'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngFileUpload',
    'myApp.user',
    'myApp.contractListing',
    'myApp.contractDetails',
    'myApp.createContract',
    'myApp.signContract',
    'myApp.activity',
    'myApp.version',
    'myApp.commonComponent'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider, $rootScope) {
   $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({ redirectTo: '/login' });
}]);
