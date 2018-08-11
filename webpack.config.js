const path = require('path'); //path是webpack的基本包,处理路径
const HTMLplugin = require('html-webpack-plugin');
//新版本会要求插件
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const isDev = process.env.NODE_ENV === 'development';

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
//使用UglifyJsPlugin及OptimizeCSSPlugin插件来 压缩JS及CSS文件
//当然如果你只是想简单的压缩，而不做任何配置的话
//可以按照官方文档中给出的方法使用optimization.minimizer: true

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//视频使用extract-text-webpack-plugin来提取CSS文件
//不过在webpack 4.x中则应该使用mini-css-extract-plugin来提取CSS到单独文件中
//https://blog.csdn.net/harsima/article/details/80819747

const config = {
    target: 'web',
    //入口文件
    //__dirname代表当前文件所在目录地址
    entry: path.join(__dirname, 'src/index.js'),
    //输出文件
    output: {
        filename: 'bundle.[hash:8].js',//输出文件名
        path: path.join(__dirname, 'dist')//输出文件目录
    },
    module: {//配置加载项
        rules: [//规则
            {
                //用vue-loader来处理以vue结尾的文件,确保正确输出js代码
                test: /.vue$/,
                use: 'vue-loader'
            },
            {
                test: /.jsx$/,
                use: 'babel-loader'
            },
            /* {
                 test:/.css$/,
                 use:[
                     // style-loader是将外部css文件注入html文件中，最后将html文件中的css 用css-loader进行解析
                     'style-loader',
                     'css-loader'
                 ]
             },*/

            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024,//文件小于1024则转换成base64编码写入文件
                            name: '[name]-a.[ext]'
                        }
                    }
                ]
            }
        ]
    },
    //webpack插件配置
    plugins: [
        //能够在js代码中引用到，并且vue也能够根据此进行分类打包
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        //把引用的插件创建出来
        new VueLoaderPlugin(),
        //把对html扩展的插件创建出来
        new HTMLplugin()
    ]
};

// // 配置是根据不同的环境判断，通过设置一个环境变量来判断
if (isDev) {
    config.module.rules.push({
        test: /\.styl(us)?$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                }
            },
            'stylus-loader'
        ]
    });
    //帮助我们在页面上调试代码的,devTools官方推荐配置
    config.devtool = '#cheap-module-eval-source-map';
    config.devServer = {
        port: 8080,
        //设置0000任何地址都可以进行访问
        host: '127.0.0.1',
        overlay: {
            //这里的作用是,当我们出现错误的时候都显示到网页上
            errors: true,
        },
        //用于挂载没有渲染的页面
        // historyApiFallback:{
        //
        // },
        //在启动服务器的时候自动帮我们打开浏览器
        open: true,
        //热部署,当有更改的时候自动刷新网页
        hot: true
    };
    config.plugins.push(
        //这里加载的两个插件用于热部署,不需要刷新页面
        new webpack.HotModuleReplacementPlugin(),
        //减少不需要信息的显示
        new webpack.NodeEnvironmentPlugin()
    )
} else {
    // 生成坏境的配置
   /* config.entry = {   // 将所用到的类库单独打包
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue']
    };*/
    config.output.filename = '[name].[chunkhash:8].js';
    let extractLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {}
    };

    config.module.rules.push({
        test: /\.styl(us)?$/,

        use: [
            extractLoader,
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                }
            },
            'stylus-loader'
        ]


    });
    config.plugins.push(
        new MiniCssExtractPlugin({filename: 'styles.[contentHash:8].css'}),
       /* new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        })*/
    );
    //https://juejin.im/post/5af1677c6fb9a07ab508dabb
    //将类库文件单独打包出来
    config.optimization = {
        splitChunks: {
            chunks: 'async',// 必须三选一： "initial" | "all" | "async"(默认就是异步)
            // 大于30KB才单独分离成chunk
            minSize: 30000,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,// 最大初始化请求书，默认1
            name: true,
            cacheGroups: {//设置缓存的 chunks
                default: {
                    priority: -20,
                    reuseExistingChunk: true,
                },
                vendors: {
                    name: 'vendors',    // 要缓存的 分隔出来的 chunk 名称
                    test: /[\\/]node_modules[\\/]/, //正则规则验证 符合就提取 chunk
                    priority: -10,      // 缓存组优先级
                    chunks: "all"       // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                },

                echarts: {
                    name: 'echarts',
                    chunks: 'all',
                    // 对echarts进行单独优化，优先级较高
                    priority: 20,
                    test: function(module){
                        let context = module.context;
                        return context && (context.indexOf('echarts') >= 0 || context.indexOf('zrender') >= 0)
                    }
                }
            }
        }
        //单独打包 runtimeChunk
        ,runtimeChunk:{name: "manifest"}
        // 压缩代码
        ,minimizer: [
            // js mini
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false // set to true if you want JS source maps
            }),
            // css mini
            new OptimizeCSSPlugin({})
        ]
    }
}

module.exports = config;
