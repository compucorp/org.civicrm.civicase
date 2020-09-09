(function (_, angular) {
  var module = angular.module('civicase');

  module.service('civicasePeopleTabRoles', function (isTruthy, RelationshipType,
    ts) {
    var caseContacts = [];
    var caseRelationships = [];
    var roles = this;
    var relTypes = RelationshipType.getAll();

    roles.ROLES_PER_PAGE = 25;
    roles.caseTypeRoles = [];
    roles.fullRolesList = [];
    roles.isLoading = true;
    roles.list = [];
    roles.totalCount = 0;

    roles.filterRoles = filterRoles;
    roles.getCountOfAssignedRoles = getCountOfAssignedRoles;
    roles.goToPage = goToPage;
    roles.setCaseContacts = setCaseContacts;
    roles.setCaseRelationships = setCaseRelationships;
    roles.setCaseTypeRoles = setCaseTypeRoles;
    roles.updateRolesList = updateRolesList;

    /**
     * Assign number of roles present per type of relationship
     */
    function assignCountOfRolesPerType () {
      _.each(roles.caseTypeRoles, function (caseTypeRole) {
        caseTypeRole.count = _.filter(roles.list, function (role) {
          return role.display_name && role.name === caseTypeRole.name;
        }).length;
      });
    }

    /**
     * Filters the roles list by letter and by role type.
     *
     * @param {string} alphaFilter the letter to filter roles by.
     * @param {string} rolesFilter the type to filter roles by.
     */
    function filterRoles (alphaFilter, rolesFilter) {
      roles.list = _.filter(roles.fullRolesList, function (role) {
        var isFilteredByLetter = !alphaFilter ||
          _.includes((role.display_name || '').toUpperCase(),
            alphaFilter);
        var isFilteredByRoleType = !rolesFilter ||
          role.role === rolesFilter;

        return isFilteredByLetter && isFilteredByRoleType;
      });
    }

    /**
     * Formats the case type role to include its description, contact types,
     * and role name.
     *
     * @param {object} caseTypeRole the raw case type role as stored in the case
     *   type definition.
     * @returns {object} the formateed case type role.
     */
    function formatCaseTypeRole (caseTypeRole) {
      var relType = _.find(relTypes, function (relation) {
        return relation.name_a_b === caseTypeRole.name ||
          relation.name_b_a === caseTypeRole.name;
      });
      var roleDescription = (
        isTruthy(caseTypeRole.manager)
          ? (ts('Case Manager.') + ' ')
          : ''
      ) + (relType.description || '');

      return _.assign({}, {
        role: relType.label_b_a,
        contact_type: relType.contact_type_b,
        contact_sub_type: relType.contact_sub_type_b,
        relationship_type_id: relType.id,
        description: roleDescription
      });
    }

    /**
     * @param {number} relationshipTypeId the relationship type of the relations
     *   to return.
     * @returns {object[]} a list of active relationships.
     */
    function getActiveAssignedRoles (relationshipTypeId) {
      return getAllAssignedRoles(relationshipTypeId, {
        is_active: '1'
      });
    }

    /**
     * @param {number} relationshipTypeId the relationship type of the relations
     *   to return.
     * @param {object} extraFilters a map of filters to use when filtering the
     *   relationships list.
     * @returns {object[]} a list of active relationships.
     */
    function getAllAssignedRoles (relationshipTypeId, extraFilters) {
      return _.filter(
        caseRelationships,
        _.assign({ relationship_type_id: relationshipTypeId }, extraFilters)
      );
    }

    /**
     * Returns the list of case roles from the stored list of roles and
     * relationships. If a role has no assigned contact, it will include an
     * empty "unnassigned" role.
     *
     * @param {object} filters filters to apply when getting the case roles.
     * @returns {object[]} a list of case roles.
     */
    function getCaseRoles (filters) {
      var caseRoles = [];

      roles.caseTypeRoles.forEach(function (caseTypeRole) {
        var assignedRoles = filters.showInactiveRoles
          ? getAllAssignedRoles(caseTypeRole.relationship_type_id)
          : getActiveAssignedRoles(caseTypeRole.relationship_type_id);

        if (assignedRoles.length) {
          assignedRoles.forEach(function (caseRelation) {
            var contact = _.first(caseRelation['api.Contact.get'].values);
            caseRoles.push({
              contact_id: caseRelation.contact_id_b,
              description: caseTypeRole.description,
              desc: caseRelation.description,
              display_name: contact.display_name,
              email: contact.email,
              isPastRole: caseRelation.is_active === '0',
              phone: contact.phone,
              relationship_type_id: caseTypeRole.relationship_type_id,
              role: caseTypeRole.role,
              start_date: caseRelation.start_date
            });
          });
        } else {
          // Include an empty "unnassigned" role:
          caseRoles.push({
            description: caseTypeRole.description,
            relationship_type_id: caseTypeRole.relationship_type_id,
            role: caseTypeRole.role
          });
        }
      });

      return caseRoles;
    }

    /**
     * @returns {object[]} Returns a list of clients from the stored case
     *   contacts list.
     */
    function getClientRoles () {
      return _.filter(caseContacts, {
        role: ts('Client')
      })
        .map(function (contact) {
          return {
            contact_id: contact.contact_id,
            description: null,
            desc: null,
            display_name: contact.display_name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            start_date: null
          };
        });
    }

    /**
     * On the contact tab all the records don't have some contact assigned
     * This filters the list with roles assigned to a contact.
     *
     * @returns {number} count of roles
     */
    function getCountOfAssignedRoles () {
      return _.filter(roles.fullRolesList, function (role) {
        return role.contact_id;
      }).length;
    }

    /**
     * Removes duplicate relationship records if the same role contact is
     * present for multiple clients.
     *
     * @param {object[]} relationships list of case relationships.
     * @returns {object[]} a unique list of case relationships.
     */
    function getUniqueCaseRelationships (relationships) {
      return _.chain(relationships)
        .map(function (relationship) {
          return _.assign({}, relationship, {
            startDateTimestamp: moment(relationship.start_date).valueOf()
          });
        })
        .sortByAll(['is_active', 'startDateTimestamp'])
        .filter(function (relationship, index, sortedRelationships) {
          var similarRelationshipIndex = _.findLastIndex(sortedRelationships, {
            contact_id_b: relationship.contact_id_b,
            relationship_type_id: relationship.relationship_type_id
          });

          return similarRelationshipIndex === index;
        })
        .value();
    }

    /**
     * Updates the list of roles to display the given page.
     *
     * @param {number} pageNumber the page number to navigate to.
     */
    function goToPage (pageNumber) {
      roles.list = _.slice(
        roles.fullRolesList,
        (roles.ROLES_PER_PAGE * (pageNumber - 1)),
        roles.ROLES_PER_PAGE * pageNumber
      );
    }

    /**
     * Stores the case contacts that will be used when creating the list
     * of roles and their assignees.
     *
     * @param {object[]} newCaseContacts a list of case contacts.
     */
    function setCaseContacts (newCaseContacts) {
      caseContacts = newCaseContacts;
    }

    /**
     * Stores the relationships that will be used when creating the list of roles
     * and their assignees.
     *
     * @param {object[]} newCaseRelationships a list of contact relationships for
     *   a given case.
     */
    function setCaseRelationships (newCaseRelationships) {
      caseRelationships = getUniqueCaseRelationships(newCaseRelationships);
    }

    /**
     * Stores the list of case type roles that will be used when creating the
     * list of roles and their assignees.
     *
     * @param {object[]} rawCaseTypeRoles a list of case type roles as stored
     *   in the case type definition object.
     */
    function setCaseTypeRoles (rawCaseTypeRoles) {
      roles.caseTypeRoles = _.map(rawCaseTypeRoles, formatCaseTypeRole);
    }

    /**
     * Updates the list of roles according to the stored contacts, relationships,
     * and case type roles. After updating the list it will display the first page
     * and store a count of the roles by type.
     *
     * @param {object} filterOptions a set of filters to use when updating the
     *   roles list.
     */
    function updateRolesList (filterOptions) {
      var filters = _.assign({}, filterOptions);
      roles.isLoading = false;
      roles.fullRolesList = _([]).concat(
        getCaseRoles(filters),
        getClientRoles()
      ).value();
      roles.totalCount = roles.fullRolesList.length;

      goToPage(1);
      assignCountOfRolesPerType();
    }
  });
})(CRM._, angular);
