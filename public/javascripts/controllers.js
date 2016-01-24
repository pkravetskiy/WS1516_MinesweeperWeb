var app = angular.module("minesweeperApp", ["ui.bootstrap", "ui.bootstrap.modal"]);

app.controller('fieldCtrl', function ($scope, $http, $rootScope, $q) {
  $scope.loading = true;
  $scope.victory = false;
  $scope.lose = false;
  // initializing flags
  $scope.flags = [];
  var removeFlags = function() {
    for (var i = 1; i <= 30; i++) {
      $scope.flags[i] = [];
      for (var j = 1; j <=16; j++) {
        $scope.flags[i][j] = false;
      }
    }
  };
  removeFlags();

  // Cookies functions
  var setCookie = function (cname, cvalue) {
    var d = new Date();
    // 30 days expiration
    d.setTime(d.getTime() + (30*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  };

  var delCookie = function (cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  var getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  };

  var init_cookies = function() {
    var cookie = getCookie('tries');
    if (cookie == "")
      setCookie('tries', '0');
    cookie = getCookie('wins');
    if (cookie == "")
      setCookie('wins', '0');
    cookie = getCookie('loses');
    if (cookie == "")
      setCookie('loses', '0');
    cookie = getCookie('modal_shown');
    if (cookie == "")
      setCookie('modal_shown', '0');
  };
  init_cookies();

  $http.get('/json').success(function(data) {
    $scope.playingField = data;

    $scope.cellclicked = function( row, column) {
      if ($scope.victory || $scope.lose) {
        return;
      }
      $scope.loading = true;
      $http.get('/json/'+row+'/'+column).success(function(data) {
        $scope.victory = data.victory;
        $scope.lose = data.loose;
        $scope.playingField = data;
        var tmp = parseInt(getCookie('tries')) + 1;
        if ($scope.victory) {
          setCookie('tries', tmp.toString());
          document.getElementById('tries').textContent = tmp.toString();
          tmp = parseInt(getCookie('wins')) + 1;
          setCookie('wins', tmp.toString());
          document.getElementById('wins').textContent = tmp.toString();
          $scope.toggleModal();
        } else if ($scope.lose) {
          setCookie('tries', tmp.toString());
          document.getElementById('tries').textContent = tmp.toString();
          tmp = parseInt(getCookie('loses')) + 1;
          setCookie('loses', tmp.toString());
          document.getElementById('loses').textContent = tmp.toString();
          $scope.toggleModal();
        }
      });
      $scope.loading = false;
    };
    $scope.loading = false;
  });

  $scope.showResults = function(){
    $scope.showRes = true
  };

  $scope.showModal = false;
  $scope.toggleModal = function(){
    if ($scope.victory)
      document.getElementById('result').innerHTML = 'You win!';
    else if ($scope.lose)
      document.getElementById('result').innerHTML = 'You lose!';
    document.getElementById('tries').textContent = getCookie('tries');
    document.getElementById('wins').textContent = getCookie('wins');
    document.getElementById('loses').textContent = getCookie('loses');
    $scope.showModal = !$scope.showModal;
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
      console.log("Got message", message.data);
      listener(message);
      try {
        $scope.playingField = JSON.parse(message.data);
      }
      catch(e)  {
        $scope.loginStatus = message.data;
      }
      $scope.$apply();
      $scope.loading = false;
    };

    $scope.sendRequest =  function(request) {
      if (request != 'u' || request != 'r') {
        setCookie('tries', (parseInt(getCookie('tries')) + 1).toString());
        removeFlags();
        $scope.victory = false;
        $scope.lose = false;
      }

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
        var id = event.target.id;
        var id_row = id.length - 3;
        var id_col = id.length - 1;
        scope.flags[id[id_row]][id[id_col]] = !scope.flags[id[id_row]][id[id_col]];
      });
    });
  };
});

app.directive('modal', function () {
  return {
    template: '<div class="modal fade">' +
    '<div class="modal-dialog modal-sm">' +
    '<div class="modal-content">' +
    '<div class="modal-header" id="header">' +
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
      '<h1 class="modal-title" id="result">{{ title }}</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '<div class="row" style="text-align: center">' +
        '<div class="col-md-4">' +
          '<div class="panel panel-primary">' +
            '<div class="panel-heading">Tries</div>' +
            '<div class="panel-body" id="tries">0</div>' +
          '</div>' +
        '</div>' +
        '<div class="col-md-4">' +
          '<div class="panel panel-success">' +
            '<div class="panel-heading">Wins</div>' +
            '<div class="panel-body" id="wins">0</div>' +
          '</div>' +
        '</div>' +
        '<div class="col-md-4">' +
          '<div class="panel panel-danger">' +
            '<div class="panel-heading">Loses</div>' +
            '<div class="panel-body" id="loses">0</div>' +
          '</div>' +
        '</div>' +
        '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
      '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
      '<button type="button" class="btn btn-primary" data-dismiss="modal" id="restart" ng-click="sendRequest(\'n\')">Restart</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:true,
    link: function postLink(scope, element, attrs) {
      scope.title = attrs.title;

      scope.$watch(attrs.visible, function(value){
        if(value == true)
          $(element).modal('show');
        else
          $(element).modal('hide');
      });

      $(element).on('shown.bs.modal', function(){
        scope.$apply(function(){
          scope.$parent[attrs.visible] = true;
        });
      });

      $(element).on('hidden.bs.modal', function(){
        scope.$apply(function(){
          scope.$parent[attrs.visible] = false;
        });
      });
    }
  };
});
