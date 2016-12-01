;(function (angular, $) {
'use strict';
angular.module('myApp.commonComponent',[]);
angular.module('myApp.commonComponent')
	.constant('DATE_TIME_PICKER_DEFAULTS', {
            format: 'dd MMMM yyyy H:m:s',
            closeOnDateSelect: true,
            validateOnBlur: true,
            startDate:new Date(),
            yearStart: 1900,
        })
        .directive('msDateTimePicker', function (DATE_TIME_PICKER_DEFAULTS, $filter,$timeout) {
            return {
                require: '?ngModel',
                scope: {
                    ngMin: '=',
                    ngMax: '=',
                    correctTimeZone: '=?'
                },
                link: function ($scope, $element, $attr, ngModelController) {

                    if (angular.isUndefined($scope.correctTimeZone)) $scope.correctTimeZone = true;
                    if (!ngModelController) {
                        return;
                    }
                    var $dateFilter = $filter('date'),
                        options = angular.extend({}, DATE_TIME_PICKER_DEFAULTS);
                        options.onGenerate =function( ct ){
						    place(jQuery(this));
						}
                    if(ngModelController.$modelValue){
                        options.defaultDate = ngModelController.$modelValue;
                    }

                    options.onChangeDateTime = function (dt, $input, e) {
                        ngModelController.$setViewValue($dateFilter(dt, 'dd MMMM yyyy H:m:s'));
                    };

                    ngModelController.$render = function () {
                    	render($element);
                    };
                    function render($element){
                    	$timeout(function(){
                        	$element.datetimepicker(options);
                        	$element.datetimepicker('show');
                    	},100);
                    }
                    function place($element){
                    	$timeout(function(){
                        	var offset = $element.offset();
                        	$element.css({
                        		top: offset.top - 200+'px'
                        	});
                    	},100);
                    }

                    $scope.$on('$destroy', function () {
                        $element.datetimepicker('destroy');
                    });

                }
            };
        });
})(angular, jQuery);