import enchant from 'enchantjs/enchant';
import RPGObject from './object';
import Key from 'mod/key';
import Hack from 'hackforplay/hack';
import { disable } from 'feeles/eval';

// プレイヤーの入力をできなくするフラグ
window.NO_INPUT = true;

class Player extends RPGObject {
	constructor() {
		super();


		this.mod(Hack.assets.magicianGirl);

		this.enteredStack = [];
		this.on('enterframe', this.stayCheck);
		this.on('walkend', this.enterCheck);
		this._layer = RPGMap.Layer.Player;

		this.hp = 3;
		this.atk = 1;

		this.input = {
			up: 'up',
			down: 'down',
			left: 'left',
			right: 'right',
			attack: 'space'
		};

		// 歩き終わったときに自動でモノを拾う (pickUp)
		this.isAutoPickUp = true;
	}

	checkInput(type) {
		const input = Array.isArray(this.input[type]) ? this.input[type] : [this.input[type]];
		return input.map(function(name) {
			return Key[name].pressed;
		}).reduce(function(a, b) {
			return a + b;
		});
	}

	onenterframe() {

		if (!Hack.isPlaying) return;

		if (window.NO_INPUT) {
			// つねに入力を受け付けない
			return ;
		}

		if (this.behavior === BehaviorTypes.Idle) {
			if (this.checkInput('attack')) {
				this.attack();
			}
		}

		if (this.behavior === BehaviorTypes.Idle) {
			var hor = this.checkInput('right') - this.checkInput('left');
			var ver = hor ? 0 : this.checkInput('down') - this.checkInput('up');
			if (hor || ver) {
				// Turn
				this.forward = [hor, ver];
				this.walk();
			}
		}


	}

	/**
	 * プレイヤーをスタン状態にさせる（プロコロ独自処理）
	 */
	stun() {
		// コードの実行を止める・実行不可能にする
		disable();

		if (!this._stunEffect) {
			// ダメージエフェクトを作成
			this._stunEffect = new enchant.Sprite(48, 32);
			// スタンの見た目
			Hack.assets.damageEffect.call(this._stunEffect);
			// プレイヤーの位置に追従
			this._stunEffect.onenterframe = () => {
				this._stunEffect.moveTo(this.x, this.y);
				this._stunEffect.moveBy(-this.offset.x, -this.offset.y);
				this._stunEffect.moveBy(this._stunEffect.offset.x, this._stunEffect.offset.y);
			};
		}
		if (!this._stunEffect.scene) {
			// エフェクトを表示（リセットすると消える）
			Hack.defaultParentNode.addChild(this._stunEffect);
		}
	}

	enterCheck() {
		// Dispatch playerenter Event
		RPGObject.collection.filter(function(item) {
			return item.mapX === this.mapX && item.mapY === this.mapY;
		}, this).forEach(function(item) {
			item.dispatchEvent(new Event('playerenter'));
			this.enteredStack.push(item);
		}, this);
	}


	stayCheck() {
		// Dispatch playerstay/playerexit Event
		this.enteredStack.forEach(function(item) {
			if (item.mapX === this.mapX && item.mapY === this.mapY) {
				item.dispatchEvent(new Event('playerstay'));
			} else {
				item.dispatchEvent(new Event('playerexit'));
				var index = this.enteredStack.indexOf(item);
				this.enteredStack.splice(index, 1);
			}
		}, this);
	}

}


export default Player;
