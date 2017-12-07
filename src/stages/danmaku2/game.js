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


var coinArray = new Array();
var trapArray = new Array();

var danganTimer;


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
			feeles.openCode('stages/danmaku2/code.js');
			
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


	player.ondangan = () => {
		Hack.log('あたった');
	};

	feeles.setInterval(timerFunc, 2000);
	feeles.setAlias('check', check, 'check() // 主人公の向いてる隣接マスに罠がでてるか否か\n');

}

async function check() {

	var targetX, targetY;
	if(player.forward.x==1) {
		targetX = player.mapX+1;
		targetY = player.mapY;
	} else if(player.forward.x==-1) {
		targetX = player.mapX-1;
		targetY = player.mapY;
	} else if(player.forward.y==-1) {
		targetX = player.mapX;
		targetY = player.mapY-1;
	} else if(player.forward.y==1) {
		targetX = player.mapX;
		targetY = player.mapY+1;
	}

	if (trapArray.length > 1) {
		// for (var i=0; i<trapArray.length; i++) {
		for(var i=0; i<trapArray.length; i++) {
			var obj = trapArray[i];
			console.log("check array:" + i +", x:" + obj.mapX+", y:" + obj.mapY + "targetX:"+targetX+",y:"+targetY) ;
			if (obj.mapX == targetX && obj.mapY == targetY) {
				return 1;
			}
		}
		return 0;
	} else {
		return 0;
	}

}

function resetMap() {

	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
		10|03 03 03 03 03 03 03 03 03 03 03 03 00 10|
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

	// setTraps(0);
}

function setTraps(pattern) {
	// トラップ消す
	if (trapArray.length > 1) {
		// for (var i=0; i<trapArray.length; i++) {
		while(trapArray.length>0) {
			trapArray[trapArray.length-1].destroy();
			trapArray.pop();
		}
	}

	switch(pattern) {
		case 0: {
			// トラップ出す
			for (var i=-10; i<=4; i+=4) {
				for (var k=0; k<=14; k++) {
					if (k>0 && k<14 && (i+k)>0 && (i+k)<8) { 
						const trap = putTrap(k,i+k);
						trapArray.push(trap);			
					}		
				}
			}
			break;
		}
		case 1: {
			// トラップ出す
			for (var i=-12; i<=4; i+=4) {
				for (var k=0; k<=14; k++) {
					if (k>0 && k<14 && (i+k)>0 && (i+k)<8) { 
						const trap = putTrap(k,i+k);
						trapArray.push(trap);					
					}
				}
			}
			break;
		}
	}
}

var trapCount=0;
function timerFunc() {
	setTraps(trapCount%2);
	trapCount++;
}


function putCoin(x, y) {
	const itemCoin1 = new RPGObject();
	itemCoin1.mod(('▼ スキン', _kコイン));
	itemCoin1.locate(x, y, 'map1');
	itemCoin1.onplayerenter = () => {
		itemCoin1.destroy();
		Hack.score += mCoinScore;
	};
	return itemCoin1;
}

function putTrap(x, y) {
	const item2 = new RPGObject();
	item2.mod(('▼ スキン', _wわなかかった));
	item2.locate(x, y, 'map1');
	item2.layer = RPGMap.Layer.Under;

	// 出現時に真上にプレイヤーがいた
	if (player.mapX == x && player.mapY == y) {
		player.damageTime = 30;
		Hack.log("のった2");		
	}
	
	item2.on(('▼ イベント', 'のった'), () => {
		item2.mod(('▼ スキン', _wわなかかった));
		player.damageTime = 30;
		Hack.log("のった");
	});
	return item2;
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
