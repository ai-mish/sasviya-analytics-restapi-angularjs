'use strict';

angular.module('loanApp')
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$rootScope','$q', '$window', function($rootScope, $q, $window) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    config.timeout = 30000;
                    if ($window.sessionStorage.token) {
                      config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
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
