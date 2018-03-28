'use strict';

angular.module('loanApp')
.factory('loanService', ['$http', '$q', '$localStorage','$httpParamSerializer' , function($http, $q,$localStorage,$httpParamSerializer){
  var factory = {
      connect:connect
    };


    function connect() {
        var deferred = $q.defer();
        var data = {
            grant_type:'password',
            username: 'xxxxxx',
            password: 'xxxxxx'
        };
        var oauth_token_secret = btoa("sas.ec:");
        var req = {
            method: 'POST',
            url: "http://viya33.apac.sas.com/SASLogon/oauth/token",
            headers: {
                "Authorization": "Basic " + oauth_token_secret,
                "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            data: $httpParamSerializer(data)
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


    return factory;

}]);
