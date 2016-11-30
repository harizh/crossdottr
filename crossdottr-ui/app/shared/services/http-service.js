(function(angular) {

    angular.module('myApp')
        .factory('httpRequestService', function($http, $rootScope, $window) {
            var apiUrl = 'http://staging-1.crossdottr.com';
            // set headers
            var setHeaders = function(requestType) {
                
                var config = {
                    'x-auth-token': localStorage.getItem('AUTH-TOKEN')
                }
                return config;
            };
            // handling unauthorized user login
            var unauthorizedUser = function() {
                localStorage.clear();
                $('.ajax-loader, .overlay').hide();
                $window.location.href = '/#!/login';
            };

            return {
                get: function(url) {
                    $('.ajax-loader, .overlay').show();
                    return $http({
                        method: 'GET',
                        url: apiUrl + url,
                        headers: setHeaders(),
                        timeout: 180000
                    }).success(function(response) {
                        if (response.status == 401)
                            unauthorizedUser();
                        $('.ajax-loader, .overlay').hide();
                    }).error(function(data, status, headers, config) {
                        if (status == 401)
                            unauthorizedUser();

                    });
                },
                post: function(url, dataSent) {
                    $('.ajax-loader, .overlay').show();
                    return $http({
                        method: 'POST',
                        url: apiUrl + url,
                        data: dataSent,
                        headers: setHeaders(),
                        timeout: 180000
                    }).success(function(response) {
                        $('.ajax-loader, .overlay').hide();
                    }).error(function(data, status, headers, config) {
                        if (status == 401)
                            unauthorizedUser();

                    });
                },
                put: function(url, dataSent) {
                    $('.ajax-loader, .overlay').show();
                    return $http({
                        method: 'put',
                        url: apiUrl + url,
                        data: dataSent,
                        headers: setHeaders(),
                        timeout: 180000
                    }).success(function(response) {
                        $('.ajax-loader, .overlay').hide();
                    }).error(function(data, status, headers, config) {
                        if (status == 401)
                            unauthorizedUser();

                    });
                }

            }
        });
})(angular);
