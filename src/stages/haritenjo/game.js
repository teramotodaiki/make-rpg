import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mCoinScore = 1;

async function gameFunc() {
	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(2, 1); // はじめの位置
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
		feeles.openCode('stages/haritenjo/code.js');
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

	feeles.setInterval(setTraps, 3000);

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
		player.locate(2, 1); // はじめの位置
	});


	// コインを置きまくる
	// for (var i=1; i<=13; i++) {
	// 	for (var j=1; j<=8; j++) {
	// 		putCoin(i, j);
	// 	}
	// }
	// わな置きまくる。
	/*+ モンスター アイテム せっち システム */
}

var trapArray = new Array();
var trapFlag = false;

function setTraps() {
	if (!trapFlag) {
		for (var i=1; i<13; i++) {
			for (var j=1; j<8; j++) {
				const trap = putTrap(i,j);
				trapArray.push(trap);
			}
		}
	} else {
		for (var i=1; i<13; i++) {
			for (var j=1; j<8; j++) {
				trapArray[trapArray.length-1].destroy();
				trapArray.pop();
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
}


Hack.onreset = function() {
	resetMap();
	player.locate(2, 1); // はじめの位置
	player.forward = [1, 0];
};

export default gameFunc;
