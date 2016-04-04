'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('filters'));


  describe('orderObjectBy', function() {

    it('object의 order속성으로 정렬', inject(function(orderObjectByFilter) {
      var input = {
        'new': {'name': '새 글', 'order':3},
        'trends': {'name':'트랜드', 'order':1},
        'best': {'name': '베스트', 'order':2},
        'mine': {'name': '내가 올린 사연', 'hide':true, 'order':4}
      };
      var attribute = 'order';
      expect((orderObjectByFilter(input, attribute)[0].order)).toEqual(1);
    }));
  });
});
