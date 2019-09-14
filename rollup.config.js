const pkg = require('./package.json');

const banner = `/*
 * @license
 * ` + pkg.name + `
 * Version: ` + pkg.version + `
 *
 * Copyright ` + (new Date().getFullYear()) + ` Christopher Beine
 * Released under the MIT license
 * https://github.com/dudelkuchen/` + pkg.name + `/blob/master/LICENSE
 */`;

export default {
	input: 'src/largedata.js',
	banner: banner,
	format: 'umd',
	external: [
		'chart.js'
	],
	globals: {
		'chart.js': 'Chart'
	}
};