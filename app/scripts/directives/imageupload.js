angular.module('imageupload', [])
  .directive('image', function($q) {
    'use strict';

    var URL = window.URL || window.webkitURL;

    var getResizeArea = function () {
      var resizeAreaId = 'fileupload-resize-area';

      var resizeArea = document.getElementById(resizeAreaId);

      if (!resizeArea) {
        resizeArea = document.createElement('canvas');
        resizeArea.id = resizeAreaId;
        resizeArea.style.visibility = 'hidden';
        document.body.appendChild(resizeArea);
      }

      return resizeArea;
    };

    var resizeImage = function (origImage, options) {
      var maxHeight = options.maxHeight || 0;
      var maxWidth = options.maxWidth || 0;
      var ratioHeight = options.ratioHeight || 0;
      var ratioWidth = options.ratioWidth || 0;
      var quality = options.quality || 0.7;
      var type = options.type || 'image/jpg';
      var clip = null;

      var canvas = getResizeArea();

      var h = origImage.height;
      var w = origImage.width;
      
      if(ratioHeight>0 && ratioWidth>0) {
        if(ratioWidth > ratioHeight) {
          h = Math.round(h = w*ratioHeight/ratioWidth);
        } else {
          w = Math.round(w = h*ratioWidth/ratioHeight);
        }
        clip = {
          x: origImage.width===w ? 0 : (origImage.width-w)/2,
          y: origImage.height===h ? 0 : (origImage.height-h)/2
        }
      }
      
      // calculate the width and height, constraining the proportions
      var resize = {h:h, w:w};
      if(maxHeight > 0) {
        if (resize.h > maxHeight) {
          resize.w = Math.round(resize.w *= maxHeight / resize.h);
          resize.h = maxHeight;
        }
      }
      if(maxWidth > 0) {
        if (resize.w > maxWidth) {
          resize.h = Math.round(resize.h *= maxWidth / resize.w);
          resize.w = maxWidth;
        }
      }
      
      canvas.width = resize.w;
      canvas.height = resize.h;
      //draw image on canvas
      var ctx = canvas.getContext('2d');
      if(clip) {
        ctx.drawImage(origImage, clip.x, clip.y, w, h, 0, 0, resize.w, resize.h);
      } else {
        ctx.drawImage(origImage, 0, 0, resize.w, resize.h);
      }
      // get the data from canvas as 70% jpg (or specified type).
      return canvas.toDataURL(type, quality);
    };

    var createImage = function(url, callback) {
      var image = new Image();
      image.onload = function() {
        callback(image);
      };
      image.src = url;
    };

    var fileToDataURL = function (file) {
      var deferred = $q.defer();
      var reader = new FileReader();
      reader.onload = function (e) {
        deferred.resolve(e.target.result);
      };
      reader.readAsDataURL(file);
      return deferred.promise;
    };
    
    var newBlob = function(data, datatype) {
      var out;
      try {
        out = new Blob([data], {type: datatype});
        //console.debug('case 1');
      }
      catch (e) {
        window.BlobBuilder = window.BlobBuilder ||
          window.WebKitBlobBuilder ||
          window.MozBlobBuilder ||
          window.MSBlobBuilder;

        if (e.name === 'TypeError' && window.BlobBuilder) {
          var bb = new BlobBuilder();

          bb.append(data.buffer);
          out = bb.getBlob(datatype);
          //console.debug('case 2');
        }
        else if (e.name === 'InvalidStateError') {
          // InvalidStateError (tested on FF13 WinXP)
          out = new Blob([data], {type: datatype});
          //console.debug('case 3');
        }
        else {
          // We're screwed, blob constructor unsupported entirely   
          //console.debug('Errore');
        }
      }
      return out;
    };
    
    var dataURItoBlob = function(dataURI, type) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      var data = new Uint8Array(array);
      return newBlob(data, type);
    };

    return {
      restrict: 'A',
      scope: {
        image: '=',
        resizeOption: '=',
        resizeType: '@?',
        uploadLimit: '=',
        loadingFlag: '=',
        changeCallback: '='
      },
      link: function postLink(scope, element, attrs, ctrl) {
        var doResizing = function(imageResult, callback) {
          createImage(imageResult.url, function(image) {
            if(!angular.isArray(scope.resizeOption)) {
              scope.resizeOption = [scope.resizeOption];
            }

            imageResult.resized = {};
            for(var i in scope.resizeOption) {
            var dataURI = '';
            var type = '';
              if(scope.resizeOption[i].passGif && imageResult.file.type.indexOf('gif'>0)) {
                imageResult.resized[scope.resizeOption[i].name] = imageResult;
              } else {
                dataURI = resizeImage(image, scope.resizeOption[i]);
                type = dataURI.match(/:(.+\/.+);/)[1];
                imageResult.resized[scope.resizeOption[i].name] = {
                  dataURI: dataURI,
                  file: dataURItoBlob(dataURI, type),
                  type: type,
                  url: URL.createObjectURL(dataURItoBlob(dataURI, type))
                };
              }
            }

            callback(imageResult);
          });
        };

        var applyScope = function(imageResult) {
//console.log(imageResult);
          scope.$apply(function() {
            if(attrs.multiple) {
              scope.image.push(imageResult);
            } else {
              scope.image = imageResult;
            }
          });
        };

        var imagesCreate = function(files){
          var uploadLimit = scope.uploadLimit ? scope.uploadLimit : 10;
          for(var i = 0; i < uploadLimit; i++) {
            if(!files[i]) {continue;}
            //create a result object for each file in files
            var imageResult = {};
            try {
              imageResult = {
                file: files[i],
                url: URL.createObjectURL(files[i])
              };
            } catch(e){
              return false;
            }
            
            fileToDataURL(files[i]).then(function(dataURI) {
              imageResult.dataURI = dataURI;
            });
            
            if(angular.isObject(scope.resizeOption)) { //resize image
              doResizing(imageResult, function(imageResult) {
                applyScope(imageResult);
              });
            }
            else { //no resizing
              applyScope(imageResult);
            }
          }
        };
        
        var loadingCtrl = function(val){
          if(scope.loadingFlag !== undefined) {
            scope.$apply(function() {
              scope.loadingFlag = val;
            });
          }
        };
        
        element.bind('change', function (evt) {
          loadingCtrl(true);
          
          //when multiple always return an array of images
          if(attrs.multiple) {
            scope.image = [];
          }
          var files = evt.target.files;
          if(files.length > 0) {
            imagesCreate(files);
            scope.changeCallback({image: scope.image});
            loadingCtrl(false);
          } else {
            loadingCtrl(false);
          }
        });
      }
    };
  });
