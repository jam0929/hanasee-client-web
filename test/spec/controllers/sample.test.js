'use strict';

describe('Controller: SampleCtrl', function(){
  var scope, SampleCtrl;//we'll use this scope in our tests

  //mock Application to allow us to inject our own dependencies
  beforeEach(angular.mock.module('sampleCtrls'));
  //mock the controller for the same reason and include $rootScope and $controller
  beforeEach(angular.mock.inject(function($rootScope, $controller){
    //create an empty scope
    scope = $rootScope.$new();
    //declare the controller and inject our empty scope
    SampleCtrl = $controller('SampleCtrl', {$scope: scope});
  }));
  
  // tests start here
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});