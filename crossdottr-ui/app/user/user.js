'use strict';

angular.module('myApp.user', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'user/login.html',
            controller: 'UserCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('UserCtrl', function($scope, $http, $rootScope, $window) {
        var vm = this;

        //  vm.login = login;
        $scope.password = '';
        $scope.email = '';
        $scope.login = function() {
            console.log(1)
            vm.dataLoading = true;
            var jsonObject = {
                "email": this.email,
                "password": this.password
            }
            $http({
                    method: 'post',
                    url: 'http://staging-1.crossdottr.com/login',
                    data: jsonObject
                })
                .success(function(data, status) {
                    console.log('all is good', data);
                    localStorage.setItem('AUTH-TOKEN', data.authToken);
                    $rootScope.login = true;

                    $http.get('http://staging-1.crossdottr.com/userinfo', {
                        headers: { 'x-auth-token': localStorage.getItem('AUTH-TOKEN') }
                    }).success(function(response) {
                        localStorage.setItem('user-info', JSON.stringify(response));
                    });
                    $window.location.href = '/#!/activity';

                })
                .error(function(data, status) {
                    $scope.invalidLogin = true;
                });

        };
    });
