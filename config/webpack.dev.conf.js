const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = require('./index')
const webpackConfig = require('./webpack.base.conf')
const commonExcludes = require('../lib/common-excludes')
const userWebpackConfig = require('../lib/get-user-webpack-config')('dev')

// so that everything is absolute
webpackConfig.output.publicPath = `${config.devDomain}/`

// add hot-reload related code to entry chunks
Object.keys(webpackConfig.entry).forEach((name) => {
  webpackConfig.entry[name] = [
    path.join(__dirname, '../lib/hot-client.js')
  ].concat(webpackConfig.entry[name])
})

module.exports = merge(webpackConfig, {
  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        include: paths.src,
        exclude: commonExcludes('/node_modules/'),
        loader: 'eslint-loader',
        options: {
          configFile: config.paths.eslintrc
        }
      },
      {
        test: /\.s?[ac]ss$/,
        exclude: commonExcludes(),
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true, includePaths: [].concat(config.paths.bourbon) } }
        ]
      },
      {
        test: /\.js$/,
        exclude: commonExcludes(),
        loader: 'hmr-alamo-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'BUILD_MODE': JSON.stringify('serve')
    }),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'checkout'],
      filename: '../layout/theme.liquid',
      template: './layout/theme.liquid',
      inject: true
    }),
    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'checkout'],
      filename: '../layout/search.liquid',
      template: './layout/search.liquid',
      inject: true
    }),
    new HtmlWebpackPlugin({
      excludeChunks: ['static', 'index'],
      filename: '../layout/checkout.liquid',
      template: './layout/checkout.liquid',
      inject: true
    })

  ]
}, userWebpackConfig)
