/* eslint-env jasmine */
(function (_) {
  describe('ContactsCache', function () {
    var $q, $rootScope, ContactsCache, ContactsData, crmApi;

    beforeEach(function () {
      module('civicase', 'civicase.data');
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _ContactsCache_, _ContactsData_, _crmApi_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      ContactsCache = _ContactsCache_;
      ContactsData = _.cloneDeep(_ContactsData_);
      crmApi = _crmApi_;
    }));

    describe('basic tests', function () {
      it('has the correct interface', function () {
        expect(ContactsCache).toEqual(jasmine.objectContaining({
          add: jasmine.any(Function),
          getImageUrlOf: jasmine.any(Function),
          getContactIconOf: jasmine.any(Function),
          getCachedContact: jasmine.any(Function)
        }));
      });
    });

    describe('add()', function () {
      var expectedApiParams;

      beforeEach(function () {
        crmApi.and.returnValue($q.resolve({
          values: []
        }));
        expectedApiParams = {
          'sequential': 1,
          'options': { 'limit': 0 },
          'return': [
            'birth_date',
            'city',
            'contact_type',
            'display_name',
            'email',
            'gender_id',
            'image_URL',
            'postal_code',
            'state_province',
            'street_address',
            'tag'
          ],
          'api.Phone.get': {
            'contact_id': '$value.id',
            'phone_type_id.name': { 'IN': [ 'Mobile', 'Phone' ] },
            'return': [ 'phone', 'phone_type_id.name' ]
          },
          'api.GroupContact.get': {
            'contact_id': '$value.id',
            'return': [ 'title' ]
          },
          'api.EntityTag.get': {
            'entity_table': 'civicrm_contact',
            'entity_id': '$value.id',
            'return': [ 'tag_id.name', 'tag_id.description', 'tag_id.color' ]
          }
        };
      });

      describe('when called for the first time', function () {
        beforeEach(function () {
          _.extend(expectedApiParams, { 'id': { 'IN': ContactsData.values } });

          ContactsCache.add(ContactsData.values);
        });

        it('gets the details of sent contacts', function () {
          expect(crmApi).toHaveBeenCalledWith('Contact', 'get', expectedApiParams);
        });
      });

      describe('when called from second time onwards', function () {
        var contactsForTheFirstCall, contactsForTheSecondCall;

        beforeEach(function () {
          contactsForTheFirstCall = [ContactsData.values[0]];
          ContactsCache.add(contactsForTheFirstCall);
          contactsForTheSecondCall = [ContactsData.values[1]];

          _.extend(expectedApiParams, { 'id': { 'IN': contactsForTheSecondCall } });
          ContactsCache.add(contactsForTheSecondCall);
        });

        it('gets the details of new contacts only', function () {
          expect(crmApi.calls.mostRecent().args).toEqual(['Contact', 'get', expectedApiParams]);
        });
      });

      describe('when called again before first calls data is not returned', function () {
        var contactsForTheFirstCall;
        var promise1, promise2;

        beforeEach(function () {
          contactsForTheFirstCall = [ContactsData.values[0]];
          promise1 = ContactsCache.add(contactsForTheFirstCall);
          promise2 = ContactsCache.add(contactsForTheFirstCall);
        });

        it('second call waits for the first one to finish', function () {
          expect(promise1).toEqual(promise2);
        });
      });
    });

    describe('getCachedContact()', function () {
      var expectedContact, returnedContact;

      describe('when the contact exists', function () {
        beforeEach(function () {
          var phones;
          ContactsData.values[0].tags = 'tag1,tag2,tag3';

          crmApi.and.returnValue($q.resolve(ContactsData));
          ContactsCache.add(ContactsData.values);
          $rootScope.$digest();

          expectedContact = _.cloneDeep(ContactsData.values[0]);
          expectedContact.tags = expectedContact.tags.split(',').join(', ');
          phones = _.indexBy(expectedContact['api.Phone.get'].values, 'phone_type_id.name');

          expectedContact.mobile = phones['Mobile'];
          expectedContact.phone = phones['Phone'];
          expectedContact.groups = _.map(expectedContact['api.GroupContact.get'].values, 'title').join(', ');

          delete expectedContact['api.Phone.get'];
          delete expectedContact['api.GroupContact.get'];

          returnedContact = ContactsCache.getCachedContact(ContactsData.values[0].contact_id);
        });

        it('returns the cached contact', function () {
          expect(returnedContact).toEqual(expectedContact);
        });
      });

      describe('when the contact does not exist', function () {
        beforeEach(function () {
          crmApi.and.returnValue($q.resolve(ContactsData));
          ContactsCache.add(ContactsData.values);
          $rootScope.$digest();

          returnedContact = ContactsCache.getCachedContact(_.random(100, 1000));
        });

        it('returns null', function () {
          expect(returnedContact).toEqual(null);
        });
      });
    });

    describe('getImageUrlOf()', function () {
      var returnValue;

      beforeEach(function () {
        crmApi.and.returnValue($q.resolve(ContactsData));
        ContactsCache.add(ContactsData.values);
        $rootScope.$digest();
        returnValue = ContactsCache.getImageUrlOf(ContactsData.values[0].contact_id);
      });

      it('gets the image url of sent contact id', function () {
        expect(returnValue).toBe(ContactsData.values[0].image_URL);
      });
    });

    describe('getContactIconOf()', function () {
      var returnValue;

      beforeEach(function () {
        crmApi.and.returnValue($q.resolve(ContactsData));
        ContactsCache.add(ContactsData.values);
        $rootScope.$digest();
        returnValue = ContactsCache.getContactIconOf(ContactsData.values[0].contact_id);
      });

      it('gets the contact type of sent contact id', function () {
        expect(returnValue).toBe(ContactsData.values[0].contact_type);
      });
    });
  });
})(CRM._);
