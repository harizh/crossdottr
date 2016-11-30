'use strict';

angular.module('myApp.signContract', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/sign-contract/:token', {
            templateUrl: 'sign-contract/sign-contract.html',
            controller: 'signContractCtrl',
            controllerAs: 'vm'
        });

    }])
    .controller('signContractCtrl', function($scope, $http, $rootScope, $routeParams, httpRequestService, $timeout) {
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        $timeout(function() {
            $('#side-bar, .navbar-form, .navbar-nav').css('display', 'none')
        }, 50);


        var wrapper = document.getElementById("signature-pad"),
            clearButton = wrapper.querySelector("[data-action=clear]"),
            saveButton = wrapper.querySelector("[data-action=save]"),
            closeButton = wrapper.querySelector("[data-action=close]"),
            canvas = wrapper.querySelector("canvas"),
            signaturePad;

        // Adjust canvas coordinate space taking into account pixel ratio,
        // to make it look crisp on mobile devices.
        // This also causes canvas to be cleared.
        function resizeCanvas() {
            // When zoomed out to less than 100%, for some very strange reason,
            // some browsers report devicePixelRatio as less than 1
            // and only part of the canvas is cleared then.
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }

        window.onresize = resizeCanvas;
        resizeCanvas();

        signaturePad = new SignaturePad(canvas);

        clearButton.addEventListener("click", function(event) {
            signaturePad.clear();
        });

        closeButton.addEventListener("click", function(event) {
            angular.element('#signature-container').css('visibility', 'hidden').css('height', '0');
            angular.element('.overlay').hide()
        });

        saveButton.addEventListener("click", function(event) {
            if (signaturePad.isEmpty()) {
                alert("Please provide signature first.");
            } else {
                if ($('#agree').prop('checked')) {
                    //   alert("canvas Signature upload Successfully.");
                    // angular.element('.item-color').css('color','red')
                    //  window.open(signaturePad.toDataURL());
                    var dataUrl = signaturePad.toDataURL();
                    
                    if($('#img-tag').length > 0) {                        
                        $('#img-tag').attr('src', dataUrl)
                    } else {
                        $('#sign-text').remove();
                        var wd = $('.sign-holder').css('width'),
                         he = $('.sign-holder').css('height');
                        $('.sign-holder').append('<img id="img-tag" src="'+dataUrl+'" style="width:'+wd+';height:'+he+'">')
                    }

                    // dataUrl = dataUrl.replace('data:image/png;base64,', '');



                    // var dataUrl = signaturePad.toDataURL("image/jpeg");



                    // var blob = dataURItoBlob(dataUrl);
                    console.log(dataUrl)
                    var formData = {

                        data: dataUrl

                    };
                    console.log($('.SIGNATURE').attr('id'))
                    var id = $('.SIGNATURE').attr('id');
                    $('#' + id).find('span').remove()
                    $('#' + id).css('padding', 0)
                    httpRequestService.post('/party/token/' + $routeParams.token + '/field/' + id + '/json/object', formData)
                        .success(function(response) {
                            console.log(1, response);
                            angular.element('#signature-container').css('visibility', 'hidden').css('height', '0')
                            angular.element('.overlay').hide()

                        })
                } else {
                    alert('Please agree')
                }

            }
        });
        $scope.showSignaturePad = function(id) {
            angular.element('.overlay').show()
            var top = parseInt(angular.element('#' + id).parent().css('top')) + 130,
                left = angular.element('#' + id).parent().css('left')
            angular.element('#signature-container').css('visibility', 'visible').css('height', 'auto');
            angular.element('.popup_style').hide();
        }
        $scope.saveText = function(id) {
            var formData = {
                data: $('#' + id).val()
            };


            httpRequestService.post('/party/token/' + $routeParams.token + '/field/' + id + '/json/text', formData)
                .success(function(response) {
                    console.log(1, response);

                })

        }
        $scope.signContract = function() {
            console.log(1)
            httpRequestService.post('/sign/contract/' + $routeParams.token)
                .success(function(response) {
                    $('#sign-item').remove();
                    $('#success').show()

                })
        }
        $scope.rejectContract = function() {
            console.log(1)
            httpRequestService.post('/reject/contract/' + $routeParams.token)
                .success(function(response) {
                    $('#sign-item').remove();
                    $('#reject-message').show()

                })
        }
        $scope.saveFile = function(event) {
            var formData = new FormData();
            formData.append('data', event[0]);
            var id = angular.element('.upload-file').attr('id');
            console.log(formData)


            httpRequestService.post("party/token/" + $routeParams.token + "/field/" + id + "/json/object", formData)
                .success(function(response) {
                    console.log(1, response);
                    // $rootScope.contractId = response;
                    //  $rootScope.contractForm.id = response;
                    // $window.location.href = '/#!/contract/' + response;

                })




        }
         httpRequestService.get('/party/'+$routeParams.token+'/self')
            .success(function(response) { 
                console.log(response)
                $scope.name = response.user.firstName;
                httpRequestService.get('/party/'+$routeParams.token+'/others')
                .success(function(response) { console.log(response)
                    $scope.parties = response;
                })
            })
        httpRequestService.get('/view/contract/thumbnails/' + $routeParams.token)
            .success(function(response) {
                $scope.thumbnails = response;

                //  /party/:token/fields
                httpRequestService.get('/party/' + $routeParams.token + '/fields')
                    .success(function(response) {
                        $scope.fileds = response;
                        console.log(response, 9999999992)
                        for (var i = 0; i < response.length; i++) {
                            if (response[i].fieldType == 'SIGNATURE' && response[i].objectId != '') {
                                httpRequestService.get('/party/token/' + $routeParams.token + '/field/' + response[i].id + '/object?format=datauri')
                                    .success(function(responseUrl) {
                                        // http:\/\/localhost:9000\/view\/contract\/file\/<token>

                                        $('.SIGNATURE span').remove()
                                        $('.SIGNATURE').css('padding', 0)
                                        $scope.utl = responseUrl;
                                       
                                        console.log(responseUrl)
                                    })
                            }
                        }
                        var date = new Date();

                        $scope.filedVal = {
                            'DATE': date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
                        }
                    })

            })
    }).filter('cut', function () {
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