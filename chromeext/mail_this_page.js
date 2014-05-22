function getTabUrl( tab ) {
  return tab.url;
}

function getTabTitle( tab ) {
  return tab.title;
}

function isUrlHttp( url ) {
  return url.indexOf( 'http' ) == 0;
}

function isUrlHttps( url ) {
  return url.indexOf( 'https' ) == 0;
}

function showSend( tabId ) {
  showBadge( tabId, 'send', [0,128,0,255] );
}

function showFailure( tabId, text ) {
  showBadge( tabId, 'ng', [128,0,0,255] );
  alert( text );
}

showBadge = function( timerId ) {
  return function( tabId, text, color ) {
    if ( timerId != null ) clearTimeout( timerId );
    chrome.browserAction.setBadgeText( { tabId : tabId, text : text } );
    chrome.browserAction.setBadgeBackgroundColor( { tabId : tabId, color : color } );
    timerId = setTimeout( function() {
      chrome.browserAction.setBadgeText( { tabId : tabId, text : '' } );
    }, 1000 );
  };
}( null );

function isSuccess( text ) {
  return text.indexOf( 'OK' ) == 0;
}

function handleResponse( tabId, req ) {
  if ( req.status == 200 ) {
    if ( isSuccess( req.responseText ) ) {
      ;  // no op.
    } else {
      showFailure( tabId, req.responseText );
    }
  } else if ( req.status == 0 ) {
    showFailure( tabId, 'Failed to XMLHttpRequest. (seems network unavailable.) ' );
  } else {
    showFailure( tabId, 'HTTP Response Code: ' + req.status );
  }
}

function mailThisPage( tabId, title, url ) {
  var server = 'https://mail-this-page.appspot.com/?u='
             + encodeURIComponent( url ) + '&t='
             + encodeURIComponent( title );
  httpRequest = new XMLHttpRequest();
  httpRequest.open( 'GET', server, true );
  httpRequest.onreadystatechange = function() {
    if ( httpRequest.readyState == 4 ) {
      handleResponse( tabId, httpRequest );
    }
  };
  httpRequest.send( null );
  showSend( tabId );
}

chrome.browserAction.onClicked.addListener( function( tab ) {
  var url = getTabUrl( tab );
  var title = getTabTitle( tab );
  
  if ( isUrlHttp( url ) || isUrlHttps( url ) ) {
    mailThisPage( tab.id, title, url );
  } else {
    mailThisPage( tab.id, "(no page title)", url );
  }
} );
