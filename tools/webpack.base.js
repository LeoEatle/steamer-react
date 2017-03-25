

var webpackConfig = {
    entry: configWebpack.entry,
    output: {
        publicPath: config.cdn,
        path: path.join(configWebpack.path.dist, "cdn"),
        filename: "[name]-" + configWebpack.chunkhash + ".js",
        chunkFilename: "chunk/[name]-" + configWebpack.chunkhash + ".js",
    },
    module: {
        loaders: [
            { 
                test: /\.jsx$/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: './.webpack_cache/',
                    "plugins": [
                        ["transform-decorators-legacy"],
                        ["transform-react-jsx", { "pragma":"preact.h" }]
                    ],
                    presets: [
                        ["es2015", {"loose": true}]
                    ]
                },
                exclude: /node_modules/,
            },
            { 
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: './.webpack_cache/',
                    plugins: ['transform-decorators-legacy'],
                    presets: [
                        ["es2015", {"loose": true}],
                        'react',
                    ]
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                // 单独抽出样式文件
                loader: ExtractTextPlugin.extract('style', 'css'),
                include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style', 'css?-autoprefixer&localIdentName=[name]-[local]-[hash:base64:5]!postcss!less?root=' + path.resolve('src')),
                // include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    "url-loader?limit=1000&name=img/[path]/[name]-" + configWebpack.hash + ".[ext]",
                    // 压缩png图片
                    // 'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
                ],
                include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.ico$/,
                loader: "url-loader?name=[name].[ext]",
                include: path.resolve(configWebpack.path.src)
            },
        ],
        noParse: [
            
        ]
    },
    postcss: function(webpack) { 
        return [
            PostcssImport(),
            Autoprefixer() 
        ]
    },
    resolve: {
        root: [
            path.resolve(configWebpack.path.src)
        ],
        moduledirectories:['node_modules', configWebpack.path.src],
        extensions: ["", ".js", ".jsx", ".es6", "css", "scss", "less", "png", "jpg", "jpeg", "ico"],
        alias: {
            // 使用压缩版本redux
            'redux': 'redux/dist/redux.min',
            'react-redux': 'react-redux/dist/react-redux',
            'utils': path.join(configWebpack.path.src, '/js/common/utils'),
            'sutils': 'steamer-browserutils/index',
            'spin': path.join(configWebpack.path.src, '/js/common/spin'),
            'spinner': path.join(configWebpack.path.src, '/page/common/components/spinner/index.js'),
            'spinner-p': path.join(configWebpack.path.src, '/page/common/components/spinner/index-p.js'),
            'net': 'steamer-net/index',
            'touch': path.join(configWebpack.path.src, '/page/common/components/touch/index.js'),
            'touch-p': path.join(configWebpack.path.src, '/page/common/components/touch/index-p.js'),
            'scroll': 'react-list-scroll/lib/',
            'scroll-p':path.join(configWebpack.path.src, '/page/common/components/scroll/index-p.js'),
            'pure-render-decorator': 'pure-render-deepCompare-decorator/dist/',
        }
    },
    plugins: [
        // remove previous dist folder
        new Clean([configWebpack.path.dist], {root: process.cwd()}),
        // inject process.env.NODE_ENV so that it will recognize if (process.env.NODE_ENV === "__PROD__")
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(config.env)
            }
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/libs/',
                to: 'libs/[name]-' + configWebpack.hash + '.[ext]'
            }
        ]),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new ExtractTextPlugin("./css/[name]-" + configWebpack.contenthash + ".css", {filenamefilter: function(filename) {
            // 由于entry里的chunk现在都带上了js/，因此，这些chunk require的css文件，前面也会带上./js的路径
            // 因此要去掉才能生成到正确的路径/css/xxx.css，否则会变成/css/js/xxx.css
            return filename.replace('/js', '');
        }}),
        new UglifyJsParallelPlugin({
            workers: os.cpus().length, // usually having as many workers as cpu cores gives good results 
            // other uglify options 
            compress: {
                warnings: false,
            },
        }),
        new WebpackMd5Hash(),
        new webpack.NoErrorsPlugin(),
    ],
    // 使用外链
    externals: {
        'react': "React",
        'react-dom': "ReactDOM",
        'preact': 'preact',
    },
    watch: false, //  watch mode
};

module.exports = webpackConfig;