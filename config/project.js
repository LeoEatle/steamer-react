'use strict';

const path = require('path'),
      utils = require('steamer-webpack-utils'),
      __cwd = process.cwd(),
      __env = process.env.NODE_ENV,
      steamerConfig = require('./steamer.config');

/**
 * [config basic configuration]
 * @type {Object}
 */

var config = {
    env: __env,
    webpack: {
        path: {
            src: path.join(__cwd, "src"),
            dev: path.join(__cwd, "dev"),
            dist: path.join(__cwd, "dist"),
            sprite: path.join(__cwd, "src/img/sprites"),
        },
        selectedEntry: [], // 开发，启动的时候，可以只编译selectedEntry里的入口文件，如js/index
        hash: "[hash:6]",
        chunkhash: "[chunkhash:6]",
        imghash: "",
        contenthash: "[contenthash:6]",
    },
    webserver: steamerConfig.webserver,
    cdn: steamerConfig.cdn,
    port: steamerConfig.port,    // port for local server
    route: steamerConfig.route  // http://host/news/
};

// 自动扫描html
config.webpack.html = utils.getHtmlFile(config.webpack.path.src);
// 根据约定，自动扫描js entry，约定是src/page/xxx/main.js 或 src/page/xxx/main.jsx
/** 
    当前获取结果
    {
        'js/index': [path.join(configWebpack.path.src, "/page/index/main.js")],
        'js/spa': [path.join(configWebpack.path.src, "/page/spa/main.js")],
        'js/pindex': [path.join(configWebpack.path.src, "/page/pindex/main.jsx")],
    }
 */
config.webpack.entry = utils.getJsFile(config.webpack.path.src, 'page', 'main', ['js', 'jsx']);

config.webpack.sprites = utils.getSpriteFolder(config.webpack.path.sprite);

module.exports = config;
