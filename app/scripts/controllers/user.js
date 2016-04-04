'use strict';

angular.module('oAuthCtrls', ['userServices', 'mainServices', 'ivpusic.cookie'])
  .controller('UserCtrl', [
    '$rootScope',
    '$scope',
    '$location',
    '$routeParams',
    'ipCookie',
    '$filter',
    'User',
    'DeviceSignin',
    'Signout',
    function($rootScope, $scope, $location, $routeParams, ipCookie, $filter, User, DeviceSignin, Signout){
      $rootScope.oAuth = {
        dialogPath: {
          signin: '/dialog/authorize',
          signup: '/dialog/regist'
        },
        param: {
          client_id: '',
          redirect_uri: $location.absUrl(),
          response_type: 'token',
          state: angular.toJson({redirectUrl: '/'}),
          scope: '',
          open_type: 'self' //self | iframe | popup
        },
        token: {
          pair: {},
          expire: null
        }
      };
      $scope.$emit('NEED_OAUTH_INIT', {data: $rootScope.oAuth});
      
      $scope.getOAuthUrl = function(type, redirectUrl){
        if(redirectUrl) {
          $scope.oAuth.param.state = angular.toJson({redirectUrl: redirectUrl});
        }

        $scope.oAuthUrl = $scope.appInfo.api.baseUrl + $scope.oAuth.dialogPath[type] + '?' + $.param($scope.oAuth.param);
        return $scope.oAuthUrl;
      };
      
      $rootScope.userInfo = {
        isSignin:false,
        setting: [],
        connection: []
      };
      $rootScope.userConnection = {};
      
      $scope.setUserInfo = function(res) {
        if(res.User) {
          $scope.userInfo.isSignin = true;
          $scope.userInfo.uid = res.User.uid;
          $scope.userInfo.email = res.User.email;
          $scope.userInfo.nickname = res.User.nickname;
          $scope.userInfo.created = res.User.created;
          $scope.userInfo.picture = res.User.picture;
          $scope.userInfo.language = res.User.language;
          $scope.userInfo.admin = res.User.admin;
          $scope.userInfo.setting = res.User.hanasee ? angular.fromJson(res.User.hanasee) : {};
        }
      };
      
      $scope.setToken = function(res){
        if(res.Token) {
          res.Token.access_token = res.Token.access_token || res.Token.id;
        
          ipCookie('access_token', res.Token.access_token, { expires: 9999, path:'/' });
          ipCookie('token_type', res.Token.token_type, { expires: 9999, path:'/' });
          ipCookie('refresh_token', res.Token.refresh_token, { expires: 9999, path:'/' });
          ipCookie('token_expire', res.Token.expire_in, { expires: 9999, path:'/' });
          
          $scope.oAuth.token.pair.access_token = res.Token.access_token;
          $scope.oAuth.token.pair.token_type = res.Token.token_type;
          $scope.oAuth.token.refresh_token = res.Token.refresh_token;
          $scope.oAuth.token.expire = res.Token.expire_in;
        }
      };
      
      $scope.removeToken = function() {
        ipCookie.remove('access_token', {path:'/' });
        ipCookie.remove('token_type', {path:'/' });
        ipCookie.remove('refresh_token', {path:'/' });
        ipCookie.remove('token_expire', {path:'/' });
        
        $scope.oAuth.token.pair = {};
        $scope.oAuth.token.expire = null;
      };

      $scope.getToken = function() {
        try {
          $scope.oAuth.token.pair.access_token = ipCookie('access_token');
          $scope.oAuth.token.pair.token_type = ipCookie('token_type');
          $scope.oAuth.token.refresh_token = ipCookie('refresh_token');
          $scope.oAuth.token.expire = ipCookie('token_expire');
        }
        catch (e) {
          $scope.removeToken();
        }
      };
      
      $scope.signout = function(){
        new Signout.save();
        $scope.userInfo = {};
        $scope.userInfo.isSignin = false;
        $scope.removeToken();
      };
      
      $scope.moveSign = function(type, $event){
        $scope.signout();
        var encodePath = '';
        if($event) {
          $event.preventDefault();
          $event.stopPropagation();
        } else {
          encodePath = $location.path();
        }
        
        switch($scope.oAuth.param.open_type) {
          case 'self':
            window.location.href = $scope.getOAuthUrl(type, encodePath);
            break;
          case 'iframe':
            $scope.move('/signin/'+encodePath, $event);
            break;
        }
      };
      
      $scope.sessSignCallback = function(res, isCallback, redirectUrl){
        $scope.setToken(res);
        $scope.setUserInfo(res);
        if(isCallback) {
          $scope.move(redirectUrl);
          $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:true});
        } else {
          $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: true, isSignin:true});
        }
      };
      
      $scope.sessSignin = function(isCallback, redirectUrl) {
        var param = {uid:'me'};
        if(window.android) {
          var deviceInfo = JSON.parse(window.android.getRegId());
          param.appName = $scope.appInfo.appname;
          param.deviceId = deviceInfo.device_id;
          param.clientId = $scope.oAuth.param.client_id;
          param.access_token = $scope.oAuth.token.pair.access_token;
          param.token_type = $scope.oAuth.token.pair.token_type;
          new DeviceSignin.save(
            param,
            function(res) {
              try {
                window.android.register(res.User.uid.toString());
              } catch(e) {
                console.log(e);
              }
              $scope.sessSignCallback(res, isCallback, redirectUrl);
            }, function(res){
              $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:false});
              $scope.moveHanasees();
            }
          );
        } else {
          if(parseInt($scope.oAuth.token.expire) > new Date().getTime()) {
            param.access_token = $scope.oAuth.token.pair.access_token;
          } else {
            param.refresh_token = $scope.oAuth.token.refresh_token;
          }
          param.token_type = $scope.oAuth.token.pair.token_type;
          new User.get(
            param,
            function(res) {
              $scope.sessSignCallback(res, isCallback, redirectUrl);
            }, function(){
              $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:false});
              $scope.moveHanasees();
            }
          );
        }
      };
      
      $scope.getToken();
      if(window.android || $scope.oAuth.token.pair.access_token &&
        $scope.oAuth.token.pair.token_type &&
        $scope.oAuth.token.expire
      ){
        $scope.sessSignin();
      } else {
        $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:false});
      }
    }
  ])
  
  .controller('oAuthCallbackCtrl', [
    '$scope',
    '$routeParams',
    function($scope, $routeParams){
    
      if($routeParams.code && $routeParams.code === '200') {
        var redirectUrl = '/';
        if($routeParams.state) {
          var state = angular.fromJson($routeParams.state);
          redirectUrl = state.redirectUrl ? state.redirectUrl : '/';
        }
        if($routeParams.from) {
          $scope.track('Event', 'User', 'Signed up', $routeParams);
        }

        var res = {};
        res.Token = $routeParams;
        $scope.setToken(res);
        $scope.sessSignin(true, redirectUrl);
      }
    }
  ])
  .controller('SigninCtrl', ['$scope', '$routeParams', '$sce', function($scope, $routeParams, $sce){
    if($scope.userInfo.isSignin) {
      $scope.move( '/' );
    }
    
    $scope.iframeUrl = $sce.trustAsResourceUrl($scope.getOAuthUrl('signin', $routeParams.redirectUrl));
  }])
  .controller('SignupCtrl', ['$scope', '$routeParams', '$sce', function($scope, $routeParams, $sce){
    if($scope.userInfo.isSignin) {
      $scope.move( '/' );
    }
    
    $scope.iframeUrl = $sce.trustAsResourceUrl($scope.getOAuthUrl('signup'));
  }]);
  
  
angular.module('userCtrls', ['userServices', 'nativeServices', 'mainServices'])
  .controller('UserCtrl', [
    '$rootScope',
    '$scope',
    '$routeParams',
    '$filter',
    'User',
    'Signin',
    'Signout',
    function ($rootScope, $scope, $routeParams, $filter, User, Signin, Signout) {
      $rootScope.userInfo = {
        isSignin:false,
        connection: []
      };
      $rootScope.userConnection = {};
      
      $scope.setUserInfo = function(res) {
        $scope.userInfo.isSignin = true;
        $scope.userInfo.uid = res.uid;
        $scope.userInfo.email = res.email;
        $scope.userInfo.nickname = res.nickname;
      };
      
      $scope.sessSignin = function(){
        /*
        if(window.android) {
          //카스로그인
          window.android.login('window.android.signinCallback');
        } else {
        */
        
        new User.get(
          {'id':'me'},
          function(res) {
            if(res.uid) {
              $scope.setUserInfo(res);
            }
            $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: true, isSignin:true});
          }, function(){
            $scope.$emit('SESS_SIGNIN_COMPLATE', {isReload: false, isSignin:false});
          }
        );
        //}
      };
      $scope.sessSignin();
      
      $scope.isSignin = function(){
        return $scope.userInfo.isSignin?true:false;
      };
      
      $scope.signout = function(){
        new Signout.save();
        $scope.userInfo = {};
        $scope.userInfo.isSignin = false;
//        $scope.move( '/' );
      };
      
      $scope.signinAction = function(){
        var opt = {
          'password': $scope.userInfo.password
        };
        new Signin($scope.userInfo.email, opt).then(function(res){
          $scope.userInfo.password = '';
          if(res.uid) {
            $scope.setUserInfo(res);

            if($.inArray('kakao', $scope.userInfo.connection) > -1) {
              $scope.setKakaoConn();
            }

            $scope.move( $routeParams.redirectUrl || '/' );
          }
          
        }, function(res){
          if(res.status === 401) {
            $scope.globle.alert = { type: 'warning', msg: res.data.message };
          }
        });
      };
      
      $scope.setKakaoConn = function(){
        new User.get({'id':$scope.userInfo.uid, 'action':'connection'}, function(res){
          if(res.key) {
            window.android.setUserInfo('uid', $scope.userInfo.uid);
            window.android.setUserInfo('key', res.key);
          } else {
            new User.save({
              'connectionProvider':'kakao',
              'connectionProfile':window.android.getUserInfo(),
              'action':'connection'
            }, function(){
              new User.get({'id':$scope.userInfo.uid, 'action':'connection'}, function(res){
                window.android.setUserInfo('uid', $scope.userInfo.uid);
                window.android.setUserInfo('key', res.key);
              });
            });
          }
        });
      };
      
      $scope.moveSignin = function(){
        var encodePath = encodeURIComponent($scope.appInfo.currentPath);
        $scope.move('/signin/'+encodePath);
      };
    }
  ])
  .controller('SigninCtrl', ['$scope', function($scope){
    if($scope.userInfo.isSignin) {
      $scope.move( '/' );
    }
  }])
  .controller('SignupCtrl', ['$scope', '$translate', 'UserSignup', function($scope, $translate, UserSignup){
    if($scope.userInfo.isSignin) {
      $scope.move( '/' );
    }
    
    $scope.signup = {
      'referer': $scope.appInfo.appname
    };

    $scope.signupAction = function(){
      if(parseInt($scope.signup.nickname).toString().length === 15) {
        $translate('SIGNUP_PAGE.message.nicknameDup').then(function (value) {
          $scope.globle.alert = { type: 'warning', msg: value };
        });
        return false;
      }

      new UserSignup($scope.signup).then(function(res){
        $scope.userInfo.email = $scope.signup.email;
        $scope.userInfo.password = $scope.signup.password;
        $scope.signinAction();
      }, function(res){
        $scope.globle.alert = { type: 'warning', msg: res.data.message };
        $scope.userInfo.password = '';
      });
    };
  }]);
