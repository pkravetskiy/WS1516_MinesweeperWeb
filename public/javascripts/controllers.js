var app = angular.module("minesweeperApp", ["ui.bootstrap", "ui.bootstrap.modal"]);

app.controller('fieldCtrl', function ($scope, $http, $rootScope, $q) {
  $scope.loading = true;
  $http.get('/json').success(function(data) {
    $scope.playingField = data;

    $scope.cellclicked = function( row, column) {
      $scope.loading = true;
      $http.get('/json/'+row+'/'+column).success(function(data) {
        $scope.playingField = data;
      });
      $scope.loading = false;
    };
    $scope.loading = false;
  });

  $scope.showResults = function(){
    $scope.showRes = true
  };

  var init = function() {
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
      $scope.playingField = JSON.parse(message.data);
      $scope.$apply();
      $scope.loading = false;
    };

    $scope.sendRequest =  function(request) {
      $scope.loading = true;
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
});

app.controller('hoverCtrl', function($scope, $timeout) {
  $scope.callAtTimeout = function() {
    $scope.mouse = {background: '#eff0f2'};
  };

  $scope.hover = function(bool){
    if (bool === true) {
      $scope.mouse = {background: '#C6DAF2'};
    } else if (bool === false) {
      $timeout( function(){ $scope.callAtTimeout(); }, 100);
    }
  };
  $scope.none = function() {

  }
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
            });
        });
    };
});
