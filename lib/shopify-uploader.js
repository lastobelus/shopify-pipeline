#!/usr/bin/env node
const chalk = require('chalk')
const path = require('path')
const themekit = require('@shopify/themekit').command
const watch = require('node-watch')
const EventEmitter = require('events')
const { TokenBucket } = require('limiter')
const md5 = require('md5')
const fs = require('fs')
const config = require('../config')
const util = require('util')
const debuglog = util.debuglog('shopify-upload')

process.env.NODE_DEBUG = process.env.NODE_DEBUG || 'shopify-upload'

const themekitSettings = {
  env: 'development',
  deployRoot: config.paths.dist,
  defaultArgs: [
    '--no-update-notifier',
    '--config', config.paths.userShopifyConfig
  ]
}

const themekitEnv = 'development'
const defaultArgs = [
  '--no-update-notifier',
  '--config', 'config/shopify.yml'
]

const bucketSize = 74 // bucket size is 80, when I used 80 I got frequent errors. At 75 I got an error very rarely
const refillRate = 4
EventEmitter.defaultMaxListeners = bucketSize + 1
const bucket = new TokenBucket(bucketSize, refillRate, 'second')
bucket.content = bucket.bucketSize


const hashCache = {}

function actOnFile(file, action, cb) {
  bucket.removeTokens(1, () => {
    themekit(
      {
        args: [
          action,
          '--env',
          themekitSettings.env,
          ...themekitSettings.defaultArgs,
          file
        ],
        cwd: themekitSettings.deployRoot
      },
      (err) => {
        cb(err, file)
      }
    )
  })
}

function uploadFile(file, cb) {
  actOnFile(file, 'upload', cb)
}

function removeFile(file, cb) {
  actOnFile(file, 'remove', cb)
}

module.exports = {
  uploadChanges() {
    const watchDir = config.paths.dist
    !fs.existsSync(watchDir) && fs.mkdirSync(watchDir)
    debuglog(chalk.green(`\n\nwatching ${watchDir} with bucketSize: ${bucketSize}, refillRate: ${refillRate}\n`))
    watch(watchDir, { recursive: true }, (evt, filePath) => {
      const name = path.relative(watchDir, filePath)
      const handleResult = (err, file) => {
        if (err) {
          debuglog('') // need to ensure progress bars don't overwite errors
          debuglog(chalk.red(`failed to upload ${file}`))
          debuglog('')
        } else {
          // console.log('.')
          // console.log('uploaded', file)
          // console.log('.')
        }
      }

      if (evt === 'update') {
        fs.readFile(filePath, (err, buf) => {
          const hash = md5(buf)
          if (hashCache[name] !== hash) {
            debuglog(chalk.cyan(`uploading, ${name}`))
            uploadFile(name, handleResult)
            hashCache[name] = hash
          } else {
            debuglog(chalk.black(`  (unchanged) ${name}`))
          }
        })
      }

      if (evt === 'remove') {
        debuglog(chalk.cyan(`removing, ${name}`))
        removeFile(name, handleResult)
      }
    })
  }
}

