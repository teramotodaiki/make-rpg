export default [
	/* プレイヤーに命令する関数 */
	{
		prefix: 'wait',
		text: 'wait(1) // やすめ\n'
	},
	{
		prefix: 'turnRight',
		text: 'turnRight() // まわれ右\n'
	},
	{
		prefix: 'turnLeft',
		text: 'turnLeft() // まわれ左\n'
	},
	{
		prefix: 'dash',
		text: 'dash() // ダッシュ！\n'
	},
	{
		prefix: 'headUp',
		text: 'headUp() // 上を向け\n'
	},
	{
		prefix: 'headRight',
		text: 'headRight() // 右を向け\n'
	},
	{
		prefix: 'headDown',
		text: 'headDown() // 下を向け\n'
	},
	{
		prefix: 'headLeft',
		text: 'headLeft() // 左を向け\n'
	},
	{
		prefix: 'attack',
		text: 'attack() // まほうでこうげき\n'
	},
	{
		prefix: 'locate',
		text: 'locate(7, 5) // しゅんかんいどう\n'
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
