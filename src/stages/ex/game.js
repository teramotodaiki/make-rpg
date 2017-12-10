import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(1, 2); // はじめの位置
	player.on(('▼ イベント', 'こうげきするとき'), (event) => {
		const 使い手 = event.target;
		const ビーム = new RPGObject();
		ビーム.mod(('▼ スキン', Hack.assets.energyBall));
		ビーム.onふれはじめた = (event) => {
			if (event.hit !== 使い手) {
				Hack.Attack(event.mapX, event.mapY, 使い手.atk);
				ビーム.destroy();
			}
		};
		使い手.shoot(ビーム, 使い手.forward, 10);
	});
	/*+ スキル */

	// さいしょの向きをかえる
	player.forward = [1, 0];

	// 詠唱待ち時間設定
	window.WAIT_TIME = 3000;

	// ゲーム時間設定
	window.TIME_LIMIT = 300 * 1000;

	// リミット解除
	window.MAX_SCORE = 1000000000;

	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/start_message_01'];
	description.moveTo(46, 48);
	Hack.menuGroup.addChild(description);

	const startButton = new enchant.Sprite(120, 32);
	startButton.image = game.assets['resources/start_button'];
	startButton.moveTo(180, 220);
	Hack.menuGroup.addChild(startButton);
	startButton.ontouchstart = () => {
		Hack.menuGroup.removeChild(description);
		Hack.menuGroup.removeChild(startButton);
		// タイマー開始
		Hack.startTimer();
	};

	Hack.on('gameend', function () {
		// 一旦削除
		const score = Hack.score;
		Hack.scoreLabel.score = 0;
		Hack.menuGroup.removeChild(Hack.scoreLabel);
		setTimeout(() => {
			// スコアラベル表示
			Hack.scoreLabel.moveBy(0, 210);
			Hack.overlayGroup.addChild(Hack.scoreLabel);
			Hack.scoreLabel.score = score;
		}, 1000);
	});

	// 魔道書のコードをひらく
	feeles.openCode('stages/ex/code.js');

}

function resetMap() {


	const map1 = Hack.createMap(`
		092|092|092|092|092|092|092|092|092|092|092|092|092|092|092|
		092|091|091|091|091|091|091|091|091|091|091|091|091|091|092|
		092|102 102 102 102 102 102 102 102 102 102 102 102 102 092|
		092|091|102 091|091|091|091|091|091|091|091|091|091|091|092|
		092|102 102 102 102 102 102 102 102 102 102 102 102 102 092|
		092|091|091|091|091|091|091|091|091|091|091|091|092|102 092|
		092|102 102 102 102 102 102 102 102 102 102 102 092|102 092|
		092|102 091|091|091|091|091|091|091|091|091|091|091|102 092|
		092|102 102 102 102 102 102 102 102 102 102 102 102 102 092|
		091|091|091|091|091|091|091|091|091|091|091|091|091|091|091|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(13, 2, 'map1');
	itemStairs2.layer = RPGMap.Layer.Under;
	itemStairs2.on(('▼ イベント', 'のった'), async () => {
		// ダッシュしながら階段に乗ると直前のコインが消える前にリロードされるので少し待つ
		Hack.player.stop();
		await new Promise((resolve) => setTimeout(resolve, 100));
		Hack.player.resume();
		resetMap();
		Hack.floorLabel.score++;
		player.locate(1, 2); // はじめの位置
	});


	// コインを置きまくる
	putCoin(2, 2);

	for (const x of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
		putCoin(x, 4);
	}
	for (const y of [5, 6, 7, 8]) {
		putCoin(13, y);
	}
	for (const x of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
		putCoin(x, 8);
	}
	for (const y of [6, 7]) {
		putCoin(1, y);
	}
	for (const x of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
		putCoin(x, 6);
	}

	/*+ モンスター アイテム せっち システム */

}

function putCoin(x, y) {
	const itemCoin1 = new RPGObject();
	itemCoin1.mod(('▼ スキン', _kコイン));
	itemCoin1.locate(x, y, 'map1');
	itemCoin1.onplayerenter = () => {
		itemCoin1.destroy();
		Hack.score += mCoinScore;
	};
}


Hack.onreset = function() {
	resetMap();
	player.locate(1, 2); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
