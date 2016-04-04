'use strict';

angular.module('commonServices', [ 'constant' ])
  .factory('LanguageCountry', [
    '$translate',
    'ipCookie',
    'SupportLanguage',
    'SupportCountry',
    function($translate, ipCookie, SupportLanguage, SupportCountry){
      var language = {
        selected: '',
        supportList: SupportLanguage,
        init: function(def){
          this.set(def, true);
          return this;
        },
        get: function(){
          return this.selected;
        },
        getList: function(lang){
          return lang ? this.supportList[lang] : this.supportList[this.selected];
        },
        set: function(lang){
          if(!lang && navigator.language) {
            lang = navigator.language.substr(0,2) || 'en';
          }
          if(!this.supportList[lang]) {
            lang = 'en';
          }
          
          $translate.use(lang);
          moment.lang(lang);
          this.selected = lang;
        },
        isSet: function(){
          return this.selected ? true : false;
        }
      };
      
      var country = {
        selected: '',
        supportList: SupportCountry,
        init: function(def){
          this.set(def);
          return this;
        },
        get: function(){
          return this.selected ? this.selected : 'us';
        },
        getList: function(country){
          return country ? this.supportList[country] : this.supportList[this.selected];
        },
        set: function(country){
          if(!country && navigator.language) {
            country = navigator.language.substr(3,5) || 'us';
          }
          if(!this.supportList[country]) {
            country = 'us';
          }
          this.selected = country;
        },
        isSet: function(){
          return this.selected ? true : false;
        }
      };

      return {country: country, language: language};
    }
  ])
  
  .factory('Channel', [
    'AppInfo', '$resource', '$filter', 'ipCookie',
    function(AppInfo, $resource, $filter, ipCookie) {
      return {
        value: '',
        list: [],
        init: function(def){
          this.getList();
          this.set(def);
          return this;
        },
        getList: function(){
          var self = this;
          var Channels = $resource(AppInfo.api.baseUrl+'/'+AppInfo.appname+'/hanasees/channels');
          new Channels.get({}, function(res){
            res.Channels = $filter('orderBy')(res.Channels, 'order');
            self.list = res.Channels;
          });
        },
        get: function(){
          return this.value;
        },
        set: function(val){
          if(!val) {
            val = 'all';
          }
          this.value = val;
        },
        isSet: function(){
          return this.value ? true : false;
        }
      }
    }
  ]);
