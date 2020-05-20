(function (angular, loadCrmForm, getCrmUrl) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetailsLinkedCasesTab', function () {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: '~/civicase/case/details/linked-cases-tab/directives/case-details-linked-cases-tab.directive.html',
      controller: 'civicaseCaseDetailsLinkedCasesTabController'
    };
  });

  module.controller('civicaseCaseDetailsLinkedCasesTabController', civicaseCaseDetailsLinkedCasesTabController);

  /**
   * Linked Cases Tab Controller.
   *
   * @param {object} $scope the scope object.
   * @param {object} LinkCasesCaseAction the link case action service.
   */
  function civicaseCaseDetailsLinkedCasesTabController ($scope, LinkCasesCaseAction) {
    $scope.linkCase = linkCase;

    /**
     * Opens a modal that allows the user to link the case stored in the scope with
     * one choosen by the user.
     *
     * The case details are refreshed after linking the cases.
     */
    function linkCase () {
      var linkCaseForm = LinkCasesCaseAction.doAction([$scope.item]);

      loadCrmForm(getCrmUrl(linkCaseForm.path, linkCaseForm.query))
        .on('crmFormSuccess crmPopupFormSuccess', function () {
          $scope.refresh();
        });
    }
  }
})(angular, CRM.loadForm, CRM.url);
