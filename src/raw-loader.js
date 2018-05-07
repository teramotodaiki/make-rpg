/* global feeles */

// raw-loader: inspired https://github.com/webpack-contrib/raw-loader
export async function load(mapName, localRequire, load) {
	
	// NOTICE: feeles.fetch は, base64 encode されたファイルの中身を
	// さらに Blob にして Response に与えている
	// この Blob をもとに Blob URL を生成したとき,
	// Windows/Chrome では Cross Origin Request として扱われる
	// これを回避するため, feeles.fetchDataURL を使う
	const dataURL = await feeles.fetchDataURL(mapName);
	const base64 = dataURL.split(',')[1];
	const text = decodeURIComponent(escape(atob(base64)));
	load(text);
	
}
	