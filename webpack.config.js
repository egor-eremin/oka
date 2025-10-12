const path = require('path');

module.exports = {
	entry: './src/js/main.js',
	output: {
		path: path.resolve(__dirname, 'build/js'),
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules|bower_components/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					chunks: 'initial',
					test: /node_modules|bower_components/,
					name: 'vendor',
					enforce: true,
				},
			},
		},
	},
	resolve: {
		alias: {
			'TweenLite': path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
			'TweenMax': path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
			'TimelineLite': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
			'TimelineMax': path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
			'ScrollMagic': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
			'animation.gsap': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
			'debug.addIndicators': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'),
		},
	},
	devtool: 'source-map',
};
