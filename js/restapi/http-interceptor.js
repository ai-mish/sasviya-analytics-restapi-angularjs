'use strict';

angular.module('myApp', ['ngStorage'])
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        console.log('Interceptor --> Bearer=' + $localStorage.token)
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
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
