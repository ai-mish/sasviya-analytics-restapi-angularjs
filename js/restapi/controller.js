'use strict';

/* Controllers */

angular.module('myApp')
    .controller('ViyaAuthController', ['$rootScope', '$scope', '$location', '$localStorage', 'ViyaAuthService', function($rootScope, $scope, $location, $localStorage, ViyaAuthService) {

      signin()
      function signin(){
            ViyaAuthService.signin()
                .then(
                function(d) {
                    console.log(d.access_token)
                    console.log(d)
                    $localStorage.token = d.access_token;
                },
                function(errResponse){
                    console.error(errResponse);
                    console.error('Controller failed to connect to Viya');
                }
            );
        }
        function runSASCode(predictor, resultVarName) {
          console.log('Controller: runSASCode')
          ViyaAuthService.runSASCode()
          $scope[resultVarName] = "Testing"
        }

        $scope.runSASCode = function(predictor, resultVarName) {
          runSASCode(predictor, resultVarName)
        };
        $scope.token = $localStorage.token;
}]);
