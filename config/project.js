'use strict';

const path = require('path'),
      os = require('os'),
      webpack = require('webpack'),
      utils = require('steamer-webpack-utils'),
      steamerConfig = require('./steamer.config'),
      __basename = path.dirname(__dirname),
      __env = process.env.NODE_ENV,
      isProduction = __env === 'production';

var srcPath = path.resolve(__basename, 'src'),
    devPath = path.resolve(__basename, 'dev'),
    distPath = path.resolve(__basename, 'dist'),
    spritePath = path.resolve(__basename, 'src/img/sprites');

var hash = '[hash:6]',
    chunkhash = '[chunkhash:6]',
    contenthash = '[contenthash:6]';

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HappyPack = require('happypack');

// ========================= webpack快捷配置 =========================
// 基本情况下，你只需要关注这里的配置
var config = {
    // ========================= webpack环境配置 =========================
    env: __env,

	// 默认使用的npm命令行
	npm: 'npm',

    webpack: {

        // ========================= webpack路径与url =========================
        // 项目路径
        path: {
            src: srcPath,
            dev: devPath,
            dist: distPath,
            sprite: spritePath,
            distCdn: 'cdn', // 生成cdn的目录，dist/cdn
            distWebserver: '../webserver' // 生成webserver的目录, dist/webserver， 目录相对于 distCdn
        },

        // ========================= webpack服务器及路由配置 =========================
        // 开发服务器配置
        webserver: steamerConfig.webserver,
        cdn: steamerConfig.cdn,
        cssCdn: steamerConfig.cssCdn || steamerConfig.cdn,
        imgCdn: steamerConfig.imgCdn || steamerConfig.cdn,
        port: steamerConfig.port, // port for local server
        route: steamerConfig.route, // http://host/news/

        // ========================= webpack自定义配置 =========================

        // 是否清理生成文件夹
        clean: true,
        // sourcemap
        sourceMap: {
            development: false,
            production: false
        },

        // javascript 方言，目前仅支持 ts(typescript)
        js: [],

        // 预编译器，默认支持css 和 less. sass, scss 和 stylus 由npm-install-webpack-plugin自动安装
        style: [
            'css', 'less'
        ],
        // 生产环境是否提取css
        extractCss: true,
        // 是否启用css模块化
        cssModule: false,

        // 合图，normal (仅1倍图) , retinaonly (仅2倍图), retina (包括1倍及2倍图), none (不使用合图)
        spriteMode: 'normal',
        // 默认支持less. sass, scss 和 stylus 由npm-install-webpack-plugin自动安装
        spriteStyle: 'less',

        // html 模板. 默认支持html 和 ejs, handlebars 和 pug 由npm-install-webpack-plugin自动安装
        template: [
            'html'
        ],

        // 生产环境下资源(js, css, html)是否压缩
        compress: true,

        // 不经webpack打包的资源
        static: [
            {
                src: 'libs/',
                hash: true
            }
        ],

        // 利用DefinePlugin给应用注入变量
        injectVar: {
            'process.env': {
                NODE_ENV: JSON.stringify(__env)
            }
        },

        // webpack resolve.alias 包别名
        alias: {
            'react/lib/ReactMount': 'react-dom/lib/ReactMount',
            'redux': isProduction ? 'redux/dist/redux.min' : 'redux/dist/redux',
            'react-redux': 'react-redux/dist/react-redux',
            'utils': path.join(srcPath, '/js/common/utils'),
            'sutils': 'steamer-browserutils/index',
            'net': 'steamer-net/index',
            'touch': 'react-touch-component/lib/index',
            'touch-p': 'react-touch-component/lib/pindex',
            'scroll': 'react-list-scroll/dist/',
            'scroll-p': 'react-list-scroll/dist/pindex',
            'pure-render-decorator': 'pure-render-deepCompare-decorator/dist/',
            'pure-render-immutable-decorator': 'pure-render-immutable-decorator/dist'
        },

        // 文件名与哈希, hash, chunkhash, contenthash 与webpack的哈希配置对应
        hash: hash,
        chunkhash: chunkhash,
        contenthash: contenthash,
        hashName: isProduction ? ('[name]-' + hash) : '[name]',
        chunkhashName: isProduction ? ('[name]-' + chunkhash) : '[name]',
        contenthashName: isProduction ? ('[name]-' + contenthash) : '[name]',

        // ========================= webpack entry配置 =========================
        // 根据约定，自动扫描js entry，约定是src/page/xxx/main.js 或 src/page/xxx/main.jsx
        /** 
            获取结果示例
            {
                'js/index': [path.join(configWebpack.path.src, "/page/index/main.js")],
                'js/spa': [path.join(configWebpack.path.src, "/page/spa/main.js")],
                'js/pindex': [path.join(configWebpack.path.src, "/page/pindex/main.jsx")],
            }
         */
        entry: utils.filterJsFileByCmd(utils.getJsEntry({
            srcPath: path.join(srcPath, 'page'), 
            fileName: 'main',
            extensions: ['js', 'jsx', 'ts', 'tsx'],
            keyPrefix: 'js/',
            level: 1
        })),

        // 自动扫描html，配合html-res-webpack-plugin
        /**
            获取结果示例
            [ 
                { 
                    key: 'index',
                    path: 'path/src/page/index/index.html'
                },
                { 
                    key: 'spa',
                    path: 'path/src/page/spa/index.html'
                },
                { 
                    key: 'pindex',
                    path: 'path/src/page/pindex/index.html'
                } 
            ]
         */
        html: utils.filterHtmlFileByCmd(utils.getHtmlEntry({
            srcPath: path.join(srcPath, 'page'),
            level: 1
        })),

        // 自动扫描合图，配合webpack-spritesmith插件
        /**
            获取结果示例
            [
                { 
                    key: 'btn',
                    path: 'path/src/img/sprites/btn'
                },
                { 
                    key: 'list',
                    path: 'path/src/img/sprites/list'
                } 
            ]
         */
        sprites: utils.getSpriteEntry({
            srcPath: spritePath
        })

    }
};

// ========================= webpack深度配置 =========================
// 使用了webpack-merge与webpack.base.js进行配置合并
// 如果上面的配置仍未能满足你，你可以在此处对webpack直接进行配置，这里的配置与webpack的配置项目一一对应
config.custom = {
    // webpack output
    getOutput: function() {
        return {};
    },

    // webpack module
    getModule: function() {
        var module = {
            rules: [
                
            ]
        }; 

        var jsRule = null;

        if (isProduction) {
            // js 使用了 happypack 进行编译，具体 babel 配置参看 happypack 插件的配置
            jsRule = { 
                test: /\.js$/,
                loader: 'happypack/loader?id=1',
                exclude: /node_modules/
            };
        }
        else {
            jsRule = { 
                test: /\.js$/,
                use: [
                    {
                        loader: 'cache-loader',
                        options: {
                            // provide a cache directory where cache items should be stored
                            cacheDirectory: path.resolve('.cache')
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                'react-hot-loader/babel'
                            ]
                        }
                    }
                ],
                exclude: /node_modules/
            };
        }

        module.rules.push(jsRule);
        
        return module;
    },

    // webpack resolve
    getResolve: function() {
        return {
            alias: config.webpack.alias
        };
    },

    // webpack plugins
    getPlugins: function() {
        var plugins = [
            new ExtractTextPlugin({
                filename: (getPath) => {
                  return getPath('css/' + config.webpack.contenthashName + '.css').replace('css/js', 'css');
                },
                allChunks: false,
                disable: !((isProduction || !config.webpack.extractCss))
            }),
            new webpack.ProvidePlugin({
                Promise: 'imports?this=>global!exports?global.Promise!es6-promise'
            })
        ];

        if (isProduction) {
            plugins.push(new HappyPack({
                id: '1',
                verbose: false,
                loaders: [{
                    path: 'babel-loader',
                    options: {
                        cacheDirectory: './.cache/'
                    }
                }]
            }));
        }

        config.webpack.html.forEach(function(page, key) {
            plugins.push(new HtmlResWebpackPlugin({
                mode: 'html',
                filename: isProduction ? (config.webpack.path.distWebserver + '/' + page.key + '.html') : page.key + '.html',
                template: page.path,
                favicon: 'src/favicon.ico',
                htmlMinify: null,
                entryLog: !key,
                cssPublicPath: isProduction ? config.webpack.cssCdn : config.webpack.webserver,
                templateContent: function(tpl) {
                    if (isProduction) {
                        return tpl;
                    }

                    var regex = new RegExp('<script.*src=["|\']*(.+).*?["|\']><\/script>', 'ig');

                    tpl = tpl.replace(regex, function(script, route) {
                        if (!!~script.indexOf('react.js') || !!~script.indexOf('react-dom.js')) {
                            return '';
                        }
                        return script;
                    });
                    return tpl;
                }
            }));
        }); 

        return plugins;
    },
        
    // webpack externals
    getExternals: function() {
        if (isProduction) {
            return {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'preact': 'preact'
            };
        }

        return {};
    },

    // 其它 webpack 配置
    getOtherOptions: function() {
        return {};
    }
};

// ========================= webpack merge 的策略 =========================
config.webpackMerge = {
    // webpack-merge smartStrategy 配置
    smartStrategyOption: {
        'module.rules': 'prepend',
        'plugins': 'append'
    },

    // 在smartStrategy merge 之前，用户可以先行对 webpack.base.js 的配置进行处理
    mergeProcess: function(webpackBaseConfig) {
        return webpackBaseConfig;
    }
};

module.exports = config;