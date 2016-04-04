'use strict';

angular.module('mainCtrls', [
  'ngSanitize',
  'ngMd5',
  'mainServices',
  'hanaseeServices',
  'partServices',
  'nativeServices',
  'commentCtrls'])
  .controller('MainCtrl', ['$scope', '$resource', 'Hanasee',
    function($scope, $resource, Hanasee){
      if(!$scope.global.sessSigninComplate) {return false;}
      
      var Part = $resource($scope.appInfo.api.baseUrl+'/'+$scope.appInfo.appname+'/parts');
      
      $scope.todayHanasees = {///hanasee/hanasees?limit=##&order=new
        param: {limit:6, order:'new', country:$scope.country.get()},
        data: [],
        isLoad: false,
        load: function(){
          if(this.isLoad) { return fasle; }
          this.isLoad = true;
          var self = this;
          new Hanasee.get(self.param, function(res){
            self.data = self.data.concat(res.Hanasees);
//console.log(self.data)
            self.isLoad = false;
          }, function(res){
            self.isLoad = false;
          });
        }
      };
      $scope.todayHanasees.load();

      $scope.jjalbangs = {  ///hanasee/parts?limit=##&filter=image
        param: {limit:4, filter:'image'},
        data: [],
        isLoad: false,
        load: function(){
          if(this.isLoad) { return false; }
          this.isLoad = true;
          var self = this;
          new Part.get(self.param, function(res){
            self.data = self.data.concat(res.Parts);
//console.log(self.data)
            self.isLoad = false;
          }, function(res){
            self.isLoad = false;
          });
        }
      };
      $scope.jjalbangs.load();
      
      $scope.onairHanasees = {  ///hanasee/hanasees?onair=1
        param: {limit:4, onair:'1', country:$scope.country.get()},
        data: [],
        isLoad: false,
        load: function(){
          if(this.isLoad) { return false; }
          this.isLoad = true;
          var self = this;
          new Hanasee.get(self.param, function(res){
            self.data = self.data.concat(res.Hanasees);
//console.log(self.data)
            self.isLoad = false;
          }, function(res){
            self.isLoad = false;
          });
        }
      };
      $scope.onairHanasees.load();
      
      $scope.bestUsers = {  ///hanasee/hanasees?order=best
        param: {limit:6, order:'best', country:$scope.country.get()},
        data: [],
        isLoad: false,
        load: function(){
          if(this.isLoad) { return false; }
          this.isLoad = true;
          var self = this;
          new Hanasee.get(self.param, function(res){
            self.data = self.data.concat(res.Hanasees);
//console.log(self.data)
            self.isLoad = false;
          }, function(res){
            self.isLoad = false;
          });
        }
      };
      $scope.bestUsers.load();
      
      $scope.bestParts = {  ///hanasee/parts?limit=##&filter=likeCount
        param: {limit:4, filter:'likeCount'},
        data: [],
        isLoad: false,
        load: function(){
          if(this.isLoad) { return false; }
          this.isLoad = true;
          var self = this;
          new Part.get(self.param, function(res){
            self.data = self.data.concat(res.Parts);
//console.log(self.data)
            self.isLoad = false;
          }, function(res){
            self.isLoad = false;
          });
        }
      };
      $scope.bestParts.load();
      
    }
  ])
  .controller('LandingCtrl', ['$scope', '$interval',
    function($scope, $interval){
      if(!$scope.global.sessSigninComplate) {return false;}
      if($scope.userInfo.isSignin) {
        $scope.move('/main');
      }
      
      $scope.landingData = {
        lastPageNum: 4,
        pageNum: 0,
        movePage: function(dirction){
          if((dirction==='prev' && this.pageNum === 0) || 
            (dirction==='next' && this.pageNum === this.lastPageNum)) { return false; }
          this.pageNum = dirction === 'prev' ? this.pageNum-1 : this.pageNum+1
        },
        getRange: function() {
          return new Array(this.lastPageNum+1);
        },
        backgroundNum: 1,
        intervalStop: null,
        intervalTime: 3.5*1000,
        start: function(){
          this.stop();
          var self = this;
          this.intervalStop = $interval(function(){
            self.backgroundNum = self.backgroundNum<6 ? self.backgroundNum+1 : 1;
          }, this.intervalTime);
        },
        stop: function(){
          if(this.intervalStop) {
            $interval.cancel(this.intervalStop);
          }
        }
      };
      $scope.landingData.start();
    }
  ])
  .controller('HelpCtrl', ['$scope', '$routeParams', 'Boards',
    function($scope, $routeParams, Boards){
      if(!$scope.global.sessSigninComplate) {return false;}
      $scope.boards = {
        init: function(){
          this.isLoad = false;
          this.data = [];
          this.paging = {
            limit: 100,
            cursor: ''
          };
          this.type = $routeParams.type;
        }
      };
      $scope.boards.init();

      $scope.boardListLoad = function(){
        if($scope.boards.isLoad) { return false; }
        
        var param = { type: $routeParams.type };
        angular.extend(param, $scope.boards.paging);
        angular.extend(param, $scope.oAuth.token.pair);
        new Boards.get(param, 
          function(res){
            $scope.boards.data = $scope.boards.data.concat(res.Boards);
            $scope.boards.paging.cursor = res.cursor;
            $scope.boards.isLoad = false;
          }, function(){ $scope.boards.isLoad = false; }
        );
      };
      $scope.boardListLoad();
      
      $scope.qnsWrite = {
        isSave:false,
        isOpen:false,
        content: ''
      };
      
      $scope.qnaSave = function(){
        if($scope.boards.type !== 'qna' || $scope.qnsWrite.isSave) { return false; }
        $scope.qnsWrite.isSave = true;
        
        var param = { type: $routeParams.type, content:$scope.qnsWrite.content };
        angular.extend(param, $scope.oAuth.token.pair);
        new Boards.save(param,
          function(res){
            $scope.boards.data = [res.Board].concat($scope.boards.data);
            $scope.qnsWrite.content="";
            $scope.qnsWrite.isSave = false;
          }, function(){ $scope.qnsWrite.isSave = false; }
        );
      };
    }
  ])
  .controller('ActivitiesCtrl', ['$scope', '$routeParams', 'Notification',
    function($scope, $routeParams, Notification){
      if(!$scope.global.sessSigninComplate) {return false;}
      if(!$scope.userInfo.isSignin) {
        $scope.moveSign('signin');
        return false;
      }
      $scope.activities = {
        init: function(){
          this.isLoad = false;
          this.data = [];
          this.paging = {
            limit: 20,
            cursor: ''
          };
        }
      };
      $scope.activities.init();
      
      if($routeParams.type && $routeParams.type==='modal') {
        $scope.activities.paging.limit = 5;
        $scope.activities.type = $routeParams.type;
      } else {
        $scope.global.notificationUnchecked = 0;
      }
      
      $scope.activityListLoad = function(){
        if($scope.activities.isLoad) { return false; }
        
        var param = {};
        angular.extend(param, $scope.activities.paging);
        angular.extend(param, $scope.oAuth.token.pair);
        new Notification.get(param,
          function(res){
            $scope.activities.data = $scope.activities.data.concat(res.Notifications);
            $scope.activities.paging.cursor = res.cursor;
            $scope.activities.isLoad = false;
          }, function(){ $scope.activities.isLoad = false; }
        );
      };
      $scope.activityListLoad();
      
      $scope.activitiesScrollHandler = function(){
      if($scope.activities.type === 'modal') { return false; }
        if($(window).height()!==$(document).height() && 
          $(document).height() - window.pageYOffset - $(window).height() < 200
        ) {
          return true;
        }
        return false;
      };
      $scope.activitiesScrollEvent = function(){
        if($scope.global.currentPageType !== 'activities') { return false; }
        if($scope.activities.data.length !== 0) {
          $scope.activityListLoad();
        }
      };
    }
  ])
  .controller('SettingsCtrl', ['$scope', 'User', 'Notification',
    function($scope, User, Notification){
      if(!$scope.global.sessSigninComplate) {return false;}
      if(!$scope.userInfo.isSignin) {
        $scope.moveSign('signin');
      }
      $scope.optionDetail.init();
      
      $scope.setting = {
        activeCountry: $scope.userInfo.setting.activeCountry || $scope.country.selected
      };
      if($scope.userInfo.hanasee) {
        $scope.setting = $scope.userInfo.hanasee;
      }
      
      $scope.$on('OPTION_DETAIL_CLOSE', function(){
        $scope.setting.activeCountry = $scope.userInfo.setting.activeCountry;
      });
      $scope.isSave = false;
      $scope.$on('OPTION_DETAIL_SAVE', function(){
        if($scope.isSave) { return false; }
        $scope.isSave = true;
        $scope.userInfo.setting.activeCountry = $scope.setting.activeCountry;
        $scope.country.set($scope.setting.activeCountry);
        
        var param = {
          uid: $scope.userInfo.uid,
          hanasee: angular.toJson($scope.userInfo.setting)
        };
        angular.extend(param, $scope.oAuth.token.pair);
        new User.save(param, 
          function(){ $scope.isSave = false; },
          function(){ $scope.isSave = false; }
        );
      });
      
      $scope.notiSettings = {
        init: function(res){
          if(!res.Setting) { return false; }
          this.data = {};
          this.data.comment = {
            mail: res.Setting.comment_mail,
            push: res.Setting.comment_push,
            social: res.Setting.comment_social
          };
          this.data.favoriteHanaseeAction = {
            mail: res.Setting.favoriteHanaseeAction_mail,
            push: res.Setting.favoriteHanaseeAction_push,
            social: res.Setting.favoriteHanaseeAction_social
          };
          this.data.myHanaseeChange = {
            mail: res.Setting.myHanaseeChange_mail,
            push: res.Setting.myHanaseeChange_push,
            social: res.Setting.myHanaseeChange_social
          };
          this.data.myHanaseeReact = {
            mail: res.Setting.myHanaseeReact_mail,
            push: res.Setting.myHanaseeReact_push,
            social: res.Setting.myHanaseeReact_social
          };
          this.data.myHanaseeView = {
            mail: res.Setting.myHanaseeView_mail,
            push: res.Setting.myHanaseeView_push,
            social: res.Setting.myHanaseeView_social
          };
          this.data.myReact = {
            mail: res.Setting.myReact_mail,
            push: res.Setting.myReact_push,
            social: res.Setting.myReact_social
          };
          this.data.myStatusChange = {
            mail: res.Setting.myStatusChange_mail,
            push: res.Setting.myStatusChange_push,
            social: res.Setting.myStatusChange_social
          };
        }
      };
      $scope.loadNotificationSetting = function(){
        var param = {type:'setting'};
        angular.extend(param, $scope.oAuth.token.pair);
        new Notification.get(param,
          function(res){
            $scope.notiSettings.init(res);
          }
        );
      };
      $scope.loadNotificationSetting();
      $scope.isSave = false;
      $scope.notiSettingSave = function(key, nowVal) {
        if($scope.isSave) { return false; }
        $scope.isSave = true;
        var param = {type:'setting'};
        param[key] = nowVal==='F'?'T':'F';
        angular.extend(param, $scope.oAuth.token.pair);
        new Notification.save(param,
          function(res){
            $scope.notiSettings.init(res);
            $scope.isSave = false;
          }, function(){
            $scope.isSave = false;
          }
        );
      }
    }
  ])
  .controller('DashboardCtrl', [
    '$scope', '$routeParams', 'HanaseesLoader', 'User', 'hanaseeStatusChkFunc',
    function(
      $scope, $routeParams, HanaseesLoader, User, hanaseeStatusChkFunc
    ) {
      if(!$scope.global.sessSigninComplate) {return false;}
      if(!$routeParams.uid && !$scope.userInfo.isSignin) {
        $scope.moveSign('signin');
        return false;
      }
      $scope.optionDetail.init();
      
      if(!$scope.userInfo.setting.country) {
        $scope.userInfo.setting.country = $scope.country.get();
      }
      
      $scope.dashboardData = {
        uid: $routeParams.uid || $scope.userInfo.uid,
        hanasee: {}
      };
      $scope.setDashboardData = function(){
        $scope.dashboardData.uid = $scope.userInfo.uid;
        $scope.dashboardData.email = $scope.userInfo.email;
        $scope.dashboardData.nickname = $scope.userInfo.nickname;
        $scope.dashboardData.picture = $scope.userInfo.picture;
        $scope.dashboardData.language = $scope.userInfo.language;
        $scope.dashboardData.hanasee.country = $scope.userInfo.setting.country;
      };
      
      $scope.isSave = false;
      $scope.$on('OPTION_DETAIL_CLOSE', function(){
        if($scope.dashboardData.uid !== $scope.userInfo.uid) { return false; }
        $scope.dashboardData.picture = $scope.userInfo.picture;
        $scope.dashboardData.nickname = $scope.userInfo.nickname;
        $scope.dashboardData.hanasee.country = $scope.userInfo.setting.country;
        $scope.dashboardData.language = $scope.language.get();
      });
      $scope.$on('OPTION_DETAIL_SAVE', function(){
        if($scope.dashboardData.uid !== $scope.userInfo.uid) { return false; }
        
        $scope.userInfo.picture = $scope.dashboardData.picture;
        $scope.userInfo.nickname = $scope.dashboardData.nickname;
        $scope.userInfo.setting.country = $scope.dashboardData.hanasee.country;
        $scope.language.set($scope.dashboardData.language);
        
        var param = {
          nickname: $scope.dashboardData.nickname,
          language: $scope.dashboardData.language,
          hanasee: angular.toJson($scope.userInfo.setting)
        };
        $scope.profileSave(param);
      });
      $scope.profileSave = function(param){
        if($scope.isSave || $routeParams.uid || !param || Object.keys(param).length===0) {return false;}
        $scope.isSave = true;
        angular.extend(param, $scope.oAuth.token.pair);
        
        var formData = new FormData();
        if(param.image && param.image.file) {
          formData.append('picture', param.image.file, param.image.file.name);
          delete param.image;
        }
        
        for(var i in param) {
          formData.append(i, param[i]);
        }
        
        new User.upload(
          {uid: $scope.userInfo.uid},
          formData,
          function(res){
            if(res.User) {
              $scope.setUserInfo(res);
              $scope.setDashboardData();
              $scope.isSave = false;
            }
          }, function(){ $scope.isSave = false; }
        );
      };
      
      //dashboard author, marked list load
      $scope.loadDashboardHanasees = function(){
        var param = {listType: 'author', uid:$scope.dashboardData.uid, paging:{limit:4}, order:'-created'};
        angular.extend(param, $scope.oAuth.token.pair);
        new HanaseesLoader(param).then(
          function(res){
            if(res.Hanasees) {
              for(var i in res.Hanasees) {
                res.Hanasees[i].status = hanaseeStatusChkFunc(res.Hanasees[i].status, res.Hanasees[i].updated, res.Hanasees[i].partCount, $scope.hanasees.afkInterval);
              }
              if(res.Hanasees.length === 4) {
                $scope.dashboardData.writeMoreFlag = true;
                delete res.Hanasees[3];
              }
              $scope.dashboardData.writeList = res.Hanasees;
            }
          }
        );
        
        var param = {listType: 'marked', marked:$scope.dashboardData.uid, paging:{limit:4}, order:'-created'};
        new HanaseesLoader(param).then(
          function(res){
            if(res.Hanasees) {
              for(var i in res.Hanasees) {
                res.Hanasees[i].status = hanaseeStatusChkFunc(res.Hanasees[i].status, res.Hanasees[i].updated, res.Hanasees[i].partCount, $scope.hanasees.afkInterval);
              }
              if(res.Hanasees.length === 4) {
                $scope.dashboardData.markedMoreFlag = true;
                delete res.Hanasees[3];
              }
              $scope.dashboardData.markedList = res.Hanasees;
            }
          }
        );
      };
      
      //dashboard user info load
      if(!$routeParams.uid || $routeParams.uid == $scope.userInfo.uid) {
        $scope.setDashboardData();
        $scope.loadDashboardHanasees();
      } else {
        new User.get(
          $scope.dashboardData,
          function(res) {
            if(res.User) {
              $scope.dashboardData.uid = res.User.uid;
              $scope.dashboardData.nickname = res.User.nickname;
              $scope.dashboardData.picture = res.User.picture;
              $scope.dashboardData.language = res.User.language;
              $scope.loadDashboardHanasees();
            }
          }, function(){
            $scope.setDashboardData();
            $scope.loadDashboardHanasees();
          }
        );
      }
    }
  ])
  .controller('HanaseesCtrl', [
    '$scope', '$routeParams', '$timeout', '$translate',
    'HanaseesLoader', 'Hanasee', 'hanaseeStatusChkFunc',
    function(
      $scope, $routeParams, $timeout, $translate,
      HanaseesLoader, Hanasee, hanaseeStatusChkFunc
    ) {
      if(!$scope.global.sessSigninComplate) {return false;}
      if($routeParams.channel && $routeParams.channel !== $scope.hanasees.channel) {
        $scope.hanasees.init();
      }
      
      $scope.hanaseeFilter = {
        status: ['ready', 'onair', 'completed'],
        order : {
          ready : ['best', 'new'],
          onair : ['trends', 'best', 'new'],
          completed : ['best', 'new']
        }
      };
      
      if($routeParams.listType) {
        $scope.hanasees.init();
        $scope.channel.set('all');
        if($routeParams.listType === 'author') {
          $scope.hanasees.uid = $routeParams.uid;
          $scope.hanasees.listType = 'author';
          $scope.hanasees.order = '-created';
        } else if($routeParams.listType === 'marked'){
          $scope.hanasees.marked = $routeParams.uid;
          $scope.hanasees.listType = 'marked';
          $scope.hanasees.order = '-created';
        } else if($routeParams.listType === 'today'){
          $scope.hanasees.listType = 'today';
          $scope.hanasees.order = 'new';
        }
      } else {
        if($routeParams.search) {
          $scope.hanasees.search = $routeParams.search;
        }
      }
      
      $scope.optionChange = function(status, order) {
        if($scope.global.navFlag) { return false; }
        $scope.hanasees.init();
        
        $scope.hanasees.status = status = status || 'onair';
        $scope.hanasees.order = order = order || (status==='onair'?'trends':(status==='completed'?'best':'new'));
        
        $translate('HANASEES_PAGE.status.'+$scope.hanasees.status).then(function (status) {
          $translate('HANASEES_PAGE.order.'+$scope.hanasees.order).then(function (order) {
            $scope.global.currentTitle = status+'-'+order;
          });
        });
        $scope.hanaseeListLoad();
      };
      
      $scope.$on('HANASEES_LOADED', function(){
        $scope.hanasees.init();
        $scope.hanaseeListLoad();
      });
      $scope.hanaseeListLoad = function(){
        if($scope.hanasees.data.length>0 && !$scope.hanasees.paging.cursor) {return false; }
        if($scope.hanasees.isLoad) { return false; }
        $scope.hanasees.isLoad = true;
        $scope.global.mainLoadingFlag = true;
        $scope.global.navFlag = true;
        $scope.hanasees.country = $scope.country.get();
        //hanasee filter
        if($routeParams.channel){
          $scope.channel.set($routeParams.channel);
        }
        $scope.hanasees.channel = $scope.channel.get();
        
        new HanaseesLoader($scope.hanasees).then(
          function(res){
            if(res.Hanasees && res.Hanasees.length > 0) {
              for(var i in res.Hanasees) {
                res.Hanasees[i].status = hanaseeStatusChkFunc(res.Hanasees[i].status, res.Hanasees[i].updated, res.Hanasees[i].partCount, $scope.hanasees.afkInterval);
                res.Hanasees[i].nickname = res.Hanasees[i].Author ? res.Hanasees[i].Author.nickname : 'Anonymous';
                res.Hanasees[i].viewCount = res.Hanasees[i].viewCount ? parseInt(res.Hanasees[i].viewCount) : 0;
                res.Hanasees[i].partCount = res.Hanasees[i].partCount ? parseInt(res.Hanasees[i].partCount) : 0;
                res.Hanasees[i].shareCount = res.Hanasees[i].shareCount ? parseInt(res.Hanasees[i].shareCount) : 0;
                res.Hanasees[i].totalViewCount = parseInt(res.Hanasees[i].totalViewCount);
              }

              $scope.hanasees.data = $scope.hanasees.data.concat(res.Hanasees);
              $scope.hanasees.count = res.count;
              
              $scope.hanasees.paging.cursor = res.cursor;
              $scope.hanasees.isLoad = false;

            } else {
              $scope.hanasees.isLoad = false;
            }
            
            $scope.global.navFlag = false;
            $scope.global.mainLoadingFlag = false;
          }, function(){
            $scope.hanasees.isLoad = false;
            $scope.global.navFlag = false;
            $scope.global.mainLoadingFlag = false;
          }
        );
      };
      if($scope.hanasees.data.length === 0) {
        $scope.hanaseeListLoad();
      }
      
      $scope.hansiesScrollHandler = function(){
        if($(window).height()!==$(document).height() && 
          $(document).height() - window.pageYOffset - $(window).height() < 200
        ) {
          return true;
        }
        return false;
      };
      $scope.hansiesScrollEvent = function(){
        if($scope.global.currentPageType !== 'hanasees') { return false; }
        if($scope.hanasees.data.length !== 0) {
          $scope.hanaseeListLoad();
        }
      };

      $timeout(function(){
        $scope.loadScroll($scope.hanasees.anchorHash);
      }, 0);
    }
  ])

  .controller('HanaseeCtrl', [
    '$rootScope', '$scope', '$route', '$routeParams', '$timeout',
    '$interval', '$filter', '$translate', '$modal', 'Hanasee',
    'LikeFunc', 'ShareFunc', 'NativeFunc', 'hanaseeStatusChkFunc',
    function(
      $rootScope, $scope, $route, $routeParams, $timeout,
      $interval, $filter, $translate, $modal, Hanasee,
      LikeFunc, ShareFunc, NativeFunc, hanaseeStatusChkFunc
    ){
      if(!$scope.global.sessSigninComplate) {return false;}
      if(!$routeParams.uid || !$routeParams.sid){return false;}
      //$scope.hanasee = null; //상세 들어올때마다 갱신

      $scope.syncCallback = function(res){
        if(res.viewCount) {
          $scope.hanasee.viewCount = res.viewCount;
        }
      };

      $scope.$on('HANASEE_LOADED', function(){
        var param = {
          uid: $routeParams.uid,
          sid: $routeParams.sid
        };
        angular.extend(param, $scope.oAuth.token.pair);
        $scope.syncData.start(param, $scope.syncCallback);
      });
      
      var param = $routeParams;
      angular.extend(param, $scope.oAuth.token.pair);
      new Hanasee.get(
        param,
        function(res){
          res.Hanasee.status = hanaseeStatusChkFunc(res.Hanasee.status, res.Hanasee.updated, res.Hanasee.partCount, $scope.hanasees.afkInterval);
          res.Hanasee.options = res.Hanasee.options ? angular.fromJson(res.Hanasee.options) : {};
          res.Hanasee.partCount = res.Hanasee.partCount ? parseInt(res.Hanasee.partCount) : 0;
          res.Hanasee.shareCount = res.Hanasee.shareCount ? parseInt(res.Hanasee.shareCount) : 0;
          res.Hanasee.totalViewCount = res.Hanasee.totalViewCount ? parseInt(res.Hanasee.totalViewCount) : 0;
          res.Hanasee.viewCount = res.Hanasee.viewCount ? parseInt(res.Hanasee.viewCount) : 1;
          res.Hanasee.likeCount = res.Hanasee.likeCount ? parseInt(res.Hanasee.likeCount) : 0;
          res.Hanasee.commentCount = res.Hanasee.commentCount ? parseInt(res.Hanasee.commentCount) : 0;
          //res.Hanasee.descriptionView = res.Hanasee.description ? $scope.encodeEntities(res.Hanasee.description)'';
          res.Hanasee.linky = res.Hanasee.description && res.Hanasee.description.indexOf($scope.appInfo.currentHost)>-1 ? '_self' : '_blank';
          
          $scope.hanasee = res.Hanasee;
          $scope.hanasee.passwordInput = '';
          $scope.hanasee.nickname = res.Hanasee.Author ? res.Hanasee.Author.nickname : 'Anonymous';
          $scope.hanasee.liked = $.inArray($scope.hanasee.sid, res.Liked) > -1 ? true : false;
          
          if(!$scope.hanasee.images || $scope.hanasee.images.length===0) {
            $scope.hanasee.images = $scope.hanasee.thumbnails = [];
            //$scope.hanasee.images[0] = $scope.hanasee.thumbnails[0] = $scope.appInfo.webUrl+$scope.appInfo.imagePath+'/noimage.png';
          }

          $scope.ogTagCtrl.set(
            $scope.hanasee.images && $scope.hanasee.images.length>0 ? $scope.hanasee.images[0] : '',
            $scope.hanasee.title,
            (angular.isArray($scope.hanasee.tags)?$scope.hanasee.tags.join(' '):$scope.hanasee.tags)+' '+$scope.hanasee.description
          );

//console.log('hanasee');console.log($scope.hanasee);
          if($scope.hanasee.password && $scope.hanasee.password!=='_') {
            $scope.$watch('hanasee.passwordInput', function(){
              if($scope.hanasee.password===$filter('md5')($scope.hanasee.passwordInput)) {
                $scope.loadedAnimate.run($scope.parts);
              }
            });
          }

          if($scope.hanasee.options.requireLike) {
            $scope.$watch('hanasee.liked', function(){
              if($scope.hanasee.liked) {
                $scope.loadedAnimate.run($scope.parts);
              }
            });
          }
          
          $scope.todayHanasees = {///hanasee/hanasees?limit=##&order=new
            param: {limit:4, order:'new', country:$scope.country.get()},
            data: [],
            isLoad: false,
            load: function(){
              if(this.isLoad) { return fasle; }
              this.isLoad = true;
              var self = this;
              new Hanasee.get(self.param, function(res){
                self.data = self.data.concat(res.Hanasees);
    //console.log(self.data)
                self.isLoad = false;
              }, function(res){
                self.isLoad = false;
              });
            }
          };
          $scope.todayHanasees.load();

          $scope.$broadcast('HANASEE_LOADED');
          $scope.$emit('WRITE_HANASEE_LOADED', {hanasee:$scope.hanasee});
        },
        function(res){
          if(res.status === 404){
            $scope.move( '/' );
          }
        }
      );

      $scope.hanaseeStatusChange = function(status){
        var updateData = {
          uid: $scope.hanasee.Author.uid,
          sid: $scope.hanasee.sid,
          status: status
        };
        angular.extend(updateData, $scope.oAuth.token.pair);

        new Hanasee.save(updateData, function(res){
          if(res.code === 200) {
            $scope.hanasee.status = hanaseeStatusChkFunc(status, res.Hanasee.updated, res.Hanasee.partCount, $scope.hanasees.afkInterval);

            $scope.track('Event', 'Hanasee', 'StatusChanged', updateData);
          }
        });
      };

      $scope.hanaseeDelete = function(){
        if(confirm('삭제 하시겠습니까?')) {
          var key = {
            uid: $scope.hanasee.Author.uid,
            sid: $scope.hanasee.sid
          };
          angular.extend(key, $scope.oAuth.token.pair);

          new Hanasee.delete(key, function(){
            $scope.objectSearch($scope.hanasees.data, {k:'sid', v:key.sid}, true);
            //$scope.objectSearch($scope.myHanasees, {k:'sid', v:key.sid}, true);
            $scope.hanasees.anchorHash = '';
            window.history.back();

            $scope.track('Event', 'Hanasee', 'Deleted', key);

          }, function(res){
            if(res === 401) {
              $scope.moveSign('signin');
            }
          });
        }
      };
      
      $scope.commentsModalOpen = function(part) {
        var modalInstance = $modal.open({
          templateUrl: 'views/comments.html',
          resolve: {},
          size: 'lg'
        });
      };
      
      $scope.$on('HANASEE_COMMENT_COUNT_SHANGE', function(event, args){
        $scope.hanasee.commentCount = args.commentCount;
      });
      
      $scope.isLike = false;
      $scope.likeAction = function(){
        if($scope.isLike) {return false;}
        $scope.isLike = true;
        var param = {
          uid: $scope.hanasee.Author.uid,
          sid: $scope.hanasee.sid,
          action: $scope.hanasee.liked?'unlike':'like',
          url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
        };
        angular.extend(param, $scope.oAuth.token.pair);
        
        new LikeFunc($scope.hanasee, param, Hanasee).then(
          function(res){
            $scope.isLike = false;
            $scope.track('Event', 'Hanasee', $scope.hanasee.liked ? 'Liked' : 'Unliked', param);
          },
          function(res){
            $scope.isLike = false;
            if(res.status) {
              $scope.moveSign('signin');
            }
          }
        );
        /*
        var param = {
          uid: $scope.hanasee.Author.uid,
          sid: $scope.hanasee.sid,
          action: $scope.hanasee.liked?'unlike':'like',
          url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
        };
        angular.extend(param, $scope.oAuth.token.pair);

        $scope.hanasee.liked = !$scope.hanasee.liked;
        new Hanasee.save(
          param,
          function(res){
            $scope.hanasee.liked ? $scope.hanasee.likeCount++ : $scope.hanasee.likeCount--;
            $scope.track('Event', 'Hanasee', $scope.hanasee.liked ? 'Liked' : 'Unliked', param);
          },
          function(res){
            $scope.hanasee.liked = !$scope.hanasee.liked;
            switch(res.status){
              case 401:
                $scope.moveSign('signin');
                break;
              case 500:
                $scope.hanasee.liked = true;
                break;
            }
          }
        );*/
      };

      $scope.$on('PARTS_ORDER_INIT', function(event, args){
        $scope.partsOrder = args.order==='-created'?'desc':'asc';
      });
      $scope.changeOrder = function(){
        if($scope.parts.isLoad) { return false; }
        var order = 'created';
        if($scope.partsOrder==='asc') {
          $scope.partsOrder = 'desc';
          order = '-created';
        } else {
          $scope.partsOrder = 'asc';
          order = 'created';
        }
        $scope.$broadcast('PARTS_ORDER_CHANGE', {order: order});
      };

      $scope.noticeInfo = {
        openFlag : false,
        message: ''
      };
      $scope.sendNotice = function(){
        var param = {
          uid: $scope.hanasee.Author.uid,
          sid: $scope.hanasee.sid,
          action: 'notice',
          message: $scope.noticeInfo.message,
          url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
        };
        angular.extend(param, $scope.oAuth.token.pair);

        new Hanasee.save(param, function(res){
          $scope.noticeInfo = {
            openFlag : false,
            message: ''
          };
          $translate('SERVER_MSG.hanasee.notice.200').then(function (value) {
            $scope.global.alert = { type: 'success', msg: value };
          });

          $scope.track('Event', 'Hanasee', 'Noticed', param);
        }, function(res){
          $scope.global.alert = { type: 'danger', msg: res.data.message };
        });
      };
      
      $scope.slideModal = function(){
        $modal.open({
          templateUrl: 'slideModalContent.html',
          controller: function($scope, slides){$scope.slides = slides;},
          resolve: {
            slides: function() {
              return $scope.hanasee.images;
            }
          },
          size: 'lg'
        });
      };
    }
  ])

  .controller('PartsCtrl', [
    '$scope', '$routeParams', '$timeout', '$interval',
    '$modal', 'Part', 'PartsLoader','LikeFunc',
    'PartDeleteFunc', 'hanaseeStatusChkFunc',
    function($scope, $routeParams, $timeout, $interval, 
      $modal, Part, PartsLoader, LikeFunc,
      PartDeleteFunc, hanaseeStatusChkFunc
    ) {
      if(!$scope.global.sessSigninComplate) {return false;}
      if($scope.parts.uid !== $routeParams.uid ||
        $scope.parts.sid !== $routeParams.sid
      ) {
        $scope.parts.init();
      }
      $scope.parts.uid = $routeParams.uid;
      $scope.parts.sid = $routeParams.sid;

      if(parseInt($scope.parts.uid)===parseInt($scope.userInfo.uid)) {
        $scope.parts.order = '-created';
      } else {
        $scope.parts.order = 'created';
      }

      $scope.$emit('PARTS_ORDER_INIT', {order: $scope.parts.order});
      $scope.$on('PARTS_ORDER_CHANGE', function(event, args){
        $scope.autoLoadingStop();
        $scope.parts.order = args.order;
        /*
        $scope.parts.data.reverse();
        if($scope.parts.pagingKey) {
          var tmp = $scope.parts.pagingKey.next;
          $scope.parts.pagingKey.next = $scope.parts.pagingKey.prev;
          $scope.parts.pagingKey.prev = tmp;
        }
        */
        $scope.parts.init();
        $scope.partListLoad();
      });

      $scope.parts.autoLoading = null;
      $scope.$watchCollection('parts.autoLoading', function(direction){
        if(direction) {
          $scope.intervalTrigger.start('#partsLoadBtn-'+direction, 'click');
        }
      });
      $scope.autoLoadingStop = function($event){
        if($event) {$scope.eventStop($event);}
        $scope.parts.autoLoading = null;
        $scope.intervalTrigger.stop();
      };

      $scope.partListLoad = function(direction){
        direction = direction || ($scope.parts.order === 'created' ? 'next' : 'prev');
        $scope.global.mainLoadingFlag = true;
        if($scope.parts.isLoad) {
          $scope.global.mainLoadingFlag = false;
          return false;
        }

        $scope.parts.isLoad = true;
        $scope.parts.paging.direction = direction;
        $scope.parts.paging.offset = $scope.parts.paging.offsetKey ? $scope.parts.paging.offsetKey[direction] : null;
        new PartsLoader($scope.parts).then(
          function(res){
            if(res.Parts && res.Parts.length > 0) {
              if($scope.parts.order === '-created' && direction === 'next' ||
                $scope.parts.order === 'created' && direction === 'prev' ||
                $scope.parts.data.length === 0
              ) {
                $scope.autoLoadingStop();
              }
              
              //part 선처리
              for(var i in res.Parts) {
                res.Parts[i].loaded = false;

                res.Parts[i].commentCount = res.Parts[i].commentCount ? parseInt(res.Parts[i].commentCount) : 0;
                res.Parts[i].likeCount = res.Parts[i].likeCount ? parseInt(res.Parts[i].likeCount) : 0;
                res.Parts[i].liked = $.inArray(res.Parts[i].tid, res.Liked) > -1 ? true : false;
                if(res.Parts[i].videoUrl && res.Parts[i].videoUrl.lastIndexOf('embed/') > 0) {
                  res.Parts[i].videoUrl = res.Parts[i].videoUrl.substr(res.Parts[i].videoUrl.lastIndexOf('embed/')).replace('embed/', '');
                }
                res.Parts[i].linky = res.Parts[i].content && res.Parts[i].content.indexOf($scope.appInfo.currentHost)>-1 ? '_self' : '_blank';
//                res.Parts[i].content = $scope.encodeEntities(res.Parts[i].content);
              }

              //direction에 따라 기존 리스트에 병합
              var loadedFlag = false;
              var partCnt = $scope.parts.data.length+res.Parts.length;
              var pagingData = {};
              var targetElem = {};
              var relativePos = 0;
              if(direction==='prev') {
                if($scope.parts.dataSize < partCnt) {
                  $scope.parts.data.splice($scope.parts.data.length-res.Parts.length, res.Parts.length);
                }
                targetElem = $scope.parts.data[0];
                if(targetElem && targetElem.tid) {
                  relativePos = $('#'+targetElem.tid).offset().top - window.pageYOffset + $('#'+targetElem.tid).outerHeight(true) + $('p.date:first').outerHeight(true);
                }
                $scope.parts.data = res.Parts.concat($scope.parts.data);
              } else {
                if($scope.parts.dataSize < partCnt) {
                  $scope.parts.data.splice(0, res.Parts.length);
                }
                /*
                for(i = 1 ; i <= $scope.parts.data.length ; i++) {
                  targetElem = $scope.parts.data[$scope.parts.data.length-i];
                  if($('#'+targetElem.tid).offset().top < $('body').scrollTop()) {
                    targetElem = $scope.parts.data[$scope.parts.data.length-(i-1)];
                    break;
                  }
                }*/
                targetElem = $scope.parts.data[$scope.parts.data.length-1];
                if(targetElem && targetElem.tid) {
                  relativePos = $(window).height() 
                    - ((window.pageYOffset + $(window).height()) - $('#'+targetElem.tid).offset().top);
                }
                $scope.parts.data = $scope.parts.data.concat(res.Parts);
              }
              
              //move scroll
              if(targetElem && direction==='prev' || $scope.parts.dataSize < partCnt && res.Parts.length > 5) {
                $scope.loadScroll(targetElem.tid, function(){
                  $scope.loadedAnimate.run($scope.parts);
                },relativePos);
                loadedFlag = true;
              }
              
              var pagingData = {
                first: $scope.parts.data[0],
                last: $scope.parts.data[$scope.parts.data.length-1]
              };
              $scope.parts.paging.offsetKey = {
                prev: pagingData.first.created,
                next: pagingData.last.created
              };

              //첫 로딩시 북마크 있는겨우 스크롤 이동
              if(res.Marked && $scope.parts.data.length === res.Parts.length) {
                $scope.parts.marked = res.Marked;
                relativePos = ($(window).height() / 2) - ($('#'+$scope.parts.marked.tid).height() / 2);
                $scope.loadScroll($scope.parts.marked, null, relativePos);
              }

              if(!loadedFlag) {
                $scope.loadedAnimate.run($scope.parts);
              }
            } else {  //받은 톡이 없은 경우
              if($scope.parts.autoLoading !== direction) {
                if($scope.parts.order === 'created' && direction === 'next' ||
                  $scope.parts.order === '-created' && direction === 'prev'
                ) {
                  $scope.parts.autoLoading = direction;
                } else {
                  $scope.autoLoadingStop();
                }
              }
            }

            $scope.parts.isLoad = false;
            $scope.global.mainLoadingFlag = false;
            $scope.$broadcast('PARTS_LOADED', {data:$scope.parts.data});
          });
      };
      if($scope.parts.data.length === 0) {
        $scope.partListLoad();
      }
      
      $scope.partsScrollLock = {
        prev: true,
        next: false
      }
      $scope.partsScrollHandler = function(){
        if($scope.global.currentPageType !== 'hanasee' || $('.item-parts').length===0) { return false; }
        var interval = 200;
        if($(window).height()===$(document).height()) {
          return false;
        }

        var prevGuideLine = $('.item-parts').offset().top;
        var nextGuideLine = $(document).height() - interval;
        
        if(nextGuideLine < window.pageYOffset + $(window).height()) {
          if(!$scope.partsScrollLock.next) {
            $scope.partsScrollLock.next = true;
            $scope.partsScrollLock.prev = false;
            return {result: true, direction:'next'};
          }
        } else if(prevGuideLine > window.pageYOffset) {
          if(!$scope.partsScrollLock.prev){
            $scope.partsScrollLock.next = false;
            $scope.partsScrollLock.prev = true;
            return {result: true, direction:'prev'};
          }
        } else {
          $scope.partsScrollLock.next = false;
          $scope.partsScrollLock.prev = false;
        }
        
        return false;
      };
      $scope.partsScrollEvent = function(handlerRtn){
        if($scope.global.currentPageType !== 'hanasee') { return false; }
        if($scope.parts.data.length !== 0 && handlerRtn && handlerRtn.direction) {
          $scope.partListLoad(handlerRtn.direction);
        }
      };
      
      $scope.$on('HANASEE_LOADED', function(){
        $timeout(function(){
          $scope.loadScroll($scope.parts.anchorHash);
        }, 0);
      });

      $scope.partModalOpen = function(part) {
        var params = {
          uid: part.uid || part.Hanasee.Author.uid,
          sid: part.sid || part.Hanasee.sid,
          tid: part.tid,
          type: 'modal'
        };
        
        var modalInstance = $modal.open({
          templateUrl: 'views/part.html',
          controller: 'PartCtrl',
          resolve: {
            $routeParams: function() { return params }
          },
          size: 'sm'
        });
        
        modalInstance.result.then(function() {
          $scope.ogTagCtrl.set(
            $scope.hanasee.images && $scope.hanasee.images.length>0 ? $scope.hanasee.images[0] : '',
            $scope.hanasee.title,
            (angular.isArray($scope.hanasee.tags)?$scope.hanasee.tags.join(' '):$scope.hanasee.tags)+' '+$scope.hanasee.description
          );
        }, function() {
          $scope.ogTagCtrl.set(
            $scope.hanasee.images && $scope.hanasee.images.length>0 ? $scope.hanasee.images[0] : '',
            $scope.hanasee.title,
            (angular.isArray($scope.hanasee.tags)?$scope.hanasee.tags.join(' '):$scope.hanasee.tags)+' '+$scope.hanasee.description
          );
        });
      };
      
      $scope.partKey = {
        uid: $routeParams.uid,
        sid: $routeParams.sid
      };
      $scope.partWrite = angular.extend($scope.partKey, $scope.oAuth.token.pair);
      $scope.writeInit = function(){
        $scope.writeTmp.content = '';
        $scope.writeTmp.image = {};
        $('#part_file').val('');
      };
      
      $scope.writeTmp = {
        image: {},
        content: '',
        recursive: {
          type: 'text',
          arr: []
        }
      };
      
      $scope.isPartSave = false;
      $scope.partSave = function(param){
        if($scope.isPartSave) {return false;}
        $scope.isPartSave = true;

        var formData = new FormData();
        for(var j in $scope.partWrite) {
          formData.append(j, $scope.partWrite[j]);
        }

        if(param && param.image) {
          $scope.writeTmp.recursive.type = 'image';
          var images = [];
          if(!angular.isArray(param.image)) {
            images.push(param.image);
          } else {
            images = param.image.reverse();
          }
          
          $scope.writeTmp.recursive.arr = images;
          var image = $scope.writeTmp.recursive.arr.pop();
          formData.append('image', image.file, image.file.name);
          $scope.writeInit();
          $scope.partSaveApi(formData);
        } else if($scope.writeTmp.content) {
          $scope.writeTmp.recursive.type = 'text';
          var contents = [];
          if($scope.writeTmp.content.indexOf('\n') === -1) {
            contents.push($scope.writeTmp.content);
          } else {
            contents = $scope.writeTmp.content.replace(/\n+/gi, '\n').split('\n').reverse();
          }
          
          $scope.writeTmp.recursive.arr = contents;
          formData.append('content', $scope.writeTmp.recursive.arr.pop());
          $scope.writeInit();
          $scope.partSaveApi(formData);
        }
      };
      $scope.partSaveApi = function(formData){
        new Part.upload(
          $scope.partKey,
          formData,
          function(res){
            var data = res.Part;
            var isVaild = false;
            if($scope.writeTmp.recursive.arr.length > 0) {
              var newFormData = new FormData();
              for(var j in $scope.partWrite) {
                newFormData.append(j, $scope.partWrite[j]);
              }
              
              if($scope.writeTmp.recursive.type==='text') {
                var content = null;
                while(!(content = $scope.writeTmp.recursive.arr.pop().trim())){
                  if($scope.writeTmp.recursive.arr.length===0){
                    break;
                  }
                }
                if(content) {
                  isVaild = true;
                  newFormData.append('content', content);
                }
              } else if($scope.writeTmp.recursive.type==='image'){
                var image = null;
                while(!(image = $scope.writeTmp.recursive.arr.pop())){
                  if($scope.writeTmp.recursive.arr.length===0){
                    break;
                  }
                }
                if(image) {
                  isVaild = true;
                  newFormData.append('image', image.file, image.file.name);
                }
              }
              
              if(isVaild) {
                $scope.partSaveApi(newFormData);
              }
            } else {
              if($scope.parts.order === '-created') {
                $scope.autoLoadingStop();
                $timeout(function(){ angular.element('#partsLoadBtn-prev').trigger('click'); }, 0);
                $scope.parts.autoLoading = 'prev';
              }
              
              $scope.hanasee.status = hanaseeStatusChkFunc(data.Hanasee.status, data.Hanasee.updated, data.Hanasee.partCount, $scope.hanasees.afkInterval);
              $scope.hanasee.partCount = data.Hanasee.partCount;
              $scope.isPartSave = false;
            }

            $scope.track('Event', 'Part', 'Created', data);
          },
          function(){
            $scope.isPartSave = false;
          }
        );
      };
      
      $scope.partDelete = function(tid, $event){
        $scope.eventStop($event);
        var param = {
          uid: $scope.parts.uid,
          sid: $scope.parts.sid,
          tid: tid
        };
        angular.extend(param, $scope.oAuth.token.pair);
        
        new PartDeleteFunc($scope, param);
      };
      
      /*
      $scope.isLike = false;
      $scope.likeAction = function(idx){
        if($scope.isLike) {return false;}
        $scope.isLike = true;
        var part = $scope.parts.data[idx];
        var param = {
          uid: part.Hanasee.Author.uid,
          sid: part.Hanasee.sid,
          tid: part.tid,
          action:part.liked?'unlike':'like',
          url: $scope.appInfo.webUrl+'/part/'+part.Hanasee.Author.uid+'/'+part.Hanasee.sid+'/'+part.tid
        };
        angular.extend(param, $scope.oAuth.token.pair);
        
        new LikeFunc(part, param, Part).then(
          function(res){
            $scope.isLike = false;
            $scope.track('Event', 'Part', part.liked?'Liked':'Unliked', param);
          },
          function(res){
            $scope.isLike = false;
            if(res.status) {
              $scope.moveSign('signin');
            }
          }
        );
      };

      $scope.bookmarkAction = function(idx){
        var part = $scope.parts.data[idx];
        /*
        var prevPart = {};
        if($scope.parts.order === 'created') {
          prevPart = idx<4 ? $scope.parts.data[0] : $scope.parts.data[idx-4];
          prevPart.createdKey = parseInt(prevPart.created)-1;
        } else {
          prevPart = $scope.parts.data.length-1 < idx+4 ? $scope.parts.data[$scope.parts.data.length-1] : $scope.parts.data[idx+4];
          prevPart.createdKey = parseInt(prevPart.created)+1;
        }

        var index = {
          order: $scope.parts.order,
          uid: prevPart.uid,
          created: prevPart.created,
          key: prevPart.key
        };/
        var action = $scope.parts.marked===part.tid ? 'unmark':'mark';
        var param = {
          uid: part.Hanasee.Author.uid,
          sid: part.Hanasee.sid,
          tid: part.tid,
          action: action,
          url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
        };
        angular.extend(param, $scope.oAuth.token.pair);

        new Part.save(
          param,
          function(res){
            $scope.parts.marked = action==='mark' ? part.tid : '';
            $scope.track('Event', 'Part', action==='mark'?'Marked':'Unmarked', param);
          },
          function(res){
            switch(res.status){
              case 401:
                $scope.moveSign('signin');
                break;
              case 500:
                $scope.parts.marked = part.tid;
                break;
            }
          }
        );
      };
      */
    }
  ])
  .controller('PartCtrl', [
    '$scope', '$routeParams', '$interval', '$timeout',
    'Hanasee', 'Part', 'LikeFunc', 'PartDeleteFunc',
    function(
      $scope, $routeParams, $interval, $timeout,
      Hanasee, Part, LikeFunc, PartDeleteFunc
    ) {
      if(!$scope.global.sessSigninComplate) {return false;}
      $scope.hanasee = null;
      $scope.part = null; //상세 들어올때마다 갱신
      $scope.routeParams = $routeParams;
      
      var param = $scope.routeParams;
      angular.extend(param, $scope.oAuth.token.pair);

      new Part.get(param, function(res){
        res.Part.shareCount = res.Part.shareCount ? parseInt(res.Part.shareCount) : 0;
        res.Part.likeCount = res.Part.likeCount ? parseInt(res.Part.likeCount) : 0;
        res.Part.commentCount = res.Part.commentCount ? parseInt(res.Part.commentCount) : 0;
        res.Part.linky = res.Part.content && res.Part.content.indexOf($scope.appInfo.currentHost)>-1 ? '_self' : '_blank';
        
        $scope.part = res.Part;
        $scope.hanasee = res.Part.Hanasee;
        $scope.part.nickname = res.Part.Hanasee.Author ? res.Part.Hanasee.Author.nickname : 'Anonymous';
        $scope.part.liked = $.inArray(res.Part.tid, res.Liked) > -1 ? true : false;
        $scope.part.marked = res.Marked || '';

        $scope.ogTagCtrl.set(
          $scope.part.image ? $scope.part.image : (
            $scope.part.imageUrl ? $scope.part.imageUrl : (
              $scope.part.videoUrl ? 'http://i.ytimg.com/vi/'+$scope.part.videoUrl+'/hqdefault.jpg' : ''
            )
          ),
          $scope.hanasee.title,
          $scope.part.content
        );

        $scope.syncCallback = function(res){
          if(res.viewCount) {
            //$scope.hanasee.viewCount = res.viewCount;
          }
        };
        $scope.syncData.start({uid: res.Part.Hanasee.Author.uid, sid: res.Part.Hanasee.sid}, $scope.syncCallback);
      });

      $scope.$on('PART_COMMENT_COUNT_SHANGE', function(event, args){
        $scope.part.commentCount = args.commentCount;
      });

      $scope.$on('COMMENT_LOADED', function(event, args){
        $scope.loadedAnimate.run($scope.comments);
      });
      
      $scope.partDelete = function($event){
        $scope.eventStop($event);
        var param = {
          uid: $scope.part.Hanasee.Author.uid,
          sid: $scope.part.Hanasee.sid,
          tid: $scope.part.tid
        };
        angular.extend(param, $scope.oAuth.token.pair);
        
        new PartDeleteFunc($scope, param).then(function(){
          $timeout(function(){$('.modal').trigger('click');}, 0);
        });
      };

      $scope.isLike = false;
      $scope.likeAction = function(){
        if($scope.isLike) {return false;}
        $scope.isLike = true;
        var param = {
          uid: $scope.part.Hanasee.Author.uid,
          sid: $scope.part.Hanasee.sid,
          tid: $scope.part.tid,
          action:$scope.part.liked?'unlike':'like',
          url: $scope.appInfo.webUrl+'/part/'+$scope.part.Hanasee.Author.uid+'/'+$scope.part.Hanasee.sid+'/'+$scope.part.tid
        };
        angular.extend(param, $scope.oAuth.token.pair);
        
        new LikeFunc($scope.part, param, Part).then(
          function(res){
            $scope.isLike = false;
            if($scope.parts.data.length > 0) {
              var idx = $scope.objectSearch($scope.parts.data, {k:'tid', v:$scope.part.tid}, false);
              if(idx > -1) {
                $scope.parts.data[idx].likeCount = res.Part.likeCount;
                $scope.parts.data[idx].liked = $scope.part.liked;
              }
            }
            $scope.track('Event', 'Part', $scope.part.liked?'Liked':'Unliked', param);
          },
          function(res){
            $scope.isLike = false;
            if(res.status) {
              $scope.moveSign('signin');
            }
          }
        );
      };

      $scope.bookmarkAction = function(){
        var part = $scope.part;
        var action = $scope.part.marked===part.tid ? 'unmark':'mark';
        
        var param = {
          uid: part.Hanasee.Author.uid,
          sid: part.Hanasee.sid,
          tid: part.tid,
          action: action,
          url: $scope.appInfo.webUrl+$scope.appInfo.currentPath
        };
        angular.extend(param, $scope.oAuth.token.pair);

        new Part.save(
          param,
          function(res){
            $scope.part.marked = action==='mark' ? part.tid : '';
            $scope.parts.marked = action==='mark' ? part.tid : '';
            $scope.track('Event', 'Part', action==='mark'?'Makred':'Unmarked', param);
          },
          function(res){
            switch(res.status){
              case 401:
                $scope.moveSign('signin');
                break;
              case 500:
                $scope.part.marked = part.tid;
                break;
            }
          }
        );
      };
    }
  ])
  .controller('WriteCtrl', [
    '$scope',
    '$routeParams',
    '$translate',
    'md5',
    'Hanasee',
    function($scope, $routeParams, $translate, md5, Hanasee){
      if(!$scope.global.sessSigninComplate) { return false; }
      if(!$scope.userInfo.isSignin) {
        $scope.moveSign('signin');
      }
      $scope.optionDetail.init();
      $scope.$on('WRITE_HANASEE_LOADED', function(event, args){
        if($scope.global.sessSigninComplate && $routeParams.uid && $routeParams.sid){
          $scope.write.channel = $scope.writeTmp.channel = args.hanasee.channel || 'etc';
          $scope.write.country = args.hanasee.country || 'kr';
          $scope.writeTmp.uid = args.hanasee.Author.uid;
          $scope.writeTmp.sid = args.hanasee.sid;
          $scope.write.title = args.hanasee.title;
          $scope.write.description = args.hanasee.description;
          $scope.writeTmp.isPassword = args.hanasee.password && args.hanasee.password!=='_' ? true : false;
          $scope.write.password = $scope.writeTmp.password = $scope.writeTmp.isPassword ? args.hanasee.password : '';
          $scope.writeTmp.options = args.hanasee.options;
          $scope.writeTmp.tags = typeof args.hanasee.tags==='string' ? args.hanasee.tags : args.hanasee.tags.join(' ');
          $scope.writeTmp.nowImageCnt = args.hanasee.images?args.hanasee.images.length:0;
          
          if(!args.hanasee.images || args.hanasee.images.length===0 || 
            $.inArray($scope.appInfo.webUrl+$scope.appInfo.imagePath+'/noimage.png', args.hanasee.images)===-1
          ) {
            $scope.write.update = {
              images: args.hanasee.images,
              thumbnails: args.hanasee.thumbnails,
              deleteItem: {
                images: [],
                thumbnails: []
              }
            };
          }
        }
//console.log($scope.write);
      });
      
      var channel = $scope.channel.get();
      
      $scope.write = {
        tags: [],
        options: {},
        channel: !channel || channel==='all' ? 'etc' : channel,
        country: $scope.country.get()
      };
      angular.extend($scope.write, $scope.oAuth.token.pair);
      
      $scope.writeTmp = {
        'imageCnt': 8,
        'nowImageCnt': 0,
        'loadingFlag': false,
        'image': null,
        'images': [],
        'options': {},
        'channel': $scope.write.channel,
        //'imgOpenList': [],
        'isPassword': false,
        'isSetPassword': false
      };
      /*
      for(var i=0; i<$scope.writeTmp.imageCnt; i++){
        $scope.writeTmp.imgOpenList[i] = false;
        $scope.writeTmp.images[i] = null;
      }
      $scope.writeTmp.imgOpenList[0] = true;
      */
      /*
      $scope.$watchCollection('writeTmp.images', function(){
        for(var i=0; i<$scope.writeTmp.imageCnt; i++){
          if(!angular.isUndefined($scope.writeTmp.imgOpenList[i]) &&
            $scope.writeTmp.images[i] &&
            $scope.writeTmp.images[i].file &&
            i+1 < $scope.writeTmp.imageCnt
          ) {
            $scope.writeTmp.imgOpenList[i+1] = true;
          }
        }
      });
      */
      
      $scope.$on('OPTION_DETAIL_CLOSE', function(){
        $scope.writeTmp.channel = $scope.write.channel;
        $scope.writeTmp.password = $scope.write.password;
      });
      $scope.$on('OPTION_DETAIL_SAVE', function(){
        $scope.write.channel = $scope.writeTmp.channel;
        $scope.write.password = $scope.writeTmp.password;
        $scope.writeTmp.isSetPassword = true;
      });
      
      $scope.nowImageCnt = function(){
        $scope.writeTmp.nowImageCnt = $scope.writeTmp.images.length+($scope.write.update?$scope.write.update.images.length:0);
      };
      $scope.imageTrigger = function(){
        $scope.writeTmp.image = null;
        $scope.nowImageCnt();
        if($scope.writeTmp.nowImageCnt < $scope.writeTmp.imageCnt) {
          $('#file_input').trigger('click');
        }
      };
      $scope.imageAdd = function(param){
        if(param && param.image) {
          if(angular.isArray(param.image)){
            for(var i in param.image) {
              if($scope.writeTmp.nowImageCnt < $scope.writeTmp.imageCnt) {
                $scope.writeTmp.images.push(param.image[i]);
                $scope.nowImageCnt();
              }
            }
          } else {
            $scope.writeTmp.images.push(param.image);
            $scope.nowImageCnt();
          }
        }
      };
      $scope.imageRemove = function(idx){
        $scope.writeTmp.images.splice(idx, 1);
        $scope.nowImageCnt();
      };
      $scope.updateImageRemove = function(idx){
        $scope.write.update.deleteItem.images.push($scope.write.update.images[idx]); 
        $scope.write.update.images.splice(idx,1);
        $scope.write.update.deleteItem.thumbnails.push($scope.write.update.thumbnails[idx]);
        $scope.write.update.thumbnails.splice(idx,1);
        $scope.nowImageCnt();
      }

      $scope.$watch('writeTmp.tags', function(){
        $scope.write.tags = [];
        if($scope.writeTmp && $scope.writeTmp.tags) {
          var tmp = $scope.writeTmp.tags.split(' ');
          for(var i in tmp) {
            var word = tmp[i].trim();
            if (word.length>0 && $.inArray(word, $scope.write.tags) === -1) {
              $scope.write.tags.push(word);
            }
          }
        }
      });

      $scope.isHanaseeSave = false;
      $scope.hanaseeSave = function(){
        if($scope.isHanaseeSave || !$scope.userInfo.isSignin) {return false;}
        $scope.isHanaseeSave = true;

        if($scope.writeTmp.isPassword && !$scope.writeTmp.isSetPassword) {
          delete $scope.write.password;
        } else {
          $scope.write.password = $scope.writeTmp.isPassword ? md5.createHash($scope.write.password) : '';
        }
        
        if($scope.write.update) {
          $scope.write.update = angular.toJson($scope.write.update);
        }
        $scope.write.options = angular.toJson($scope.writeTmp.options);
        
        var formData = new FormData();
        for(var j in $scope.write) {
          if(j === 'tags') {
            for(var k in $scope.write[j]) {
              if($scope.write[j][k]) { formData.append(j, $scope.write[j][k]); }
            }
          } else {
            if($scope.write[j]) { formData.append(j, $scope.write[j]); }
          }
        }
        
        var sizeErrorFlag = false;
        if($scope.writeTmp.images) {
          for(var i in $scope.writeTmp.images) {
            if(!$scope.writeTmp.images[i]) {
              continue;
            }
            if($scope.writeTmp.images[i].file.size > 5*1024*1024) {
              $scope.imageRemove(i);
              sizeErrorFlag = true;
            }
            formData.append('images', $scope.writeTmp.images[i].file, $scope.writeTmp.images[i].file.name);
          }
        }
        if(sizeErrorFlag) {
          $translate('COMMON.warning.fileSize').then(function (value) {
            $scope.global.alert = { type: 'danger', msg: value };
          });
          $scope.isHanaseeSave = false;
          return false;
        }
        
        var param = {};
        if($scope.writeTmp.uid && $scope.writeTmp.sid) {
          param = {
            uid: $scope.writeTmp.uid,
            sid: $scope.writeTmp.sid
          }
        }
        
        new Hanasee.upload(
          param,
          formData,
          function(res){
            //$scope.objectSearch($scope.myHanasees, {k:'sid', v:res.Hanasee.sid}, true);
            //$scope.myHanasees.push(res.Hanasee);

            $scope.track('Event', 'Hanasee', 'Created', res.Hanasee);

            $scope.isHanaseeSave = false;
            $scope.move('/hanasee/'+res.Hanasee.Author.uid+'/'+res.Hanasee.sid);
          },
          function(res){
            $scope.isHanaseeSave = false;
            $scope.global.alert = { type: 'danger', msg: res.data.message };
          }
        );
      };
    }
  ])

  .controller('ShareCtrl', [
    '$scope',
    'Hanasee',
    'Part',
    'ShareFunc',
    function($scope, Hanasee, Part, ShareFunc){
      if(!$scope.global.sessSigninComplate) {return false;}
      $scope.shareLink = function(snsType, dataType){
        var data = {
          'appName': $scope.appInfo.title,
          'title': $scope.hanasee.title,
          'marketUrl': $scope.appInfo.android.url,
          'appId': $scope.appInfo.android.appId,
          'currentImage': $scope.global.currentImage
        };

        var param = {
          uid: $scope.hanasee.Author.uid,
          sid: $scope.hanasee.sid,
          action: 'share'
        };
        angular.extend(param, $scope.oAuth.token.pair);
        if(dataType === 'hanasee') {
          data.content = $(('<b>'+($scope.hanasee.description ? $scope.hanasee.description : '')+'</b>').replace(/<br[\s]?[\/]?\>/gi, '\n').trim()).text();
          data.currentUrl = $scope.appInfo.webUrl+'/hanasee/'+param.uid+'/'+param.sid;
          
          new Hanasee.save(param, function(res){
            $scope.hanasee.shareCount = res.Hanasee ? res.Hanasee.shareCount : $scope.hanasee.shareCount+1;
            ShareFunc[snsType](data);
            data.snsType = snsType;
            $scope.track('Event', 'Hanasee', 'Shared', data);
          });
        } else if(dataType === 'part'){
          param.tid = $scope.part.tid;
          data.content = $(('<b>'+($scope.part.content ? $scope.part.content : '')+'</b>').replace(/<br[\s]?[\/]?\>/gi, '\n').trim()).text();
          data.currentUrl = $scope.appInfo.webUrl+'/part/'+param.uid+'/'+param.sid+'/'+param.tid;
          
          new Part.save(param, function(res){
            $scope.part.shareCount = res.Part ? res.Part.shareCount : $scope.part.shareCount+1;
            ShareFunc[snsType](data);
            data.snsType = snsType;
            $scope.track('Event', 'Part', 'Shared', data);
          });
        }
      };
    }
  ]);
