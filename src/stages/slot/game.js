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
var startPlayerY = 2;
var slotNumber1 = 0;
var slotNumber2 = 0;
var slotAnswer = 21;

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
		feeles.openCode('stages/slot/code.js');
	};

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
}

function resetMap() {
	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
		10|00 00 00 00 00 00 00 00 00 00 00 00 00 10|
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
 	slotAnswer = Math.floor(Math.random()*89) + 10;
	putKanban(7, 3);
	putSlot1(5, 5);
	putSlot2(9, 5);
}

function putKanban(x, y) {
	const itemKanban1 = new RPGObject();
	itemKanban1.mod(('▼ スキン', _kコイン));
	itemKanban1.locate(x, y, 'map1');
	itemKanban1.on(('▼ イベント', 'こうげきされた'), () => {
		Hack.log(slotAnswer + " と書いてある");
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
		Hack.log((slotNumber1*10 + slotNumber2));
	});
}

function putSlot2(x, y) {
	const itemSlot2 = new RPGObject();
	itemSlot2.mod(('▼ スキン', _tたからばこひらいた));
	itemSlot2.locate(x, y, 'map1');
	itemSlot2.on(('▼ イベント', 'こうげきされた'), () => {
		slotNumber2++;
		if (slotNumber2==10) {
			slotNumber2 = 0;
		}
		checkAnswer();
		Hack.log((slotNumber1*10 + slotNumber2)+", " + slotNumber2);
	});
}

function checkAnswer() {
	if ((slotNumber1*10 + slotNumber2) == slotAnswer) {
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
};

Hack.onreset = function() {
	resetMap();
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
