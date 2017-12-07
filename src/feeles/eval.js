/* global feeles */
import enchant from '../enchantjs/enchant';
import Hack from '../hackforplay/hack';
import workerJs from 'raw-loader!worker';
import addSnippet from 'addSnippet';

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;

// setTimeout の戻り値を保持する
let timerId;

// ワーカー側で使える関数の名前リスト
const methods = {};

/**
 * feeles.setAlias を上書きする
 * methods に追加することで、ワーカーで使えるようにする
 * completion が設定された場合、スニペットを登録する
 * @param {String} prefix 関数の名前(入力補完に使う)
 * @param {Function} ref 登録したい関数
 * @param {String|undefined} completion 補完したときに出てくる文字列
 */
feeles.setAlias = function(prefix, ref, completion) {
	// ワーカーで使えるように
	methods[prefix] = ref;
	if (completion) {
		// スニペットを追加
		addSnippet({ prefix, text: completion });
	}	
};

export default function (code) {
	// 魔道書の実行をフック

	// いま eval が可能か
	if (!isEnabled) {
		console.error('今はコードが実行できない！');
		return; // キャンセル
	}

	// 前回の Worker をとじる
	kill();
			
	// ゲーム終了後は eval できない
	if (!Hack.isPlaying) return;
	
	// 魔道書実行イベントを発行
	Hack.dispatchEvent(new Event('code'));
		
	// 待機してからスタート
	clearInterval(timerId);
	timerId = feeles.setTimeout(() => {

		// いま eval が可能か
		if (!isEnabled) {
			console.error('今はコードが実行できない！');
			return; // キャンセル
		}

		if (Hack.isPlaying) {
			// RUN!
			run(code);
		}

	}, window.WAIT_TIME);	
}

// もう一つのスレッドを保持する変数
// null でないとき: thread が running
let worker = null;

function run(code) {
	// ['attack', 'dash', ...]
	const asyncMethodKeywords = Object.keys(methods);
	// 特定の関数がコールされているとき、そこに await キーワードを付け足す
	// /(attack|dash|...)\(/g
	const regExp = new RegExp(`(${asyncMethodKeywords.join('|')})\\(`,  'g');

	try {
		// 全体を async function で囲み,
		// const methodNames の変数宣言を差し込み,
		// workerJs とがっちゃんこして,
		// 最後に await キーワードを補完
		code = `
const methodNames = [
	${asyncMethodKeywords.map(name => `'${name}'`).join(',')}
];
${workerJs}
(async function () {
	${code.replace(regExp, 'await $1(')}
})()`;

		// code (javascript) が取得できる URL
		const url = URL.createObjectURL(
			new Blob([code], { type: 'text/javascript' })
		);

		// 前回の Worker をとじる
		kill();
		
		// 実行開始!
		worker = new Worker(url);

		// Worker から受け取ったリクエストを処理し,
		// 終わり次第メッセージを返す
		worker.addEventListener('message', event => {
			const { id, name, args } = event.data;
			// Worker 側から指定されたメソッドをコール
			const method = methods[name];
			if (!method) {
				console.info('現在登録されているメソッド:', methods);
				throw new Error(`メソッド ${name} は登録されていません. feeles.setAlias(name, func); してください`);
			}
			method(...args).then(returnValue => {
				// ワーカーにメッセージ（戻り値）を送る
				event.target.postMessage({
					id,
					returnValue
				});
				// Hack.onsendworker を発火
				const sendworkerEvent = new Event('sendworker');
				sendworkerEvent.method = method;
				sendworkerEvent.returnValue = returnValue;
				Hack.dispatchEvent(sendworkerEvent);
			});
		});

		worker.addEventListener('error', error => {
			// もう一度メインスレッドで例外を投げる
			throw error;
		});

	} catch (error) {
		// Hack.onerror を発火
		const Event = enchant.Event;
		const errorEvent = new Event('error');
		errorEvent.target = Hack;
		errorEvent.error = error;
		Hack.dispatchEvent(errorEvent);
	}
}

// 現在実行中のプロセス（Workerをkill）
export function kill () {
	if (worker) {
		// worker が running なら
		worker.terminate();
		worker = null;			
	}
}

// eval が可能かどうかを表すフラグ (read only)
export let isEnabled = true;

export function disable() {
	isEnabled = false;	
	// 前回の Worker をとじる
	kill();
}

export function enable() {
	isEnabled = true;	
}