import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;
var startPlayerX = 1;
var startPlayerY = 7;

// １つのレーンに存在する弾丸のかず
const amount = 3;
// １つのレーンから弾丸が発射される周期 [sec]
const quoteTime = 4;
// １つのレーンが繰り返す長さ [px]
const quoteLength = 320 + 32; // スプライトが完全に隠れるまで
// 隣のレーンとの位相差 [sec]
const gap = 1;

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

	// ゲーム時間設定
	window.TIME_LIMIT = 300 * 1000;

	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/start_message_01'];
	description.moveTo(46, 48);
	Hack.menuGroup.addChild(description);

	// const startButton = new enchant.Sprite(120, 32);
	// startButton.image = game.assets['resources/start_button'];
	// startButton.moveTo(180, 220);
	// Hack.menuGroup.addChild(startButton);
	// startButton.ontouchstart = () => {
	// 	Hack.menuGroup.removeChild(description);
	// 	Hack.menuGroup.removeChild(startButton);
	// 	// タイマー開始
	// 	Hack.startTimer();

	// 	// 魔道書のコードをひらく
	// 	feeles.openCode('stages/danmaku/code.js');
	// };


	// 説明画面（作戦タイム）のタイマー => ゲームスタート
	const strategyTimer = new enchant.ui.MutableText(352, 8);
	const limit = Date.now() + window.STRATEGY_TIME;
	strategyTimer.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	strategyTimer.on('enterframe', () => {
		const last = Math.max(0, limit - Date.now()) / 1000 >> 0;
		strategyTimer.text = 'TIME:' + last;
		if (last <= 0) {
			Hack.menuGroup.removeChild(description);
			// Hack.menuGroup.removeChild(startButton);
			// タイマー開始
			Hack.startTimer();
		
			// 魔道書のコードをひらく
			feeles.openCode('stages/danmaku/code.js');
			
			// 削除
			Hack.menuGroup.removeChild(strategyTimer);
		}
	});
	Hack.menuGroup.addChild(strategyTimer);

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

		// 次へボタン
		const nextButton = new enchant.Sprite(120, 32);
		nextButton.image = game.assets['resources/next_button'];
		nextButton.moveTo(180, 260);
		nextButton.ontouchstart = () => {
			// stage 1.5 へ
			feeles.replace('stages/1/index.html');
		};

		setTimeout(() => {		
			Hack.overlayGroup.addChild(nextButton);		
		}, 4000);
	});


	player.ondangan = () => {
		Hack.log('あたった');
	};

}
var danganTimer;

function resetMap() {


	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 10|03 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(1, 1, 'map1');
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

	/*+ モンスター アイテム せっち システム */

	for (let x = 2; x <= 14; x++) {
		// x のレーンに弾丸配置＆移動開始
		setDanganVertical(x);
	}
}

// 弾丸の配列
const danganArray = [];

// x のレーンに amount 個配置
function setDanganVertical(x) {
	// 初期時刻
	const initTime = Date.now();
	// 縦方向のスピード [px/sec]
	const speed = -quoteLength / amount / quoteTime;
	// -32 ~ quoteLength - 32 までの画面内に収める (負の数も考慮する)
	const obtain = y =>  ((y % quoteLength) + quoteLength) % quoteLength - 32;
	// 縦に amount 個並べる
	for (let index = 0; index < amount; index++) {
		const itemDangan = new Sprite(32, 32);
		// 見た目を「つぼ」にする
		_tつぼ.call(itemDangan);

		// 初期位置 [px] (縦に amount 個だけ均等に並べたあと, x に比例した位相差遅れを加算する)
		const initY = quoteLength / amount * index + x * -speed * gap;
		// 動かす
		itemDangan.onenterframe = () => {
			// 経過時間
			const time = (Date.now() - initTime) / 1000;
			// 等速直線運動 % 縦の長さ
			itemDangan.moveTo(x * 32, obtain(initY + speed * time));
			// 当たり判定 (円の当たり判定)
			if (player.within(itemDangan, 16)) {
				player.dispatchEvent(new Event('dangan'));
			}
		};
		Hack.defaultParentNode.addChild(itemDangan);
	}
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
	feeles.clearInterval(danganTimer);
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
	// Hack.log をリセット
	Hack.textarea.text = '';
};

export default gameFunc;
