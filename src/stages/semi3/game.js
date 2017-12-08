import 'hackforplay/core';
import * as sequence from 'sequence';

/* ここの部分は選手には見えません
 * デバッグ中につき魔道書は最初から表示されています
 */
var mDragonScore = 35;
var mDragonHp = 1;
var mOrbScore = 5;
async function gameFunc() {

	resetMap();

	const player = self.player = new Player(); // プレイヤーをつくる
	player.locate(7, 8); // はじめの位置
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
	});

}

Hack.onreset = function() {
	resetMap();
	player.locate(7, 8); // はじめの位置
	player.forward = [0, -1];
};

function resetMap() {
	const map1 = Hack.createMap(`
		63|60|61|61|61|62|60|61|62|63|63|63|63|63|63|
		63|70|71 71 71 72|70|71 72|63|63|63|60|61|62|
		63|80|81|81|81|82|70|71 72|63|63|63|70|71 72|
		63|63|63|63|63|63|70|71 72|63|63|63|70|71 72|
		63|63|63|63|63|63|70|71 72|63|63|63|70|71 72|
		63|63|63|63|63|63|70|71 72|63|63|63|70|71 72|
		63|63|63|63|63|63|80|81|82|63|63|63|70|71 72|
		60|61|61|61|61|61|61|61|61|61|61|62|80|81|82|
		70|71 71 71 71 71 71 71 71 71 71 72|63|63|63|
		80|81|81|81|81|81|81|81|81|81|81|82|63|63|63|
	`);
	Hack.maps.map1 = map1;

	Hack.changeMap('map1'); // map1 をロード
	
	const itemStairs = new RPGObject();
	itemStairs.mod(('▼ スキン', _kくだりかいだん));
	itemStairs.locate(7, 1, 'map1');
	itemStairs.layer = RPGMap.Layer.Under;
	itemStairs.on(('▼ イベント', 'のった'), () => {
		resetMap();
		Hack.floorLabel.score++;
		player.locate(7, 8); // はじめの位置
	});

	// オーブを壊した後呼ぶ関数
	let orbNum = 3;
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
	itemDragon.locate(7, 5, 'map1');
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

	const itemGem1 = new RPGObject();
	itemGem1.mod(('▼ スキン', Hack.assets.orangeOrb));
	itemGem1.hp = 1;
	itemGem1.locate(4, 3, 'map1');
	itemGem1.tl.moveBy(0, 96, 60).moveBy(0, -96, 60).loop();
	itemGem1.on(('▼ イベント', 'たおれたとき'), destroyOrb);


	const itemGem2 = new RPGObject();
	itemGem2.mod(('▼ スキン', Hack.assets.orangeOrb));
	itemGem2.hp = 1;
	itemGem2.locate(10, 6, 'map1');
	itemGem2.tl.moveBy(0, -96, 60).moveBy(0, 96, 60).loop();
	itemGem2.on(('▼ イベント', 'たおれたとき'), destroyOrb);


	const itemGem3 = new RPGObject();
	itemGem3.mod(('▼ スキン', Hack.assets.orangeOrb));
	itemGem3.hp = 1;
	itemGem3.locate(8, 2, 'map1');
	itemGem3.tl.moveBy(-64, 0, 60).moveBy(64, 0, 60).loop();
	itemGem3.on(('▼ イベント', 'たおれたとき'), destroyOrb);

	const itemBarrier = new Sprite(128, 128);
	itemBarrier.image = game.assets['resources/barrier'];
	itemBarrier.moveTo(173, 80);
	itemBarrier.opacity = 0.7;
	itemBarrier.tl.scaleTo(1.1, 20).scaleTo(0.9, 20).loop();
	itemBarrier.on('enterframe', () => {
		const scale = 0.4 + 0.2 * orbNum + 0.05 * Math.sin(itemBarrier.age / 10);
		itemBarrier.scaleX = itemBarrier.scaleY = scale;
	});
	Hack.defaultParentNode.addChild(itemBarrier);

	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _iいしかべ));
	item1.locate(4, 8, 'map1');

	/*+ モンスター アイテム せっち システム */

}

export default gameFunc;
