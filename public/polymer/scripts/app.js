var init = function() {
  console.log("INIT");
  // Keep all pending requests here until they get responses
  var callbacks = {};
  // Create a unique callback ID to map requests to responses
  var currentCallbackId = 0;
  // Create our websocket object with the address to the websocket
  var ws = window['MozWebSocket'] ? MozWebSocket : WebSocket;
  var sock = new ws("ws://localhost:9000/greeter");

  sock.onopen = function(){
    console.log("Socket has been opened!");
  };

  sock.onmessage = function(message) {
    listener(message);
    // Wait until DOM is loaded, probaly bad
    setTimeout(function(){ document.querySelector('my-element').username = message.data; }, 500);
  };

  sendRequest =  function(request) {
    var defer = $q.defer();
    var callbackId = getCallbackId();
    callbacks[callbackId] = {
      time: new Date(),
      cb:defer
    };
    request.callback_id = callbackId;
    console.log('Sending request', request);
    sock.send(request);
    return defer.promise;
  };

  function listener(data) {
    var messageObj = data.data;
    console.log("Received data from websocket: ", data);
    // If an object exists with callback_id in our callbacks object, resolve it
    if(callbacks.hasOwnProperty(messageObj.callback_id)) {
      console.log(callbacks[messageObj.callback_id]);
      $rootScope.apply(callbacks[messageObj.callback_id].cb.resolve(messageObj.data));
      delete callbacks[messageObj.callbackID];
    }
  }
  // This creates a new callback ID for a request
  function getCallbackId() {
    currentCallbackId += 1;
    if(currentCallbackId > 10000) {
      currentCallbackId = 0;
    }
    return currentCallbackId;
  }
};
init()
