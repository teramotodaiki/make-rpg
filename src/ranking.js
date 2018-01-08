import Hack from 'hackforplay/hack';

const config = {
	apiKey: 'AIzaSyCVt3IbyRsuEmgUsSF5cOz1zQ8KbiJJqk0',
	authDomain: 'new-rpg.firebaseapp.com',
	databaseURL: 'https://new-rpg.firebaseio.com',
	projectId: 'new-rpg',
	storageBucket: 'new-rpg.appspot.com',
	messagingSenderId: '397341167700'
};

const insertScript = src => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.src = src;
	script.onload = () => {
		resolve();
	};
	script.onerror = event => {
		reject(event.error);
	};
	// Go!
	document.body.appendChild(script);	
});

const firebasePromise = Promise.resolve()
	.then(() => insertScript('https://www.gstatic.com/firebasejs/4.8.1/firebase.js'))
	.then(() => insertScript('https://www.gstatic.com/firebasejs/4.6.0/firebase-firestore.js'))
	.then(() => {
		if (!window.firebase) {
			throw new Error('window.firebase not found');
		}
		// firebase の初期化
		window.firebase.initializeApp(config);
		// resolve する
		return window.firebase;
	})
	.catch(reason => {
		console.error(reason);
		return reason;
	});

const rating = (score = 0, lastTime = 0) => score * 1000 + lastTime;

/**
 * 
 * @param {string} stage ランキング登録するステージ
 * @param {number} score 最終スコア
 * @param {number} lastTime 残り時間[sec]
 */
export default async function ranking(stage = '') {
	// 現在のスコア
	const score = Hack.score;
	// start してからの経過時間
	const lastTime = _lastTimeMs / 1000;
	// TODO: 現在のスコアと経過時間から自分の現在順位を問い合わせる
	const rank = await getRank(stage, score, lastTime);

	let name;
	if (rank <= 100) {
		name = prompt(`あなたは現在 ${rank} 位です！おめでとう！ランキングに名前を残すことができます`);
	} else {
		name = prompt('お疲れ様でした！ランキングに登録する場合はニックネームを入力してください');
	}

	if (typeof name === 'string') {
		// OK が押された
		await addRecord({
			name,
			stage,
			score,
			lastTime
		});
		// TODO: そのステージのランキングを表示する (addRecord の中で)
	}
}

export async function getRank(stage = '', score = 0, lastTime = 0) {
	const firebase = await firebasePromise;
	return firebase
		.firestore()
		.collection('records')
		.where('stage', '==', stage)
		.where('rating', '>', rating(score, lastTime))
		.orderBy('rating', 'desc')
		.limit(100)
		.get()
		.then(querySnapshot => querySnapshot.size + 1);
}

export function isCheat({ score = 0, lastTime = 0 }) {
	const prefix = '【チートが発見されました】';
	const checks = [
		[score > window.MAX_SCORE, `${prefix}スコアの上限は${window.MAX_SCORE}ですよ！`],
		[lastTime > window.TIME_LIMIT / 1000, `${prefix}残り時間の上限は${window.TIME_LIMIT / 1000}秒ですよ！`],
		[Hack.isPlaying, `${prefix}まだゲームは終わってませんよ！`]
	];
	for (const [pred, message] of checks) {
		if (pred) {
			console.info(`${prefix}${message}`);
		}
	}
	// いずれかが true であれば cheat フラグを立てる
	return checks.some(item => item[0]);
}

export async function addRecord(data) {
	const firebase = await firebasePromise;
	// レーティング情報を付与
	data.rating = rating(data.score, data.lastTime);
	// タイムスタンプ
	data.created_at = firebase.firestore.FieldValue.serverTimestamp();
	// チートフラグ
	data.cheat = isCheat(data);
	
	return firebase
		.firestore()
		.collection('records')
		.add(data);
}

let _lastTimeMs;
/**
 * ランキング送信用の lastTime を更新する
 * @param {number} lastTime Unix タイム [ms]
 */
export function updateLastTime(lastTime = 0) {
	_lastTimeMs = lastTime;
}
