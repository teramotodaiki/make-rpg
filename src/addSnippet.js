/* global feeles */

const snippets = [];

const sendCompletion = () => {
	// 必要な入力補完の情報をエディタに送る
	feeles.connected.then(({ port }) => {
		console.log(snippets);
		port.postMessage({
			// id: getUniqueId(),
			query: 'complete',
			value: snippets
		});
	});
};

/**
 * 
 * @param {String} prefix この文字を打ったとき補完する
 * @param {String} text 選択されたときこの文字が出る
 */
function addSnippet(...append) {
	// 新しくスニペットを追加
	snippets.push(...append);
	// 送り直す
	sendCompletion();
}

export default addSnippet;
