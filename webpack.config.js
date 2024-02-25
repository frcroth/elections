const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const distPath = path.resolve(__dirname, "dist");
const devMode = process.env.NODE_ENV !== "production";

let plugins = [
    new HtmlWebpackPlugin({
        template: "./index.html"
    }),
    new MiniCssExtractPlugin({
        filename: "[name].[hash].css"
    }),
];

const devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
   
];

if (devMode) {
    plugins.concat(devPlugins);
}

const config = {
    entry: [ "./js/index.js", "./css/custom.css" ],
    output: {
        filename: "main.[hash].js",
        path: distPath,
    },
    devServer: {
        port: 8080,
        hot: true
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    {
                        loader: "css-loader",
                        options: { sourceMap: devMode }
                    },
                ]
            }
        ]
    }
};

module.exports = config;
