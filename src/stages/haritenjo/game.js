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
	// 	feeles.openCode('stages/haritenjo/code.js');
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
			feeles.openCode('stages/haritenjo/code.js');
			
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

	feeles.setInterval(timerFunc, 100);
	// feeles.setInterval(setTraps, 4000);
	feeles.setAlias('getSafeTime', getSafeTime);

}

function resetMap() {
	const map1 = Hack.createMap(`
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
		10|10|10|10|10|10|10|10|10|10|10|10|10|10|10|
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
	
	const itemStairs2 = new RPGObject();
	itemStairs2.mod(('▼ スキン', _kくだりかいだん));
	itemStairs2.locate(9, 5, 'map1');
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
	for (var i=1; i<=13; i++) {
		for (var j=2; j<=8; j++) {
			if ((i==1 && j==2)) {
				continue;
			}
			const coin = putCoin(i, j);
			coinArray.push(coin);
		}
	}
}

var timerCount = 0;
function timerFunc() {
	timerCount++;
	if (timerCount == 40) {
		setTraps();
		Hack.log('トラップ発動');
	} else if (timerCount == 80) {
		setTraps();
		timerCount = 0;
	} else if (timerCount % 10 == 0 && timerCount < 40) {
		Hack.log('トラップ発動まであと'+(40-timerCount)*0.1+'秒');
	}
}

function getSafeTime() {
	if (timerCount < 40) {
		return (40-timerCount)*0.1;
	} else {
		return 0;
	}
}


function setTraps() {
	// トラップ発動
	if (!trapFlag) {
		// コイン消す
		for (var i=1; i<=13; i++) {
			for (var j=2; j<=8; j++) {
				if (i==1 && j==2) {
					continue;
				}
				coinArray[coinArray.length-1].destroy();
				coinArray.pop();
			} 
		}

		// trap出す
		for (var i=1; i<=13; i++) {
			for (var j=2; j<=8; j++) {
				if (i==1 && j==2) {
					continue;
				}
				const trap = putTrap(i,j);
				trapArray.push(trap);
			}
		}
	} 
	// トラップ解消
	else {
		// トラップ消す
		for (var i=1; i<=13; i++) {
			for (var j=2; j<=8; j++) {
				if (i==1 && j==2) {
					continue;
				}
				trapArray[trapArray.length-1].destroy();
				trapArray.pop();
			} 
		}
		// コインを置きまくる
		for (var i=1; i<=13; i++) {
			for (var j=2; j<=8; j++) {
				if (i==1 && j==2) {
					continue;
				}
				const coin = putCoin(i, j);
				coinArray.push(coin);
			}
		}
	}
	trapFlag = !trapFlag;
}

function putTrap(x, y) {
	const item2 = new RPGObject();
	item2.mod(('▼ スキン', _tつぼ));
	item2.locate(x, y, 'map1');
	item2.layer = RPGMap.Layer.Under;
	item2.on(('▼ イベント', 'のった'), () => {
		item2.mod(('▼ スキン', _tつぼ));
		player.hp -= 1;
		player.damageTime = 30;

	});
	item2.on(('▼ イベント', 'おりた'), () => {
		item2.mod(('▼ スキン', _tつぼ));
	});
	return item2;
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


Hack.onreset = function() {
	resetMap();
	player.locate(startPlayerX, startPlayerY); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
