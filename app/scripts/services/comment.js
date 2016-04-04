'use strict';

angular.module('commentServices', [ 'ngResource' ])
  .factory('Comment', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/comments/:url/:cid/:action',
      {'url':'@url', 'cid':'@cid', 'action':'@action'}
    );
  }])
  .factory('CommentsLoader', [ 'Comment', '$q', function(Comment, $q) {
    return function(comment) {
      var param = {
        order: comment.order,
        url: comment.url,
        limit: comment.paging.limit,
        cursor: comment.paging.cursor,
        access_token: comment.access_token,
        token_type: comment.token_type
      };
      
      if(comment.filter) {
        param.filter = comment.filter;
      }
      
      var delay = $q.defer();
      Comment.get(param, function(res) {
        delay.resolve(res);
      }, function(res) {
        delay.reject(res);
      });
      return delay.promise;
    };
  }]);
