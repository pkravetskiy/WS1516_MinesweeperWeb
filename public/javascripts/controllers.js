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
