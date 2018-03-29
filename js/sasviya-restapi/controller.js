'use strict';

angular.module('loanApp')
.controller('loanController', ['$scope','$httpParamSerializer','$http','$window','loanService',
function ($scope,$httpParamSerializer,$http,$window,loanService) {


  var decisionPublishedName = 'hmeq_approval1_0';
  var input_data_json = {
    "version": 1,
    "inputs": [
      {"name": "CLNO","value": 1.0},
      {"name": "JOB","value": "IT"},
      {"name": "REASON","value": "1"},
      {"name": "VALUE","value": 2.0}
    ]};

  function run(decisionPublishedName,input_data_json){
    $scope.modelProcessing = true
    loanService.connect()
        .then(function(data) {
          console.log(data);
          console.log('Token:');
          $window.sessionStorage.token = data.access_token;
          $scope.message = 'Welcome';
          loanService.executeDecision(decisionPublishedName,input_data_json).
          then(function(response){
            $scope.modelProcessing = false;
            $scope.scoreResult=response.outputs["Approve"];
            console.log(response)
          },
          function(error)
          {
            console.log(error);
            $scope.modelProcessing = false;
          })
        }, function(error){
          console.error(error);
          delete $window.sessionStorage.token;
          $scope.modelProcessing = false;
          $scope.message = 'Error: Invalid user or password';
        });
  }

 run(decisionPublishedName,input_data_json);

}]);
