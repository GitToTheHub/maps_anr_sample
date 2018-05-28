var fileSystem;
var rootDir;

function initFileSystem(successCallback) {
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
    this.fileSystem = fileSystem;
    this.rootDir = fileSystem.root;
    
    if (successCallback) successCallback();
  }, fileErrorHandler);
}

function writeFile(filename, data, successCallback, errorCallback) {
  rootDir.getFile(filename, {create: true, exclusive: false},
    function(fileEntry) {
      writeFileEntry(fileEntry, data, successCallback, errorCallback);
    },
  fileErrorHandler);
}

function writeFileEntry(fileEntry, data, successCallback, errorCallback) {
  fileEntry.createWriter(function (fileWriter) {      
    // Bevor die Datei beschrieben wird, muss diese geleert werden, damit nicht alter Inhalt überbleibt
    // Datei wurde geleert
    fileWriter.onwriteend = function() {
      
      // Datei wurde erfolgreich geschrieben
      fileWriter.onwriteend = function() {
        console.log("Datei wurde erfolgreich gespeichert: " + fileEntry.toURL());
        if (successCallback) successCallback();
      };
      
      // Fehler beim Schreiben der Datei
      fileWriter.onerror = function (e) {
        console.log("Konnte Datei nicht schreiben, path=" + fileEntry.toURL() + ", error=" + e.toString());
        if (errorCallback) errorCallback(fileEntry, e);
      };
      
      // Datei schreiben
      fileWriter.write(data);
    }
    
    // Konnte Datei nicht leeren
    fileWriter.onerror = function(e) {
      console.log("Konnte Datei nicht leeren, path=" + fileEntry.toURL() + ", error=" + e.toString());
      if (errorCallback) errorCallback(fileEntry, e);
    };
    
    // Datei leeren
    fileWriter.truncate(0);
  }, fileErrorHandler);
}

function readFile(filename, successCallback, errorCallback) {
  rootDir.getFile(filename, {create: false, exclusive: false},
    function(fileEntry) {
      readFileEntry(fileEntry, successCallback, errorCallback);
    },
  fileErrorHandler);
}

function readFileEntry(fileEntry, successCallback, errorCallback) {
  fileEntry.file(function (file) {
    var fileReader = new FileReader();
    
    fileReader.onloadend = function() {
      console.log("Datei erfolgreich gelesen, path=" + fileEntry.toURL());
      
      if (successCallback) successCallback(this.result);
    };
    
    fileReader.onerror = function (e) {
      console.log(getFileReadErrorMessage(fileEntry, error));
      
      if (errorCallback) errorCallback(fileEntry, e);
    };
    
    fileReader.readAsText(file);
  }, null);
}

function getFileReadErrorMessage(fileEntry, error) {
  return "Konnte Datei nicht lesen, path=" + fileEntry.toURL() + ", error=" + e.toString();
}

function fileErrorHandler(fileError) {
  var msg = '';
  switch (fileError.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  
  console.error('Dateifehler: ' + msg);
  inspectObject(fileError, "fileError");
}