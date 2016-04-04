'use strict';

angular.module('commentCtrls', ['commentServices'])
  .controller('CommentCtrl', [ '$rootScope', '$scope', '$filter', 'Comment', 'CommentsLoader',
    function($rootScope, $scope, $filter, Comment, CommentsLoader){
      $scope.comentsInit = function(url, filter){
        $rootScope.comments = {
          url: url,
          order: '-created',
          data: [],
          paging: {
            limit: 20,
            cursor: ''
          },
          isLoad: false
        };
        angular.extend($scope.comments, $scope.oAuth.token.pair);
        if(!url) {
          $scope.isCommentSave = true;
          $scope.comments.isLoad = true;
          $scope.global.mainLoadingFlag = false;
          return false;
        }
        
        $scope.commentWrite = {
          url: url
        };
        angular.extend($scope.commentWrite, $scope.oAuth.token.pair);
        
        if(angular.isArray(filter) && filter.length === 2 && filter[1]) {
          $scope.commentWrite[filter[0]] = filter[1].toString();
          $scope.comments.filter = {};
          $scope.comments.filter[filter[0]] = filter[1].toString();
        }

        if($scope.global.sessSigninComplate) {
          $scope.commentListLoad();
        }
      };
      
      $scope.$on('COMMENT_RELOAD', function(event, args){
        $scope.comments.data = [];
        $scope.comments.paging.cursor = '';
        $scope.comments.isLoad = false;
        $scope.commentListLoad();
      });
      
      $scope.commentListLoad = function(){
        if($scope.comments.data.length>0 && !!$scope.comments.paging.cursor) { return false; }
        if($scope.comments.isLoad) {
          $scope.global.mainLoadingFlag = false;
          return false;
        }
        $scope.global.mainLoadingFlag = true;
        $scope.comments.isLoad = true;
        
        new CommentsLoader($scope.comments).then(
          function(res){
            if(res.Comments) {
              for(var i in res.Comments) {
                res.Comments[i].likeCount = res.Comments[i].likeCount ? parseInt(res.Comments[i].likeCount) : 0;
                res.Comments[i].liked = $.inArray(res.Comments[i].cid, res.Liked) > -1 ? true : false;
                res.Comments[i].linky = res.Comments[i].content && res.Comments[i].content.indexOf($scope.appInfo.currentHost)>-1 ? '_self' : '_blank';
              }
              //res.Comments = $filter('orderBy')(res.Comments, $scope.comments.order);
              $scope.comments.data = $scope.comments.data.concat(res.Comments);
              $scope.comments.paging.cursor = res.cursor;
            }
            
            $scope.comments.isLoad = false;
            $scope.global.mainLoadingFlag = false;
            $rootScope.$broadcast('COMMENT_LOADED', $scope.comments);
          }
        );
      };

      $scope.isCommentSave = false;
      $scope.commentSave = function(){
        if($scope.isCommentSave) {return false;}
        $scope.isCommentSave = true;

        new Comment.save(
          $scope.commentWrite,
          function(res){
            var data = res.Comments;

            if($scope.comments.order === '-created') {
              $scope.comments.data.unshift(data);
            } else if($scope.comments.limit > $scope.comments.data.length){
              $scope.commentListLoad();
            }
            $scope.commentWrite.content = '';
            $scope.isCommentSave = false;
            
            $rootScope.$broadcast('COMMENT_SAVE', $scope.comments);
          },
          function(res){
            $scope.isCommentSave = false;
          }
        );
      };
      
      $scope.commentDelete = function(url, cid){
        if(confirm('삭제 하시겠습니까?')) {
          var key = {
            url: url,
            cid: cid
          };
          angular.extend(key, $scope.oAuth.token.pair);
          new Comment.delete(
            key,
            function(){
              var idx = -1;
              for(var i in $scope.comments.data) {
                if($scope.comments.data[i].url.toString() === key.url.toString() && $scope.comments.data[i].cid.toString()===key.cid.toString()) {
                  idx = i;
                }
              }
              var deleted = null;
              if(idx > -1) {
                deleted = $scope.comments.data.splice(idx, 1);
              }
              $rootScope.$broadcast('COMMENT_DELETE', angular.extend({deleted:deleted?deleted[0]:null}, $scope.comments));
            },
            function(res){
              if(res.status === '401') {
                $scope.moveSign('signin');
              }
            }
          );
        }
      };
      
      $scope.isLike = false;
      $scope.likeAction = function(idx){
        if($scope.isLike) {return false;}
        $scope.isLike = true;
        
        var comment = $scope.comments.data[idx];
        var param =  {
          url: comment.url,
          cid: comment.cid,
          action: comment.liked?'unlike':'like'
        };
        angular.extend(param, $scope.oAuth.token.pair);
        comment.liked = !comment.liked;
        new Comment.save(
          param,
          function(res){
            comment.likeCount = res.Comment.likeCount;
            $scope.isLike = false;
          },
          function(res){
            comment.liked = !comment.liked;
            switch(res.status){
              case 401:
                $scope.moveSign('signin');
                break;
              case 500:
                comment.liked = true;
                break;
            }
            $scope.isLike = false;
          }
        );
      };
    }
  ]);
