var appInitialized = false;
var startpageFilename = "standorte_liste.html";

var app = {
  // ACHTUNG: initialize darf erst nach 'deviceready' aufgerufen werden!
  initialize: function(successCallback, errorCallback) {
    initStatusbar();
    
    // iOS-Click-Fix: Unter iOS gibt es ein Standard-Delay beim Klicken auf Elemente von 300ms
    // Das wird hiermit behoben
    $(function() {
      
      // iOS-Autocomplete-Bugfix
      // needsClick-Methode von FastClick überschreiben
      //
      // Durch FastClick entsteht der Bug, dass Einträge aus der autocomplete-Box nicht
      // mehr ausgewählt werden können. Das wird hiermit behoben.
      var needsClick = FastClick.prototype.needsClick;
      
      FastClick.prototype.needsClick = function(target) { 
        
        // FastClick für oberstes Element deaktivieren
        if ( (target.className || '').indexOf('awesomplete') > -1 ) {
          return true;
          
          // Fastclick für alle Elemente deaktivieren, bei denen die ID mit 'awesomplete' beginnt
        } else if ( (target.id || '').startsWith('awesomplete')) {
          return true;
          
          // Fastclick für <marker>-Tag deaktivieren
        } else if ( (target.parentNode.id || '').startsWith('awesomplete')) {
          return true;
          
        } else {
          return needsClick.apply(this, arguments);
        }
      };

      FastClick.attach(document.body);
    });
    
    var initFileSystemSuccessCallback = function () {
      initializeSlidebars();
      
      // Link-Klicks für sliderbar umleiten
      $('a').click(function(e) {
        e.preventDefault();
        loadPageContent({url: this.href})
      });
      
      // Android: Auf Back-Button reagieren
      document.addEventListener("backbutton", function() {
        navigateBack(true);
      }, true);
      
      // Zurück-Button in der Navigation-Bar
      $("#navigationbar-backbutton").click(function(event){
        navigateBack();
      });
      
      appInitialized = true;
      if (successCallback) successCallback();
    };
    
    initFileSystem(initFileSystemSuccessCallback, errorCallback);
  }
};

/*
 Die Statusbar könnte auch über die config.xml gestylt werden. Durch einen Fehler
 im PhonegapBuild, kann es jedoch passieren, dass die eingestellten Werte mit
 Standardwerten überschrieben werden.
 Siehe: https://getsatisfaction.com/nitobi/topics/cordova-plugin-statusbar-on-phonegap-version-cli-5-2-0-ignoring-statusbaroverlayswebview
 */
function initStatusbar() {
  // Statusbar soll nicht über die WebView gehen
  StatusBar.overlaysWebView(false);
  
  // Farbe der Statusbar setzen (derzeit nicht benötigt)
  // StatusBar.backgroundColorByHexString("#CD171A");
  
  // Einstellung Statusbar für iOS
  if (isIOS()) {
    // Use the lightContent statusbar (light text, for dark backgrounds).
    StatusBar.styleDefault();
  }
}

function initializeSlidebars()
{
  // Slidebars initialisieren
  app.slidebars = new slidebars();
  app.slidebars.init();
     
  // Toggle Slidebars
  $('#menu-button').click(function(event) {
    // Stop default action and bubbling
    event.preventDefault();
    event.stopPropagation();

    // Toggle the Slidebar
    app.slidebars.toggle('slidebar-id');
  });
       
  $('#slidebars-canvas-container').click(function(event) {
    if (app.slidebars.isActiveSlidebar('slidebar-id'))
    {
      // Stop default action and bubbling
      event.preventDefault();
      event.stopPropagation();
      closeSlidebar();
    }
  });
}

function hasSavedLocation()
{ 
  if (localStorage.streetname && localStorage.streetnumber) {
    return true;
  } else {
    return false;
  }
}

function savedStreetnameWithNumber() {
  return localStorage.streetname + " " + localStorage.streetnumber;
}

function containerLocationImageTags(containerLocation) {
  var containers = containerLocation.containers;
  var imageString = "";
  
  for (var index = 0; index < containers.length; index++) {
    imageString += '<img src="img/' + containerImage(containers[index]) + '" class="location-icon">';
  }
  
  return imageString;
}

function trashBagLocationImageTags(trashBagLocation) {
  var images = trashBagLocationImages(trashBagLocation);
  var imageTags = "";
  
  for (var index = 0; index < images.length; index++) {
    imageTags += '<img src="img/' + images[index] + '" class="location-icon">';
  }
  
  return imageTags;
}

function containerLocationSubText(containerLocation) {
  return containerLocation.street.name + " " + containerLocation.street_number + ", " + getDistanceAwayText(containerLocation.distance);
}

function trashBagLocationSubText(trashBagLocation) {
  return trashBagLocation.street.name + " " + trashBagLocation.street_number + ", " + getDistanceAwayText(trashBagLocation.distance);
}

function getDistanceAwayText(distance) {
  return translate("x_distance_away", {distance: distanceToText(distance)});
}

function showPleaseWaitContainer() {
  $("#please-wait-container").show();
}

function hidePleaseWaitContainer() {
  $("#please-wait-container").hide();
}

function closeSlidebar() {
  app.slidebars.close('slidebar-id');
}

function slidebarOpened() {
  return app.slidebars.isActiveSlidebar('slidebar-id');
}

function loadStartpage() {
  loadPageContent({filename: startpageFilename});
}

function loadContainerListPage() {
  loadPageContent({filename: "standorte_liste.html", variables: {locationType: LOCATION_TYPE_CONTAINER}});
}

function loadTrashBagListPage() {
  loadPageContent({filename: "standorte_liste.html", variables: {locationType: LOCATION_TYPE_TRASHBAG}});
}

function loadLocationMapPage(locationType, showLocationInfoId) {
  var variables = {
    locationType: locationType
  };
  
  if (showLocationInfoId) {
    variables.showLocationInfoId = showLocationInfoId;
  }
  
  loadPageContent({filename: "standorte_karte.html", variables: variables});
}

function initAutocomplete(inputId, values, compareValueKey) {
  var dataList = [];
  
  for (var index = 0; index < values.length; index++) {
    var value = values[index];
    
    if (compareValueKey) {
      value = value[compareValueKey];
    }
    
    dataList.push(value);
  }
  
  new Awesomplete(document.getElementById(inputId), {
    list: dataList,
    minChars: 1
  });
}

/*
 Diese Funktion ermöglicht, durch einzelne Input-Felder mit einer mobilen Tastatur zu springen.
 */
function initFormForMobileKeyboard(formId) {
  
  // Funktioniert unter iOS nur, wenn in der config.xml der Parameter
  // "KeyboardDisplayRequiresUserAction" auf "false" steht. Da es mit
  // dieser Einstellung aber aktuell Probleme gibt, ist diese Funktion
  // deaktiviert.
  if (isIOS()) {
    return;
  }
  
  // Input-Felder mit data-index-Attribut versehen, damit durch die
  // einzelnen Felder navigiert werden kann
  var dataIndex = 0;
  
  $("#" + formId + " input, #" + formId + " textarea").each(function(index, elem) {
    var jqElement = $(this);
    dataIndex++;
    jqElement.attr("data-index", dataIndex);
  });
  
  $('#' + formId).on('keydown', 'input', function (event) {
    if (event.which == 13) {
      event.preventDefault();
      var inputField = $(event.target);
      var dataIndex = parseInt(inputField.data('index'));
      
      var nextInputField = $('*[data-index="' + (dataIndex + 1) + '"]');
      
      if (nextInputField.data("index")) {
        nextInputField.focus();
      } else {
        $('#' + formId).submit();
      }
    }
  });
}

function initSwitchery(){
  var elem = document.querySelector('.js-switch');
  if(elem){
    var init = new Switchery(elem);      
  }
}