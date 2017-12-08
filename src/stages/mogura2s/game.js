import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var moguraScore = 20;
var coinArray = new Array();
var trapArray = new Array();
var trapFlag = false;
var startPlayerX = 1;
var startPlayerY = 2;
var moguraRandomArray = [3, 2, 4, 1, 0, 4, 2, 3, 0, 1, 4, 2];

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
	// 	feeles.openCode('stages/mogura/code.js');
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
			feeles.openCode('stages/mogura2s/code.js');
			
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

	feeles.setTimeout(timerFunc, 1000);
	feeles.setAlias('check', check, 'check()');

}

function resetMap() {
	const map1 = Hack.createMap(`
		91|91|91|91|91|91|91|91|91|91|91|91|91|91|91|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 93 90 93 90 93 90 93 90 93 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		91|91|91|91|91|91|91|91|91|91|91|91|91|91|91|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード		

	putRock(4,3);
	putRock(6,6);
	putRock(6,7);
	putRock(9,2);
	putRock(10,7);
	putRock(11,7);
	putRock(12,7);

}

var timerCount = 0;
var itemMogura;
var moguraX = 1;
var moguraY = 0;
var moguraCount = 0;

function timerFunc() {

 	moguraX = moguraRandomArray[moguraCount % moguraRandomArray.length] *2 + 3;
	moguraCount++;
	moguraY = 3;
	moguraOn(moguraX, moguraY);
}


function moguraOn(x, y) {
	itemMogura = new RPGObject();
	itemMogura.mod(('▼ スキン', Hack.assets.mogura));
	itemMogura.locate(x, y, 'map1');

	itemMogura.layer = RPGMap.Layer.Under;
	itemMogura.onこうげきされた = () => {
		itemMogura.destroy();
		Hack.score += moguraScore;
		feeles.setTimeout(timerFunc, 1000);
	};
}

async function check() {
	if (itemMogura.parentNode === null) {
		return 0;
	}
	// 右向き
	if (player.forward.x == 1) {
		if ((moguraX == player.mapX+1) && (moguraY == player.mapY)) {
			return 1;
		} else {
			return 0;
		}
	} 
	// 左向き
	else if (player.forward.x == -1) {
		if ((moguraX == player.mapX-1) && (moguraY == player.mapY)) {
			return 1;
		} else {
			return 0;
		}
	}
	// 下向き
	else if (player.forward.y == 1) {
		if ((moguraX == player.mapX) && (moguraY == player.mapY+1)) {
			return 1;
		} else {
			return 0;
		}
	}
	// 上向き
	else if (player.forward.y == -1) {
		if ((moguraX == player.mapX) && (moguraY == player.mapY-1)) {
			return 1;
		} else {
			return 0;
		}	
	}
}

function putRock(x, y ) {
	const item6 = new RPGObject();
	item6.mod(('▼ スキン', _iいしかべ));
	item6.locate(x, y, 'map1');
	item6.on(('▼ イベント', 'こうげきされた'), () => {
	});
}

Hack.onreset = function() {
	resetMap();
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
	moguraCount = 0;
	itemMogura.destroy();
	moguraX = 1;
	moguraY = 0;
	feeles.setTimeout(timerFunc, 1000);
};

export default gameFunc;
