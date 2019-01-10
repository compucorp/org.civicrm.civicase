(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseTabAffix', function ($rootScope, $timeout) {
    return {
      scope: {},
      link: civicaseCaseTabAffix
    };

    /**
     * Link function for civicaseCaseTabAffix
     *
     * @param {Object} scope
     * @param {Object} $el
     * @param {Object} attrs
     */
    function civicaseCaseTabAffix (scope, $el, attrs) {
      var $caseNavigation = $('.civicase__case-body_tab');
      var $toolbarDrawer = $('#toolbar');
      var $casePanelBody = $('.civicase__case-details-panel > .panel-body');
      var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus

      $rootScope.$on('civicase::case-search::dropdown-toggle', function () {
        $timeout(function () {
          // Reset right case view tab header
          if ($caseNavigation.data('bs.affix')) {
            $caseNavigation.data('bs.affix').options.offset.top = $casePanelBody.offset().top - bodyPadding;
          }
        });
      });

      $timeout(function () {
        $caseNavigation.affix({
          offset: {
            top: $casePanelBody.offset().top - bodyPadding
          }
        }).on('affixed.bs.affix', function () {
          var caseNavigationTopPosition = $toolbarDrawer.is(':visible')
            ? $toolbarDrawer.height()
            : bodyPadding;

          $caseNavigation.css('top', caseNavigationTopPosition);
        }).on('affixed-top.bs.affix', function () {
          $caseNavigation.css('top', 'auto');
        });
      });
    }
  });
})(angular, CRM.$, CRM._);
