var path         = require('path')
var fs           = require('fs')
var os           = require('os')
var applib      = require(path.join(__dirname, 'app-lib.js'))
const {v4 : uuidv4} = require('uuid')

function get_usage(api_key) {
  let usage = {}

  usage['USAGE'] = []
  usage['USAGE'].push(process['CONF']['PACKAGE']['description'])
  usage['USAGE'].push("API Access: Read Only")
  usage['USAGE'].push("")
  usage['USAGE'].push("App: " + process['CONF']['PACKAGE']['name'])
  usage['USAGE'].push("Version: " + process['CONF']['PACKAGE']['version'] + ' (' + process['CONF']['PACKAGE']['version_date'] + ')')
  usage['USAGE'].push("Author: " + process['CONF']['PACKAGE']['author'])
  usage['USAGE'].push("License: " + process['CONF']['PACKAGE']['license'])
  usage['USAGE'].push("Copyright: " + process['CONF']['PACKAGE']['copyright'])
  usage['USAGE'].push("")
  usage['USAGE'].push("Return JSON or LDIF format depending on API URL")
  usage['USAGE'].push("Help URL:")
  usage['USAGE'].push('https://' + process['CONF']['BASEURL_HOST'] + ':' + process['CONF']['TCP_PORT'] + '/api' + '?key=' + api_key )

  usage['API'] = {}

  return usage
}
exports.get_usage = get_usage
