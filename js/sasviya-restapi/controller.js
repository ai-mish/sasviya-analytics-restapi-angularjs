'use strict';

angular.module('loanApp')
.controller('loanController', ['$scope','$httpParamSerializer','$http','$window','loanService',
function ($scope,$httpParamSerializer,$http,$window,loanService) {


  function start(){
    $scope.running = true
  }

  function stop(){
    $scope.running = false
  }
  function init(){


    start();
    console.log('Token:');
    $scope.Approve="Click Check Button";
    $scope.P_BAD1=0.0;
    $scope.modelProcessing = false;
    $scope.Input_Job = "Sales";
    $scope.Input_Reason = "DebtCon";
    $scope.Input_CLNO = 0;
    $scope.Input_Property_Value=0;
    $scope.jobs =
        [
            "Sales", "Self",
            "Mgr", "Office"
        ];
    $scope.reasons =
        [
            "DebtCon", "HomeImp"
        ];
    stop();
  }

  init()


  $scope.run = function() {
    console.log('Test')


    var CLNO=$scope.Input_CLNO;
    var JOB = $scope.Input_Job;
    var REASON = $scope.Input_Reason;
    var VALUE = $scope.Input_Property_Value;
    console.log($scope)
    var decisionPublishedName = 'hmeq_approval1_0';
    var input_data_json = {
      "version": 1,
      "inputs": [
        {"name": "CLNO","value": 1.0},
        {"name": "JOB","value": "Self"},
        {"name": "REASON","value": "1"},
        {"name": "VALUE","value": 2.0}
      ]};
    input_data_json["inputs"][0]["value"]=CLNO;
    input_data_json["inputs"][1]["value"]=JOB;
    input_data_json["inputs"][2]["value"]=REASON;
    input_data_json["inputs"][3]["value"]=VALUE;

    console.log(input_data_json)
    executeDecision(decisionPublishedName,input_data_json);

  }

  function executeDecision(decisionPublishedName,input_data_json){
    if ( $window.sessionStorage.token ) {
    delete $window.sessionStorage.token;
    }
    start();
    loanService.connect()
        .then(function(data) {
          console.log(data);
          console.log('Token:');
          $window.sessionStorage.token = data.access_token;
          loanService.executeDecision(decisionPublishedName,input_data_json).
          then(function(response){
            stop();
            console.log("Response");
            $scope.Approve=response["outputs"][0]["value"];
            $scope.P_BAD1=response["outputs"][1]["value"];
            console.log(response)
          },
          function(error)
          {
            console.log(error);
            stop();
          })
        }, function(error){
          console.error(error);
          delete $window.sessionStorage.token;
          stop();
          $scope.message = 'Error: Invalid user or password';
        });
  }

}]);
