const path         = require('path')
const app          = require('express')()
const https        = require('https')
const config       = require('./libs/config')
const applib       = require('./libs/app-lib.js')
const apilib       = require('./libs/api-lib.js')
const is_admin = applib.running_as_admin()


// Validate if runnign with Adminstrative (Root) permissions is allowed.
if (is_admin && !config.SECURITY.RUN_AS_ADMIN) {
  console.log("ERROR: Running with Adminstrative permissions is not permitted.")
  console.log("       See: " + config.APP.CONF_FILE)
  process.exit(1)
}


// Verify and Initialize Certificates
if (config.SECURITY.HTTPS) {} // TBD


// Verify and Initialize Credentials
if (config.SECURITY.ENFORCE_API_KEYS) {}  // TBD


// DEBUG
// console.log(JSON.stringify(config, null, 2))


// ============= API Routing ============
let api_key='API-KEY'


// API Queries


app.use('/api/:context/:component', function(req, res) {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  applib.logger('INFO: ACCESS GRANTED: ' + fullUrl  + ' TO: '+ req.connection.remoteAddress)

  switch (req.params.context) {
    case 'documents':
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(apilib.get_document(decodeURIComponent(req.params.component)), null, 2))
      break;
  
    default:
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(apilib.get_usage(api_key), null, 2))
      break;
  }
})

app.use('/api/:context', function(req, res) {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  applib.logger('INFO: ACCESS GRANTED: ' + fullUrl  + ' TO: '+ req.connection.remoteAddress)

  switch (req.params.context) {
    case 'documents':
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(apilib.get_documents(), null, 2))
      break;
  
    default:
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(apilib.get_usage(api_key), null, 2))
      break;
  }
})

// app.use('/api', function(req, res) {
//   if (req.query.hasOwnProperty('key')) {
//     res.writeHead(200, {'Content-Type': 'application/json'})
//     res.end(JSON.stringify(apilib.get_usage(req.query.key), null, 2))


//   // Added API Key Based Access
//   //   let valid_api_key = apilib.verify_key(req.query.key)

//   //   switch (valid_api_key) {
//   //     case true:
//   //       res.writeHead(200, {'Content-Type': 'application/json'})
//   //       res.end(JSON.stringify(apilib.get_usage(req.query.key), null, 2))
//   //       break;
//   //     case false:
//   //       apilib.access_denied(res)
//   //       break;
//   //   }
//   // } else {
//   //   apilib.access_denied(res)
//   // }
// })

app.use('/favicon.ico', function(req, res) {
  // applib.logger('INFO: ACCESS GRANTED: ' + req.originalUrl + ' TO: '+ req.connection.remoteAddress)
  res.sendFile(path.join(__dirname, 'favicon.ico'))
})

// Usage
app.use('/help', function(req, res) {
  // applib.logger('INFO: ACCESS GRANTED: ' + req.originalUrl + ' TO: '+ req.connection.remoteAddress)

  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(JSON.stringify(apilib.get_usage(api_key), null, 2))
})

app.use('/usage', function(req, res) {
  // applib.logger('INFO: ACCESS GRANTED: ' + req.originalUrl + ' TO: '+ req.connection.remoteAddress)

  res.writeHead(200, {'Content-Type': 'application/json'})
   res.end(JSON.stringify(apilib.get_usage(api_key), null, 2))
})

// Config - DISABLE For Production
app.use('/config', function(req, res) {
  // applib.logger('INFO: ACCESS GRANTED: ' + req.originalUrl + ' TO: '+ req.connection.remoteAddress)

  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(JSON.stringify(config, null, 2))
})


app.use('/', function(req, res) {
  // applib.logger('INFO: ACCESS GRANTED: ' + req.originalUrl + ' TO: '+ req.connection.remoteAddress)

    // let valid_api_key = apilib.verify_key(req.query.key)
    // switch (valid_api_key) {
    //   case true:
    //     api_key = req.query.key
    //     break;
    // }

    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(apilib.get_usage(api_key), null, 2))
})


// 404 Errors
app.use(function (req, res, next) {
  res.status(404).send("404 Page not found: " + req.url )
  var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  remote_ip = remote_ip.replace(/^\:\:ffff\:/, '') // IPv4 part only
  console.log('ERR ' + res.statusCode + ' ' + req.method + ' ' + remote_ip + ' [' + req.headers['user-agent'] + '] ' + ' ' + req.url)
})


// Starting Express Web Service
// https://hackernoon.com/set-up-ssl-in-nodejs-and-express-using-openssl-f2529eab5bb

switch (config.SECURITY.HTTPS) {
  case true: // HTTPS
    https.createServer({
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname,'cert.pem')),
        passphrase: config.CREDENTIALS.SSL.CERTIFICATE_PASSPHRASE
    }, app).listen(config.APP.API_TCP_PORT)
    break;
  default: // Non SSL
    app.listen(config.APP.API_TCP_PORT, function () {
      console.log('Auth API on: http://localhost:' + config.APP.API_TCP_PORT)
    })
}

applib.logger("Started " + config.PACKAGE.name)
applib.logger("   Version:     " + config.PACKAGE.version)
applib.logger("   Date:     " + config.PACKAGE.version_date)
applib.logger("   Description: " + config.PACKAGE.description)
