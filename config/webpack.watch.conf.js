const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const AssetTagToShopifyLiquid = require('../lib/asset-tag-to-shopify-liquid')

const config = require('../config')
const webpackConfig = require('./webpack.base.conf')
const commonExcludes = require('../lib/common-excludes')
const userConfigs = require('../lib/get-user-webpack-config')

const userWebpackConfig = userConfigs.configForEnv('watch')


let htmlMin = false
if (argv.minify) {
  htmlMin = {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    collapseBooleanAttributes: true,
    minifyJS: true,
    minifyCSS: true,
    maxLineLength: 140,
    removeStyleLinkTypeAttributes: true,
    removeScriptTypeAttributes: true,
    removeRedundantAttributes: true
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
  }
}

const sourceMapStyle = argv.source_map || argv['source-map'] || false

const enableBrowserSync = argv['browser-sync']
const browserSyncTunnelUrl = argv['browser-sync-tunnel-url']


const configPromise = new Promise((resolve) => {
  // console.log('sourceMapStyle: ', sourceMapStyle)
  // console.log('enableBrowserSync: ', enableBrowserSync)
  // console.log('browserSyncTunnelUrl: ', browserSyncTunnelUrl)
  const finalConfig = merge.smart(webpackConfig, {
    watch: true,
    devtool: sourceMapStyle,

    // we don't want hashed names in watch mode
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js'
    },

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
        'process.env.NODE_ENV': JSON.stringify('development'),
        BUILD_MODE: JSON.stringify('watch')
      }),

      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: false
      }),

      // extract css into its own file
      new ExtractTextPlugin('[name].css'),

      // generate dist/layout/theme.liquid with correct paths to assets
      new HtmlWebpackPlugin({
        chunks: ['index'],
        filename: '../layout/theme.liquid',
        template: './layout/theme.liquid',
        inject: true,
        cache: true,
        hash: false,
        minify: htmlMin,
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency',
        InsertBrowserSync: enableBrowserSync,
        BrowserSyncTunnelUrl: browserSyncTunnelUrl
      }),

      new HtmlWebpackPlugin({
        chunks: ['index'],
        filename: '../layout/search.liquid',
        template: './layout/search.liquid',
        inject: true,
        cache: true,
        hash: false,
        minify: htmlMin,
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),

      new HtmlWebpackPlugin({
        chunks: ['checkout'],
        filename: '../layout/checkout.liquid',
        template: './layout/checkout.liquid',
        inject: true,
        cache: true,
        hash: false,
        minify: htmlMin,
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),

      new HtmlWebpackPlugin({
        chunks: ['slots'],
        filename: '../templates/page.deal-of-the-day.liquid',
        template: './templates/page.deal-of-the-day.liquid',
        inject: true,
        cache: true,
        hash: false,
        minify: false,
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),

      new AssetTagToShopifyLiquid(),

      // split node_modules/vendors into their own file
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: module => (
          module.resource
            && /\.js$/.test(module.resource)
            && module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
        )
      }),

      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      })
    ]
  }, ...userWebpackConfig)
  resolve(finalConfig)
})

module.exports = configPromise
