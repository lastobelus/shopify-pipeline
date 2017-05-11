/* eslint-disable no-console */
// const path = require('path');
// const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('../config/webpack.prod.conf');
const config = require('../config');
const shopify = require('../lib/shopify-deploy');
const env = require('../lib/getShopifyEnvOrDie.js')(argv.env, config.shopify);

// // Copy over everything from the 'static' folder
// fs.copySync(path.join(__dirname, '../static'), path.join(__dirname, '../dist'), {
//   dereference: true,
// });

webpack(webpackConfig, (err, stats) => {
  if (err) throw err;

  process.stdout.write(`${stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  })}`);

  if (argv.deploy) {
    shopify.overwrite(env).then(() => {
      console.log(chalk.green('\nFiles overwritten successfully!\n'));
    }).catch((error) => {
      console.log(`\n${chalk.red(error)}\n`);
    });
  }
});
