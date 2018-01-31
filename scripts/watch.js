/*
 * Run Webpack with the webpack.prod.conf.js configuration file. Write files to disk.
 *
 * If the `deploy` argument has been passed, deploy to Shopify when the compilation is done.
 */
const argv = require('minimist')(process.argv.slice(2))
process.env.watch = true

const chalk = require('chalk')
const webpack = require('webpack')
const webpackConfig = require('../config/webpack.watch.conf')
const uploader = require('../lib/shopify-uploader')

const config = require('../config')
const shopify = require('../lib/shopify-deploy')
const env = require('../lib/get-shopify-env-or-die')(argv.env, config.shopify)
process.env.SHOPIFY_ENV = env

const util = require('util')
// const debuglog = util.debuglog('shopify-upload')
// debuglog('webpack-config:\n %o', webpackConfig)


if (!argv.inc) {
  uploader.uploadChanges()
}

webpack(webpackConfig, (err, stats) => {
  if (err) throw err

  process.stdout.write(`${stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  })}`)
})
