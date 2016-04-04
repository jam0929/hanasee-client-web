'use strict';

angular.module('mainServices', [ 'ngResource', 'commonServices' ])
  .factory('Notice', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/'+AppInfo.appname+'/notice');
  }])
  .factory('LikeFunc', ['$q', function($q){
    return function(target, param, Resource){
      target.liked = !target.liked;
      
      var delay = $q.defer();
      Resource.save(param, 
        function(res) {
          target.liked ? target.likeCount++ : target.likeCount--;
          delay.resolve(res);
        },
        function(res) {
          target.liked = !target.liked;
          if(res.status === 500) {  //already like
            target.liked = true;
          }
          delay.reject(res);
        }
      );
      return delay.promise;
    }
  }])
  .factory('PartDeleteFunc', ['$translate', '$q', 'Part', function($translate, $q, Part){
    return function($scope, param){
      var delay = $q.defer();
      $translate('COMMON.confirm.delete').then(function(value) {
        if(confirm(value)) {
          new Part.delete(param, function(res){
            $scope.objectSearch($scope.parts.data, {k:'tid', v:param.tid}, true);
            $scope.hanasee.partCount = res.Hanasee.partCount;
            
            $scope.track('Event', 'Part', 'Deleted', param);
            
            delay.resolve(res);
          }, function(res){
            if(res === 401) {
              $scope.moveSign('signin');
            }
            delay.reject(res);
          });
        }
      });
      return delay.promise;
    }
  }])
  .factory('ShareFunc', ['AppInfo', function(AppInfo){
    return {
      kakaoTalk: function(data){
        kakao.link('talk').send({
          msg : data.title+'\n\n'+data.content+'\n\n웹으로 보기:'+data.currentUrl+'\n\n앱 설치하기: ',
          url : data.marketUrl,
          appid : data.appId,
          appver : '1.0',
          appname : data.appName,
          type : 'link'
        });
      },

      kakaoStory: function(data){
        kakao.link('story').send({
          post : '['+data.appName+'] '+data.title+'\n\n'+data.content+'\n\n웹으로 보기:'+data.currentUrl+'\n\n앱 설치하기: '+data.marketUrl,
          appid : data.appId,
          appver : '1.0',
          appname : data.appName,
          urlinfo : JSON.stringify({
            title: data.title,
            desc: data.content.substring(0,80)+'...',
            imageurl:[data.currentImage],
            type:'app'
          })
        });
      },

      twitter: function(data){
        window.location.href = 'https://twitter.com/intent/tweet?'+
          'original_referer='+encodeURIComponent(data.currentUrl)+
          '&text='+encodeURIComponent('['+data.appName+'] '+data.title+'\n'+data.content.replace(/\n/gi, ' ').substring(0,60))+'\n\n'+
          '&url='+encodeURIComponent(data.currentUrl);
      },

      facebook: function(data){
        window.location.href = "https://www.facebook.com/dialog/share?"+
          "app_id="+AppInfo.snsKey.fb+
          "&display=popup"+
          "&href="+encodeURIComponent(data.currentUrl)+
          "&redirect_uri="+encodeURIComponent(data.currentUrl);
       /*
        window.location.href = 'http://www.facebook.com/sharer.php?m2w&s=100'+
          '&p[url]='+encodeURIComponent(data.currentUrl)+
          '&p[images][0]='+encodeURIComponent(data.currentImage)+
          '&p[title]='+data.title+
          '&p[summary]='+data.content;
          
        window.location.href = 'https://facebook.com/sharer.php?'+
        'u='+encodeURIComponent(data.currentUrl);
        */
      },

      postText : function(data){
        return '['+data.appName+'] '+data.title+'\n\n'+data.content+'\n\n앱 설치하기 : '+data.marketUrl;
      }
    };
  }]);

angular.module('hanaseeServices', [ 'ngResource' ])
  .factory('hanaseeStatusChkFunc', [function(){
    return function(status, updated, partCount, afkInterval) {
      var rtn = status;
      if(status === 'onair' && Date.now() - updated > afkInterval) {
        rtn = 'afk';
      }
      if(status === 'ready' && partCount && partCount > 0) {
        rtn = 'paused';
      }
      return rtn;
    };
  }])
  .factory('Hanasee', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/'+AppInfo.appname+'/hanasees/:uid/:sid/:action',
      {'uid':'@uid', 'sid':'@sid', 'action':'@action'},
      {
        'upload': {method:'POST', params: {'uid':'@uid', 'sid':'@sid'}, headers:{ 'Content-Type': undefined }, 
          transformRequest:angular.identity
          /*,
          interceptor: { 'responseError': 
            function(rejection){ 
              console.log(rejection);
              /*
              if (canRecover(rejection)) {
                //return responseOrNewPromise
              }
              //return $q.reject(rejection);
              *
            }
          }*/
        }
      }
    );
  }])
  .factory('HanaseesLoader', [ 'Hanasee', '$q', function(Hanasee, $q) {
    return function(param) {
      var data = {
        order: param.order,
        limit: param.paging && param.paging.limit ? param.paging.limit : 0,
        cursor: param.paging && param.paging.cursor ? param.paging.cursor : ''
      };
      
      switch(param.listType) {
        case 'basic' :
          data.country = param.country;
          data.status = param.status;
          if(param.channel && param.channel!=='all') {
            data.channel = param.channel;
          }
          if(param.search) {
            data.search= param.search;
          }
          break;
        case 'marked' :
          data.marked= param.marked;
          break;
        case 'author' :
          data.uid= param.uid;
          break;
        case 'today' :
          break;
      }
      
      var delay = $q.defer();
      Hanasee.get(data, function(res) {
        delay.resolve(res);
      }, function(res) {
        delay.reject(res);
      });
      return delay.promise;
    };
  }]);

angular.module('partServices', [ 'ngResource' ])
  .factory('Part', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/'+AppInfo.appname+'/hanasees/:uid/:sid/parts/:tid/:action',
      {'uid':'@uid', 'sid':'@sid', 'tid':'@tid', 'action':'@action'},
      {
        'upload': {method:'POST', headers:{ 'Content-Type': undefined }, transformRequest:angular.identity}
      }
    );
  }])
  .factory('PartsLoader', [ 'Part', '$q', function(Part, $q) {
    return function(part) {
      var param = {
        order: part.order,
        uid: part.uid,
        sid: part.sid,
        limit: part.paging.limit,
        offset: part.paging.offset,
        direction: part.paging.direction,
        access_token: part.access_token,
        token_type: part.token_type
      };

      var delay = $q.defer();
      Part.get(param, function(res) {
        delay.resolve(res);
      }, function(res) {
        delay.reject(res);
      });
      return delay.promise;
    };
  }]);
  
angular.module('etcServices', [ 'ngResource' ])
  .factory('Boards', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/'+AppInfo.appname+'/boards/:type',
      {'type':'@type'}
    );
  }])
  .factory('Notification', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/notifications/:type',
      {'type':'@type'}
    );
  }])