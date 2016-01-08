var app = angular.module("minesweeperApp", []);

app.controller('fieldCtrl', function ($scope, $http) {
  $http.get('/json').success(function(data) {
    $scope.playingField = data;

    $scope.cellclicked = function( row, column) {
      $http.get('/json/'+row+'/'+column).success(function(data) {
        $scope.playingField = data;
      });
    }
  });
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
});