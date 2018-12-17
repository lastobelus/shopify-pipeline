const fs = require('fs')
const path = require('path')
const bourbon = require('node-bourbon').includePaths

const appDirectory = fs.realpathSync(process.cwd())

/**
 * Resolve a relative path to the app directory
 *
 * @return String
 */
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath)
}

/**
 * Resolve a relative path to the tool directory
 *
 * @return String
 */
function resolveSelf(relativePath) {
  return path.resolve(__dirname, '../', relativePath)
}

/**
 * Find and return the userland .eslintrc if one exists, otherwise, returns
 * shopify-pipeline .eslintrc.
 *
 * @return  String  Path to an .eslintrc file
 */
function getEslintrc() {
  const appEslintrc = resolveApp('./.eslintrc')

  if (fs.existsSync(appEslintrc)) {
    return appEslintrc
  }

  return resolveSelf('./.eslintrc')
}

module.exports = {
  root: appDirectory,
  dist: resolveApp('dist'),
  src: resolveApp('src'),
  vendors: resolveApp('src/assets/vendors'),
  lib: resolveSelf('lib'),
  entrypoints: {
    index: {
      inject: [
        'layout/theme.liquid',
        'layout/search.liquid'
      ],
      src: resolveApp('src/assets/js/index.js')
    },
    checkout: {
      inject: ['layout/checkout.liquid'],
      src: resolveApp('src/assets/js/checkout.js')
    },
    static: {
      src: resolveSelf('lib/static-files-glob.js'),
      inject: false
    }
  },
  assetsOutput: resolveApp('dist/assets'),
  userShopifyConfig: resolveApp('config/shopify.yml'),
  userServerConfig: resolveApp('config/server.yml'),
  eslintrc: getEslintrc(),
  bourbon
}
