function inspectObject(object, objectName, outputFunctions) {
  message = null;
  
  if (objectName) {
    message = "Inhalt von " + objectName;
  } else {
    message = "Inhalt vom Objekt";
  }
  
  message += " (Typ: " + typeOfObject(object) + ")";
  
  console.log(message);
  
  if (object instanceof Array) {
    console.log("  Anzahl Elemente im Array: " + object.length);
    
    for (var index = 0; index < object.length; index++) {
       inspectObject(object[index], "Index " + index);
    }
  } else {
    for (var property in object) {
      var type = typeOfObject(object[property]);
      
      output = "property: " + property + " (" + type + ")";
      
      if (type != "function" || outputFunctions) {
        output += ", value=" + object[property];
      }
      
      console.log("  " + output);
    }
  }
}

function typeOfObject(object){
  objectType = typeof object;
  
  if (object instanceof Array) {
    objectType = "array";
  }
  
  return objectType;
}

function localStorageGetBoolean(key) {
  var value = localStorage.getItem(key);

  if (!value) {
    return false;
  }
  
  return (value == "true");
}

function localStorageGetDate(key) {
  var value = localStorage.getItem(key);
  
  if (!value) {
    return null;
  }
  
  return new Date(parseInt(value));
}

function fileTransferErrorCodeToString(fileTransferError)
{
  var msg = '';
  switch (fileTransferError.code) {
    case FileTransferError.FILE_NOT_FOUND_ERR:
      msg = 'FILE_NOT_FOUND_ERR';
      break;
    case FileTransferError.INVALID_URL_ERR:
      msg = 'INVALID_URL_ERR';
      break;
    case FileTransferError.CONNECTION_ERR:
      msg = 'CONNECTION_ERR';
      break;
    case FileTransferError.ABORT_ERR:
      msg = 'ABORT_ERR';
      break;
    case FileTransferError.NOT_MODIFIED_ERR:
      msg = 'NOT_MODIFIED_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  
  return msg;
}

function alertNative(message) {
  navigator.notification.alert(message, null, translate("dialog_title_notice"));
}

const ONE_MINUTE_MILLISECONDS = 60 * 1000;
const ONE_HOUR_MILLISECONDS = 60 * ONE_MINUTE_MILLISECONDS;
const ONE_DAY_MILLISECONDS = 24 * ONE_HOUR_MILLISECONDS;

function dateWithoutTime(date) {
  var newDate = new Date(date.getTime());
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function diffDays(date1, date2, compareTime) {
  
  if (date1 > date2) {
    checkDate1 = date1;
    checkDate2 = date2;
  } else {
    checkDate1 = date2;
    checkDate2 = date1;
  }
  
  if (!compareTime) {
    checkDate1 = dateWithoutTime(checkDate1);
    checkDate2 = dateWithoutTime(checkDate2);
  }
  
  return Math.round((checkDate1.getTime() - checkDate2.getTime()) / ( 24 * 60 * 60 * 1000));
}

function timeStringInMilliseconds(timeString) {
  var timeComponents = timeString.split(":");
  var hours = parseInt(timeComponents[0]);
  var minutes = parseInt(timeComponents[1]);
  
  return (hours * ONE_HOUR_MILLISECONDS) + (minutes * ONE_MINUTE_MILLISECONDS);
}

function formatDateYYYYMMDD(date) {
  var month = '' + (date.getMonth() + 1);
  var day = '' + date.getDate();
  var year = date.getFullYear();
  
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  
  return [year, month, day].join('-');
}

function isAndroid() {
  return (device.platform == 'Android');
}

function isIOS() {
  return (device.platform == 'iOS');
}
  
function isBrowser() {
  return (device.platform == 'browser');
}

function deviceVersion() {
  return parseFloat(device.version);
}

// Prüft, ob eine Internetverbindung besteht.
function hasInternetConnection() {
  return (navigator.connection.type != Connection.NONE);
  
  /* Mögliche Werte für navigator.connection.type:
   Connection.UNKNOWN  = Unknown connection
   Connection.ETHERNET = Ethernet connection
   Connection.WIFI     = WiFi connection
   Connection.CELL_2G  = Cell 2G connection
   Connection.CELL_3G  = Cell 3G connection
   Connection.CELL_4G  = Cell 4G connection
   Connection.CELL     = Cell generic connection
   Connection.NONE     = No network connection
  */
}

// Schadstoffsammelstellen: Uhrzeit aus MySQL Datetime bauen
function buildPollutantTime(date,ausgabeEinheit){
  date = new Date(date);
  hours = date.getHours();
  if(hours.toString().length == 1){
    hours = '0'+hours;
  }
  minutes = date.getMinutes();
  if(minutes == '0'){
    minutes = '00';
  }
  if(ausgabeEinheit){
    time = hours + ':' + minutes + ' ' + translate("oclock");
  }else{
    time = hours + ':' + minutes;
  }
  return time
}

// Schadstoffsammelstellen: Datum aus MySQL Date bauen
function buildPollutantDate(date){
  date = new Date(date);
  day = date.getDate();
  if(day.toString().length == 1){
    day = '0' + day;
  }
  month = date.getMonth();
  month = month +1;
  if(month.toString().length == 1){
    month = '0' + month;
  }
  return day + '.' + month + '.' + date.getFullYear();
}

/*
 Google empfielt Platform unabhängige URL-Links die wie folgt aufgelöst werden:
 
 Android:
   - If Google Maps app for Android is installed and active, the URL launches Google Maps in the Maps app and performs the requested action.
   - If the Google Maps app is not installed or is disabled, the URL launches Google Maps in a browser and performs the requested action.

 iOS:
   - If Google Maps app for iOS is installed, the URL launches Google Maps in the Maps app and performs the requested action.
   - If the Google Maps app is not installed, the URL launches Google Maps in a browser and performs the requested action.
   
 Quelle: https://developers.google.com/maps/documentation/urls/guide
 */
function googleMapsDirectionLink(lat, lng) {
  return "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng;
}