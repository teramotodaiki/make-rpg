import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;
var coinArray = new Array();
var trapArray = new Array();
var trapFlag = false;
var startPlayerX = 1;
var startPlayerY = 4;
var slotNumber1 = 0;
var slotNumber2 = 0;
var slotAnswer1 = 0;
var slotAnswer2 = 0;

var kanban1X = 2;
var kanban1Y = 3;
var kanban2X = 6;
var kanban2Y = 3;

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
			feeles.openCode('stages/slot2/code.js');
			
			// 削除
			Hack.menuGroup.removeChild(strategyTimer);
		}
	});
	Hack.menuGroup.addChild(strategyTimer);

	feeles.closeCode();
	feeles.closeReadme();

	Hack.on('gameclear', function () {
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

	// 関数を登録する
	feeles.setAlias('check', check, 'check() // 看板を読む\n');
}

// トレーニング専用の関数を定義
async function check() {
	console.log("a1:" + slotAnswer1 + ", a2:" + slotAnswer2);
	if ((player.mapX == kanban1X) && (player.mapY == kanban1Y+1) && (player.forward.y == -1)) {
		Hack.log(slotAnswer1 + "と書いてある");
		return slotAnswer1;
	} 
	else if ((player.mapX == kanban2X) && (player.mapY == kanban2Y+1) && (player.forward.y == -1)) {
		Hack.log(slotAnswer2 + "と書いてある");
		return slotAnswer2;
	}
	else {
		return -1;
	}

}

function resetMap() {
	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード		

	// ちょっと特別に十の位は0以外にしてあげよう
 	slotAnswer1 = Math.floor(Math.random()*10);
 	slotAnswer2 = Math.floor(Math.random()*10);
	putKanban(kanban1X, kanban1Y);
	putKanban(kanban2X, kanban2Y);
	putSlot1(kanban1X+1, kanban1Y);
	putSlot2(kanban2X+1, kanban2Y);
}

function putKanban(x, y) {
	const itemKanban1 = new RPGObject();
	itemKanban1.mod(('▼ スキン', _kコイン));
	itemKanban1.locate(x, y, 'map1');
	itemKanban1.on(('▼ イベント', 'こうげきされた'), () => {
		Hack.log(slotAnswer + ' と書いてある');
	});
}

var itemSlot1;
var itemSlot2;

function putSlot1(x, y) {
	itemSlot1 = new RPGObject();
	itemSlot1.mod(('▼ スキン', _tたからばこひらいた));
	itemSlot1.locate(x, y, 'map1');
	itemSlot1.on(('▼ イベント', 'こうげきされた'), () => {
		slotNumber1++;
		if (slotNumber1==10) {
			slotNumber1 = 0;
		}
		checkAnswer();
		// Hack.log((slotNumber1*10 + slotNumber2));
	});
}

function putSlot2(x, y) {
	itemSlot2 = new RPGObject();
	itemSlot2.mod(('▼ スキン', _tたからばこひらいた));
	itemSlot2.locate(x, y, 'map1');
	itemSlot2.on(('▼ イベント', 'こうげきされた'), () => {
		slotNumber2++;
		if (slotNumber2==10) {
			slotNumber2 = 0;
		}
		checkAnswer();
		// Hack.log((slotNumber1*10 + slotNumber2));
	});
}

function checkAnswer() {
	if ((slotNumber1 == slotAnswer1) && (slotNumber2 == slotAnswer2)) {
		Hack.score+=100;
		itemSlot1.destroy();
		itemSlot2.destroy();

		const itemStairs2 = new RPGObject();
		itemStairs2.mod(('▼ スキン', _kくだりかいだん));
		itemStairs2.locate(13, 8, 'map1');
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
	}
}

Hack.onreset = function() {
	resetMap();
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
