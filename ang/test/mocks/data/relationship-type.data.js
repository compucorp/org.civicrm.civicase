((_) => {
  var module = angular.module('civicase.data');

  var relationshipTypes = {
    17: {
      id: '17',
      name_a_b: 'Application Manager is',
      label_a_b: 'Application Manager is',
      name_b_a: 'Application Manager',
      label_b_a: 'Application Manager',
      description: 'Application Manager',
      is_active: '1'
    },
    14: {
      id: '14',
      name_a_b: 'Benefits Specialist is',
      label_a_b: 'Benefits Specialist is',
      name_b_a: 'Benefits Specialist',
      label_b_a: 'Benefits Specialist',
      description: 'Benefits Specialist',
      contact_type_a: 'Individual',
      contact_type_b: 'Individual',
      is_reserved: '0',
      is_active: '1'
    },
    12: {
      id: '12',
      name_a_b: 'Health Services Coordinator is',
      label_a_b: 'Health Services Coordinator is',
      name_b_a: 'Health Services Coordinator',
      label_b_a: 'Health Services Coordinator',
      description: 'Health Services Coordinator',
      contact_type_a: 'Individual',
      contact_type_b: 'Individual',
      is_reserved: '0',
      is_active: '1'
    },
    11: {
      id: '11',
      name_a_b: 'Homeless Services Coordinator is',
      label_a_b: 'Homeless Services Coordinator is',
      name_b_a: 'Homeless Services Coordinator',
      label_b_a: 'Homeless Services Coordinator',
      description: 'Homeless Services Coordinator',
      contact_type_a: 'Individual',
      contact_type_b: 'Individual',
      is_reserved: '0',
      is_active: '1'
    },
    16: {
      id: '16',
      name_a_b: 'Senior Services Coordinator is',
      label_a_b: 'Senior Services Coordinator is',
      name_b_a: 'Senior Services Coordinator',
      label_b_a: 'Senior Services Coordinator',
      description: 'Senior Services Coordinator',
      contact_type_a: 'Individual',
      contact_type_b: 'Individual',
      is_reserved: '0',
      is_active: '1'
    }
  };

  (() => {
    CRM['civicase-base'].relationshipTypes = _.cloneDeep(relationshipTypes);
  })();

  module.service('RelationshipTypeData', function () {
    return {
      /**
       * Returns a list of mocked relationships
       *
       * @returns {Array} list of relationships
       */
      get: function () {
        return angular.copy(relationshipTypes);
      },
      /**
       * Returns a list of relationships in array format
       *
       * @returns {object[]} a list of case types.
       */
      getSequential: function () {
        return Object.values(_.cloneDeep(relationshipTypes));
      }
    };
  });
})(CRM._);
