// App Library FUnction from John Haverlack (john@haverlack.net)
// License: ISC (https://opensource.org/licenses/ISC)
var path         = require('path')
var fs           = require('fs')
var os           = require('os')
const isAdmin    = require('is-admin')
const config     = require('./config')

function logger(message) {
  let now = tell_time()
  let ts = now['UTC']['ISO8601']
  let logfile = path.join(config.APP.LOG_FILE)

  try {
    fs.appendFileSync(logfile, ts + ' : '+ message + "\n", 'utf8')
  } catch (e) {
    console.log("ERROR: Cannot write Log File: " + logfile)
    process.exit(1)
  }
}

exports.logger = logger

function running_as_admin() { // Code Source: ABL Rolecall (http://appliedbitlogistics.io/)

  let admin_perms = false

  switch(os.platform()) {
    case "linux":
      if (os.userInfo['username'] == 'root' || os.userInfo()['uid'] == 0) {
        admin_perms = true
      }
    break

    case "darwin":
      if (os.userInfo()['username'] == 'root' || os.userInfo()['uid'] == 0) {
        admin_perms = true
      }
    break

    case "win32":
    let isAdmin = require('is-admin')

    isAdmin().then(elevated => {
      if (elevated) {
        admin_perms = true
      }
    })
    break
  }

  return admin_perms
}

exports.running_as_admin = running_as_admin

function tell_time (ts) {
       var timeds = {} // Time Data Structure
       var time = new Date()

       if(ts) {
         if(String(ts).match(/^\d+$/)) {
           time = new Date(ts*1000)
         } else {
           time = new Date(ts)
         }
       }

       timeds['LOCAL'] = {}
       timeds['LOCAL']['YYYY']  = '' + time.getFullYear() + ''

       if(time.getMonth() < 9) {
           timeds['LOCAL']['MM'] = '0' + (time.getMonth() + 1) + ''
       }else {
           timeds['LOCAL']['MM'] = '' + (time.getMonth() + 1) + ''
       }

       if(time.getDate() <= 9) {
           timeds['LOCAL']['DD'] = '0' + time.getDate() + ''
       }else {
           timeds['LOCAL']['DD'] = '' + time.getDate() + ''
       }

       if(time.getHours() <= 9) {
           timeds['LOCAL']['hh'] = '0' + time.getHours() + '';
       }else {
           timeds['LOCAL']['hh'] = '' + time.getHours() + '';
       }

       if(time.getMinutes() <= 9) {
           timeds['LOCAL']['mm'] = '0' + time.getMinutes() + '';
       }else {
           timeds['LOCAL']['mm'] = '' + time.getMinutes() + '';
       }

       if(time.getSeconds() <= 9) {
           timeds['LOCAL']['ss'] = '0' + time.getSeconds() + '';
       }else {
           timeds['LOCAL']['ss'] = '' + time.getSeconds() + '';
       }

       timeds['LOCAL']['ms'] = time.getMilliseconds()

       timeds['LOCAL']['YYYY-MM-DD']   = timeds['LOCAL']['YYYY'] + '-' + timeds['LOCAL']['MM'] + '-' + timeds['LOCAL']['DD'];
       timeds['LOCAL']['hh:mm:ss']     = timeds['LOCAL']['hh'] + ':' + timeds['LOCAL']['mm'] + ':' + timeds['LOCAL']['ss'];
       timeds['LOCAL']['YYYY-MM-DD hh:mm:ss'] =  timeds['LOCAL']['YYYY-MM-DD'] + ' ' + timeds['LOCAL']['hh:mm:ss'];

       timeds['LOCAL']['DOW']   = time.getDay();
   //    timeds['LOCAL']['DOY']   = '';
       timeds['LOCAL']['WOY']   = get_week_of_year(time)[1] + 1;

       timeds['LOCAL']['TZONE'] = time.getTimezoneOffset()/60;

       timeds['UTC'] = {};
       timeds['UTC']['YYYY']  = '' + time.getUTCFullYear() + '';
       if(time.getUTCMonth() < 9) {
           timeds['UTC']['MM'] = '0' + (time.getUTCMonth() + 1) + '';
       }else {
           timeds['UTC']['MM'] = '' + (time.getUTCMonth() + 1) + '';
       }

       if(time.getUTCDate() <= 9) {
           timeds['UTC']['DD'] = '0' + time.getUTCDate() + '';
       }else {
           timeds['UTC']['DD'] = '' + time.getUTCDate() + '';
       }

       if(time.getUTCHours() <= 9) {
           timeds['UTC']['hh'] = '0' + time.getUTCHours() + '';
       }else {
           timeds['UTC']['hh'] = '' + time.getUTCHours() + '';
       }

       if(time.getUTCMinutes() <= 9) {
           timeds['UTC']['mm'] = '0' + time.getUTCMinutes() + '';
       }else {
           timeds['UTC']['mm'] = '' + time.getUTCMinutes() + '';
       }

       if(time.getUTCSeconds() <= 9) {
           timeds['UTC']['ss'] = '0' + time.getUTCSeconds() + '';
       }else {
           timeds['UTC']['ss'] = '' + time.getUTCSeconds() + '';
       }

       timeds['UTC']['ms'] = time.getUTCMilliseconds()

       timeds['UTC']['YYYY-MM-DD']   = timeds['UTC']['YYYY'] + '-' + timeds['UTC']['MM'] + '-' + timeds['UTC']['DD'];
       timeds['UTC']['hh:mm:ss']     = timeds['UTC']['hh']   + ':' + timeds['UTC']['mm'] + ':' + timeds['UTC']['ss'];
       timeds['UTC']['YYYY-MM-DD hh:mm:ss'] =  timeds['UTC']['YYYY-MM-DD'] + ' ' + timeds['UTC']['hh:mm:ss'];
       timeds['UTC']['ISO8601'] =  timeds['UTC']['YYYY-MM-DD'] + 'T' + timeds['UTC']['hh:mm:ss'] + 'Z'
       timeds['UTC']['TZONE']    = 0;

       timeds['UTC']['DOW']   = time.getUTCDay();
       timeds['UTC']['WOY']   = get_week_of_year(time)[1];

       timeds['UTC']['EPOCH_MS'] = time.getTime();
       timeds['UTC']['EPOCH']    = timeds['UTC']['EPOCH_MS']/1000;

       timeds['UTC']['TIMESTAMP'] = Math.round(timeds['UTC']['EPOCH'])
       timeds['UTC']['DOW']   = time.getUTCDay();
       //timeds['UTC']['WOY']   = get_week_of_year(Date(timeds['UTC']['TIMESTAMP']))[1];

       timeds['LOCAL']['TIMESTAMP'] = timeds['UTC']['TIMESTAMP'] - timeds['LOCAL']['TZONE'] * 3600

       return timeds;
 }

exports.tell_time = tell_time

 function get_week_of_year( d ) {
   https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
   // Copy date so don't modify original
   d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
   // Set to nearest Thursday: current date + 4 - current day number
   // Make Sunday's day number 7
   d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
   // Get first day of year
   var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
   // Calculate full weeks to nearest Thursday
   var weekNo = String(Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7));
   // Return array of year and week number

   if (weekNo <= 9) {
     weekNo = '0' + weekNo
   }

   return [d.getUTCFullYear(), weekNo]
 }

exports.get_week_of_year = get_week_of_year
