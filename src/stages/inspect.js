// インスペクターに表示される状態
const state = {
	// 現在のスコア
	score: 0,
	// 残り時間（秒）
	last: 0,
	// check() の結果の数値
	result: null
};

// スコア (HTML)
const div = document.createElement('div');
div.style.position = 'absolute';
div.style.bottom = 0;
div.style.height = '150px';
div.style.fontSize = '32px';
div.style.fontWeight = 'bold';
div.style.color = 'white';
div.style.width = '100%';

feeles.fetch('resources/background.png')
	.then(response => response.blob())
	.then(blob => div.style.backgroundImage = `url(${URL.createObjectURL(blob)})`)
	.then(() => document.body.appendChild(div));

function inspect(nextState) {
	// state に上書き
	Object.assign(state, nextState);

	// 表示を更新
	const min = Math.floor(state.last / 60);
	const sec = state.last % 60;
	div.innerHTML = `
	のこり：${min > 0 ? `${min} 分 ` : ''}${sec} 秒<br />
	スコア：${state.score} 点<br />
	${state.result === null ? '' : `けっか：${state.result}`}`;
}

export default inspect;
