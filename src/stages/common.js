/* global enchant, game, feeles */
// 全てのステージに共通する処理

import Hack from 'hackforplay/hack';
import enchant, { Event } from 'enchantjs/enchant';
import { kill } from 'feeles/eval';
import 'mod/coordinate';
import snippets from 'snippets';
import addSnippet from 'addSnippet';


window.STRATEGY_TIME = 0 * 1000; // 説明画面でとまる秒数. 実際には１分とか.

const common = () => {
	// ゲームリセットボタン
	const resetButton = new enchant.Sprite(64, 64);
	resetButton.image = game.assets['resources/reset_button'];
	resetButton.moveTo(0, 320 - 64);
	resetButton.ontouchstart = () => {
		Hack.dispatchEvent(new Event('reset'));
		// リセットはストップをかねる
		kill();
	};
	Hack.menuGroup.addChild(resetButton);

	// タイムオーバー
	Hack.on('gameclear', () => {
		// 時間切れ！
		kill();
	});

	// スコアの表示位置変更
	Hack.scoreLabel.moveTo(160, 8);
	Hack.scoreLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';

	// 階層ラベル (同じマップになんども enter することを想定している)
	Hack.floorLabel = new enchant.ui.ScoreLabel(8, 8);
	Hack.floorLabel.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	Hack.floorLabel.score = 1;
	Hack.floorLabel.label = 'FLOOR:';
	Hack.menuGroup.addChild(Hack.floorLabel);

	// 詠唱アニメーション
	let chantEffect = null;
	Hack.on('code', () => {
		if (chantEffect) chantEffect.remove();
		// chantEffect に当たり判定があるとビームが自分に当たってしまうので Sprite にする
		chantEffect = new enchant.Sprite(240, 240);
		Hack.assets.chantEffect.call(chantEffect);
		chantEffect.moveTo(window.player.x, window.player.y);
		chantEffect.moveBy(-window.player.offset.x, -window.player.offset.y);
		chantEffect.moveBy(chantEffect.offset.x, chantEffect.offset.y);
		chantEffect.compositeOperation = 'lighter';
		chantEffect.scale(0);
		Hack.defaultParentNode.addChild(chantEffect);
		chantEffect.tl.scaleTo(1, 1, 8, 'QUAD_EASEOUT');
		// 詠唱中は操作できない
		window.player.stop();
		setTimeout(() => {
			// 元に戻す
			window.player.resume();
			// エフェクトを消す
			chantEffect.tl.fadeOut(4).removeFromScene();
		}, window.WAIT_TIME);
	});

	Hack.on('realtimescorechange', ({ oldValue, newValue }) => {
		// スコアが増えたときに出る数字
		const scoreEffect = new enchant.ui.ScoreLabel();
		scoreEffect.score = (newValue - oldValue); // 取得したスコア
		Object.defineProperty(scoreEffect, 'easing', { value: 0, writable: false });
		scoreEffect.label = '';
		scoreEffect.moveTo(player.center.x - (scoreEffect.score.toString().length * scoreEffect.fontSize / 2), player.y);
		// いい感じのエフェクト
		scoreEffect.tl.moveBy(0, -8, 8).removeFromScene();
		// scorechange のタイミングでシーンに追加する場合は enterframe を呼ばないと label が反映されない
		scoreEffect.dispatchEvent(new Event('enterframe'));
		Hack.world.addChild(scoreEffect);
	});

	// 魔道書に構文エラーがあったとき
	Hack.on('error', ({ error }) => {
		// エラーダイアログ（画像）を表示
		const dialog = new enchant.Sprite(336, 240);
		dialog.image = game.assets['resources/error_message'];
		dialog.opacity = 0;
		dialog.moveTo(72, 40);
		dialog.ontouchstart = () => {
			// クリックでとじる
			// dialog.tl.fadeOut(30).removeFromScene();
			Hack.menuGroup.removeChild(dialog);
		};
		Hack.menuGroup.addChild(dialog);
		dialog.tl.fadeIn(30);
		// 細かい内容はコンソールに出力する
		console.error(error);
	});

	// スコア (HTML)
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.bottom = 0;
	div.style.height = '100px';
	div.style.fontSize = '32px';
	div.style.fontWeight = 'bold';
	div.style.backgroundColor = 'white';
	div.style.width = '100%';
	div.textContent = 'スコア：' + Hack.score;
	document.body.appendChild(div);
	Hack.on('scorechange', () => {
		div.textContent = 'スコア：' + Hack.score;
	});
};

// タイマーをスタートさせる
Hack.startTimer = () => {
	// 時間制限タイマー
	const limitTimer = new enchant.ui.MutableText(352, 8);
	const limit = Date.now() + window.TIME_LIMIT;
	limitTimer.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	limitTimer.on('enterframe', () => {
		if (Hack.isPlaying) {
			const last = Math.max(0, limit - Date.now()) / 1000 >> 0;
			limitTimer.text = 'TIME:' + last;
			if (last <= 0) {
				// クリア（これ以降はスコアが増えない）
				Hack.gameclear();
			}
		}
	});
	Hack.menuGroup.addChild(limitTimer);
};


// 必要なエイリアスを書き出す
addSnippet(...snippets);

export default common;