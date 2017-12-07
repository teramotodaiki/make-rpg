// インスペクターに表示される状態
const state = {
	// 現在のスコア
	score: 0,
	// 残り時間（秒）
	last: 0
};

// スコア (HTML)
const div = document.createElement('div');
div.style.position = 'absolute';
div.style.bottom = 0;
div.style.height = '100px';
div.style.fontSize = '32px';
div.style.fontWeight = 'bold';
div.style.backgroundColor = 'white';
div.style.width = '100%';
document.body.appendChild(div);

function inspect(nextState) {
	// state に上書き
	Object.assign(state, nextState);

	// 表示を更新
	const min = Math.floor(state.last / 60);
	const sec = state.last % 60;
	div.innerHTML = `
	スコア：${state.score} 点<br />
	のこり：${min > 0 ? `${min} 分` : ''}${sec} 秒`;
}

export default inspect;
