require('dotenv').config()

const { execSync } = require('child_process')
const Dotenv = require('dotenv-webpack')
const path = require('path')
const { i18n } = require('./next-i18next.config')

const assetPrefixes = {}

function commitID () {
  try {
    return execSync('git rev-parse HEAD').toString('utf8').trim()
  } catch (error) {
    return error.message
  }
}

const isDevelopment = process.env.NODE_ENV === 'development'
const PANOPTES_ENV = process.env.PANOPTES_ENV || 'staging'
const webpackConfig = require('./webpack.config')
const SENTRY_CONTENT_DSN = isDevelopment ? '' : 'https://1f0126a750244108be76957b989081e8@sentry.io/1492498'
const APP_ENV = process.env.APP_ENV || 'development'
const COMMIT_ID = process.env.COMMIT_ID || commitID()
const assetPrefix = assetPrefixes[APP_ENV]

console.info({ APP_ENV, PANOPTES_ENV, assetPrefix })

const nextConfig = {
  assetPrefix,
  basePath: '/about',

  compiler: {
    styledComponents: true,
  },

  compress: false,

  env: {
    COMMIT_ID,
    PANOPTES_ENV,
    SENTRY_CONTENT_DSN,
    APP_ENV
  },

  experimental: {
    forceSwcTransforms: true,
  },

  /** localeDetection is a Next.js feature, while the rest of i18n config pertains to next-i18next */
  i18n: {
    localeDetection: false,
    ...i18n
  },

  reactStrictMode: true,

  webpack: (config, options) => {
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }
    config.plugins.concat([
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true
      })
    ])

    const newAliases = webpackConfig.resolve.alias
    const alias = Object.assign({}, config.resolve.alias, newAliases)
    config.resolve = Object.assign({}, config.resolve, { alias })
    return config
  }
}

module.exports = nextConfig
