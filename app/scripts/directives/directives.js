'use strict';

var INTERVAL_DELAY = 1500;

angular.module('directives', [])
  //스크롤 이벤트 바인딩
  .directive('scrollevent', ['$timeout', function($timeout, $interval) {
    return {
      scope: { scrollevent: '&', scrollhandler: '&' },
      link: function(scope, element, attr) {
        var interval, eventType = 'scroll';
        var scrollHandler = function() {
          var rtn = scope.scrollhandler();
          if(!angular.isObject(rtn) && rtn || angular.isObject(rtn) && rtn.result) {
            scrollTrigger(rtn);
          }
        };

        var bindScroll = function() {
          $timeout(function(){
            unbindScroll();
            $(window).on(eventType, scrollHandler);
          }, INTERVAL_DELAY);
        };
        var unbindScroll = function() {
          // be nice to others, don't unbind their scroll handlers
          $(window).off(eventType);
        };
  
        var scrollTrigger = function(rtn) {
          unbindScroll();
          bindScroll();
          scope.$apply(function(){
            scope.scrollevent({args:rtn});
          });
        };

        bindScroll();
      }
    }
  }])
  
  .directive('focus', ['$timeout', function($timeout) {
    return function(scope, element, attr) {
      var timer = attr.focus || 0;
      if(scope.$eval(attr.focus)) {
        $timeout(function() {
          element.focus();
        }, timer);
      }
    }
  }])
    
  .directive('partDivid', function() {
    return {
      restrict:'A',
      link: function(scope, element, attr){
        var prevCreated = moment(parseInt(attr.prevcreated)/1000, 'X').fromNow();
        var nowCreated = moment(parseInt(attr.created)/1000, 'X').fromNow();
        
        if(prevCreated === nowCreated) {
          element.hide();
        } else {
          element.find('i').text(' '+nowCreated);
        }
      }
    };
  })
  
  .directive('timeago', function() {
    return {
      restrict:'A',
      link: function(scope, element, attr){
        attr.$observe('timeago', function(){
          element.text(moment(parseInt(attr.timeago)/1000, 'X').fromNow());
        });
      }
    };
  })
  
  .directive('ngEnter', function () {
    return function (scope, element, attr) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attr.ngEnter);
          });
          
          event.preventDefault();
        }
      });
    };
  })

  .directive('lowercase', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, modelCtrl) {
        var strLowercase = function(inputValue) {
          if(!inputValue) {return false;}
          var rtnValue = inputValue.toLowerCase();
          if(rtnValue !== inputValue) {
            modelCtrl.$setViewValue(rtnValue);
            modelCtrl.$render();
          }
          return rtnValue;
        };
        modelCtrl.$parsers.push(strLowercase);
        strLowercase(scope[attr.ngModel]);
      }
    };
  })
  .directive('pageReload', ['$location', '$route', function($location, $route){
    return function(scope, element, attr) {
      element.bind('click',function(){
        if(element[0] && element[0].href && element[0].href === $location.absUrl()){
          $route.reload();
        }
      });
    };
  }])
  
  .directive('youtube', function($sce) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        url: '@'
      },
      template: '<iframe width="100%" height="350" data-ng-src="{{url}}" frameborder="0" allowfullscreen></iframe>',
      link: function(scope, element, attr) {
        attr.$observe('href', function(url) {
          if(!url) return false;
          scope.url = $sce.trustAsResourceUrl(url);
        });
      }
    };
  });
  ;