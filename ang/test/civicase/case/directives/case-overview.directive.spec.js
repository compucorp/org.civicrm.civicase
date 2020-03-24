/* eslint-env jasmine */
(function ($, _) {
  describe('CaseOverview', function () {
    var $compile, $provide, $q, $rootScope, $scope, BrowserCache,
      CasesOverviewStats, crmApi, element, targetElementScope,
      CaseStatus;

    beforeEach(module('civicase.data', 'civicase', 'civicase.templates', function (_$provide_) {
      $provide = _$provide_;
    }));

    beforeEach(inject(function (_$compile_, _$q_, _$rootScope_, BrowserCacheMock, _crmApi_, _CasesOverviewStatsData_, _CaseStatus_) {
      $compile = _$compile_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      crmApi = _crmApi_;
      CasesOverviewStats = _CasesOverviewStatsData_.get();
      BrowserCache = BrowserCacheMock;
      CaseStatus = _CaseStatus_;

      BrowserCache.get.and.returnValue([1, 3]);
      $provide.value('BrowserCache', BrowserCache);
      crmApi.and.returnValue($q.resolve([CasesOverviewStats]));
    }));

    beforeEach(function () {
      $scope.caseStatuses = CaseStatus.getAll();
      $scope.summaryData = [];
    });

    beforeEach(function () {
      listenForCaseOverviewRecalculate();
      compileDirective({});
    });

    describe('compile directive', function () {
      it('should have class civicase__case-overview-container', function () {
        expect(element.html()).toContain('civicase__case-overview-container');
      });
    });

    describe('caseListLink', function () {
      it('checks the output of caseListLink function', function () {
        expect(element.isolateScope().caseListLink('type', 'status')).toEqual('#/case/list?cf=%7B%22case_type_id%22%3A%5B%22type%22%5D%2C%22status_id%22%3A%5B%22status%22%5D%7D');
      });
    });

    describe('Case Types', function () {
      beforeEach(function () {
        crmApi.and.returnValue($q.resolve([CasesOverviewStats]));
        compileDirective({ caseTypeCategory: 'cases', caseTypeID: [1, 2] });
      });

      it('fetches the active case types', function () {
        expect(crmApi).toHaveBeenCalledWith('CaseType', 'get', {
          sequential: 1,
          case_type_category: 'cases',
          id: [1, 2],
          is_active: '1'
        });
      });
    });

    describe('Case Status Data', function () {
      beforeEach(function () {
        crmApi.and.returnValue($q.resolve([CasesOverviewStats]));
        compileDirective({
          caseTypeCategory: 'cases',
          caseTypeID: [1, 2],
          status_id: '1'
        });
      });

      it('fetches the case statistics, but shows all case statuses', function () {
        expect(crmApi).toHaveBeenCalledWith([['Case', 'getstats', {
          'case_type_id.case_type_category': 'cases',
          case_type_id: [1, 2]
        }]]);
      });
    });

    describe('Case Status', function () {
      describe('when the component loads', function () {
        it('requests the case status that are hidden stored in the browser cache', function () {
          expect(BrowserCache.get).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', []);
        });

        it('hides the case statuses marked as hidden by the browser cache', function () {
          expect($scope.caseStatuses[1].isHidden).toBe(true);
          expect($scope.caseStatuses[3].isHidden).toBe(true);
        });
      });

      describe('when marking a status as hidden', function () {
        beforeEach(function () {
          $scope.caseStatuses[1].isHidden = true;
          $scope.caseStatuses[2].isHidden = false;
          $scope.caseStatuses[3].isHidden = true;

          element.isolateScope().toggleStatusVisibility($.Event(), 1); // disables the case status #2
        });

        it('stores the hidden case statuses including the new one', function () {
          expect(BrowserCache.set).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', ['1', '2', '3']);
        });
      });

      describe('when marking a status as enabled', function () {
        beforeEach(function () {
          $scope.caseStatuses[1].isHidden = true;
          $scope.caseStatuses[2].isHidden = false;
          $scope.caseStatuses[3].isHidden = true;

          element.isolateScope().toggleStatusVisibility($.Event(), 0); // enables the case status #1
        });

        it('stores the hidden case statuses including the new one', function () {
          expect(BrowserCache.set).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', ['3']);
        });
      });
    });

    describe('when showBreakdown is false', function () {
      beforeEach(function () {
        element.isolateScope().showBreakdown = false;
      });

      describe('when toggleBrekdownVisibility is called', function () {
        beforeEach(function () {
          element.isolateScope().toggleBrekdownVisibility();
        });

        it('resets showBreakdown to true', function () {
          expect(element.isolateScope().showBreakdown).toBe(true);
        });
      });
    });

    describe('when showBreakdown is true', function () {
      beforeEach(function () {
        element.isolateScope().showBreakdown = true;
      });

      describe('when toggleBrekdownVisibility is called', function () {
        beforeEach(function () {
          element.isolateScope().toggleBrekdownVisibility();
        });

        it('resets showBreakdown to false', function () {
          expect(element.isolateScope().showBreakdown).toBe(false);
        });
      });
    });

    describe('showBreakdown watcher', function () {
      it('emit called and targetElementScope to be defined', function () {
        expect(targetElementScope).toEqual(element.isolateScope());
      });
    });

    /**
     * Initialise directive.
     *
     * @param {string} params the case type category name.
     */
    function compileDirective (params) {
      $scope.caseFilter = {
        'case_type_id.case_type_category': params.caseTypeCategory,
        case_type_id: params.caseTypeID
      };
      element = $compile('<civicase-case-overview case-filter="caseFilter"></civicase-case-overview>')($scope);
      $scope.$digest();
    }

    /**
     * Listen for `civicase::custom-scrollbar::recalculate` event
     */
    function listenForCaseOverviewRecalculate () {
      $rootScope.$on('civicase::custom-scrollbar::recalculate', function (event) {
        targetElementScope = event.targetScope;
      });
    }
  });
})(CRM.$, CRM._);
