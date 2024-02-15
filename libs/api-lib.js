const path          = require('path')
const fs            = require('fs')
const os            = require('os')
const {v4 : uuidv4} = require('uuid')
const xlsx          = require('xlsx');
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
  let payload = {}
  payload['CONTENT-TYPE'] = 'application/json'

  // applib.logger(JSON.stringify(req_array, null, 2))

  switch (req_array[0]) {
    case 'documents':
      let documents = get_documents()
      // applib.logger(JSON.stringify(Object.keys(documents['PAYLOAD']), null, 2))
      if (req_array[1]) {
        if (Object.keys(documents['PAYLOAD']).includes(req_array[1]))  {
          // applib.logger("DEBUG: Checkpoint 1")
          return get_document(req_array)
        } else {
          // applib.logger("DEBUG: Checkpoint 2")
          let err = {}
          err['ERROR'] = "Unknown Document: " + req_array[1]
          payload['PAYLOAD'] = err
          return payload
        }
      } else {
        // applib.logger("DEBUG: Checkpoint 3")
        return get_documents()
      }  
    default:
      // applib.logger("DEBUG: Checkpoint 4")

      payload['PAYLOAD'] = get_usage()
      return payload
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
  // applib.logger("DEBUG: get_documents")
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
  
                case 'MAPPINGS':
                  documents[did][did_key][dv][dt] = config.DOCUMENTS[did][did_key][dv][dt]
                  break;

                case 'API':
                  documents[did][did_key][dv][dt] = {}
                  for (dau in config.DOCUMENTS[did][did_key][dv][dt]) { // Document API URL
                    switch (dau) {
                      case 'CSV':
                        documents[did][did_key][dv][dt][dau] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/' +encodeURIComponent(dau)
                        documents[did][did_key][dv][dt]['CSV2JSON'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/CSV2JSON'
                        break;
                    
                      case 'XLSX':
                        documents[did][did_key][dv][dt][dau] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/' +encodeURIComponent(dau)
                        documents[did][did_key][dv][dt]['XLSX2JSON'] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/XLSX2JSON'
                        break;

                      default:
                        documents[did][did_key][dv][dt][dau] = config.WEB.BASE_URL + "/api/documents/" + encodeURIComponent(did) + '/' + encodeURIComponent(dv) + '/' +encodeURIComponent(dau)
                        break;
                    }
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
  let payload = {}
  payload['CONTENT-TYPE'] = 'application/json'
  payload['PAYLOAD'] = documents

  return payload
}

exports.get_documents = get_documents

// Get Sepcific Document
function get_document(req_array) {
  // applib.logger("DEBUG: get_document")
  // applib.logger(JSON.stringify(req_array, null, 2))

  let documents = get_documents()['PAYLOAD']
  let document = {}
  let payload = {}
  payload['CONTENT-TYPE'] = 'application/json'
  payload['PAYLOAD']      = ''

  if (Object.keys(documents).includes(req_array[1]))  { // DocID
    // applib.logger("DEBUG: Checkpoint 5")

    if (req_array[2]) { // Document Version

      if (Object.keys(documents[req_array[1]]['VERSIONS']).includes(req_array[2]))  {
        // applib.logger("DEBUG: Checkpoint 6")
        document = {}

        if(req_array[3]) { // Docuemnt Type

          if (Object.keys(documents[req_array[1]]['VERSIONS'][req_array[2]]['API']).includes(req_array[3]))  {

            let filepath = ''
            switch (req_array[3]) {
              case 'CSV2JSON':
                filepath = path.join(config.APP.DATA_DIR,config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API['CSV'])
                break;
            
              default:
                filepath = path.join(config.APP.DATA_DIR,config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]])
              break;
            }

            // applib.logger("DEBUG: Checkpoint 10")
            // applib.logger(req_array[3] + ': ' + documents[req_array[1]]['VERSIONS'][req_array[2]]['API'][req_array[3]])
            // applib.logger(filepath)

            switch (req_array[3]) {
              case 'PDF':
                payload['CONTENT-TYPE'] = 'application/pdf'
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]].split(/\//)[1]
                document = fs.readFileSync(filepath);
                break;
            
              case 'CSV':
                payload['CONTENT-TYPE'] = 'text/csv'
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]].split(/\//)[1]
                document = fs.readFileSync(filepath, 'utf-8');
                break;

              case 'CSV2JSON':
                filepath = path.join(config.APP.DATA_DIR,config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API['CSV'])
                payload['CONTENT-TYPE'] = 'application/json';
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API['CSV'].split(/\//)[1].replace(RegExp('\.csv$'), '.json');

                // applib.logger('CSV2JSON: ' + filepath)
                // applib.logger('CSV2JSON: ' + payload['FILENAME'])

                document = convertCsvToJson(fs.readFileSync(filepath, 'utf-8'))
                break;


              case 'XLSX':
                payload['CONTENT-TYPE'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheetcsv'
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]].split(/\//)[1]
                document = fs.readFileSync(filepath);
                break;

              case 'XLSX2JSON':
                filepath = path.join(config.APP.DATA_DIR,config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API['XLXS'])
                payload['CONTENT-TYPE'] = 'application/json';
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API['XLXS'].split(/\//)[1].replace(RegExp('\.csv$'), '.json');

                // applib.logger('CSV2JSON: ' + filepath)
                // applib.logger('CSV2JSON: ' + payload['FILENAME'])

                document = convertXlsxToJson(filepath);
                break;

              case 'JSON':
                payload['CONTENT-TYPE'] = 'application/json'
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]].split(/\//)[1]
                document = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
                break;
  
              default:
                payload['CONTENT-TYPE'] = 'text/plain'
                payload['FILENAME'] = config.DOCUMENTS[req_array[1]].VERSIONS[req_array[2]].API[req_array[3]].split(/\//)[1]
                document = fs.readFileSync(filepath, 'utf-8')
                break;
            }

          } else {
            // applib.logger("DEBUG: Checkpoint 11")
            let err = {}
            err['ERROR'] = "Unknown Document Type: " + req_array[3]
            document = err    
          }


        } else {
          // applib.logger("DEBUG: Checkpoint 12")

          // applib.logger(JSON.stringify(documents[req_array[1]], null, 2))
          // applib.logger(JSON.stringify(documents[req_array[1]]['VERSIONS'][req_array[2]], null, 2))
          document = documents[req_array[1]]['VERSIONS'][req_array[2]]
        }


      } else {
        // applib.logger("DEBUG: Checkpoint 7")
        let err = {}
        err['ERROR'] = "Unknown Version: " + req_array[2]
        document = err
      }

    } else {
      // applib.logger("DEBUG: Checkpoint 8")
      // applib.logger(JSON.stringify(documents[req_array[1]], null, 2))
      document = documents[req_array[1]]
    }

  } else {
    // applib.logger("DEBUG: Checkpoint 9")
    let err = {}
    err['ERROR'] = "Unknown Document: " + req_array[1]
    document = err
  }  


  payload['PAYLOAD'] = document
  // applib.logger(JSON.stringify(payload, null, 2))

  return payload
}

exports.get_document = get_documents


function convertCsvToJson(csvText) {
  if (!csvText || typeof csvText !== 'string') {
      throw new Error('Invalid input: CSV text is empty or undefined.');
  }

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
      throw new Error('Invalid input: CSV text does not contain valid data.');
  }

  const headers = lines.shift().split(',').map(header => header.trim());
  const jsonArray = [];

  lines.forEach(line => {
      const values = line.split(',');
      const obj = {};

      headers.forEach((header, index) => {
          obj[header] = values[index] ? encodeURIComponent(values[index].trim()) : '';
      });

      jsonArray.push(obj);
  });

  return jsonArray;
}




exports.convertCsvToJson = convertCsvToJson


function convertXlsxToJson(filePath) {
  // Read the Excel file synchronously
  const workbook = xlsx.readFile(filePath);

  // Initialize an empty JSON array to store the data
  const jsonArray = [];

  // Process each sheet in the workbook
  workbook.SheetNames.forEach(sheetName => {
      // Convert the sheet to JSON
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      // Add the JSON data to the array
      jsonArray.push({ [sheetName]: jsonData });
  });

  return jsonArray;
}

exports.convertXlsxToJson = convertXlsxToJson