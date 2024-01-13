// config.js
const path = require('path')
const fs   = require('fs')
const os   = require('os')

let config_file = path.join(__dirname, '..', 'conf', 'config.json');
let config;

try {
  config  = JSON.parse(fs.readFileSync(config_file, 'utf8'))
} catch (e) {
    console.log(e)
    process.exit(1)
}

config.APP.CONF_FILE = config_file
config.APP.RUN_DIR = path.join(__dirname, '..')

config.PACKAGE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))

// Initialize Directories
let dirs = {
  'CONF_DIR': "conf",
  'DATA_DIR': "data",
  'TMP_DIR': "",
  'LOG_DIR': "log"
}

for (d in dirs) {
  if (!config.APP.hasOwnProperty(d) || config.APP[ d ] == "") {
    if ( dirs[d].match(RegExp('^\/'))) {
      config.APP[ d ] = dirs[d]
    } else {
      config.APP[ d ] = path.join(__dirname, '..', dirs[d])
    }

    try { // If config dir exists
      let stats = fs.lstatSync(path.join(config.APP[ d ]))

      if (!stats.isDirectory()) {
        console.log('ERROR: ' + config.APP[ d ] + " is not a Directory.")
        process.exit(1)
      }
    } catch (e) {
      try {
        fs.mkdirSync(config.APP[ d ], { recursive: true })
      } catch (e) {
        console.log('ERROR:  Could not MKDIR Config Dir: ' + config.APP[ d ])
        console.log(e)
        process.exit(1)
      }
    }
  }
}
config.APP.LOG_FILE = path.join(config.APP.LOG_DIR, config.PACKAGE.name + '.log')

// process['CONF']['CREDENTIALS'] = JSON.parse(fs.readFileSync(path.join('/etc', 'skqit', 'skq-auth-api', 'skq-auth-api_credentials.json'), 'utf8'))

config.HOST = {}
config.HOST.HOSTNAME = os.hostname()

config.WEB = {}
config.WEB.PROTO = "http://"
if (config.SECURITY.HTTPS) {config.WEB.PROTO = "https://"}
config.WEB.BASEHOST = 'localhost'
config.WEB.BASE_URL = config.WEB.PROTO + config.WEB.BASEHOST + ':' + config.APP.API_TCP_PORT

for (let inc in config.INCLUDES) {
  console.log("INCLUDE: " + inc + ': '+ config.INCLUDES[inc])
  config[inc] = JSON.parse(fs.readFileSync(path.join(config.INCLUDES[inc])), 'utf8')
}

module.exports = config;
