import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;
var startPlayerX = 1;
var startPlayerY = 1;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(startPlayerX, startPlayerY); // はじめの位置
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

	// ゲーム時間設定（みじかい）
	window.TIME_LIMIT = 180 * 1000;

	// リミット解除
	window.MAX_SCORE = 1000000;

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

		// 魔道書のコードをひらく
		feeles.openCode('stages/1.6/code.js');
	};

	feeles.closeCode();
	feeles.closeReadme();

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

}

function resetMap() {


	const map1 = Hack.createMap(`
		12|12|12|12|12|12|12|12|12|12|12|12|12|12|12|
		12|03 12|03 03 03 03 03 03 03 03 03 03 03 12|
		12|03 12|03 12|12|12|12|12|12|12|12|12|03 12|
		12|03 12|03 12|03 03 03 03 03 03 03 12|03 12|
		12|03 12|03 12|03 12|12|12|12|12|03 12|03 12|
		12|03 12|03 12|12|12|12|12|12|12|03 12|03 12|
		12|03 12|03 03 03 03 03 03 03 03 03 12|03 12|
		12|03 12|12|12|12|12|12|12|12|12|12|12|03 12|
		12|03 03 03 03 03 03 03 03 03 03 03 03 03 12|
		12|12|12|12|12|12|12|12|12|12|12|12|12|12|12|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(5, 4, 'map1');
	itemStairs2.layer = RPGMap.Layer.Under;
	itemStairs2.on(('▼ イベント', 'のった'), async () => {
		// ダッシュしながら階段に乗ると直前のコインが消える前にリロードされるので少し待つ
		Hack.player.stop();
		await new Promise((resolve) => setTimeout(resolve, 100));
		Hack.player.resume();
		resetMap();
		Hack.floorLabel.score++;
		player.locate(startPlayerX, startPlayerY); // はじめの位置
	});


	// コインを置きまくる
	for (var j=2; j<=8; j++) {
		putCoin(1, j);
	}
	for (var i=1; i<=13; i++) {
		putCoin(i, 8);
	}
	for (var j=1; j<=7; j++) {
		putCoin(13, j);
	}
	for (var i=3; i<=12; i++) {
		putCoin(i, 1);
	}
	for (var j=2; j<=6; j++) {
		putCoin(3, j);
	}
	for (var i=4; i<=11; i++) {
		putCoin(i, 6);
	}
	for (var j=3; j<=5; j++) {
		putCoin(11, j);
	}
	for (var i=5; i<=10; i++) {
		putCoin(i, 3);
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
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
