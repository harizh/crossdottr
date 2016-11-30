;(function (angular, $) {
'use strict';
angular.module('myApp.commonComponent')
    .directive('repeatDone', function() {
        return function(scope, element, attrs) {
        	console.log(scope.$index);
            if (scope.$last) { // all are rendered
                scope.$eval(attrs.repeatDone);
            }
        }
    })
})(angular, jQuery);