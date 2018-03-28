'use strict';

angular.module('myApp')
.factory('BearerAuthInterceptor', [function ($window, $q) {
    return {
        'request': function(config) {
            config.headers = config.headers || {};
            var encodedString = btoa("sas.ec");
            config.headers.Authorization = 'Basic '+encodedString;
            if ($window.localStorage.getItem('token')) {
              // may also use sessionStorage
                config.headers.Authorization = 'Bearer ' + $window.localStorage.getItem('token');
            }
            return config || $q.when(config);
        },
        'response': function(response) {
            if (response.status === 401) {
                //  Redirect user to login page / signup Page.
                console.error('HTTP status 401 signin failed')
            }
            return response || $q.when(response);
        }
    };
}]);
