
/* eslint-disable global-require, import/no-dynamic-require */
const fs = require('fs')
const chalk = require('chalk')
const config = require('../config')

/**
 * Find and return the user webpack config or an empty object if none is found.
 *
 * @param   env   String  The environment
 * @return        Object
 */
module.exports = (env) => {
  if (!['dev', 'prod', 'watch'].includes(env)) {
    return [{}]
  }

  const configs = ['base', env].reduce(
    (list, confName) => {
      const configPath = `${config.paths.root}/config/webpack.${confName}.conf.js`
      if (fs.existsSync(configPath)) {
        console.log(chalk.yellow(`using config from ${configPath}`))
        return list.concat(require(configPath))
      }
      return list
    },
    []
  )

  console.log('configs', configs)
  return configs
}
