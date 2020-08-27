const Path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: Path.join(__dirname, './dev/index.js'),
    output: {
        path: Path.join(__dirname, './dist/'),
        publicPath: "./",
        filename: './index.js',
        chunkFilename: './[name].chunk.js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin()
    ],
    devServer: {
        contentBase: Path.join(__dirname, './dist'),
        publicPath: '/',
        disableHostCheck: true,
        open: true, // 开启浏览器
        hot: true, // 开启热更新
    },
    devtool: "source-map", // 开启调试模式
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
        }, {
            test: /\.(gif|jpg|jpeg|png|svg)\??.*$/,
            use: [{
                loader: "file-loader",
                options: {
                    name: "[name][hash].[ext]",
                    publicPath: "./images/",
                    outputPath: "./images/",
                }
            }]
        }, {
            test: /\.(woff|svg|eot|ttf)\??.*$/,
            use: 'url-loader?limit=700&name=./' + 'fonts/[name][hash].[ext]'
        }, {
            test: /\.html$/,
            use: 'html-loader'
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.style$/,
            use: ['style-loader', 'css-loader', {
                loader: 'less-loader',
                options: {
                    javascriptEnabled: true
                }
            }]
        }, {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', {
                loader: 'less-loader',
                options: {
                    javascriptEnabled: true
                }
            }]
        }, ]
    },
    resolve: {
        alias: {
            vser: Path.resolve(__dirname, './index.js'),
        }
    }

};