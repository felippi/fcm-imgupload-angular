'use strict';

angular.module('fcmImguploadAngular').directive('fcmImguploadAngular', ['$timeout', '$window', 'fcmPubSub', function ($timeout, $window, FcmPubSub) {
    return {
        restrict: 'E',
        scope: {
            options: '=', /* options */
            progressPercent: '=?',

            //   uploadImages: '&',

            onImageDelete: '&',
            onImageUpload: '&',

            reveseCall: '&?'

        },
        // template: '<canvas></canvas>',
        templateUrl: './template/fcm-imgupload-angular.template.html',
        controller: ['$scope', '$attrs', function ($scope, $attrs) {
            $scope.events = new FcmPubSub();
            var name = $attrs.name;

            this.updateMap = function() {
                console.log('Hello FCM');
            };

            $scope.events.on(name, function(args){
                console.log('Funcionou', args);
            });

            $scope.$on('destroy', function() {
                // $scope.events.deregisterDirective(name);
            });


        }],
        link: function (scope, element, attrs, ctrl) {
            // Init Events Manager
            var events = scope.events;
            var options = scope.options;
            var _ = window._;
            if(!_) {
                console.error('Need lodash');
            }

            this.isEditMode = true;
            this.invalidFiles = '';

            scope.ctrlFcmImguploadAngular = this;

            console.log('element', element);
            console.log('cancel-upload', element.querySelector('.cancel-upload'));


            // reverse call
            // uploadImages






            this.default = {
                imageToCrop: null,
                cropType: 'rectangle',
                aspectRatio: false,
                imageCroppedSize: {w: 1200, h: 1200},
                areaInitCoords: {},
                areaInitSize: {},
                cropperInfo: {},
                initMaxArea: true,
                title: '',
                quality: '0.7',
                format: 'image/jpeg',


                onloadUiCropper: false,
                onSelectBanner: false,
                bannerChanged: false,
                bannerCroppedChanged: false,
                hasBanner: false,
                removerImagem: false,
                propagandaBanner: null
            };

            this.defaultWhithIndex = {
                thumbnail: 'image-thumbnail',
                blur: 'image-blur',
                databaseIndex: 'img'
            };

            scope.progressPercent =0;
            this.progressList = {};

            this.prop = [];
            this.on = [];
            if(!options || !Array.isArray(options)) {
                console.error('imagesFcm need a Array of Objects');
                return;
            }
            for(var index in options) {
                this.prop[index] = {};
                for(var p in this.default) {
                    this.prop[index][p] = options[index][p] || this.default[p];
                }

                for(var p in this.defaultWhithIndex) {
                    this.prop[index][p] = options[index][p] || this.defaultWhithIndex[p]+'-'+index;
                }
            }


            this.loadBanner = function (index, url) {
                var that = this;
                (function() {
                    if(!url) {
                        console.error('loadBanner need url');
                        return null;
                    }
                    index = index || 0;
                    var thumbnail = document.querySelector('#'+that.prop[index].thumbnail);
                    var blur = document.querySelector('#'+that.prop[index].blur);
                    if (thumbnail) {
                        var img = new Image();
                        that.prop[index].imageToCrop = url;

                        img.onload = function () {
                            var canvas = document.createElement('canvas');
                            canvas.id = 'image-banner'+index;
                            canvas.width = this.width;
                            canvas.height = this.height;
                            canvas.style.maxWidth = '100%';
                            canvas.style.display = 'flex';
                            var ctx = canvas.getContext('2d');
                            ctx.drawImage(this, 0, 0, this.width, this.height);

                            // $timeout(function () {
                            //     _this['bannerWidth'+index] = canvas.width;
                            //     _this['bannerHeight'+index] = canvas.height;
                            // });

                            thumbnail.innerHTML = '';
                            thumbnail.appendChild(canvas);
                        };
                        img.src = url;
                        blur.style.backgroundImage = 'url(' + url + ')';
                    }
                })();
            };

            this.selectBanner = function (index, files, file) {
                // console.log('selectBanner', index);
                index = index || 0;
                var blur = document.querySelector('#'+this.prop[index].blur);
                var thumbnail = document.querySelector('#'+this.prop[index].thumbnail);
                if (file) {
                    this.prop[index].onSelectBanner = true;
                    this.prop[index].bannerChanged = true;
                    this.prop[index].bannerCroppedChanged = true;
                    this.prop[index].hasBanner = true;
                    this.prop[index].initMaxArea = true;
                    this.prop[index].removerImagem = false;
                    var _URL = $window.URL || $window.webkitURL;
                    var url = _URL.createObjectURL(file);
                    this.prop[index].imageToCrop = url;

                    var img = new Image();

                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.id = 'image-banner'+index;
                        canvas.width = this.width;
                        canvas.height = this.height;
                        canvas.style.maxWidth = '100%';
                        canvas.style.display = 'flex';
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(this, 0, 0, this.width, this.height);
                        // $timeout(function () {
                        //     _this['bannerWidth'+index] = canvas.width;
                        //     _this['bannerHeight'+index] = canvas.height;
                        // });
                        thumbnail.innerHTML = '';
                        thumbnail.appendChild(canvas);
                    };
                    img.src = url;
                    blur.style.backgroundImage = 'url(' + img.src + ')';
                }
                else {
                    if(this.prop[index].hasBanner) {
                        this.prop[index].removerImagem = false;
                    }
                    this.prop[index].onSelectBanner = false;
                    this.prop[index].bannerChanged = false;
                    this.prop[index].bannerCroppedChanged = false;
                    this.prop[index].hasBanner = false;
                    this.prop[index].initMaxArea = true;
                    thumbnail.innerHTML = '';
                    blur.style.backgroundImage = 'none';
                }
            };

            this.onBannerCroppChange = function (index, e) {
                index = index || 0;
                if (e) {
                    if (this.prop[index].croppInitialized) {
                        this.prop[index].bannerCroppedChanged = true;
                    }
                    this.prop[index].croppInitialized = true;
                }
            };

            this.onLoadBegin = function (e, index) {
                index = index || 0;
                this.prop[index].onloadUiCropper = true;
            };
            this.onLoadDone = function (e, index) {
                index = index || 0;
                this.prop[index].onloadUiCropper = false;
            };
            this.onLoadError = function (e, index) {
                index = index || 0;
                console.log('onLoadError', e);
            };

            this.getLoadingMessage = function () {
                return 'Carregando';
            };

            this.loadByObj = function (imagesObj) {
                var that = this;
                this.prop.map(function(value, index) {
                    if(imagesObj[value.databaseIndex] && imagesObj[value.databaseIndex].url_original) {
                        that.loadBanner(index, imagesObj[value.databaseIndex].url_original);
                        value.hasBanner = true;
                        if (imagesObj[value.databaseIndex].cropperInfo) {
                            value.areaInitCoords = {
                                x: imagesObj[value.databaseIndex].cropperInfo.x || 0,
                                y: imagesObj[value.databaseIndex].cropperInfo.y || 0
                            };

                            value.areaInitSize = {
                                w: imagesObj[value.databaseIndex].cropperInfo.w || 0,
                                h: imagesObj[value.databaseIndex].cropperInfo.h || 0
                            };
                            value.initMaxArea = false;
                        }
                    }
                });
            };

            this.progressUpdate = function (index, progress) {
                var that = this;
                this.progressList[index] = progress;
                var totalProgress = _.reduce(this.progressList, function(a, b) {
                    return a + b;
                }, 0);
                var size = _.size(this.progressList);
                $timeout(function() {
                    scope.progressPercent = totalProgress/size;
                });

            };

            this.progressReset = function() {
                scope.progressPercent = 0;
                this.progressList = {};
            };

            this.uploadImages = function (imgObj) {
                console.log('uploadImg', imgObj);
                var that = this;
                this.progressReset();
                return new Promise(function(resolve, reject){
                    var promisesImg = [];
                    that.prop.map(function(value, index) {

                        if(value.removerImagem) {
                            promisesImg.push(scope.onImageDelete(value.databaseIndex));
                            promisesImg.push(escope.onImageDelete(value.databaseIndex+'_original'));
                        }

                        if ((value.bannerCroppedChanged || value.bannerChanged) && !value.removerImagem) {
                            $timeout(function () {
                                scope.isUploading = true;
                            });
                            value.bannerCroppedChanged = false;

                            promisesImg.push(new Promise(function(resolve, reject){
                                return scope.onImageUpload(value.databaseIndex, value.propagandaBanner, function(progress){
                                    that.progressUpdate(value.databaseIndex, progress);
                                    // console.log('progress '+value.databaseIndex+': ', progress);
                                }).then(function(url){
                                    if(!imgObj[value.databaseIndex]) {
                                        imgObj[value.databaseIndex] = {};
                                    }
                                    imgObj[value.databaseIndex].url = url;
                                    if(value.cropperInfo) {
                                        imgObj[value.databaseIndex].cropperInfo = {
                                            x: value.cropperInfo.cropImageLeft || 0,
                                            y: value.cropperInfo.cropImageTop || 0,
                                            w: value.cropperInfo.cropImageWidth || 0,
                                            h: value.cropperInfo.cropImageHeight || 0
                                        };
                                    }
                                    resolve(url);
                                }).catch(reject);
                            }));
                        }
                        if(value.bannerChanged && !value.removerImagem) {
                            $timeout(function () {
                                scope.isUploading = true;
                            });
                            value.bannerChanged = false;
                            var banner = document.querySelector('#image-banner'+index);

                            promisesImg.push(new Promise(function(resolve, reject){
                                banner.toBlob(function (blob) {
                                    scope.onImageUpload(value.databaseIndex+'_original', blob, function(progress){
                                        that.progressUpdate(value.databaseIndex+'_original', progress);
                                        // console.log('progress '+value.databaseIndex+': ', progress);
                                    }).then(function(url){
                                        if(!imgObj[value.databaseIndex]) {
                                            imgObj[value.databaseIndex] = {};
                                        }
                                        imgObj[value.databaseIndex].url_original = url;
                                        resolve(url);
                                    }).catch(reject);
                                }, value.format, value.quality);
                            }));
                        }
                    });
                    return Promise.all(promisesImg).then(resolve).catch(reject);
                });
            };
        }
    };
}]);



/**
 * @memberof NgMap
 * @function setDefaultOptions
 * @param {Hash} options
 * @example
 *  app.config(function(NgMapProvider) {
     *    NgMapProvider.setDefaultOptions({
     *      marker: {
     *        optimized: false
     *      }
     *    });
     *  });
 */

// Ex provider angular
/*
angular.module('ngMap').provider('NgMap', function() {
    var defaultOptions = {};



    this.setDefaultOptions = function(options) {
        defaultOptions = options;
    };

    var NgMap = function(
        _$window_, _$document_, _$q_,
        _NavigatorGeolocation_, _Attr2MapOptions_,
        _GeoCoder_, _camelCaseFilter_, _NgMapPool_
    ) {
        $window = _$window_;
        $document = _$document_[0];
        $q = _$q_;
        NavigatorGeolocation = _NavigatorGeolocation_;
        Attr2MapOptions = _Attr2MapOptions_;
        GeoCoder = _GeoCoder_;
        camelCaseFilter = _camelCaseFilter_;
        NgMapPool = _NgMapPool_;

        return {
            defaultOptions: defaultOptions,
            addMap: addMap,
            deleteMap: deleteMap,
            getMap: getMap,
            initMap: initMap,
            setStyle: setStyle,
            getGeoLocation: getGeoLocation,
            observeAndSet: observeAndSet
        };
    };
    NgMap.$inject = [
        '$window', '$document', '$q',
        'NavigatorGeolocation', 'Attr2MapOptions',
        'GeoCoder', 'camelCaseFilter', 'NgMapPool'
    ];

    this.$get = NgMap;
});

*/
