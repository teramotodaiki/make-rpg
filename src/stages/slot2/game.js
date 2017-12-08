import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var slotScore = 50;
var coinArray = new Array();
var trapArray = new Array();
var trapFlag = false;
var startPlayerX = 1;
var startPlayerY = 5;
var slotNumber1 = 0;
var slotNumber2 = 0;
var slotAnswer1 = 0;
var slotAnswer2 = 0;

var stairsX = 13;
var stairsY = 5;

var kanban1X = 2;
var kanban1Y = 4;
var kanban2X = 6;
var kanban2Y = 4;
var inputX = 10;

var slotAnswer1Array = [6, 5, 7, 8, 8, 4, 7, 7, 2, 2, 5, 8];
var slotAnswer2Array = [5, 8, 1, 5, 6, 3, 1, 9, 4, 4, 9, 2];
var slotCount = 0;

var itemSlot1, buttonSlot1;
var itemSlot2, buttonSlot2;
var itemInput, buttonInput;

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

	// 関数を登録する
	feeles.setAlias('check', check, 'check()');
}

// 看板を読む関数
async function check() {
	console.log('a1:' + slotAnswer1 + ', a2:' + slotAnswer2);
	if ((player.mapX == kanban1X) && (player.mapY == kanban1Y+1) && (player.forward.y == -1)) {
		Hack.log(slotAnswer1 + 'と書いてある');
		return slotAnswer1;
	} 
	else if ((player.mapX == kanban2X) && (player.mapY == kanban2Y+1) && (player.forward.y == -1)) {
		Hack.log(slotAnswer2 + 'と書いてある');
		return slotAnswer2;
	}
	else {
		return -1;
	}

}

function resetMap() {
	const map1 = Hack.createMap(`
		102|101|101|101|101|101|101|101|101|101|101|101|101|101|102|
		111|121|121|121|121|121|121|121|121|121|121|121|121|121|111|
		111|121|121|121|121|121|121|121|121|121|121|121|121|121|111|
		111|121|121|121|121|121|121|121|121|121|121|121|121|121|111|
		111|120|122|120|120|120|122|120|120|120|120|120|120|120|111|
		111|110 110 110 110 110 110 110 110 110 110 110 110 110 111|
		111|110 110 110 110 110 110 110 110 110 110 110 110 110 111|
		111|110 110 110 110 110 110 110 110 110 110 110 110 110 111|
		111|110 110 110 110 110 110 110 110 110 110 110 110 110 111|
		102|101|101|101|101|101|101|101|101|101|101|101|101|101|102|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード		

	// 乱数を生成
 	slotAnswer1 = slotAnswer1Array[slotCount % slotAnswer1Array.length];
 	slotAnswer2 = slotAnswer2Array[slotCount % slotAnswer2Array.length];
	// putKanban(kanban1X, kanban1Y);
	// putKanban(kanban2X, kanban2Y);
	putSlot1(kanban1X+1, kanban1Y);
	putSlot2(kanban2X+1, kanban2Y);
	putInput(inputX, kanban1Y);
}

function putKanban(x, y) {
	const itemKanban1 = new RPGObject();
	itemKanban1.mod(('▼ スキン', _kコイン));
	itemKanban1.locate(x, y, 'map1');
	itemKanban1.on(('▼ イベント', 'こうげきされた'), () => {
		Hack.log(slotAnswer + ' と書いてある');
	});
}

function putInput(x, y) {
	itemInput = new RPGObject();
	itemInput.mod(('▼ スキン', Hack.assets.displayNone));
	itemInput.locate(x, y-1, 'map1');

	buttonInput = new RPGObject();
	buttonInput.mod(('▼ スキン', Hack.assets.wallButton));
	buttonInput.locate(x, y, 'map1');

	itemInput.on(('▼ イベント', 'こうげきされた'), () => {
		if ((slotNumber1 == slotAnswer1) && (slotNumber2 == slotAnswer2)) {
			itemInput.pressed = true;
			itemInput.mod(('▼ スキン', Hack.assets.displayArrow));
			buttonInput.mod(('▼ スキン', Hack.assets.wallButtonPushed));
			Hack.score+=slotScore;

			const itemStairs2 = new RPGObject();
			itemStairs2.mod(('▼ スキン', _kくだりかいだん));
			itemStairs2.locate(stairsX, stairsY, 'map1');
			itemStairs2.layer = RPGMap.Layer.Under;
			itemStairs2.on(('▼ イベント', 'のった'), async () => {
				// ダッシュしながら階段に乗ると直前のコインが消える前にリロードされるので少し待つ
				Hack.player.stop();
				slotCount++;
				await new Promise((resolve) => setTimeout(resolve, 100));
				Hack.player.resume();
				resetMap();
				Hack.floorLabel.score++;
				player.locate(startPlayerX, startPlayerY); // はじめの位置
			});
		}
	});
	itemInput.pressed = false;
}

function putSlot1(x, y) {
	itemSlot1 = new RPGObject();
	itemSlot1.mod(('▼ スキン', Hack.assets.slot));
	itemSlot1.locate(x, y-1, 'map1');
	slotNumber1 = 0;

	buttonSlot1 = new RPGObject();
	buttonSlot1.mod(('▼ スキン', Hack.assets.wallButtonRed));
	buttonSlot1.locate(x, y, 'map1');
	slotNumber1 = 0;

	itemSlot1.on(('▼ イベント', 'こうげきされた'), () => {
		slotNumber1++;
		if (slotNumber1==10) {
			slotNumber1 = 0;
		}
		itemSlot1.frame = slotNumber1;
		checkAnswer();
	});
}

function putSlot2(x, y) {
	itemSlot2 = new RPGObject();
	itemSlot2.mod(('▼ スキン', Hack.assets.slot));
	itemSlot2.locate(x, y-1, 'map1');
	slotNumber2 = 0;

	buttonSlot2 = new RPGObject();
	buttonSlot2.mod(('▼ スキン', Hack.assets.wallButtonRed));
	buttonSlot2.locate(x, y, 'map1');
	slotNumber2 = 0;

	itemSlot2.on(('▼ イベント', 'こうげきされた'), () => {
		slotNumber2++;
		if (slotNumber2==10) {
			slotNumber2 = 0;
		}
		itemSlot2.frame = slotNumber2;
		checkAnswer();
	});
}

function checkAnswer() {
	if (!itemInput.pressed) {
		if ((slotNumber1 == slotAnswer1) && (slotNumber2 == slotAnswer2)) {
			itemInput.mod(('▼ スキン', Hack.assets.displayOK));
		} else {
			itemInput.mod(('▼ スキン', Hack.assets.displayNone));		
		}
	}
}

Hack.onreset = function() {
	resetMap();
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
