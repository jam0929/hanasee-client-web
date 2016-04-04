'use strict';

angular.module('filters', [])
  .filter('orderObjectBy', function(){
    return function(input, attribute) {
      if (!angular.isObject(input)) { return input; }
    
      var array = [];
      for(var objectKey in input) {
        input[objectKey].key = objectKey;
        array.push(input[objectKey]);
      }
      
      array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
      });

      return array;
    };
  })
  .filter('timeago', function(){
    return function(timestamp){
      return moment(parseInt(timestamp)/1000, 'X').fromNow();
    };
  })
  
  .filter('base62Encode', function(){
    var buf = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return function(value){
      var num = parseInt(value);
      if(num < 62) {return value;}
      var rtn = '';
      
      while(num>62){
        rtn += buf[num%62];
        num = Math.floor(num/62);
      }
      rtn += buf[num];
      return rtn.split('').reverse().join('');
    };
  })
  .filter('base62Decode', function(){
    var buf = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return function(value){
      var arr = value.split('').reverse().join('');
      var rtn = 0;

      for(var i in arr) {
        for(var j in buf) {
          if(buf[j] === arr[i]) {
            rtn += j*Math.pow(62, i);
            break;
          }
        }
      }
      return rtn;
    };
  })
  .filter('trustedResource', ['$sce', function($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  }]);