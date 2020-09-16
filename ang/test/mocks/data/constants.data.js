((angular) => {
  const module = angular.module('civicase.data');

  CRM['civicase-base'].allowMultipleCaseClients = true;
  CRM['civicase-base'].allowCaseLocks = false;
  CRM['civicase-base'].currentCaseCategory = 'cases';
  CRM['civicase-base'].showFullContactNameOnActivityFeed = true;
  CRM['civicase-base'].includeActivitiesForInvolvedContact = true;
  CRM['civicase-base'].caseCategoryWebformSettings = {
    cases: { newCaseWebformClient: 'cid', newCaseWebformUrl: '/cases' },
    Prospecting: { newCaseWebformClient: 'cid', newCaseWebformUrl: '/prospects' }
  };

  module.config(($provide) => {
    $provide.constant('dateInputFormatValue', CRM.config.dateInputFormat);
    $provide.constant('allowMultipleCaseClients', CRM['civicase-base'].allowMultipleCaseClients);
    $provide.constant('allowCaseLocks', CRM['civicase-base'].allowCaseLocks);
    $provide.constant('currentCaseCategory', CRM['civicase-base'].currentCaseCategory);
    $provide.constant('caseCategoryWebformSettings', CRM['civicase-base'].caseCategoryWebformSettings);
    $provide.constant('includeActivitiesForInvolvedContact', CRM['civicase-base'].includeActivitiesForInvolvedContact);
    $provide.constant('showFullContactNameOnActivityFeed', CRM['civicase-base'].showFullContactNameOnActivityFeed);
  });
})(angular);
