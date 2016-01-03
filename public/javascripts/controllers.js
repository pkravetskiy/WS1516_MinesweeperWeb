var app = angular.module("minesweeperApp", []);

app.controller('fieldCtrl', function ($scope, $http) {
  $http.get('/json').success(function(data) {
    $scope.phones = data;
  });
});
