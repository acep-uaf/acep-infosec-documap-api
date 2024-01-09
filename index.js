const path         = require('path')
const fs           = require('fs')
const os           = require('os')
const app          = require('express')();
const https        = require('https')
const auth         = require('http-auth')
const applib       = require(path.join(__dirname, 'libs', 'app-lib.js'))
const apilib       = require(path.join(__dirname, 'libs', 'api-lib.js'))


const is_admin = applib.running_as_admin()
const config_file = path.join(__dirname, 'conf', 'config.json')

try {
  process['CONF']  = JSON.parse(fs.readFileSync(config_file, 'utf8'))
} catch (e) {
    console.log(e)
    process.exit(1)
}

process['CONF']['APP']['RUN_DIR'] = path.join(__dirname)

process['CONF']['PACKAGE'] = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))

// Initialize Directories
let dirs = {
  'CONF_DIR': "conf",
  'DATA_DIR': "data",
  'TMP_DIR': "",
  'LOG_DIR': "log"
}

for (d in dirs) {
  if (!process['CONF']['APP'].hasOwnProperty(d) || process['CONF']['APP'][ d ] == "") {
    if ( dirs[d].match(RegExp('^\/'))) {
      process['CONF']['APP'][ d ] = dirs[d]
    } else {
      process['CONF']['APP'][ d ] = path.join(__dirname, dirs[d])
    }

    try { // If config dir exists
      let stats = fs.lstatSync(path.join(process['CONF']['APP'][ d ]))

      if (!stats.isDirectory()) {
        console.log('ERROR: ' + process['CONF']['APP'][ d ] + " is not a Directory.")
        process.exit(1)
      }
    } catch (e) {
      try {
        fs.mkdirSync(process['CONF']['APP'][ d ], { recursive: true })
      } catch (e) {
        console.log('ERROR:  Could not MKDIR Config Dir: ' + process['CONF']['APP'][ d ])
        console.log(e)
        process.exit(1)
      }
    }
  }
}
process['CONF']['APP']['LOG_FILE'] = path.join(process['CONF']['APP']['LOG_DIR'], process['CONF']['PACKAGE']['name'] + '.log')

// process['CONF']['CREDENTIALS'] = JSON.parse(fs.readFileSync(path.join('/etc', 'skqit', 'skq-auth-api', 'skq-auth-api_credentials.json'), 'utf8'))

process['CONF']['HOST'] = {}
process['CONF']['HOST']['HOSTNAME'] = os.hostname()


// Validate if runnign with Adminstrative (Root) permissions is allowed.
if (is_admin && !process['CONF']['RUN_AS_ADMIN']) {
  console.log("ERROR: Running with Adminstrative permissions is not permitted.")
  console.log("       See: " + config_file)
  process.exit(1)
}

console.log(JSON.stringify(process['CONF'], null, 2))

applib.logger("Started " + process['CONF']['PACKAGE']['name'])
