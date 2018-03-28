'use strict';

var App = angular.module('loanApp', ["ngStorage"]);

var encoded_token_secret = btoa("sas.ec:");
App.value('environment', {
    "baseUrl": 'http://viya33.apac.sas.com',
    "oauthEncodedTokenSecret": encoded_token_secret,
    "grant_type":"password",
    "username": "XXXXX",
    "password": "XXXXX"
});
