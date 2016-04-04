'use strict';
    //모듈 선언
var app = angular.module(
  'nutsApp', [
    'mainCtrls',
//    'userCtrls',
    'oAuthCtrls',
    'directives',
    'filters',
    'imageupload',
    'ngRoute',
    'ngResource',
    'ngTouch',
    'ui.bootstrap',
    'ivpusic.cookie',
    'pascalprecht.translate',
    'commonServices',
    'etcServices'
  ]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  //첫위치에는 고정값이 들어가야 함. currentPageType떄문
  $routeProvider
    .when('/', {
      controller : 'LandingCtrl',
      templateUrl : '/views/landing.html'
    })
    .when('/main', {
      controller : 'MainCtrl',
      templateUrl : '/views/main.html'
    })
    .when('/hanasees/-/:listType?/:uid?', {
      //template: '<div></div>',
      controller : 'HanaseesCtrl',
      templateUrl : '/views/hanasees.html'
    })
    .when('/hanasees/:channel?/:search?', {
      //template: '<div></div>',
      controller : 'HanaseesCtrl',
      templateUrl : '/views/hanasees.html'
    })
    //hanasee, hanasees
    .when('/hanasee/:uid/:sid/:snsType?', {
      controller : 'HanaseeCtrl',
      templateUrl : '/views/hanasee.html'
    })
    //part parts
    .when('/part/:uid/:sid/:tid', {
      controller : 'PartCtrl',
      templateUrl : '/views/part.html'
    })
    //part parts
    .when('/activities/:uid', {
      controller : 'ActivitiesCtrl',
      templateUrl : '/views/activities.html'
    })
    .when('/write/:uid?/:sid?', {
      controller : 'WriteCtrl',
      templateUrl : '/views/write.html'
    })
    .when('/signin/:redirectUrl?', {
      controller : 'SigninCtrl',
//      templateUrl : '/views/user/signin.html'
      templateUrl : '/views/user/oauth.signin.html'
    })
    .when('/signinCallback', {
      controller : 'oAuthCallbackCtrl',
      templateUrl : '/views/empty.html'
    })
    .when('/signup', {
      controller : 'SignupCtrl',
      //templateUrl : '/views/user/signup.html'
      templateUrl : '/views/user/oauth.signup.html'
    })
    .when('/language', {  //언어선택
      templateUrl : '/views/language.html'
    })
    .when('/country', {  //국가선택
      templateUrl : '/views/country.html'
    })
    .when('/settings', {  //앱설정
      controller : 'SettingsCtrl',
      templateUrl : '/views/settings.html'
    })
    .when('/dashboard/:uid?', {  //사용자 설정 및 데시보드
      controller : 'DashboardCtrl',
      templateUrl : '/views/dashboard.html'
    })
    .when('/account', {  //어카운트설정
      templateUrl : '/views/account.html'
    })
    .when('/notice', {  //공지
      templateUrl : '/views/notice.html'
    })
    .when('/tos', { //정책
      templateUrl : '/views/tos.html'
    })
    .when('/privacy', { //개인정보보호정책
      templateUrl : '/views/privacy.html'
    })
    .when('/help/:type', { //고객센터
      controller : 'HelpCtrl',
      templateUrl : '/views/help.html'
    })
    .when('/report', { //버그신고
      templateUrl : '/views/report.html'
    })
    .when('/info', { //정보
      templateUrl : '/views/info.html'
    })
    .otherwise({redirectTo:'/'});

  $locationProvider.html5Mode(true).hashPrefix('!');
}])
//api crossdomain issue
.config(['$httpProvider', function($httpProvider){
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = true;
}])
//translate
.config(['$translateProvider', function ($translateProvider) {
  $translateProvider
    .useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
    })
    .preferredLanguage('en')
    .fallbackLanguage(['en']);
  moment.lang('en');
}])
//unsafe resource URL
.config(['$compileProvider', function($compileProvider) {
  var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
}]);
//    app.config();

//공통 컨트롤러 설정 - 모든 컨트롤러에서 공통적으로 사용하는 부분들 선언
app.controller('CommonController', [
  '$rootScope', '$scope', '$route', '$window', '$location',
  '$anchorScroll', '$translate', '$filter', '$timeout', '$interval',
  '$modal', 'ipCookie', 'LanguageCountry', 'Channel', 'AppInfo',
  'Hanasee', 'Part', 'Notification',
  function(
    $rootScope, $scope, $route, $window, $location,
    $anchorScroll, $translate, $filter, $timeout, $interval,
    $modal, ipCookie, LanguageCountry, Channel, AppInfo,
    Hanasee, Part, Notification
  ) {
    //어플 정보
    //상용 반영시 체크
    $rootScope.appInfo = AppInfo;
    console.info('web version: '+$rootScope.appInfo.version);

    $scope.$on('NEED_OAUTH_INIT', function(event, args){
      args.data.dialogPath.signup = '/dialog/authorize';
      args.data.param = {
        client_id: '8b08d822bba96ffc425c488c60a4fe7b',
        redirect_uri: 'http://'+$location.host()+($location.port()?':'+$location.port():'')+'/signinCallback',
        state: angular.toJson({redirectUrl: '/main'}),
        response_type: 'token',
        scope: 'userInfo|test',
        open_type: 'self'
      };
    });

    $rootScope.hanasees = {
      status: 'onair',
      order: 'trends',
      search: null,
      listType: 'basic',
      afkInterval: 10*60*1000, //10분
      init: function(){
        this.data = [];
        this.paging = {
          limit: 20,
          cursor: ''
        };
        this.anchorHash = '';
        this.count = 0;
        this.isLoad = false;
        this.listType = 'basic';
        this.status = 'onair';
        this.order = 'trends';
        delete this.uid;
        delete this.marked;
      }
    };
    $rootScope.hanasees.init();
    
    $rootScope.parts = {
      uid: null,
      sid: null,
      order: 'created',
      dataSize: 60,
      init: function(){
        this.data = [];
        this.paging = {
          limit: 30,
          offset: null,
          offsetKey: null
        };
        this.anchorHash = '';
        this.isLoad = false;
      }
    };
    $rootScope.parts.init();
    
    $rootScope.global = {
      navFlag: false,
      sessSigninComplate: false,
      mainLoadingFlag: false,
      currentPageType: '/',
      alert: null,
      sideMenuStatus: 'close',
      notificationUnchecked: 0
    };

    $translate('TITLE').then(function (value) {
      $scope.appInfo.title = value;
      $rootScope.global.currentTitle = value;
    });

    $rootScope.ogTagCtrl = {
      init: function() {
        $scope.global.currentImage = $scope.appInfo.webUrl+$scope.appInfo.imagePath+'/noimage.png';
        if($scope.appInfo.title) { $scope.global.currentTitle = $scope.appInfo.title; }
        $scope.global.currentDescription = '';
      },
      set: function(image, title, desc){
        $scope.global.currentImage = image ? image : $scope.global.currentImage;
        $scope.global.currentTitle = title ? title : $scope.global.currentTitle;
        $scope.global.currentDescription = desc ? desc : $scope.global.currentDescription;
      }
    };
    //watch 처리
    $scope.$on('$routeChangeStart', function(){
      $scope.$broadcast('SIDE_MENU_CHANGE', {type:'close'});
      $scope.ogTagCtrl.init();
      $scope.syncData.stop();
      $scope.appInfo.currentUrl=$location.absUrl();
      $scope.appInfo.currentPath=$location.path();
      $scope.appInfo.currentHost=$location.protocol()+'://'+$location.host()+($location.port() ? ':'+$location.port() : '');

      var pathSplit = $scope.appInfo.currentPath.split('/');
      $scope.global.currentPageType = pathSplit[1] !== '' ? pathSplit[1] : '/';
      $scope.global.alert = null;
      
      //$scope.modalClose();
    });

    $scope.$on('$viewContentLoaded', function(){
      //seo create
      //console.log($scope.appInfo.webUrl+'/?_escaped_fragment_='+encodeURIComponent($location.path()));
      $scope.track('Pageview', null, null, {path:window.location.pathname});
    });

    $scope.$on('SESS_SIGNIN_COMPLATE', function(event, args){
      if(args.isSignin) {
        $scope.track('Event', 'User', 'Signed in', $scope.userInfo);
        // /mixpanel signin
        
        var param = {type: 'count'};
        angular.extend(param, $scope.oAuth.token.pair);
        new Notification.get(param,
          function(res){
            $scope.global.notificationUnchecked = res.unchecked;
          },
          function() {
            $scope.global.notificationUnchecked = 0;
          }
        );
      }
      
      $scope.global.sessSigninComplate = true;
      
      var setting = {};
      if(args.isSignin) {
        angular.extend($scope.hanasees, $scope.oAuth.token.pair);
        angular.extend($scope.parts, $scope.oAuth.token.pair);
        
        setting = $scope.userInfo.setting;
      }

      $rootScope.language = LanguageCountry.language.init($scope.userInfo.language);
      $scope.userInfo.language = $scope.language.get();
      $rootScope.country = LanguageCountry.country.init(setting.activeCountry || $scope.language.getList().defaultCountry);
      $rootScope.channel= Channel.init(setting.channel);
      
      if(window.android) {
        window.android.finishLoading();
      }
      if(args.isReload) {
        $route.reload();
      }
    });

    $scope.$on('COMMENT_RELOAD_REQ', function(){
      $scope.$broadcast('COMMENT_RELOAD');
    });

    $scope.$on('COMMENT_SAVE', function(event, args){
      var data = {
        uid: $route.current.params.uid,
        sid: $route.current.params.sid,
        action: 'addcomment',
        url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
      };
      angular.extend(data, $scope.oAuth.token.pair);
      if(args.filter) {
        data.tid = args.filter.filterPart;
        $scope.partCommentCountChange(data);
      } else {
        $scope.hanaseeCommentCountChange(data);
      }
    });

    $scope.$on('COMMENT_DELETE', function(event, args){
      if(!args.deleted) {return false;}
      var data = {
        uid: $route.current.params.uid,
        sid: $route.current.params.sid,
        action: 'delcomment',
        url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
      };
      angular.extend(data, $scope.oAuth.token.pair);
      if(args.deleted.filterPart) {
        data.tid = args.deleted.filterPart;
        $scope.partCommentCountChange(data);
      } else {
        $scope.hanaseeCommentCountChange(data);
      }
    });

    $scope.hanaseeCommentCountChange = function(data){
      new Hanasee.save(
      data,
      function(res){
        $scope.$broadcast('HANASEE_COMMENT_COUNT_SHANGE', {commentCount: res.Hanasee.commentCount});
      });
    };
    $scope.partCommentCountChange = function(data){
      new Part.save(
      data,
      function(res){
        if($scope.parts.data.length > 0) {
          var idx = $scope.objectSearch($scope.parts.data, {k:'tid', v:res.Part.tid}, false);
          if(idx > -1) {
            $scope.parts.data[idx].commentCount = res.Part.commentCount;
          }
        }
        
        $scope.$broadcast('HANASEE_COMMENT_COUNT_SHANGE', {commentCount: res.Part.Hanasee.commentCount});
        $scope.$broadcast('PART_COMMENT_COUNT_SHANGE', {commentCount: res.Part.commentCount});
      });
    };

    //범용 메소드
    $rootScope.notSorted = function(obj){
      return !obj ? [] : Object.keys(obj);
    }
    
    $rootScope.modalClose = function(){
      $timeout(function(){$('.modal').trigger('click');}, 0);
    };
    
    $scope.activitiesModalOpen = function() {
      var modalInstance = $modal.open({
        templateUrl: 'views/activities.html',
        controller: 'ActivitiesCtrl',
        resolve: {
          $routeParams: function() { return {uid: $scope.userInfo.uid, type: 'modal'} }
        },
        size: 'lg'
      });
    };
    
    $scope.channelModalOpen = function() {
      var modalInstance = $modal.open({
        templateUrl: 'views/channel.html',
        controller: function($scope, $modalInstance, channel){
          //modal 내부는 요 scope를 따름
          $scope.channel = channel;
          $scope.selectChannel = function(selected){
            $modalInstance.close(selected);
          };
        },
        resolve: {
          channel: function() { return $scope.channel; }
        },
        size: 'sm'
      });
      
      modalInstance.result.then(function(selected) {
        if(selected) {
          $scope.channel.set(selected);
          $scope.moveHanasees();
        }
      }, function() {
        //걍 껏을때
      });
    };
    
    $rootScope.loadedAnimate = {
      //target => target.data가 있어야 함
      target: null,
      _stop: null,
      run: function(target){
return false;
        var self = this;
        if(target) { self.target = target; }
        if(self._stop) { $interval.cancel(self._stop); }
        if(angular.isArray(self.target.data)) {
          self._stop = $interval(function(){
            if(angular.element('.list-parts').not('.list-parts.loaded').length > 0) {
              $timeout(function(){
                for(var i in self.target.data) {
                  self.target.data[i].loaded = true;
                }
                angular.element('.list-parts').not('.list-parts.loaded').addClass('loaded');
              }, 300);
            } else {
              if(angular.element('.list-parts').length>0) {
                $interval.cancel(self._stop);
              }
            }
          }, 500, 10);
        }
      }
    };

    $rootScope.track = function(trackType, category, action, param) {
      //trackType = {PageView|Event}
      //category = {Hanasee|Part|Comment}
      //action = {Read|Write|Modify|Delete}
      //param = optional

      if(!$scope.appInfo.isProduction || (window.location.hostname.search(AppInfo.appname) < 0) ||
        !$scope.global.sessSigninComplate
      ) {
        return false;
      }

      if($scope.userInfo.isSignin) {
        mixpanel.identify($scope.userInfo.uid);
        param.distinct_id = $scope.userInfo.uid;
      }
      
      if(trackType !== 'Pageview') {
        mixpanel.track(trackType+(category?' '+category:'')+(action?' '+action:''), param);
        mixpanel.people.increment('Count '+(category?' '+category:'')+(action?' '+action:''));
        var data = {
          '$email': $scope.userInfo.email,    // only special properties need the $
          '$created': new Date(parseInt($scope.userInfo.created)),
          '$name': $scope.userInfo.nickname,
          '$language': $scope.userInfo.language || navigator.language.substr(0,2) || 'en',
          '$last_login': new Date()         // properties can be dates...
        };
        data['$last_event'+(category?'_'+category:'')+(action?'_'+action:'')] = new Date();
        mixpanel.people.set(data);
      }

      if(typeof window['_gaq'] == 'object') {
        if(trackType === 'Pageview') {
          _gaq.push(['_trackPageview']);
        } else {
          _gaq.push(['_track'+trackType, category, action, param]);
        }
      }
    };

    /*
    $scope.foundationInitCount = 50;
    $rootScope.foundationInit = function(){
      $timeout(function(){
        Foundation.libs.clearing.settings.templates.viewing = '<a href="'+$scope.appInfo.currentPath+'" class="clearing-close">&times;</a><div class="visible-img" style="display: none"><div class="clearing-touch-label"></div><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" /><p class="clearing-caption"></p><a href="#!" class="clearing-main-prev"><span></span></a><a href="#" class="clearing-main-next"><span></span></a></div>';
        Foundation.libs.joyride.defaults.template.link = '<button class="joyride-close-tip transparent">&times;</button>';
        Foundation.libs.joyride.defaults.template.button = '<button class="small button joyride-next-tip"></button>';
        try {
          $scope.safeApply($(document).foundation());
        } catch(e) {
          $scope.foundationInitCount--;
          if($scope.foundationInitCount < 0) {
            $scope.foundationInitCount = 50;
            //$route.reload();
          } else {
            $rootScope.foundationInit();
          }
        }
      }, 200);
    };
    */
    $rootScope.syncData = {
      intervalStop: null,
      intervalTime: 10*1000, //10초
      run: function(data, callback){
        data.action = 'alive';
        new Hanasee.save(data, function(res){
          callback(res);
        });
      },
      start: function(data, callback){
        this.stop();
        var self = this;
        if(typeof data === 'object') {
          self.run(data, callback);
          self.intervalStop = $interval(function(){
            self.run(data, callback);
          }, self.intervalTime);
        }
      },
      stop: function(){
        if(this.intervalStop) {
          $interval.cancel(this.intervalStop);
        }
      }
    };

    $rootScope.intervalTrigger = {
      intervalStop: null,
      intervalTime: 5*1000, //5초
      start: function(selector, event){
        this.stop();
        var self = this;
        if(angular.isString(selector) && angular.element(selector).length>0) {
          self.intervalStop = $interval(function(){
            $timeout(function(){ angular.element(selector).trigger(event); }, 0);
          }, self.intervalTime);
        }
      },
      stop: function(){
        if(this.intervalStop) {
          $interval.cancel(this.intervalStop);
        }
      }
    };

    $rootScope.objectSearch = function(arr, search, remove){
      var idx = -1;
      if(angular.isArray(arr) && search.k && search.v){
        for(var i in arr) {
          if(arr[i][search.k] &&
            arr[i][search.k].toString() === search.v.toString()
          ) {
            idx = i;
          }
        }
        if(remove && idx>-1) {
          arr.splice(idx, 1);
        }
      }
      return idx;
    };
    
    $rootScope.optionDetail = {
      isOpen: false,
      target: null,
      scrollPos: 0,
      init: function(isOpen, target, scrollPos){
        this.isOpen = isOpen || false;
        this.target = target || null;
        this.scrollPos = scrollPos || 0;
      },
      open: function(target, $event, uid){
        $scope.eventStop($event);
        if(uid && uid !== $scope.userInfo.uid) { return false; }
        this.init(true, target, window.pageYOffset);
        $(window).scrollTop(0);
      },
      close: function($event){
        $scope.eventStop();
        $(window).scrollTop(this.scrollPos);
        this.init();
        $scope.$broadcast('OPTION_DETAIL_CLOSE');
      },
      save: function(){
        $scope.$broadcast('OPTION_DETAIL_SAVE');
        this.close();
      }
    }
    
    $rootScope.closeAlert = function($event) {
      $scope.eventStop($event);
      $scope.global.alert = null;
    };

    $rootScope.loadScroll = function(anchorHash, callback, relativePos) {
      if(anchorHash) {
        /*
        $location.hash(anchorHash);
        if(!callback) {callback=function(){};}
        $anchorScroll();
        */
        /*   
        //현재 viewport에서 상대값
        var relativePos = $('body').scrollTop() + $(window).height() - $('#'+targetElem.tid).offset().top
        $('#'+targetElem.tid).offset().top
        //scroll keeping
        $('body').scrollTop( $('#'+targetElem.tid).offset().top - relativePos );
        
        */
        if(!relativePos) relativePos = $('.navbar').outerHeight();
        $scope.targetPos = 0;
        $scope.loadScrollInterval = $interval(function(){
          if( $('#'+anchorHash)[0] ) {
            //var pos = $('#'+anchorHash).offset().top-$('.navbar').outerHeight();
            var pos = $('#'+anchorHash).offset().top - relativePos;
            if($scope.targetPos != pos) {
              $scope.targetPos = pos;
              return false;
            }
            
            $scope.safeApply(function(){
              if($scope.loadScrollInterval) {
                $interval.cancel($scope.loadScrollInterval);
              }
              if(!callback) {callback=function(){};}
              //$('body').animate({scrollTop: pos}, 300, 'swing', callback);
              $('body').scrollTop(pos, callback);
            });
          }
        }, 50);
      }
    };

    $rootScope.saveScrollMove = function(target, hash, url, $event) {
      $scope[target].anchorHash = hash;
      $scope.move(url, $event);
    };

    $rootScope.moveHanasees = function($event) {
      var path = '/hanasees';
      var channel = $scope.channel.get();
      
      if(channel) {
        path += '/'+channel;
      } else {
        path += '/all';
      }
      if($scope.hanasees.search) {
        path += '/'+$scope.hanasees.search;
      }
      
      if(path === $location.path()) {
        $scope.$broadcast('HANASEES_LOADED');
      } else {
        $scope.hanasees.init();
      }
      
      $scope.move(path, $event);
    };

    $rootScope.move = function (path, $event) {
      $scope.eventStop($event);
      path = path.replace($scope.appInfo.currentHost, '');
      var r = new RegExp('^(http|ftp|https):\/\/+');
      if(r.test(path)) {
        $scope.moveUrl(path);
      } else {
        $location.url(path);
      }
    };
    
    $rootScope.moveUrl = function (url) {
      window.location.href = url;
    };

    $rootScope.eventStop = function($event) {
      if(!$event) { return false; }
      $event.preventDefault();
      $event.stopPropagation();
    };

    $rootScope.encodeEntities = function(s){
      return angular.element('<div/>').text(s).html();
    };
    $rootScope.dencodeEntities = function(s){
      return angular.element('<div/>').html(s).text();
    };

    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      (phase == '$apply' || phase == '$digest') ? this.$eval(fn) : this.$apply(fn);
    };
  }
]);

app.controller('NativeCtrl', [
  '$scope',
  'NativeFunc',
  'Signin',
  function($scope, NativeFunc, Signin){
    if(!window.android){ return false; }

    NativeFunc.notiRegist();

    //version chk
    /*
    var Version = $resource($scope.appInfo.api.baseUrl+'/'+$scope.appInfo.appname+'/version');
    new Version.get({version: $scope.appInfo.version}, function(res){
      if(res.Version && res.Version.isValid==='N') {
        window.android.changeUrl($scope.appInfo.webUrl);
      }
    });
    */

    /*
    //kakaologin
    window.android.signinCallback = $scope.signinCallback = function(res){
      if(JSON.parse(res).response === '200') {
        $scope.userInfo.connection.push('kakao');
        $scope.userConnection.kakao = JSON.parse(window.android.getUserInfo());
        NativeFunc.notiRegist($scope.userConnection.kakao.username, $scope.appInfo.android.url);
        if($scope.userConnection.kakao.properties.uid && $scope.userConnection.kakao.properties.key) {
          var opt = {
            'connectionProvider': 'kakao',
            'connectionKey': $scope.userConnection.kakao.properties.key
          };
          new Signin($scope.userConnection.kakao.properties.uid, opt).then(function(res){
            if(res.id) {
              $scope.setUserInfo(res);
            }
          });
        }
        $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: true, isSignin:true});
      } else {
        $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:false});
      }
    };
    */
  }
]);

app.controller('NavCtrl', [
  '$rootScope',
  '$scope', 
  function($rootScope, $scope){
    var nowScroll;
    $scope.isProsessing = false;
    
    $scope.$on('SIDE_MENU_CHANGE', function(event, args){
      $scope.sideMenu(args.type);
    });
    $rootScope.sideMenu = function(type, $event){
      $scope.eventStop($event);
      if($scope.isProsessing || $scope.global.sideMenuStatus===type) { return false; }
      $scope.isProsessing = true;
      
      if(type==='toggle') {
        type = $scope.global.sideMenuStatus==='close' ? 'open' : 'close';
      }
      
      if(type==='open') {//menu open
        nowScroll = window.pageYOffset;
        var innerHeight = $(window).innerHeight();
        
        $('html, body').css( { 'overflow-y' : 'hidden', 'height' : innerHeight } ).scrollTop(0);
        $('.container').css('margin-top', nowScroll * (-1));
        $('.aside-left').css('height', innerHeight);
        $('.back-drop').css( { 'width' : '100%', 'height' : '100%' } );
      } else {// menu close
        $('html, body').css( { 'overflow-y' : 'auto', 'height' : 'auto', 'width':'100%' } ).scrollTop(nowScroll);
        $('.container').css('margin-top', '0');
        
        //chrome bug fix
        $('.form-write > .form-group').animate({'bottom': '-1px'}, 300, 'swing', function() {
          $('.form-write > .form-group').css('bottom','0px');
        });
      }
      $scope.global.sideMenuStatus = type;
      $scope.isProsessing = false;
    };
    
    $scope.backDropAction = function($event) {
      $scope.eventStop($event);
      $scope.sideMenuOpen(false);
    };
  }
]);

app.controller('NoticeCtrl', [
  '$scope',
  '$route',
  '$sanitize',
  '$timeout',
  '$filter',
  '$modal',
  'ipCookie',
  'Notice',
  function($scope, $route, $sanitize, $timeout, $filter, $modal, ipCookie, Notice){
return false;
    if(!$scope.global.sessSigninComplate) { return false; }
    $scope.notices = [];
    //option:'dev'일때 order 0 인거도 줌
    var param = {};
    if(!$scope.appInfo.isProduction) {
      param = {option:'dev'};
    }
    new Notice.get(param, function(res){
      if(res.Notices) {
        for(var i in res.Notices) {
          var ignore = false;
          try {
            ignore = ipCookie('ignore_notice_'+res.Notices[i].created);
          }
          catch (e) {
            ipCookie.remove('ignore_notice_'+res.Notices[i].created, {path:'/' });
          }

          if(!ignore) {
            $scope.notices.push(res.Notices[i]);
          }
        }
        $scope.notices = $filter('orderBy')($scope.notices, 'order', true);
        if($scope.notices.length > 0) {
          $scope.modalOpen(0, $scope.notices);
        }
      }
    });

    $scope.modalOpen = function(index, notices){
      var modalInstance = $modal.open({
        templateUrl: 'noticeModalContent.html',
        controller: function($scope, $modalInstance, logoPath, index, notices){
          $scope.logoPath = logoPath;
          $scope.index = index;
          $scope.notice = notices[index];
          
          $scope.modalClose = function(ignore){
            if(ignore) {
              ipCookie('ignore_notice_'+$scope.notice.created, true, { expires: 9999, path:'/' });
            }
            $modalInstance.close($scope.index);
          };
        },
        resolve: {
          logoPath: function() { return $scope.appInfo.imagePath+'/logo_ko_white_512x250.png'; },
          index: function() { return index; },
          notices: function() { return notices; }
        },
        size: 'lg'
      });
      
      modalInstance.result.then(function () {
        $scope.nextNotice(index+1);
      }, function(res) {
        $scope.nextNotice(index+1);
      });
      
      $scope.nextNotice = function(nextIndex){
        if(notices[nextIndex]) {
          $scope.modalOpen(nextIndex, notices);
        }
      };
        
      /*
      $timeout(function(){
        try {
          $scope.safeApply(
            $(selector).foundation('reveal', type)
          );
        } catch(e) {
          $scope.modalOpenCount--;
          type==='close' ? $('.reveal-modal-bg').show() : $('.reveal-modal-bg').hide();

          if($scope.modalOpenCount < 0) {
            $scope.modalOpenCount = 50;
            //$route.reload();
          } else {
            $scope.foundationInit();
            $scope.modalOpen(selector, type);
          }
        }
      }, 200);
      */
    };
  }
]);

