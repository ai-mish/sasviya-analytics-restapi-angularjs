'use strict';

angular.module('myApp', ['ngStorage'])
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    config.timeout = 30000;
                    var encodedString = btoa("xxxxx:xxxxx");
                    config.headers.Authorization = 'Basic ' + encodedString;
                    //$http.defaults.headers.common['Authorization'] = 'Basic ' + encodedString;
                    return config;
                },
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        console.log("401")
                    }
                    return $q.reject(response);
                }
            };
        }]);

    }
]);
