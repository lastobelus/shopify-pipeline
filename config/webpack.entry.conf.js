const merge = require('webpack-merge')

const config = require('../config')

const userConfig = require('../lib/get-user-webpack-config')

const userEntryConfig = userConfig.configForName('entry') || {}

const entrypoints = merge.smart(
  config.paths.entrypoints,
  userEntryConfig.entrypoints || {}
)

const entry = Object.keys(entrypoints).reduce(
  (result, entryName) => {
    result[entryName] = result[entryName].src
    return result
  },
  {}
)

module.exports = {
  entry
}
