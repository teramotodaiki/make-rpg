import 'hackforplay/core';
import * as sequence from 'sequence';
import ranking from 'ranking';

const STAGE = 'final1';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;
var mMapScore = 10;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(0, 1); // はじめの位置
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
	player.forward = [0, 1];

	// 詠唱待ち時間設定
	window.WAIT_TIME = 3000;

	// ゲーム時間設定
	window.TIME_LIMIT = 300 * 1000;

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
		feeles.openCode('stages/final1/code.js');
	};

	// // 説明画面（作戦タイム）のタイマー => ゲームスタート
	// const strategyTimer = new enchant.ui.MutableText(352, 8);
	// const limit = Date.now() + window.STRATEGY_TIME;
	// strategyTimer.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	// strategyTimer.on('enterframe', () => {
	// 	const last = Math.max(0, limit - Date.now()) / 1000 >> 0;
	// 	strategyTimer.text = 'TIME:' + last;
	// 	if (last <= 0) {
	// 		Hack.menuGroup.removeChild(description);
	// 		// Hack.menuGroup.removeChild(startButton);
	// 		// タイマー開始
	// 		Hack.startTimer();
		
	// 		// 魔道書のコードをひらく
	// 		feeles.openCode('stages/final1/code.js');
			
	// 		// 削除
	// 		Hack.menuGroup.removeChild(strategyTimer);
	// 	}
	// });
	// Hack.menuGroup.addChild(strategyTimer);

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
			// ランキング登録
			ranking(STAGE).then(() => {
				// 次のステージへのボタン
				Hack.overlayGroup.addChild(nextButton);
			});
		}, 1000);

		// 次へボタン
		const nextButton = new enchant.Sprite(120, 32);
		nextButton.image = game.assets['resources/next_button'];
		nextButton.moveTo(180, 260);
		nextButton.ontouchstart = () => {
			// stage final2 へ
			feeles.replace('stages/final2/index.html');
		};
	});

}

function resetMap() {


	const map1 = Hack.createMap(`
		091|092|091|091|091|092|091|091|091|092|091|091|091|092|091|
		144 092|144 144 144 092|144 144 144 092|144 144 144 092|144 
		144 091|144 092|144 091|144 092|144 091|144 092|144 091|144 
		144 144 144 092|144 144 144 092|144 144 144 092|144 144 144 
		092|092|092|092|092|092|092|092|092|092|092|092|092|092|092|
		091|092|091|091|091|092|091|091|091|092|091|091|091|092|091|
		144 092|144 144 144 092|144 144 144 092|144 144 144 092|144 
		144 091|144 092|144 091|144 092|144 091|144 092|144 091|144 
		144 144 144 092|144 144 144 092|144 144 144 092|144 144 144 
		091|091|091|091|091|091|091|091|091|091|091|091|091|091|091|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(0, 6, 'map1');
	itemStairs2.layer = RPGMap.Layer.Under;
	itemStairs2.on(('▼ イベント', 'のった'), async () => {
		// ダッシュしながら階段に乗ると直前のコインが消える前にリロードされるので少し待つ
		Hack.player.stop();
		await new Promise((resolve) => setTimeout(resolve, 100));
		Hack.player.resume();
		resetMap();
		Hack.floorLabel.score++;
		player.locate(0, 1); // はじめの位置

		// 階段を降りた時のスコア
		Hack.score += mMapScore;
	});


	// コインを置きまくる
	for (const x of [2, 3, 4, 6, 7, 8, 10, 11, 12, 14]) {
		putCoin(x, 1);
		putCoin(x, 6);
	}
	for (const x of [0, 2, 4, 6, 8, 10, 12, 14]) {
		putCoin(x, 2);
		putCoin(x, 7);
	}
	for (const x of [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14]) {
		putCoin(x, 3);
		putCoin(x, 8);
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
	player.locate(0, 1); // はじめの位置
	player.forward = [0, 1];
};

export default gameFunc;
