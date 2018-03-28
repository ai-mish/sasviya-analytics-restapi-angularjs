'use strict';

angular.module('myApp').controller('casctrl', ['$rootScope', '$scope', '$location', '$localStorage', 'CASService', function($rootScope, $scope, $location, $localStorage, CASService) {
    var self = this;
    self.user={id:null};
    self.users=[];
    self.session='';
    self.sessions=[];
    var room_type_selectedOption = " ";
    var cancellation_policy_selectedOption = " ";
    var air_conditioning_selectedOption = "False";
    var pool_selectedOption = "False";
    var breakfast_selectedOption = "False";
    var modelname="";
    var accommodates=1;
    var dataString="cancellation_policy,room_type,accommodates,Am_Air_conditioning,AM_Pool,AM_Breakfast\r\n";
    var scoreResult={"EM_PREDICTION":""}


    function runModel(dataString,modelname) {
      $scope.modelProcessing = true;
      $scope.scoreResult=0
      var scoreResult={};
      CASService.connectCAS()
          .then(
          function(cas) {
              self.session = cas.session;
              $localStorage.token = cas.session;
              console.log("Data ->" + dataString)
              CASService.upload(cas.session,'upload',
                                '{"casOut":{"caslib":"Melbourne2","name":"PRICEMODEL_INPUT","replace":true},"importOptions":{"fileType":"csv"}}',
                                dataString
                              )
                //cas.upload('upload','{"casOut":{"caslib":"TEMP","name":"INPUTDATA","replace":true},"importOptions":{"fileType":"csv"}}',data);
              .then(
                function(uploadResponse){
                  //console.error(uploadResponse)
                  CASService.action(cas.session,'loadactionset','{"actionSet":"modelPublishing"}')
                  .then(
                    function(loadActionSet){
                    console.log(modelname)
                    CASService.action(cas.session,
                                      'modelPublishing.runModelLocal',
                                      '{"inTable":{"caslib": "Melbourne2","name": "PRICEMODEL_INPUT"},"modelName":"' + modelname + '","modelTable":{"caslib": "Melbourne2","name": "MM_MODEL_TABLE"},"outTable":{"caslib": "Melbourne2","name": "SCORED_NEW","replace": true}}')
                    .then(
                      function(modelResult){
                        console.log(modelResult)
                        //cas.fetch('fetch','{"table":{"caslib":"TEMP","name":"SCORED_NEW"}}');
                        if (modelResult.status == 0) {
                          CASService.fetch(cas.session,'fetch','{"table":{"caslib":"Melbourne2","name":"SCORED_NEW"}}')
                          .then(
                              function(SCORED_NEW_TABLE){
                                console.log(SCORED_NEW_TABLE.results)
                                //$scope.scoreResult=SCORED_NEW_TABLE.results["Fetch"]["rows"][0][1];
                                $scope.scoreResult=CASService.getFetchResultByColumn(SCORED_NEW_TABLE.results,
                                                         ["EM_PREDICTION","PSCR_T"])
                                destroyCASSession(cas.session)
                                //$scope.modelProcessing = false
                                $scope.modelProcessing = false
                              },
                              function(fetchError){
                                console.error('Fetching Result failed')
                              }
                            )
                        } else {
                          console.error('Model ' + modelname + 'Failed to run')
                          console.error(modelResult)
                          $scope.modelProcessing = false
                          $scope.scoreResult = 150;
                        }

                      }
                      ,
                      function(actionError){
                        console.error('Failed to run Model - check CAS controller log')
                        $scope.modelProcessing = false
                      }
                    )
                    }
                    ,function(actionsetLoadError){
                      console.error('Failed to load actionset')
                      $scope.modelProcessing = false
                    })
                  //cas.act('modelPublishing.runModelLocal','{"inTable":{"caslib": "TEMP","name": "INPUTDATA"},"modelName": "R_LogisticRegression","modelTable":{"caslib": "PUBLIC","name": "MM_MODEL_TABLE"},"outTable":{"caslib": "TEMP","name": "SCORED_NEW","replace": true}}');


                },
                function(actionError){
                  console.error('Failed to run Action')
                  $scope.modelProcessing = false
                }
              )

          },
          function(errResponse){
              console.error('Unable to create a new CAS session');
              $scope.modelProcessing = false
          }
      );
      //$scope.modelProcessing = false
    } //End runModel


    function destroyCASSession(session){
      CASService.disconnectCAS(session)
          .then(
          function(d) {
              console.log('CAS session destroyed ' + self.session );
          },
          function(errResponse){
              console.error('Unable to destory CAS session ' + self.session);
          }
      );
    }

    function getModelList() {
      $scope.modelProcessing = true;
      var modelListJson = [];
      CASService.connectCAS()
          .then(
            function(cas){
                console.log(cas.session)
                //cas.fetch('fetch','{"table":{"caslib":"TEMP","name":"SCORED_NEW"}}');
                CASService.fetch(cas.session,'fetch','{"table":{"caslib":"Melbourne2","name":"MM_MODEL_TABLE"}}')
                .then(
                        function(FETCH_MM_MODEL_TABLE){
                          console.log(FETCH_MM_MODEL_TABLE)
                          //console.log('Model Names: ' + JSON.parse(data.results["Fetch"]["rows"]))
                          if (FETCH_MM_MODEL_TABLE.status == 0) {
                            angular.forEach(FETCH_MM_MODEL_TABLE.results["Fetch"]["rows"], function(row) {
                                modelListJson.push({"name":row[1]})
                                $scope.modelname_options=modelListJson;
                                $scope.modelname_selectedOption = modelListJson[1];
                            });
                          } else {
                            modelListJson.push({"name":"ERROR: Load Melbouren2 > MM_MODEL_TABLE"})
                            $scope.modelname_options=modelListJson;
                            $scope.modelname_selectedOption = modelListJson[1];
                          }
                          $scope.modelProcessing = false;
                        },
                        function(fetchError){
                          console.error('Fetching Result failed')
                          $scope.modelProcessing = false
                        }
                    )
                },
                function(casconnectError){
                  console.error('Unable to create a new CAS session');
                  $scope.modelProcessing = false
                  $scope.modelname_options=[{"name":"Unavailable"}];
                  $scope.modelname_selectedOption = "Unavailable";
                }
              )
      //return JSON.parse('[{"name":"PriceModelChamp"},{"name":"Model2"}]')
      //return modelListJson
    }


    $scope.runModel = function() {
      var dataString="";
      modelname=$scope.modelname_selectedOption.name;
      room_type_selectedOption = $scope.room_type_selectedOption.value;
      cancellation_policy_selectedOption = $scope.cancellation_policy_selectedOption.value;
      air_conditioning_selectedOption = $scope.air_conditioning_selectedOption;
      pool_selectedOption = $scope.pool_selectedOption;
      breakfast_selectedOption = $scope.breakfast_selectedOption;
      accommodates=$scope.accommodates;
      dataString = "cancellation_policy,room_type,accommodates,Am_Air_conditioning,AM_Pool,AM_Breakfast\r\n" +
                   cancellation_policy_selectedOption + "," + room_type_selectedOption + "," + accommodates + "," + air_conditioning_selectedOption + "," + pool_selectedOption + "," + breakfast_selectedOption + '\r\n';
      console.log(dataString)
      runModel(dataString,modelname)
    }

    $scope.scoreResult=0
    getModelList()
    //$scope.modelname_options=getModelList();
    //$scope.modelname_selectedOption = $scope.modelname_options[0];


    $scope.roomtype_options = [{ name: "Entire home/apt", value: "Entire home/apt" },
                               { name: "Private room", value: "Private room" },
                               { name: "Shared room", value: "Shared room" }
                             ];
    $scope.room_type_selectedOption = $scope.roomtype_options[0];

    $scope.cancellation_policy_options = [{ name: "Flexible", value: "flexible" },
                                          { name: "Moderate", value: "moderate" },
                                          { name: "Strict", value: "strict" },
                                          { name: "Super Strict", value: "super_strict_60" }
                                        ];
    $scope.cancellation_policy_selectedOption = $scope.cancellation_policy_options[0];
    $scope.accommodates=1;
    $scope.booleanvalue = {1:"Yes",0:"No"}
    $scope.air_conditioning_selectedOption = "0";
    $scope.pool_selectedOption = "0";
    $scope.breakfast_selectedOption = "0";

}]);
