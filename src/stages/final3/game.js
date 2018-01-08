import 'hackforplay/core';
import * as sequence from 'sequence';
import ranking from 'ranking';

const STAGE = 'stages/final3';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mDragonScore = 38;
var mDragonHp = 1;
var mOrbScore = 1;
async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(7, 9); // はじめの位置
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
	player.forward = [0, -1];
	
	// 詠唱待ち時間設定
	window.WAIT_TIME = 3000;
	
	// ゲーム時間設定
	window.TIME_LIMIT = 300 * 1000;
	
	// せつめい
	const description = new enchant.Sprite(388, 224);
	description.image = game.assets['resources/start_message_03'];
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
		feeles.openCode('stages/final3/code.js');
	};

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
			feeles.openCode('stages/final3/code.js');
			
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
			// ランキング登録
			ranking(STAGE);
		}, 1000);
	});

}

Hack.onreset = function() {
	resetMap();
	player.locate(7, 9); // はじめの位置
	player.forward = [0, -1];
};

function resetMap() {
	const map1 = Hack.createMap(`
		103|103|103|103|103|103|104|104|104|103|103|103|103|103|103|
		113|113|113|113|113|113|114|114|114|113|113|113|113|113|113|
		100 100 110 110 110 110 110 110 110 110 110 110 110 100 100 
		100 100 100 110 110 110 110 110 110 110 110 110 100 100 100 
		100 100 100 100 110 110 110 110 110 110 110 100 100 100 100 
		100 100 100 100 100 110 110 110 110 110 100 100 100 100 100 
		100 100 100 100 100 100 110 110 110 100 100 100 100 100 100 
		100 100 100 100 100 100 110 110 110 100 100 100 100 100 100 
		100 100 100 100 100 100 110 110 110 100 100 100 100 100 100 
		100 100 100 100 100 100 110 110 110 100 100 100 100 100 100 
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs = new RPGObject();
	itemStairs.mod(('▼ スキン', _kくだりかいだん));
	itemStairs.locate(14, 9, 'map1');
	itemStairs.layer = RPGMap.Layer.Under;
	itemStairs.on(('▼ イベント', 'のった'), () => {
		resetMap();
		Hack.floorLabel.score++;
		player.locate(7, 9); // はじめの位置
	});

	// オーブを壊した後呼ぶ関数
	let orbNum = 12;
	const destroyOrb = () => {
		orbNum--; // オーブを 1 へらす
		Hack.score += mOrbScore; // 得点を増やす		
		if (orbNum === 0) {
			// ドラゴンを倒せる状態にする
			itemDragon.hp = mDragonHp;
			// バリアを消す
			itemBarrier.visible = false;
		}
	};

	const itemDragon = new RPGObject();
	itemDragon.mod(('▼ スキン', _dドラゴン));
	// itemDragon.hp = 10;
	itemDragon.atk = 1;
	itemDragon.locate(7, 3, 'map1');
	itemDragon.scale(2, 2);
	itemDragon.forward = [0, 1];
	itemDragon.setFrame('Idle', [10]);
	itemDragon.on(('▼ イベント', 'たおれたとき'), () => {
		Hack.score += mDragonScore;
	});
	itemDragon.on(('▼ イベント', 'こうげきされた'), () => {
		if (orbNum > 0) {
		// オーブが一つでも残っているなら攻撃を受け付けない
			itemBarrier.tl.clear().show().delay(10).fadeTo(0.7, 30);
		}
	});

	// オーブ（まず下に行く）
	for (const x of [0, 2, 4, 10, 12, 14]) {
		putGem(x, 4, destroyOrb);
	}
	// オーブ（まず上に行く）
	for (const x of [1, 3, 5, 9, 11, 13]) {
		putGem(x, 7, destroyOrb);
	}

	// 石像（下）
	for (const x of [0, 2, 4, 10, 12, 14]) {
		putStone(x, 8);
	}
	// 石像（上）
	for (const x of [1, 3 ,5, 9, 11, 13]) {
		putStone(x, 3);
	}

	const itemBarrier = new Sprite(128, 128);
	itemBarrier.image = game.assets['resources/barrier'];
	itemBarrier.moveTo(173, 16);
	itemBarrier.opacity = 0.7;
	itemBarrier.tl.scaleTo(1.1, 20).scaleTo(0.9, 20).loop();
	itemBarrier.on('enterframe', () => {
		const scale = 0.4 + 0.2 * orbNum + 0.05 * Math.sin(itemBarrier.age / 10);
		itemBarrier.scaleX = itemBarrier.scaleY = scale;
	});
	Hack.defaultParentNode.addChild(itemBarrier);

	

	/*+ モンスター アイテム せっち システム */

}


function putGem (x, y, onDestroy) {

	const odd = x % 2 === 0 ? 1 : -1;

	const itemGem1 = new RPGObject();
	itemGem1.mod(('▼ スキン', Hack.assets.orangeOrb));
	itemGem1.hp = 1;
	itemGem1.locate(x, y, 'map1');
	itemGem1.tl.moveBy(0, odd * 96, 60).moveBy(0, odd * -96, 60).loop();
	itemGem1.on(('▼ イベント', 'たおれたとき'), onDestroy);

}

function putStone (x, y) {
	// 上
	const item2 = new RPGObject();
	item2.collisionFlag = false;
	item2.mod(('▼ スキン', Hack.assets.statueAbove));
	item2.locate(x, y - 1, 'map1');
	item2.layer = RPGMap.Layer.Over;
	// 下
	const item1 = new RPGObject();
	item1.mod(('▼ スキン', Hack.assets.statueBottom));
	item1.locate(x, y, 'map1');
}

export default gameFunc;
