

console.log("INIT");
// Create our websocket object with the address to the websocket
var ws = window['MozWebSocket'] ? MozWebSocket : WebSocket;
var sock = new ws("ws://localhost:9000/greeter");

sock.onopen = function(){
  console.log("Socket has been opened!");
};

sock.onmessage = function(message) {
  try {
    document.querySelector('minesweeper-field').grid = JSON.parse(message.data).field;
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
