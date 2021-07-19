(function () {
  var module = angular.module('civicase.data');
  CRM['civicase-base'].caseStatuses = {
    1: {
      color: '#42afcb',
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Ongoing',
      name: 'Open',
      value: '1',
      weight: '1'
    },
    2: {
      color: '#4d5663',
      filter: '0',
      grouping: 'Closed',
      is_active: '1',
      label: 'Resolved',
      name: 'Closed',
      value: '2',
      weight: '2'
    },
    3: {
      color: '#e6807f',
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Urgent',
      name: 'Urgent',
      value: '3',
      weight: '3'
    },
    4: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Enquiry',
      name: 'enquiry',
      value: '4',
      weight: '4'
    },
    5: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Qualified',
      name: 'qualified',
      value: '5',
      weight: '5'
    },
    6: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'In progress',
      name: 'in_progress',
      value: '6',
      weight: '6'
    },
    7: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Submitted',
      name: 'submitted',
      value: '7',
      weight: '7'
    },
    8: {
      filter: '0',
      grouping: 'Closed',
      is_active: '1',
      label: 'Won',
      name: 'won',
      value: '8',
      weight: '8'
    },
    9: {
      filter: '0',
      grouping: 'Closed',
      is_active: '1',
      label: 'Lost',
      name: 'lost',
      value: '9',
      weight: '9'
    },
    10: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Sample Status',
      name: 'Sample Status',
      value: '10',
      weight: '10'
    },
    11: {
      filter: '0',
      grouping: 'Opened',
      is_active: '1',
      label: 'Sample Status 2',
      name: 'Sample Status 2',
      value: '11',
      weight: '11'
    }
  };

  module.constant('CaseStatuses', {
    values: CRM['civicase-base'].caseStatuses
  });
}());
