const Path = require('path');
const Webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: {
        index: './index.js',
    },
    output: {
        path: Path.join(__dirname, './dist/'),
        publicPath: "./",
        filename: './[name].js',
        chunkFilename: './[name].js',
        library: 'Vser', // 模块名称
        libraryTarget: 'umd', // 输出格式
        globalObject: 'window'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: "/node_modules/",
            use: {
                loader: 'babel-loader?cacheDirectory',
                options: {
                    presets: ['es2015-loose']
                }
            }
        }]
    },
    externals: {
        lodash: {
            commonjs: 'lodash',
            commonjs2: 'lodash',
            amd: 'lodash',
            root: '_'
        }
    },
    optimization: {
        minimizer: [
            // new UglifyJsPlugin({
            //     cache: true,
            //     parallel: true,
            //     sourceMap: false, // set to true if you want JS source maps
            //     uglifyOptions: {
            //         ie8: true
            //     }
            // })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: __dirname,
            verbose: true,
            dry: false
        })
    ]
};