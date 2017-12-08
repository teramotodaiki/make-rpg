export default [
	/* プレイヤーに命令する関数 */
	{
		prefix: 'wait',
		text: 'wait(1) // やすめ'
	},
	{
		prefix: 'turnRight',
		text: 'turnRight() // まわれ右'
	},
	{
		prefix: 'turnLeft',
		text: 'turnLeft() // まわれ左'
	},
	{
		prefix: 'dash',
		text: 'dash() // ダッシュ！'
	},
	{
		prefix: 'headUp',
		text: 'headUp() // 上を向け'
	},
	{
		prefix: 'headRight',
		text: 'headRight() // 右を向け'
	},
	{
		prefix: 'headDown',
		text: 'headDown() // 下を向け'
	},
	{
		prefix: 'headLeft',
		text: 'headLeft() // 左を向け'
	},
	{
		prefix: 'attack',
		text: 'attack() // まほうでこうげき'
	},
	{
		prefix: 'locate',
		text: 'locate(7, 5) // しゅんかんいどう'
	},
	/* ループ */
	{
		prefix: 'for',
		text: `
// くりかえす
for (let かず = 0; かず < 10; かず++) {

}
`
	},
	{
		prefix: 'while',
		text: `
// check が 0 の間ずっとくりかえす
while (check() === 0) {

}
`
	},
	/* 分岐 */
	{
		prefix: 'if',
		text: `
// check が 1 のときだけ中に入る
if (check() === 1) {
	
}
`
	}
];
