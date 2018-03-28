'use strict';

angular.module('myApp').factory('CASService', ['$http', '$q', '$localStorage' , function($http, $q,$localStorage){


    var baseCASURL = 'https://cas-host:8777/cas';

    var factory = {
        connectCAS: connectCAS,
        disconnectCAS: disconnectCAS,
        action:action,
        upload: upload,
        fetch:fetch,
        getFetchResultByColumn:getFetchResultByColumn
    };


    function connectCAS() {
        var casSessionURL = baseCASURL + '/sessions';
        var deferred = $q.defer();
        $http.put(casSessionURL)
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

    function disconnectCAS(session) {
        console.log('Destorying Session ' + session)
        var disconnectURL = baseCASURL + '/sessions/' + session +'/actions/session.endSession';
        var deferred = $q.defer();
        $http.post(disconnectURL)
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


    function action(session,action,param) {
        var actionUrl = baseCASURL + '/sessions/' + session +'/actions/'+ action;
        //cas.act('loadactionset','{"actionSet":"modelPublishing"}');
    		//cas.act('modelPublishing.runModelLocal','{"inTable":{"caslib": "TEMP","name": "INPUTDATA"},"modelName": "R_LogisticRegression","modelTable":{"caslib": "PUBLIC","name": "MM_MODEL_TABLE"},"outTable":{"caslib": "TEMP","name": "SCORED_NEW","replace": true}}');

        var req = {
          method: 'POST',
          url: actionUrl,
          headers: {
            'Content-Type': 'application/json'
          },
          data: param
        }
        var deferred = $q.defer();
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

    function upload(session,action,param,data) {
        var uploadActionUrl = baseCASURL + '/sessions/' + session +'/actions/'+ action;
        /*cas.upload('upload','{"casOut":{"caslib":"TEMP","name":"INPUTDATA","replace":true},"importOptions":{"fileType":"csv"}}',data);*/
        var req = {
          method: 'PUT',
          url: uploadActionUrl,
          headers: {
            'JSON-parameters': param,
            'Content-Type':'binary/octet-stream'
          },
          data: data
        }
        var deferred = $q.defer();
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

    function fetch(session,action,param) {
        var fetchActionUrl = baseCASURL + '/sessions/' + session +'/actions/'+ action;
        var req = {
          method: 'POST',
          url: fetchActionUrl,
          headers: {
            'Content-Type':'application/json'
          },
          data: param
        }
        var deferred = $q.defer();
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

    function uploadData(){

    }

    function runStat(){

    }

    function getFetchResultByColumn(result,columnNameList){
      var pos = -1;
      var columnName="EM_PREDICTION"
      var columnValue=0
      var fetchResult = angular.toJson(result)
      console.log(fetchResult)
      console.log(result["Fetch"]["schema"])
      console.log(result["Fetch"]["rows"])

      angular.forEach(result["Fetch"]["schema"], function(schema) {
          pos=pos+1

          for (var i = 0, len = columnNameList.length; i < len; i++) {
            var stringColumn=columnNameList[i]
            if (schema["name"].indexOf(stringColumn) !== -1) {
              console.log("Checking if column exist")
              console.log(schema["name"].indexOf(stringColumn) !== -1);
              break;
              //console.log(pos)
            }
          }
        }
      );



      angular.forEach(result["Fetch"]["rows"], function(row) {
          if (pos !== -1) {
            console.log(row[pos]);
            columnValue = row[pos]
          }
          else {
            //Error return dummy value
            columnValue = 150
          }

      });

      return columnValue

    }

    function getToken(token){
      console.log(token);
      return token;
    }


    return factory;

   }]);
