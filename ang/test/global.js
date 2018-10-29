/* eslint-env jasmine */

(function (CRM) {
  CRM.civicase = {};
  CRM.angular = { requires: {} };
  /**
   * Dependency Injection for civicase module, defined in ang/civicase.ang.php
   * For unit testing they needs to be mentioned here
   */
  CRM.angular.requires['civicase'] = ['crmAttachment', 'crmUi', 'crmUtil', 'ngRoute', 'angularFileUpload', 'bw.paging', 'crmRouteBinder', 'crmResource', 'ui.bootstrap', 'uibTabsetClass', 'dialogService'];

  CRM.loadForm = jasmine.createSpy('loadForm');
  CRM.url = jasmine.createSpy('url');
}(CRM));
