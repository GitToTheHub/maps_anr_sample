var currentPage = null;
var pageStack = [];
var addedNavigationBarButtons = [];
var navigateCallback = null;

function initPageContent()
{
  closeSlidebar();
  
  $('#content a').click(function(e) {
    e.preventDefault();
    loadPageContent({url: this.href})
  });
  
  initSwitchery();
}

function loadPageContent(page, navigatingBack) {
  
  if (!navigatingBack) {
    navigatingBack = false;
  }
  
  // Url durch Dateinamen setzen
  if (!page.url && page.filename) {
    page["url"] = page.filename;
  }
  
  // Keine Page-URL gesetzt, nichts machen
  if (!page.url) {
    console.error("Leere Page-URL sollte geladen werden. Laden abgebrochen.");
    return;
  }
  
  if (!page.scrollTop) {
    page["scrollTop"] = 0;
  }
  
  if (!page.variables) {
    page.variables = {};
  }
  if(page.variables.pollutantIDs){
    localStorage.pollutantIDs = page.variables.pollutantIDs;
  }

  // Seitenladen mit Anker erstmal nicht machen
  if (page.url.indexOf("#") != -1) {
    console.error("Anker funktioniert noch nicht");
    return;
  }
  
  // index.html darf nicht geladen werden
  if (page.url.endsWith("index.html")) {
    console.error("Die index.html darf nicht über loadPageContent geladen werden!");
    return;
  }
  
  var protocol = null;
  
  // Protokoll verarbeiten
  if (page.url.indexOf(":") != -1) {
    protocol = page.url.substring(0, page.url.indexOf(':'));
    
    // Eine heruntergeladene Datei soll geladen werden
    if (protocol == "downloaded") {
      var filename = page.url.substring(page.url.lastIndexOf(':') + 1);
      rootDir.getFile(filename, {create: false, exclusive: false},
        function(fileEntry) {
          loadPageContent({url: fileEntry.toURL()});
        },
      fileErrorHandler);
      
      return;
      
      // Links wie mailto, tel, http, etc. an den Browser weiterleiten
    } else if (
      protocol == "mailto" ||
      protocol == "tel" ||
      protocol == "http" || protocol == "https" ||
      protocol == "geo" || protocol == "maps") {
      console.log("Gebe Link an Browser weiter: " + page.url);
      window.location = page.url;
      return;
    }
  }
  
  console.log("Lade Seite: " + page.url);
  
  // Fehlermeldung, wenn Query-Parameter in der URL enthalten sind
  if (page.url.indexOf('?') != -1) {
     console.warn("Query-Parameter werden nicht unterstützt.");
  }
  
  $.get(page.url, function(pageContent) {
  
    // Die aktuelle Seite darüber informieren, dass etwas geladen wird
    if (navigateCallback) {
      navigateCallback(page, navigatingBack);
      navigateCallback = null;
    }
    
    removeAddedNavigationBarButtons();
    
    // Es wird vorwärts navigiert
    if (!navigatingBack) {
      
      if (page.url.endsWith(startpageFilename)) {
        pageStack.length = 0;
      }
      
      // Scroll-Position merken
      if (currentPage) {
        currentPage.scrollTop = $("#content").scrollTop();
      }
      
      pageStack.push(page);
    }
    
    currentPage = page;
    
    // Ausgabe vom pageStack
    // inspectObject(pageStack, "pageStack");
    
    // Back-Button in Navigation-Bar anzeigen, wenn in Unterseiten navigiert wird
    if (pageStack.length > 1) {
      addBackButton();
    
    // Back-Button auf Startseite ausblenden
    } else {
      removeBackButton();
    }
    
    $("#content").html(pageContent);
    
    // translatePage();
    
    initPageContent();
    
    $("#content").scrollTop(page.scrollTop);
  }).fail(function(xhr, textStatus, errorThrown) {
    console.error("Konnte Seite nicht laden, url: " + page.url);
    alert("Konnte Seite nicht laden, url: " + page.url);
  });
}

function setPageTitle(pageTitle)
{
  $("#navigationbar-title").html(pageTitle);
}

function addNavigationBarButton(imageName, onClickFunction) {
  var button = $('<img src="img/' + imageName + '" class="navigationbar-icon">').click(onClickFunction);
  $("#navigationbar-buttons-right").append(button);
  addedNavigationBarButtons.push(button);
  
  // Titel anpassen, damit dieser richtig zentriert wird
  $("#navigationbar-title").css("padding-right", "+=30");
  
  return button;
}

function removeAddedNavigationBarButtons() {
  for(var i=0; i < addedNavigationBarButtons.length; i++) {
    addedNavigationBarButtons[i].remove();
    // Titel anpassen, damit dieser richtig zentriert wird
    $("#navigationbar-title").css("padding-right", "-=30");
  }
  
  addedNavigationBarButtons.length = 0;
}

function addBackButton() {
  if (!$("#navigationbar-backbutton").is(":visible")) {
    $("#navigationbar-backbutton").show();
    
    // Titel anpassen, damit dieser richtig zentriert wird
    $("#navigationbar-title").css("padding-right", "+=30");
  }
}

function removeBackButton() {
  if ($("#navigationbar-backbutton").is(":visible")) {
    $("#navigationbar-backbutton").hide();
    
    // Titel anpassen, damit dieser richtig zentriert wird
    $("#navigationbar-title").css("padding-right", "-=30");
  }
}

function navigateBack(hardwareButtonPressed) {
  
  // Bitte-Warten Dialog wird angezeigt, nichts machen
  if ($("#please-wait-container").is(":visible")) {
    return;
  }
  
  if (hardwareButtonPressed && slidebarOpened()) {
    closeSlidebar();
    return;
  }
  
  // In Seiten zurücknavigieren
  if (pageStack.length > 1) {
    
    // Aktuelle Seite aus dem Stack nehmen
    pageStack.pop();
    
    var loadPage = pageStack[pageStack.length-1];
    
    loadPageContent(loadPage, true);
    
  // App beenden
  } else {
    navigator.app.exitApp();
  }
}

function setNavigateCallback(callback) {
  navigateCallback = callback;
}