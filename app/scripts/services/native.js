'use strict';

angular.module('nativeServices', [ 'ngResource' ])
  .factory('Noti', [ 'AppInfo', '$resource', function(AppInfo, $resource) {
    return $resource(AppInfo.api.baseUrl+'/devices');
  }])
  
  .factory('NativeFunc', ['Noti', 'AppInfo', function(Noti, AppInfo){
    return {
      'notiRegist': function(deviceInfo, username, marketUrl){
        var self = this;
        var device = deviceInfo ? deviceInfo : JSON.parse(window.android.getRegId());
        
        var param = {
          appName: AppInfo.appname,
          regId: device.reg_id,
          deviceId: device.device_id,
        };
        
        new Noti.save(param, function(res) {
          /*
          if(res.insertId > 0) {
            var data = {
              'type': 'text',
              'storyPostText': username+'님이 \''+AppInfo.title+'\'앱을 시작하셨습니다.\n\n안드로이드 다운로드\n'+marketUrl
            };
            self.uploadStroryPost(data, null, '앱으로 가기', '/list/trends', '');
          }
          */
        });
      },
      'uploadStroryPost': function(data, img, title, href, callback){
        var vars = [];
        if(img) {
          vars = [
            {
              'type' : 'image',
              'value' : img.split('|')[0],
              'x' : 0,
              'y' : 0
            }
          ];
        }
        
        window.android.kakaoStoryUpload(
          data.storyPostText,
          img ? JSON.stringify(vars) : null, //img url
          title,
          '#'+href,
          callback //callback AppInfo 테스트 필요
        );
      }
    };
  }]);