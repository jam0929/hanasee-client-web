'use strict';

/* E2E 테스트 */

describe('AngularJS 어플리케이션', function() {
console.log('-------------------------start-------------------------');
  
  describe('페이지 접속', function() {
    beforeEach(function() {
      browser().navigateTo('/');
    });
  
    it('특별한 해시값을 지정하지 않을 경우 자동으로 메인으로 이동', function() {
      expect(browser().window().hash()).toBe("/ssuls/onair/trends");
    });
  });
  
  describe('페이지 접속 확인', function() {
    
  });
  
  describe('로그인 메뉴들 로그인으로 이동하는지 확인', function() {
    
  });
  
  describe('회원가입으로 이동', function() {
    
  });
  
  describe('회원가입', function() {
    it('메인 페이지인지 확인', function() {
    });
    
    it('로그인 상태인지 확인', function() {
    });
  });
  
  describe('세션 로그인', function() {
    
  });
  
  describe('로그아웃', function() {
    
  });
  
  describe('로그인', function() {
    it('메뉴 클릭', function() {
      element('.tab-bar .left-off-canvas-toggle').click();
      expect(element('.off-canvas-wrap').attr('class')).toContain('move-right');
    });
    
    it('로그인 페이지로', function() {
      element('a[href="#/signin"]').click();
      expect(browser().window().hash()).toBe("/signin");
    });
    
    it('로그인', function() {
      input('userInfo.email').enter('qw@qw.com');
      input('userInfo.password').enter('qw');

      element('form button[type=submit]').click();
      expect(browser().window().hash()).toBe("/ssuls/onair/trends");
    });
  });

});