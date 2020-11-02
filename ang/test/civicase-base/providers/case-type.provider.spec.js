/* eslint-env jasmine */

((_) => {
  describe('Case Type', () => {
    let CaseType, CaseTypesData;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject((_CaseType_, _CaseTypesMockData_) => {
      CaseType = _CaseType_;
      CaseTypesData = _CaseTypesMockData_.get();
    }));

    describe('when getting all case types', () => {
      let returnedCaseTypes;

      beforeEach(() => {
        returnedCaseTypes = CaseType.getAll();
      });

      it('returns all the case types', () => {
        expect(returnedCaseTypes).toEqual(CaseTypesData);
      });
    });

    describe('when getting the titles for case types using their name', () => {
      let returnedTitles;

      beforeEach(() => {
        returnedTitles = CaseType.getTitlesForNames([
          'housing_support',
          'adult_day_care_referral'
        ]);
      });

      it('returns the title for the given case types', () => {
        expect(returnedTitles).toEqual([
          'Housing Support',
          'Adult Day Care Referral'
        ]);
      });
    });

    describe('when getting a case type by id', () => {
      let expectedCaseType, returnedCaseType;

      beforeEach(() => {
        const caseTypeId = _.chain(CaseTypesData).keys().sample().value();
        expectedCaseType = CaseTypesData[caseTypeId];
        returnedCaseType = CaseType.getById(caseTypeId);
      });

      it('returns the matching case type', () => {
        expect(returnedCaseType).toEqual(expectedCaseType);
      });
    });

    describe('when getting all roles for the given case type category id', () => {
      let expectedResult, returnedResult;

      beforeEach(() => {
        const casesCategoryId = '1';
        expectedResult = [
          { name: 'Homeless Services Coordinator', id: '11' },
          { name: 'Health Services Coordinator', id: '12' },
          { name: 'Benefits Specialist', id: '14' },
          { name: 'Senior Services Coordinator', id: '16' }
        ];
        returnedResult = CaseType.getAllRolesByCategoryID(casesCategoryId);
      });

      it('returns all the unique case roles', () => {
        expect(returnedResult).toEqual(expectedResult);
      });
    });
  });
})(CRM._);
