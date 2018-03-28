'use strict';

angular.module('loanApp')
.controller('loanController', ['$scope','$httpParamSerializer','$http','$window','loanService',
function ($scope,$httpParamSerializer,$http,$window,loanService) {

  function authenticate(){
    loanService.connect()
        .then(function(data) {
          console.log(data)
          $window.sessionStorage.token = data.token;
          $scope.message = 'Welcome';
        }, function(error){
          console.error(error);
          delete $window.sessionStorage.token;
          $scope.message = 'Error: Invalid user or password';
        });
  }
 authenticate();

}]);
