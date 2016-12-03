'use strict';

angular.module('myApp.contractDetails', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contract/:ID', {
            templateUrl: 'contract-details/contract-details.html',
            controller: 'ContractDetailCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ContractDetailCtrl', function($timeout,$scope, $http, $rootScope, $routeParams, httpRequestService, $window) {
        var vm = this;


        angular.element($window).bind("scroll", function(e) {

            var elemTop = $('#dropp').scrollTop();
            //  console.log('scroll', $(window).scrollTop(), $('#dropp').offset().top)
            if ($(window).scrollTop() > 200)
                $('.menu-items').addClass('fixed-menu')
            else
                $('.menu-items').removeClass('fixed-menu')
        })
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        $scope.contractDetails = '';
        angular.element(document).ready(function() {
            var signeeOptions = [];
            $scope.contractDetailsObj = $scope.contractDetails;







            // angular.element('.button_li button').on('click', function() {
            //     angular.element('.popup_style').hide();
            // })

        })
        $scope.selectedDroppables = '';
        httpRequestService.get('/fields')
            .success(function(response) { console.log(response) })

        httpRequestService.get('/contract/' + $routeParams.ID)
            .success(function(response) {
                console.log(response)
                $scope.contract = response;
                $scope.contractDetails = response;

                var contractData = new Array();
                httpRequestService.get('/thumbnails/' + response.document.id)
                    .success(function(response) {
                        console.log(response)
                        $scope.thumbnails = response;

                        setTimeout(function() {

                            var pos = null;
                            var parent = null;
                            var current = null;

                            angular.element(".draggable").draggable({
                                helper: 'clone',
                                cursor: 'move',
                                // snap: '.droppable',
                                appendTo: '.document-content',
                                containment: '#dropp',
                                revert: "invalid",


                            });
                            var obj = $scope.contractDetails;
                            angular.element(".droppable").droppable({

                                drop: function(e, ui) {
                                    if (angular.element(ui.draggable)[0].id != "") {

                                        this.x = ui.helper.clone().addClass('droppables');
                                        ui.helper.remove();
                                        console.log(this.x.find('.ui-resizable-handle'))
                                        this.x.find('.ui-resizable-handle').remove();
                                        this.x.resizable({
                                            // helper: 'ui-resizable-helper',
                                            containment: angular.element(this),
                                            // tolerance: 'fit',
                                        });
                                        this.x.appendTo(angular.element(this));

                                        this.x.draggable({
                                            helper: 'ui-resizable-helper',
                                            //containment: angular.element(this),
                                            containment: '#dropp',

                                            tolerance: 'fit',
                                            stop: function(event, ui) {
                                                console.log(event.target.parentElement.id)
                                                var finalOffset = $(this).offset();
                                                var finalxPos = finalOffset.left;
                                                var finalyPos = finalOffset.top;
                                                console.log($(this).css('left'), $(this).css('top'))

                                                //  $('#finalX').text('Final X: ' + finalxPos);
                                                // $('#finalY').text('Final X: ' + finalyPos);
                                            }
                                        });
                                        // this.x.resizable();
                                        var dropItemPos = angular.element(this).offset(),
                                            dragItemPos = this.x.offset(),
                                            originalY = dragItemPos.top - dropItemPos.top,
                                            originalX = dragItemPos.left - dropItemPos.left,
                                            thisId = angular.element(this).attr('id');
                                        var contractDataItem = {
                                            fieldType: angular.element(ui.draggable)[0].id,
                                            id: 1,
                                            minHeight: 10,
                                            minWidth: 50,
                                            page: { id: thisId, document: { id: $scope.contractDetails.document.id } },
                                            text: "",
                                            xOrigin: originalX,
                                            xorigin: originalX,
                                            yOrigin: originalY,
                                            yorigin: originalY,
                                            isEnable: 0

                                        };

                                        this.x.attr('position', originalX + '-' + originalY + '-' + angular.element(ui.draggable)[0].id + '-' + thisId + '-' + $scope.contractDetails.document.id)
                                        var attrId = generateRandomString(10).trim();
                                        this.x.attr('id', attrId);
                                        if(this.x.attr('data-type')=='signature'){
                                            $scope.signature[attrId]={
                                                id:attrId
                                            };
                                        }
                                        jQuery('body').on('click', this.x, function(event) {
                                            $scope.selectedDroppables = jQuery(event.target).parents('.droppables').attr('id');
                                            $timeout(function() {
                                                 $scope.$apply();
                                              }, 0);
                                            //console.log('$scope.selectedDroppables', $scope.selectedDroppables, event);
                                        });

                                        var mr = 0;
                                        if (originalX > (this.clientWidth / 2)) {
                                            var mr = 0
                                        }
                                        var dragItem = this.x,
                                            contextItem = angular.element(dragItem).find('.nav_con_det_menu'),
                                            popupId = contextItem.attr('modal');
                                        contextItem.contextMenu('#' + popupId, {

                                            'horAdjust': mr,
                                            'displayAround': 'trigger',
                                            'position': 'bottom'
                                        });
                                        // var dragItem = this.x,
                                        //     contextItem = angular.element(dragItem).find('.nav_con_det_menu'),
                                        //     popupId = contextItem.attr('modal');
                                        // contextItem.contextMenu('#' + popupId, {});
                                        // angular.element('.ui-resizable-handle').remove();
                                    }

                                }

                            });
                        })

                    })
            })
            .error(function(argument) {
                // body...
            })



        $scope.hideElement = function(event) {
            angular.element('.popup_style').hide();
        }

        $scope.removeElement = function() {
            angular.element("#" + $scope.selectedDroppables).remove();
            angular.element('.popup_style').hide();
        };
        $scope.signature = [];
        $scope.selectSignee = function(dropable){
            console.log("dropable",dropable);
            console.log("$scope.signature[dropable].selectedSignee",$scope.signature[dropable].selectedSignee);
        }

        $scope.updateContract = function() {
            var valid = true;
            angular.element('.droppables').each(function() {
                console.log(11111)
                if (angular.element(this).attr('position')) {

                    var field = angular.element(this)
                        .find('.nav_con_det_menu').html(),
                        modal = angular.element(this).find('.nav_con_det_menu').attr('modal'),
                        selectedParty = angular.element('#' + modal).find('select').val(),
                        positionElem = angular.element(this).attr('position').split('-');
                        

                    //positionElem = angular.element(this).attr('position').split('-');
                    for (var i = 0; i < $scope.contractDetails.parties.length; i++) {
                        if (selectedParty == 'Select Signee...') {
                            alert('Please choose a party for ' + positionElem[2]);
                            valid = false;
                            break;
                        } else {
                            if (!selectedParty || selectedParty == $scope.contractDetails.parties[i].user.id) {

                                if ($scope.contractDetails.parties[i].contractFields.length > 0) {
                                    for (var j = 0; j < $scope.contractDetails.parties[i].contractFields.length; j++) {
                                        if ($scope.contractDetails.parties[i].contractFields[j].length > 0 && $scope.contractDetails.parties[i].contractFields[j].fieldType == positionElem[2] && $scope.contractDetails.parties[i].contractFields[j].page.id == positionElem[3]) {

                                            console.log($scope.contractDetails.parties[i].contractFields[j])
                                            delete $scope.contractDetails.parties[i].contractFields[j];
                                        }
                                    }
                                }
                                console.log(positionElem[2])
                                var contractDataItem = {
                                    fieldType: positionElem[2],

                                    minHeight: parseInt(angular.element(this).css('height')),
                                    minWidth: parseInt(angular.element(this).css('width')),
                                    page: { id: positionElem[3], document: { id: positionElem[4] } },
                                    text: "",
                                    xOrigin: parseInt($(this).css('left')),
                                    xorigin: parseInt($(this).css('left')),
                                    yOrigin: parseInt($(this).css('top')),
                                    yorigin: parseInt($(this).css('top'))

                                };
                                $scope.contractDetails.parties[i].contractFields.push(contractDataItem)
                            }
                        }
                    }
                }

            })
            if (valid == true) {
                httpRequestService.put('/contract/' + $scope.contractDetails.id, $scope.contractDetails)
                    .success(function(response) {
                        console.log(response);
                        angular.element('#send-signee').show();
                        angular.element('#contract-details').remove();

                    })
                console.log($scope.contractDetails)
            }
        }

        $scope.sendForSign = function() {
            httpRequestService.post('/send/contract/' + $scope.contractDetails.id)
                .success(function(response) {
                    console.log(response);
                    $('#send-signee-review').show();
                    angular.element('#send-signee').remove()
                        //  angular.element('#send-signee').show();
                        // angular.element('#contract-details').remove();

                })
        }



        function generateRandomString(length) {
            var text = " ";
            var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < length; i++) {
                text += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return text;
        }

    });