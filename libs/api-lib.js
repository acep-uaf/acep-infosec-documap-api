const path          = require('path')
const fs            = require('fs')
const os            = require('os')
const {v4 : uuidv4} = require('uuid')
const applib        = require(path.join(__dirname, 'app-lib.js'))
const config        = require('./config')

function get_usage(api_key) {
  let usage = {}

  usage['APP'] = {}
  usage['APP']['Name']      = config.PACKAGE.name
  usage['APP']['Desc']      = config.PACKAGE.description
  usage['APP']['Version']   = config.PACKAGE.version + ' (' + config.PACKAGE.version_date + ')'
  usage['APP']['Git']       = config.PACKAGE.repository.url
  usage['APP']['Author']    = config.PACKAGE.author
  usage['APP']['License']   = config.PACKAGE.license
  usage['APP']['Copyright'] = "Copyright " + config.PACKAGE.copyright
  usage['APP']['Org']       = config.PACKAGE.copyright_url
  usage['APP']['Access']    = "Read Only"

  usage['HELP'] = {}
  usage['HELP']['BASE'] = config.WEB.BASE_URL + '/'
  usage['HELP']['HELP'] = config.WEB.BASE_URL + '/help'
  usage['HELP']['USAGE'] = config.WEB.BASE_URL + '/usage'

  usage['CONFIG'] = config.WEB.BASE_URL + '/config'

  usage['API'] = {}
  usage['API']['DESC'] = "API Usage"
  usage['API']['URL']  = config.WEB.BASE_URL + '/api'


  usage['API']['DOCUMENTS'] = {}
  usage['API']['DOCUMENTS']['DESC'] = "List of Available Documents"
  usage['API']['DOCUMENTS']['URL']  = config.WEB.BASE_URL + '/api/documents'

  return usage
}
exports.get_usage = get_usage


function api_router(req_array) {

  applib.logger(JSON.stringify(req_array, null, 2))

  switch (req_array[0]) {
    case 'documents':
      let documents = get_documents()
      if (req_array[1]) {
        if (Object.keys(documents).includes(req_array[1]))  {
          return get_document(req_array[1])
        } else {
          return get_documents()
        }
      } else {
        return get_documents()
      }  
    default:
      return get_usage()
      break;
  }
}

exports.api_router = api_router


function verify_key(api_key) {
  let verfied = false
  for (k in config['CREDENTIALS']['API_KEYS']) {
    if (api_key == config['CREDENTIALS']['API_KEYS'][k]) {
      verfied = true
      applibs.logger('INFO: API_KEY: ' + k)
    }
  }

  return verfied
}


exports.verify_key = verify_key

function access_denied(resout) {
  let error_res = {}
  error_res['ERROR'] = 'Access Denied'
  resout.writeHead(200, {'Content-Type': 'application/json'})
  resout.end(JSON.stringify(error_res, null, 2))
}

exports.access_denied = access_denied


// API Query Functions

// Get a list of Documents

function get_documents() {
  let documents = {}

  for (let did in config.DOCUMENTS) { // did = Document ID
    documents[did] = {}

    for (did_key in config.DOCUMENTS[did]) {
      switch (did_key) {
        case 'TITLE':
          documents[did][did_key] = config.DOCUMENTS[did][did_key]
          documents[did]['API_URL'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did)
          break;

        case 'VERSIONS':
          documents[did][did_key] = {}
          for (dv in config.DOCUMENTS[did][did_key]) { // dv = Doc Version
            // console.log(did + ' | ' + did_key + ' | ' + dv)
            documents[did][did_key][dv] = {}
            documents[did][did_key][dv]['API_URL'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + dv
      
            for (dt in config.DOCUMENTS[did][did_key][dv]) { // dt = Doc Type
              switch (dt) {
                case 'CSV':
                  // console.log(did + ' | ' + did_key + ' | ' + dv + ' | ' + dt)
                  documents[did][did_key][dv][dt] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/' +encodeURIComponent(dt)  
                  documents[did][did_key][dv]['CSV2JSON'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/CSV2JSON'   
                  break;

                case 'WEBSITE':
                  documents[did][did_key][dv][dt] = config.DOCUMENTS[did][did_key][dv][dt]
                  break;

                case 'SOURCE':
                  documents[did][did_key][dv][dt] = config.DOCUMENTS[did][did_key][dv][dt]
                  break;
  
                case 'API':
                  documents[did][did_key][dv][dt] = {}
                  for (dau in config.DOCUMENTS[did][did_key][dv][dt]) { // Document API URL
                    documents[did][did_key][dv][dt][dau] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/' +encodeURIComponent(dau)
                  }
                  break;
                
                default:
                  // console.log(did + ' | ' + did_key + ' | ' + dv + ' | ' + dt)
                    
                  break;
              }
            }
          }
          break;
          
        default:
          documents[did][did_key] = config.DOCUMENTS[did][did_key]
          break;
      }
    }   
  }
  
  delete documents.INCLUDES
  return documents
}

exports.get_documents = get_documents

// Get Sepcific Document
function get_document(doc_id) {
  let documents = {}

  switch (doc_id) {
    case "":
      for (let did in config.DOCUMENTS) {
        documents[did] = {}
    
        for (did_key in config.DOCUMENTS[did]) {
          switch (did_key) {
            case 'TITLE':
              documents[did][did_key] = config.DOCUMENTS[did][did_key]
              documents[did]['URL'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did)
          
            default:
              documents[did][did_key] = config.DOCUMENTS[did][did_key]
              break;
          }
        }   
      }
      break;

  }
  
  return documents
}

exports.get_document = get_document