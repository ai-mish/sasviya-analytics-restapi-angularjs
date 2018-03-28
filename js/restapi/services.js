'use strict';

angular.module('myApp')
    .factory('ViyaAuthService', ['$http', '$localStorage', '$q' , function($http, $localStorage,$q){

        var baseUrl = "https://cas-host";

        var factory = {
            signin: signin,
            runSASCode: runSASCode
        };

        function signin() {
             var deferred = $q.defer();
             var encodedString = btoa("sas.ec:");
             $http.defaults.headers.common['Authorization'] = 'Basic ' + encodedString;
             var req = {
               method: 'POST',
               url: baseUrl + '/SASLogon/oauth/token',
               headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
               },
               dataType: "json",
               data: 'grant_type=password&username=sas&password=MyPassword'
             }
             $http(req)
                 .then(
                 function (response) {
                     deferred.resolve(response.data);
                 },
                 function(errResponse){
                     deferred.reject(errResponse);
                 }
               );
             return deferred.promise;
        }

        function runSASCode() {
          console.log('Services: runSASCode')
          var sasCode="proc print;run;"
          var savep={caslib:'MYCASLIB3',name:'cart.sashdat',table:{name:'cart',caslib:'MYCASLIB3'},replace:true};
          var code = {code:sasCode,single:'yes'};
          var runCodeReq = {
            method: 'POST',
            url: baseUrl + '/actions/runCode',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.sas.collection+json',
              'Origin': 'javascript',
              'X-Requested-With': 'XMLHttpRequest'
            },
            params: code
          }
          /*$http({
            method:'POST',
            url:baseUrl+'/actions/runCode',
            params:code
          })*/
          $http(runCodeReq).then(
                    function callBack(response){
                      console.log(response);
                      $http({
                        method:'POST',
                        url:baseUrl+'/actions/save',
                        params:savep
                      }).then(
                                function callback(response){
                                  console.log(response);
                                },
                                function errorcallback(){
                                  console.log("wrongsave");
                                }
                              );
                            } //function callBack end
        ,function error(errResponse){
          console.log('actions/runCode failed');
          console.log(errResponse);
        }
      )
    }

        return factory;

    }]);
