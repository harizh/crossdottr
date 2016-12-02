'use strict';

angular.module('myApp.createContract', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/create-contract', {
            templateUrl: 'create-contract/create-contract.html',
            controller: 'CreateContractCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('CreateContractCtrl', function($scope, $http, $rootScope, $window, httpRequestService, $compile) {
        var vm = this;
        //  $scope.valid = true;
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        $scope.documentName = '';
        $scope.fileUpload = function(event) {
            if ($('#doc-name').val() != '') {
                var formData = new FormData();
                formData.append('esigndoc', event[0]);

                $.ajax({
                    url: "http://staging-1.crossdottr.com/document", //Server script to process data
                    type: 'POST',
                    headers: {
                        'X-AUTH-TOKEN': localStorage.getItem('AUTH-TOKEN')
                    },
                    xhr: function() { // Custom XMLHttpRequest
                        $('#progress-wrp').show()
                        var xhr = $.ajaxSettings.xhr();
                        if (xhr.upload) {
                            xhr.upload.addEventListener('progress', function(event) {
                                var percent = 0;
                                var position = event.loaded || event.position;
                                var total = event.total;
                                if (event.lengthComputable) {
                                    percent = Math.ceil(position / total * 100);
                                }
                                //update progressbar
                                $(".progress-bar").css("width", +percent + "%");
                                $(".status").text(percent + "%");
                            }, true);
                        }
                        return xhr;
                    },
                    //Ajax events
                    success: function(response) {

                        $rootScope.documentId = response.id;
                        // $scope.$apply(function () {
                        $scope.documentName = response.fileName;
                        //})
                        angular.element('#docName').html(response.fileName)
                        angular.element('.white').show()
                        console.log($scope.documentName)

                        var user2 = {
                            role: 'SIGNEE',
                            user: {
                                emailAddress: '',
                                fullName: ''
                            }
                        }
                        var userInfo = JSON.parse(localStorage.getItem('user-info'));
                        console.log(userInfo.id)
                            // $rootScope.contractForm.name = $('#doc-name').val();
                        var formData = {

                            name: $('#doc-name').val(),
                            document: { id: response.id },
                            parties: [

                            ],
                            user: {
                                id: userInfo.id
                            },
                            contractFields: [{
                                field: {
                                    id: '1'
                                }
                            }],
                            expiryDate: null

                        };
                        // formData.parties.push(user2);
                        $rootScope.contractForm = formData;

                        httpRequestService.post('/contract', formData)
                            .success(function(response) {
                                console.log(1, response);
                                $rootScope.contractId = response;
                                $rootScope.contractForm.id = response;
                                $scope.enabled = true;
                                // $window.location.href = '/#!/contract/' + response;

                            })


                    },
                    error: function() {
                        $window.location.href = '/#!/login';
                    },
                    //  error: this.errorHandler,
                    // Form data
                    data: formData,
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false,
                    contentType: false,
                    processData: false
                });

            } else {
                $('#esigndoc').val('')
                alert('Please enter a Doc Name')
            }
        }
        $scope.contractName = '';
        $scope.email = '';
        $scope.fullName = '';
        $scope.document ={
            expiryDate :null,
            chooseExpiry:false
        }
        $scope.viewSignee={
            name:'',
            email:''
        }
        $scope.signeeList = [{
                id:1,
                name:'',
                email:''
            }];
        var signeeId=2;
        $scope.addSigneeForm = function(){
            $scope.signeeList.push({
                id:signeeId,
                name:'',
                email:''
            });
            signeeId++;
        };
        $scope.removeSigneeForm = function(id){
            _.remove($scope.signeeList, {
                id: id
            });
        }
        $scope.view= {
            init:false,
            chooseSigningOrder:  false
        };
        $scope.toggleChooseSigningOrder = function(){
            console.log($scope.view.chooseSigningOrder);
            $scope.makeSortable();
        }
        $scope.makeSortable = function(){
            if(!$scope.view.init){
                $( "#sortable" ).sortable({ 
                    placeholder: "ui-sortable-placeholder",
                    update:function(event, ui){
                        console.log('event',event);
                        console.log('ui', ui);
                    }
                });
                $scope.view.init = true;
            }
            if($scope.view.chooseSigningOrder){
                $( "#sortable" ).sortable( "enable");
                $( "#sortable" ).disableSelection();
                $( "#sortable" ).removeClass('disable');
                $( "#sortable" ).addClass('enable');
            }else{
                $( "#sortable" ).sortable("disable");
                $( "#sortable" ).removeClass('enable');
                $( "#sortable" ).addClass('disable');
            }
        };

        $scope.addPartyFileds = function() {
            var htmlTemplate = '<div class="box-body white mb20 party-field-container">';

            htmlTemplate += '<div class="form-group">';
            htmlTemplate += '<label for="name1">Name & Email</label>';
            htmlTemplate += ' <input type="text" class="form-control firstname" id="name1" value="" placeholder="Full name" required="">';
            htmlTemplate += '</div>';
            // htmlTemplate += '<div class="form-group"><input type="text" class="form-control lastname" id="name2" value="" placeholder="Last name" required=""></div>'
            htmlTemplate += '<div class="form-group">';
            htmlTemplate += '<input type="email" class="form-control email" id="email1" value="" placeholder="Enter email" required=""></div>';
            htmlTemplate += '<span class="text-sm" class="remove-signee-field"  ng-click="removeSigneeField($event)" style="cursor:pointer;"><i class="fa fa-trash-o"></i> <strong >Remove Signer</strong></span></div>';
            var temp = $compile(htmlTemplate)($scope);
            angular.element('#party-form').append(temp);
        }
        $scope.removeSigneeField = function($event) {
            angular.element($event.target).parents('.box-body').remove();
        }
        $scope.removeDoc = function() {
            angular.element('#docName').html('')
            angular.element('.white').hide()
        }
        $scope.updatePartyFileds = function() {
            console.log(1, $rootScope.contractForm)
            var invalid = false;
            var partyFieldData = [];
            angular.element('.party-field-container').each(function(i, obj) {
                var email = $(this).find('.email').val(),
                    firstName = $(this).find('.firstname').val(),
                    lastName = '',
                    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (email != '' && firstName != '' && re.test(email) != false) {
                    var firstNameSplit = firstName.split(/ (.+)?/); // "72"
                    firstName = firstNameSplit[0];
                    if (firstNameSplit[1])
                        lastName = firstNameSplit[1]
                    var partyField = {
                        role: 'SIGNEE',
                        user: {
                            emailAddress: email,
                            firstName: firstName,
                            lastName: lastName
                        }
                    }
                    $rootScope.contractForm.name = $('#doc-name').val();
                    $rootScope.contractForm.emailSubject = $('.emailSubject').val();
                    $rootScope.contractForm.emailText = $('.emailText').val();
                    $rootScope.contractForm.parties.push(partyField);
                } else {
                    console.log(0)
                    invalid = true;
                    $scope.inValid = true;
                }

            })
            console.log($rootScope.contractForm)
            if (invalid == false) {
                httpRequestService.put('/contract/' + $rootScope.contractForm.id, $rootScope.contractForm)
                    .success(function(response) {
                        console.log(response, $rootScope.contractForm.id);
                        $window.location.href = '/#!/contract/' + $rootScope.contractForm.id;

                    })
            }
        }
        $scope.createContract = function() {

            var user2 = {
                role: 'SIGNEE',
                user: {
                    emailAddress: this.email,
                    fullName: this.fullName
                }
            }
            var user = {
                id: 1
            }

            //  var formData = {

            //     // name: this.contractName,
            //      document: { id: $rootScope.documentId },
            //      parties: [

            //      ],
            //      user: {
            //          id: 1
            //      },
            //      contractFields: [{
            //          field: {
            //              id: '1'
            //          }
            //      }],
            //      expiryDate: null

            //  };
            // // formData.parties.push(user2);

            //  httpRequestService.post('/contract', formData)
            //      .success(function(response) {
            //          console.log(response);
            //          $window.location.href = '/#!/contract/' + response;

            //      })
        }
        angular.element(document).ready(function() {
            angular.element('.remove-signee-field').on('click', function() {
                console.log(1)
            })
        });



    });