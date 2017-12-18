const path = require('path');

module.exports = {
    entry: {
        setupMap: './src/setupMap.js',
        index: './src/frontPage.js',
        generator: './src/generator.js'
    },
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
        dgram: 'empty'
    },
    output: {
         path: path.resolve(__dirname, 'dist'),
         filename: '[name].bundle.js'
     },
     module: {
         loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.png$/,
                loader: 'url-loader',
                query: {mimetype: 'image/png'}
            },
            {
                test: require.resolve('jquery'),
                use: [
                        {
                            loader: 'expose-loader',
                            options: '$'
                        }
                    ]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader'
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader'
            }
        ]
    }
};