const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const webpackConfig = require('./webpack.base.conf')
const commonExcludes = require('../lib/common-excludes')
const userWebpackConfig = require('../lib/get-user-webpack-config')('watch')

const config = require('../config')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AssetTagToShopifyLiquid = require('../lib/asset-tag-to-shopify-liquid')

const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const htmlMin = false

const finalConfig = merge(webpackConfig, {
  watch: true,
  devtool: 'hidden-source-map',

  module: {
    rules: [
      {
        test: /\.s?[ac]ss$/,
        exclude: commonExcludes(),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { importLoaders: 2 }
            },
            {
              loader: 'postcss-loader',
              options: { plugins: [autoprefixer, cssnano] }
            },
            {
              loader: 'sass-loader',
              options: { includePaths: [].concat(config.paths.bourbon) }
            }
          ]
        })
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' }
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),

    // extract css into its own file
    new ExtractTextPlugin('styles.[contenthash].css'),

    // generate dist/layout/theme.liquid with correct paths to assets
    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'checkout'],
      filename: '../layout/theme.liquid',
      template: './layout/theme.liquid',
      inject: true,
      hash: false,
      minify: htmlMin,
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),

    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'checkout'],
      filename: '../layout/search.liquid',
      template: './layout/search.liquid',
      inject: true,
      hash: false,
      minify: htmlMin,
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),

    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'index'],
      filename: '../layout/checkout.liquid',
      template: './layout/checkout.liquid',
      inject: true,
      hash: false,
      minify: htmlMin,
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),

    new AssetTagToShopifyLiquid(),

    // split node_modules/vendors into their own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
        )
    }),

    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    })
  ]
}, userWebpackConfig)

module.exports = finalConfig