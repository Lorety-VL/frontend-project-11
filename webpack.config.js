// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin(),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'postcss-loader'],
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};
