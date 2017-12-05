/* global feeles */
import enchant from '../enchantjs/enchant';
import Hack from '../hackforplay/hack';
import workerJs from 'raw-loader!worker';

// コードを受け取ってから実行を開始するまでの待機時間
window.WAIT_TIME = 3000;

// setTimeout の戻り値を保持する
let timerId;

// ワーカー側で使える関数の名前リスト
const methods = {};

// feeles.setAlias を上書き
// methods に追加することで、ワーカーで使えるようにする
// => feeles.exports に書き出すのをやめる
// => 'message.complete' イベントを発火させない
feeles.setAlias = function(name, ref) {
	methods[name] = ref;
};

export default function (code) {
	// 魔道書の実行をフック

	// 前回の Worker をとじる
	kill();
			
	// ゲーム終了後は eval できない
	if (!Hack.isPlaying) return;
	
	// 魔道書実行イベントを発行
	Hack.dispatchEvent(new Event('code'));
		
	// 待機してからスタート
	clearInterval(timerId);
	timerId = feeles.setTimeout(() => {

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
			method(...args).then(() => {
				event.target.postMessage({
					id
				});
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