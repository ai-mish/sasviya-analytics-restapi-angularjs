angular.module('myApp')
.factory('CASAuthInterceptor', [function() {
    return {
    // Send the Authorization header with each request
        'request': function(config) {
            config.headers = config.headers || {};
            var encodedString = btoa("xxxxx:xxxxxx");
            config.headers.Authorization = 'Basic '+encodedString;
           return config;
        }
    };
}]);
