function getHttpObject() {
  var xhr = null;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    try {
      xhr = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        // Swallow the exception.
      }
    }
  }
  return xhr;
}

function initProcessing(file, canvas) {
  var request = getHttpObject();
  if (request) {
    request.onreadystatechange = function() {
      parseResponse(request, canvas);
    };
    request.open('GET', file, true);
    request.send(null);
  }
}

function parseResponse(request, canvas) {
  if (request.readyState == 4) {
    if (request.status == 200 || request.status == 304) {
      var targetCanvas = document.getElementById(canvas);
      Processing(targetCanvas, request.responseText);
    }
  }
}
