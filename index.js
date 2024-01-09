const app          = require('express')()
const https        = require('https')
const config       = require('./libs/config')
const applib       = require('./libs/app-lib.js')
const apilib       = require('./libs/api-lib.js')
const is_admin = applib.running_as_admin()

process.CONF = config

// Validate if runnign with Adminstrative (Root) permissions is allowed.
if (is_admin && !config.SECURITY.RUN_AS_ADMIN) {
  console.log("ERROR: Running with Adminstrative permissions is not permitted.")
  console.log("       See: " + config.APP.CONF_FILE)
  process.exit(1)
}


console.log(JSON.stringify(config, null, 2))

applib.logger("Started " + config.PACKAGE.name)
