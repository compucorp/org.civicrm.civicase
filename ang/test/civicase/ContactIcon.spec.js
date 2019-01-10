/* eslint-env jasmine */

(function (_) {
  describe('ContactPopoverContent', function () {
    var $controller, $rootScope, $scope, contactsDataServiceMock;
    var expectedContactIcon = 'Individual';

    beforeEach(module('civicase', function ($provide) {
      contactsDataServiceMock = jasmine.createSpyObj('contactsDataService', ['getContactIconOf']);
      contactsDataServiceMock.getContactIconOf.and.returnValue(expectedContactIcon);

      $provide.value('ContactsCache', contactsDataServiceMock);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
      initController();
    });

    describe('when the directive initializes', function () {
      it('requests the icon data for the contact', function () {
        expect(contactsDataServiceMock.getContactIconOf).toHaveBeenCalledWith($scope.contactId);
      });

      it('stores the icon data', function () {
        expect($scope.contactIcon).toBe(expectedContactIcon);
      });
    });

    function initController () {
      $scope = $rootScope.$new();
      $scope.contactId = _.uniqueId();

      $controller('civicaseContactIconController', { $scope: $scope });
    }
  });
})(CRM._);
