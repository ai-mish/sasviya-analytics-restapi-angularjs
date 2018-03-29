'use strict';

angular.module('loanApp')
.controller('loanController', ['$scope','$httpParamSerializer','$http','$window','loanService',
function ($scope,$httpParamSerializer,$http,$window,loanService) {

  function runDecision(decisionPublishedName,input_data_json){



    if ( $window.sessionStorage.token ) {
    delete $window.sessionStorage.token;
    }
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
            console.log("Response");
            $scope.Approve=response["outputs"][0]["value"];
            $scope.P_BAD1=response["outputs"][1]["value"];
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

$scope.run = function() {
    var CLNO=$scope.CLNO;
    var JOB = $scope.JOB;
    var REASON = $scope.REASON;
    var VALUE = $scope.VALUE;
    var decisionPublishedName = 'hmeq_approval1_0';
    var input_data_json = {
      "version": 1,
      "inputs": [
        {"name": "CLNO","value": 1.0},
        {"name": "JOB","value": "IT"},
        {"name": "REASON","value": "1"},
        {"name": "VALUE","value": 2.0}
      ]};

      input_data_json["inputs"][0]["value"]=CLNO;
      input_data_json["inputs"][1]["value"]=JOB;
      input_data_json["inputs"][2]["value"]=REASON;
      input_data_json["inputs"][3]["value"]=VALUE;

      console.log(input_data_json);
      runDecision(decisionPublishedName,input_data_json);
    }

}]);
