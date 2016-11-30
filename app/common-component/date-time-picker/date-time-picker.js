;(function (angular, $) {
'use strict';
angular.module('myApp.commonComponent',[]);
angular.module('myApp.commonComponent')
	.constant('DATE_TIME_PICKER_DEFAULTS', {
            timepicker: true,
            lazyInit: true,
            mask: '9999/19/39 12:30',
            format: 'yyyy/MM/dd H:m:s',
            closeOnDateSelect: true,
            validateOnBlur: true,
            allowBlank: true,
            startDate:new Date(),
            defaultDate:new Date(),
            yearStart: 1900
        })
        .directive('msDateTimePicker', function (DATE_TIME_PICKER_DEFAULTS, $filter) {
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

                    angular.extend(options, getMinMaxDates());

                    options.onChangeDateTime = function (dt, $input, e) {
                        ngModelController.$setViewValue($dateFilter(dt, 'yyyy/MM/dd H:m:s'));
                    };

                    ngModelController.$render = function () {
                        $element.datetimepicker(options);
                        $element.datetimepicker('show');
                    };

                    function getMinMaxDates() {
                        return {
                            minDate: $scope.ngMin || false,
                            maxDate: $scope.ngMax || false,
                            // ownerDocument: $element
                        };
                    }

                    $scope.$watchGroup(['ngMin', 'ngMax'], function () {
                        angular.extend(options, getMinMaxDates());
                        $element.datetimepicker(options);
                    });

                    $scope.$on('$destroy', function () {
                        $element.datetimepicker('destroy');
                    });

                }
            };
        });
})(angular, jQuery);