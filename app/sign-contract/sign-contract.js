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


        // var wrapper = document.getElementById("signature-pad"),
        var wrapper = document.getElementById("signature-container"),
            clearButton = wrapper.querySelector("[data-action=clear]"),
            saveButton = wrapper.querySelector("[data-action=save]"),
            // closeButton = wrapper.querySelector("[data-action=close]"),
            canvas = wrapper.querySelector("canvas#canvas-signature-pad"),
            signaturePad;

        // Adjust canvas coordinate space taking into account pixel ratio,
        // to make it look crisp on mobile devices.
        // This also causes canvas to be cleared.
        /*function resizeCanvas() {
            // When zoomed out to less than 100%, for some very strange reason,
            // some browsers report devicePixelRatio as less than 1
            // and only part of the canvas is cleared then.
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }*/
        $scope.resizeCanvas = function() {
            if(canvas.offsetWidth==0){
             $timeout($scope.resizeCanvas,200)
             }else{
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
             canvas.width = canvas.offsetWidth * ratio;
             canvas.height = canvas.offsetHeight * ratio;
             canvas.getContext("2d").scale(ratio, ratio);
             }
         }

        window.onresize = $scope.resizeCanvas;
        $scope.resizeCanvas();

        signaturePad = new SignaturePad(canvas);
        var signatureTyped =document.getElementById("canvas-type-signature");
        jQuery(signatureTyped).hide();
        var signatureUploaded =document.getElementById("canvas-upload-signature");
        jQuery(signatureUploaded).hide();

        clearButton.addEventListener("click", function(event) {
            signaturePad.clear();
        });

        // closeButton.addEventListener("click", function(event) {
        //     angular.element('#signature-container').css('visibility', 'hidden').css('height', '0');
        //     angular.element('.overlay').hide()
        // });
        function isCanvasBlank(canvas) {
            var blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;

            return canvas.toDataURL() == blank.toDataURL();
        }

        function getBase64Image(img) {
            // Create an empty canvas element
            signatureUploaded.width = img.x;
            signatureUploaded.height = img.y;

            // Copy the image contents to the canvas
            var ctx = signatureUploaded.getContext("2d"); 
            ctx.clearRect(0,0,signatureUploaded.width, signatureUploaded.height);
            ctx.drawImage(img, 0,0, img.x, img.y);
    

            return  signatureUploaded.toDataURL();
        }

        function setSignatureOnDocument(dataUrl){
            if($('#img-tag').length > 0) {                        
                $('#img-tag').attr('src', dataUrl)
            } else {
                $('#sign-text').remove();
                var wd = $('.sign-holder').css('width'),
                 he = $('.sign-holder').css('height');
                $('.sign-holder').append('<img id="img-tag" src="'+dataUrl+'" style="width:'+wd+';height:'+he+'">')
            }
            console.log(dataUrl);
            var formData = {data: dataUrl};
            console.log($('.SIGNATURE').attr('id'))
            var id = $('.SIGNATURE').attr('id');
            $('#' + id).find('span').remove()
            $('#' + id).css('padding', 0)
            httpRequestService.post('/party/token/' + $routeParams.token + '/field/' + id + '/json/object', formData)
                .success(function(response) {
                    console.log(1, response);
                    jQuery('#signature-container').modal('hide');
                })
        }
        function saveDrawImage(){
            if (signaturePad.isEmpty()) {
                alert("Please provide signature first.");
            } else {
                
                    //   alert("canvas Signature upload Successfully.");
                    // angular.element('.item-color').css('color','red')
                    //  window.open(signaturePad.toDataURL());
                    var dataUrl = signaturePad.toDataURL();
                    setSignatureOnDocument(dataUrl);

                   // dataUrl = dataUrl.replace('data:image/png;base64,', '');
                   // var dataUrl = signaturePad.toDataURL("image/jpeg");
                   // var blob = dataURItoBlob(dataUrl);
            }
        }

        function saveTypeImage(){
            if (isCanvasBlank(signatureTyped)) {
                alert("Please provide signature first.");
            } else {
                var dataUrl = signatureTyped.toDataURL();
                setSignatureOnDocument(dataUrl);
            }
        }
        function saveUploadImage(){
            if (!$scope.sign.files) {
                alert("Please provide signature first.");
            } else {
                var dataUrl = getBase64Image(document.getElementById('signature-uploaded'));
                setSignatureOnDocument(dataUrl);
            }
        }
        saveButton.addEventListener("click", function(event) {
            if ($('#agree').prop('checked')) {
                switch($scope.signaturePattern){
                    case 'draw':
                        saveDrawImage();
                        break;
                    case 'type':
                        saveTypeImage();
                        break;
                    case 'upload':
                        saveUploadImage();
                        break
                }
            }else{
                alert('Please agree')
            }
        });
        $scope.fontList = ['Allura','Kaushan Script','Marck Script','Dancing Script'];
        $scope.signaturePattern = 'draw';
        $scope.font = $scope.fontList[0];
        $scope.signame = 'Barrington Russel';
        $scope.sign={
            file : {}
        };
        $scope.setSignaturePattern = function(pattern){
            $scope.signaturePattern = pattern;
        }
        $scope.setFont = function(font){
            $scope.font = font;
            var ctx = signatureTyped.getContext("2d");
            ctx.clearRect(0, 0, signatureTyped.width, signatureTyped.height);
            ctx.fillText($scope.signame,10,40);

            ctx.font='28px '+$scope.font;
        }
        $scope.setFont($scope.font);

        $scope.$watch('sign.files', function () {
            //console.log($scope.sign.files);
            //$scope.upload($scope.files);
        });
        $scope.showSignaturePad = function(id) {
            // angular.element('.overlay').show()
            // var top = parseInt(angular.element('#' + id).parent().css('top')) + 130,
            //     left = angular.element('#' + id).parent().css('left')
            // angular.element('#signature-container').css('visibility', 'visible').css('height', 'auto');
            // angular.element('.popup_style').hide();
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

                });

        };
        
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