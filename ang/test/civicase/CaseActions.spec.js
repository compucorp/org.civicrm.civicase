/* eslint-env jasmine */

describe('Case Actions', function () {
  var $compile, $rootScope;

  beforeEach(module('civicase'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  describe('basic tests', function () {
    var element;

    beforeEach(function () {
      element = $compile('<div civicase-case-actions=[]></div>')($rootScope);
      $rootScope.$digest();
    });

    it('complies the Action directive', function () {
      expect(element.html()).toContain('ng-repeat="action in caseActions');
    });
  });
});
