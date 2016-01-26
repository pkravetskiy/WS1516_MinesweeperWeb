

console.log("INIT");
// Create our websocket object with the address to the websocket
var ws = window['MozWebSocket'] ? MozWebSocket : WebSocket;
var sock = new ws("wss://minesweeper-web.herokuapp.com/greeter");

sock.onopen = function(){
  console.log("Socket has been opened!");
};

sock.onmessage = function(message) {
  console.log('Got message', message.data);
  try {
    victoryN = JSON.parse(message.data).victory;
    looseN = JSON.parse(message.data).loose;
    fieldN = JSON.parse(message.data).field;
    setTimeout(function(){ document.querySelector('minesweeper-field').grid = fieldN; }, 500);
    setTimeout(function(){ document.querySelector('minesweeper-field').victory = victoryN; }, 500);
    setTimeout(function(){ document.querySelector('minesweeper-field').loose = looseN; }, 500);
  }
  catch(e)  {
    // Wait until DOM is loaded, probaly bad
    setTimeout(function(){ document.querySelector('my-element').username = message.data; }, 500);
  }
};

sendRequest =  function(request) {
  console.log('Sending request', request);
  sock.send(request);
};

revealField =  function(row, column) {
  if (row < 10 && column < 10) {
    sendRequest("0" + row + "-0" + column);
  } else if (row < 10 && column >= 10) {
    sendRequest("0" + row + "-" + column);
  } else if (row >= 10 && column < 10) {
    sendRequest(row + "-0" + column);
  } else {
    sendRequest(row + "-" + column);
  }
};
