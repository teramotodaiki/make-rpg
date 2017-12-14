import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var moguraScore = 10;
var coinArray = new Array();
var trapArray = new Array();
var trapFlag = false;
var startPlayerX = 1;
var startPlayerY = 2;
let timeoutIndex = null;

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

	// リミット解除
	window.MAX_SCORE = 10000000;

	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/grand_1'];
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
		feeles.openCode('stages/mogura2s/code.js');
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

	feeles.clearTimeout(timeoutIndex);
	timeoutIndex = feeles.setTimeout(timerFunc, 1000);
	feeles.setAlias('check', check, 'check()');

}

function resetMap() {
	const map1 = Hack.createMap(`
		91|91|91|91|91|91|91|91|91|91|91|91|91|91|91|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 93 90 93 90 93 90 93 90 93 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 93 90 93 90 93 90 93 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		92|90 90 90 90 90 90 90 90 90 90 90 90 90 92|
		91|91|91|91|91|91|91|91|91|91|91|91|91|91|91|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード		

	putRock(4,3);
	putRock(6,6);
	putRock(8,3);
	putRock(9,2);
	putRock(5,5);
	putRock(11,5);
	putRock(12,7);
	putRock(2,5);
	putRock(3,7);

	let i = 1;
	for (const xy of order) {
		const [x, y] = xy;
		putNumber(x, y, i + '');
		i++;
	}

}

var timerCount = 0;
var itemMogura;

let index = -1;
const order = [
	[5, 3],
	[11, 3],
	[4, 5],
	[3, 3],
	[5, 3],
	[10, 5],
	[8, 5],
	[6, 5],
	[10, 5],
	[7, 3],
	[11, 3],
	[7, 3],
	[3, 3],
	[9, 3],
	[6, 5],
	[9, 3],
	[8, 5],
	[4, 5]
];

var moguraX = order[0][0];
var moguraY = order[0][1];

function putNumber(x, y, num) {
	const label1 = new enchant.ui.MutableText(x*32+8, y*32+16);
	label1.text = '?';
	Hack.menuGroup.addChild(label1);
}


function timerFunc() {
	index = (index + 1) % order.length;

	const [x, y] = order[index];
	moguraX = x;
	moguraY = y;

	// moguraX+=2;
	// if (moguraX>11) {
	// 	moguraX = 3;
	// } 
	// moguraY = 3;
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
		feeles.clearTimeout(timeoutIndex);
		timeoutIndex = feeles.setTimeout(timerFunc, 1000);
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

	itemMogura.destroy();
	moguraX = order[0][0];
	moguraY = order[0][1];
	index = -1;
	feeles.clearTimeout(timeoutIndex);
	timeoutIndex = feeles.setTimeout(timerFunc, 1000);
};

export default gameFunc;
