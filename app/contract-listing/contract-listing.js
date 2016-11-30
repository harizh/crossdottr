'use strict';

angular.module('myApp.contractListing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contracts/:status', {
            templateUrl: 'contract-listing/contract-listing.html',
            controller: 'ContractListingCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ContractListingCtrl', function($scope, $http, $rootScope, $routeParams, httpRequestService, $filter) {
        if(localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        httpRequestService.get('/contracts')
            .success(function(response) {console.log(response)
                $scope.contracts = response.reverse();

                var val = $routeParams.status
                $scope.status = $filter('uppercase')(val).replace(/-/g, '_');
               console.log($scope.status)

            })
            .error(function(argument) {
                // body...
            })
    });
