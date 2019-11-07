/* eslint-env jasmine */

(function (_) {
  describe('AddActivityMenu', function () {
    describe('Add Activity Menu Controller', function () {
      var $controller, $rootScope, $scope, CaseType, ActivityType;

      beforeEach(module('civicase', 'civicase.data'));

      beforeEach(inject(function (_$controller_, _$rootScope_, _CaseType_, _ActivityType_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        ActivityType = _ActivityType_;
        CaseType = _CaseType_;
      }));

      describe('creating the activity count', function () {
        var expectedActivityCount;

        beforeEach(function () {
          var activityTypeIds = [_.uniqueId(), _.uniqueId(), _.uniqueId()];
          var mockCase = {
            case_type_id: 1,
            allActivities: [
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[1] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[1] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[2] }
            ]
          };
          expectedActivityCount = {};
          expectedActivityCount[activityTypeIds[0]] = 3;
          expectedActivityCount[activityTypeIds[1]] = 2;
          expectedActivityCount[activityTypeIds[2]] = 1;

          initController(mockCase);
        });

        it('creates a list of activity counts', function () {
          expect($scope.case.activity_count).toEqual(expectedActivityCount);
        });
      });

      describe('activity menu', function () {
        var activityTypeWithMaxInstance, activityTypeExceedingMaxInstanceIsHidden;

        beforeEach(function () {
          var activityTypes = CaseType.getAll()[1].definition.activityTypes;
          activityTypeWithMaxInstance = activityTypes.find(function (activity) {
            return activity.max_instances;
          });
          var actTypeId = _.findKey(ActivityType.getAll(), {
            name: activityTypeWithMaxInstance.name
          });
          var mockCase = {
            case_type_id: 1,
            allActivities: [
              { id: _.uniqueId(), activity_type_id: actTypeId }
            ]
          };

          initController(mockCase);

          activityTypeExceedingMaxInstanceIsHidden = !_.find($scope.availableActivityTypes, function (activityType) {
            return activityType.name === activityTypeWithMaxInstance.name;
          });
        });

        it('hides activity types exceeding max instance', function () {
          expect(activityTypeExceedingMaxInstanceIsHidden).toBe(true);
        });
      });

      /**
       * Initializes the add activity menu controller.
       *
       * @param {object} caseData a sample case to pass to the controller.
       */
      function initController (caseData) {
        $scope = $rootScope.$new();
        $scope.case = caseData;

        $controller('civicaseAddActivityMenuController', {
          $scope: $scope
        });
      }
    });
  });
})(CRM._);
