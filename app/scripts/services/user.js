'use strict';

angular.module('userServices', [ 'ngResource'])
  .factory('DeviceSignin', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/signin');
  }])
  
  .factory('Signin', [ 'AppInfo', '$resource', '$q', function(AppInfo, $resource, $q) {
    return function(email, opt) {
      var Signin = $resource(AppInfo.api.baseUrl+'/signin');
      var param = {
        'email': email
      };
      if(opt.connectionProvider) {
        param.connectionProvider = opt.connectionProvider;
        param.connectionKey = opt.connectionKey;
      } else {
        param.password = opt.password;
      }
      
      var delay = $q.defer();
      new Signin.save(param, function(res, code) {
        delay.resolve(res, code);
      }, function(res) {
        delay.reject(res);
      });
      return delay.promise;
    };
  }])
  
  .factory('Signout', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/signout');
  }])
  
  .factory('User', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/users/:uid/:action', 
      {'uid':'@uid', 'action':'@action'}, 
      {
        'upload': {method:'POST', params: {'uid':'@uid', 'sid':'@sid'}, headers:{ 'Content-Type': undefined }, transformRequest:angular.identity}
      });
  }])
  
  .factory('UserSignup', [ 'User', '$q', function(User, $q) {
    return function(data) {
      var delay = $q.defer();
      new User.save(data, function(res) {
        delay.resolve(res);
      }, function(res) {
        delay.reject(res);
      });
      return delay.promise;
    };
  }]);