'use strict';

angular.module('myApp.activity', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/activity', {
            templateUrl: 'activity/activity.html',
            controller: 'ActivityCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ActivityCtrl', function($scope, $http, $rootScope, httpRequestService) {
        if(localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        httpRequestService.get('/audits/100')
            .success(function(response) {console.log(response)
               $scope.contracts = response.reverse();
            })
            .error(function(argument) {
                // body...
            })
    })
    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value;
        };
    });
