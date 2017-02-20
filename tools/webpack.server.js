var express = require('express');
var app = express();
var webpack = require('webpack');
var MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var proxy = require('proxy-middleware');
var path = require('path');

var webpackConfig = require("./webpack.dev.js"),
	config = require("../config/project");
var port = config.port;

for (var key in webpackConfig.entry) {
	webpackConfig.entry[key].unshift('webpack-hot-middleware/client');
	webpackConfig.entry[key].unshift('react-hot-loader/patch');
}

var compiler = webpack(webpackConfig),
	devMiddleWare = webpackDevMiddleware(compiler, {
	    hot: true,
		historyApiFallback: true,
		// noInfo: true,
		stats: { 
			chunks: false,
			colors: true 
		},
	}),
	hotMiddleWare = webpackHotMiddleware(compiler);


app.use(devMiddleWare);

app.use(function(req, res, next) {

	let url = req.url;

	let basename = path.basename(url, '.html'),
		key = 'js/' + basename;
	
	if (url.indexOf(config.route) === 0 && config.webpack.entry[key] && !webpackConfig.entry[key]) {

		console.log('entryChunk: ' + key);

		config.webpack.entry[key].unshift('webpack-hot-middleware/client');
		config.webpack.entry[key].unshift('react-hot-loader/patch');

		compiler.apply(new MultiEntryPlugin(process.cwd(), config.webpack.entry[key], key));

		devMiddleWare.invalidate(); // 强制重新构建一次，不用调用多次，后续的触发由 webpack 自己 hot reload
		webpackConfig.entry[key] = config.webpack.entry[key];
		delete config.webpack.entry[key];

		devMiddleWare.waitUntilValid(() => {
			console.log('webpack-dev-seveer invalidate done!');
			next();
		});

	}
	else {
		next();
	}
});

app.use(hotMiddleWare);

// 前端转发
app.use(config.route, proxy('http://localhost:' + port));

// 后台转发
app.use('/api/', proxy('http://localhost:3001'));

app.listen(port, function(err) {
	if (err) {
		console.error(err);
	}
	else {
		console.info("Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port);
	}
});