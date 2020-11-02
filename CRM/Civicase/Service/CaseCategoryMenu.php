<?php

use CRM_Civicase_Service_CaseCategoryPermission as CaseCategoryPermission;
use CRM_Civicase_Service_CaseCategoryInstance as CaseCategoryInstance;
use CRM_Civicase_Helper_CaseCategory as CaseCategory;

/**
 * Create/Delete Case Type Category Menu items.
 */
class CRM_Civicase_Service_CaseCategoryMenu {

  /**
   * Creates Case Category Main menu and sub menus.
   *
   * @param string $caseTypeCategoryName
   *   Case Type category name.
   */
  public function createItems($caseTypeCategoryName) {
    $result = civicrm_api3('Navigation', 'get', ['name' => $caseTypeCategoryName]);

    if ($result['count'] > 0) {
      return;
    }
    $optionValueDetails = $this->getCaseCategoryOptionDetailsByName($caseTypeCategoryName);
    $caseCategoryPermission = new CaseCategoryPermission();
    $permissions = $caseCategoryPermission->get($caseTypeCategoryName);
    $casesWeight = CRM_Core_DAO::getFieldValue(
      'CRM_Core_DAO_Navigation',
      'Cases',
      'weight',
      'name'
    );

    $params = [
      'label' => ts($caseTypeCategoryName),
      'name' => $caseTypeCategoryName,
      'url' => NULL,
      'permission_operator' => 'OR',
      'is_active' => 1,
      'permission' => "{$permissions['ACCESS_MY_CASE_CATEGORY_AND_ACTIVITIES']['name']},{$permissions['ACCESS_CASE_CATEGORY_AND_ACTIVITIES']['name']}",
      'icon' => !empty($optionValueDetails['icon']) ? "crm-i " . $optionValueDetails['icon'] : 'crm-i fa-folder-open-o',
    ];

    $caseCategoryMenu = civicrm_api3('Navigation', 'create', $params);
    // Menu weight seems to be ignored on create irrespective of whatever is
    // passed, Civi will assign the next available weight. This fixes the issue.
    civicrm_api3('Navigation', 'create', [
      'id' => $caseCategoryMenu['id'],
      'weight' => $casesWeight + 1,
    ]);
    $this->createCaseCategorySubmenus($caseTypeCategoryName, $permissions, $caseCategoryMenu['id']);
  }

  /**
   * Creates the Case Category Sub Menus.
   *
   * @param string $caseTypeCategoryName
   *   Case category name.
   * @param array $permissions
   *   Permissions.
   * @param int $caseCategoryMenuId
   *   Menu ID.
   */
  protected function createCaseCategorySubmenus($caseTypeCategoryName, array $permissions, $caseCategoryMenuId) {
    $submenus = [
      [
        'label' => ts('Dashboard'),
        'name' => "{$caseTypeCategoryName}_dashboard",
        'url' => "civicrm/case/a/?case_type_category={$caseTypeCategoryName}#/case?case_type_category={$caseTypeCategoryName}",
        'permission' => "{$permissions['ACCESS_MY_CASE_CATEGORY_AND_ACTIVITIES']['name']},{$permissions['ACCESS_CASE_CATEGORY_AND_ACTIVITIES']['name']}",
        'permission_operator' => 'OR',
        'has_separator' => 1,
      ],
      [
        'label' => ts("New {$caseTypeCategoryName}"),
        'name' => "new_{$caseTypeCategoryName}",
        'url' => "civicrm/case/add?case_type_category={$caseTypeCategoryName}&action=add&reset=1&context=standalone",
        'permission' => "{$permissions['ADD_CASE_CATEGORY']['name']},{$permissions['ACCESS_CASE_CATEGORY_AND_ACTIVITIES']['name']}",
        'permission_operator' => 'OR',
      ],
      [
        'label' => ts("My {$caseTypeCategoryName}"),
        'name' => "my_{$caseTypeCategoryName}",
        'url' => '/civicrm/case/a/?case_type_category=' . $caseTypeCategoryName . '#/case/list?cf={"case_type_category":"' . $caseTypeCategoryName . '","case_manager":"user_contact_id"}',
        'permission' => "{$permissions['ACCESS_MY_CASE_CATEGORY_AND_ACTIVITIES']['name']},{$permissions['ACCESS_CASE_CATEGORY_AND_ACTIVITIES']['name']}",
        'permission_operator' => 'OR',
      ],
      [
        'label' => ts("My {$caseTypeCategoryName} activities"),
        'name' => "my_activities_{$caseTypeCategoryName}",
        'url' => '/civicrm/case/a/?case_type_category=' . $caseTypeCategoryName . '#/case?case_type_category=' . $caseTypeCategoryName . '&dtab=1&af={"case_filter":{"case_type_id.is_active":1,"contact_is_deleted":0,"case_type_id.case_type_category":"' . $caseTypeCategoryName . '"},
        "@involvingContact":"myActivities"}&drel=all',
        'permission' => 'access CiviCRM',
        'has_separator' => 1,
      ],
      [
        'label' => ts("All {$caseTypeCategoryName}"),
        'name' => "all_{$caseTypeCategoryName}",
        'url' => 'civicrm/case/a/?case_type_category=' . $caseTypeCategoryName . '#/case/list?cf={"case_type_category":"' . $caseTypeCategoryName . '"}',
        'permission' => "{$permissions['ACCESS_MY_CASE_CATEGORY_AND_ACTIVITIES']['name']},{$permissions['ACCESS_CASE_CATEGORY_AND_ACTIVITIES']['name']}",
        'permission_operator' => 'OR',
        'has_separator' => 1,
      ],
      [
        'label' => ts("Manage Workflows"),
        'name' => "manage_{$caseTypeCategoryName}_workflows",
        'url' => 'civicrm/workflow/a?case_type_category=' . $caseTypeCategoryName . '#/list',
        'permission' => "{$permissions['ADMINISTER_CASE_CATEGORY']['name']}, administer CiviCRM",
        'permission_operator' => 'OR',
      ],
    ];

    foreach ($submenus as $i => $item) {
      $item['weight'] = $i;
      $item['parent_id'] = $caseCategoryMenuId;
      $item['is_active'] = 1;
      civicrm_api3('Navigation', 'create', $item);
    }
  }

  /**
   * Deletes the Case Category Main menu and sub menus.
   *
   * @param string $caseTypeCategoryName
   *   Case category name.
   */
  public function deleteItems($caseTypeCategoryName) {
    $parentMenu = civicrm_api3('Navigation', 'get', ['name' => $caseTypeCategoryName]);

    if ($parentMenu['count'] == 0) {
      return;
    }

    $result = civicrm_api3('Navigation', 'get', ['parent_id' => $parentMenu['id']]);
    foreach ($result['values'] as $submenu) {
      civicrm_api3('Navigation', 'delete', ['id' => $submenu['id']]);
    }

    civicrm_api3('Navigation', 'delete', ['id' => $parentMenu['id']]);
  }

  /**
   * Disables/Enables the Case Category Main menu.
   *
   * @param int $caseCategoryId
   *   Case category name.
   * @param array $menuParams
   *   Case category name.
   */
  public function updateItems($caseCategoryId, array $menuParams) {
    $caseCategoryOptionDetails = $this->getCaseCategoryOptionDetailsById($caseCategoryId);

    $parentMenu = civicrm_api3('Navigation', 'get', ['name' => $caseCategoryOptionDetails['name']]);

    if ($parentMenu['count'] == 0) {
      return;
    }

    $menuParams['id'] = $parentMenu['id'];
    civicrm_api3('Navigation', 'create', $menuParams);
  }

  /**
   * Gets case category option details by id.
   *
   * @param int $id
   *   Category Id.
   *
   * @return array
   *   Category details.
   */
  private function getCaseCategoryOptionDetailsById($id) {
    return $this->getCaseCategoryOptionDetailsByParams(['id' => $id]);
  }

  /**
   * Gets case category option details by name.
   *
   * @param string $name
   *   Category name.
   *
   * @return array
   *   Category details.
   */
  private function getCaseCategoryOptionDetailsByName($name) {
    return $this->getCaseCategoryOptionDetailsByParams(['name' => $name]);
  }

  /**
   * Gets case category option details by params.
   *
   * @param array $params
   *   Catetgory params.
   *
   * @return array
   *   Category details.
   */
  private function getCaseCategoryOptionDetailsByParams(array $params) {
    $apiParams = [
      'sequential' => 1,
      'option_group_id' => 'case_type_categories',
    ];
    $apiParams = array_merge($apiParams, $params);
    $result = civicrm_api3('OptionValue', 'get', $apiParams);

    return !empty($result['values'][0]) ? $result['values'][0] : [];
  }

  /**
   * Creates Manage Workflow menu for existing case categories.
   *
   * @param string $instanceName
   *   Case category instance name..
   * @param bool $ifMenuLabelHasInstanceName
   *   Label for the menu to be added.
   */
  public function createManageWorkflowMenu(string $instanceName, $ifMenuLabelHasInstanceName) {
    $caseTypeCategories = CaseCategory::getCaseCategories();

    $instanceObj = new CaseCategoryInstance();
    $instances = $instanceObj->getCaseCategoryInstances($instanceName);

    foreach ($caseTypeCategories as $caseTypeCategory) {
      $isInstanceCaseCategory = NULL;

      foreach ($instances as $instance) {
        if ($instance->category_id == $caseTypeCategory['value']) {
          $isInstanceCaseCategory = $instance;
          break;
        }
      }

      if (!$isInstanceCaseCategory) {
        continue;
      }

      $parentMenuForCaseCategory = civicrm_api3('Navigation', 'get', [
        'sequential' => 1,
        'label' => $caseTypeCategory['name'],
      ])['values'][0];

      $menuLabel = $ifMenuLabelHasInstanceName
        ? 'Manage ' . $caseTypeCategory['name']
        : 'Manage Workflows';

      if ($parentMenuForCaseCategory['id']) {
        $this->addSeparatorToTheLastMenuOf(
          $parentMenuForCaseCategory['id']
        );
        $this->createManageWorkflowMenuItemInto(
          $parentMenuForCaseCategory['id'],
          $caseTypeCategory['name'],
          $menuLabel
        );
      }
    }
  }

  /**
   * Creates Manage Workflow menu for the given parent id.
   *
   * @param string $parentId
   *   Id of the parent menu item.
   * @param string $caseTypeCategoryName
   *   Case Type Category name.
   * @param string $menuLabel
   *   Label for the menu to be added.
   */
  private function createManageWorkflowMenuItemInto($parentId, $caseTypeCategoryName, string $menuLabel) {
    $caseCategoryPermission = new CaseCategoryPermission();
    $permissions = $caseCategoryPermission->get($caseTypeCategoryName);

    $ifMenuExist = count(civicrm_api3('Navigation', 'get', [
      'name' => 'manage_' . $caseTypeCategoryName . '_workflows',
    ])['values']) > 0;

    if (!$ifMenuExist) {
      civicrm_api3('Navigation', 'create', [
        'parent_id' => $parentId,
        'url' => '/civicrm/workflow/a?case_type_category=' . $caseTypeCategoryName . '#/list',
        'label' => $menuLabel,
        'name' => 'manage_' . $caseTypeCategoryName . '_workflows',
        'is_active' => TRUE,
        'permission' => "{$permissions['ADMINISTER_CASE_CATEGORY']['name']}, administer CiviCRM",
        'permission_operator' => 'OR',
      ]);
    }
  }

  /**
   * Add separator to the last child menu of the given parent id.
   *
   * @param string $parentId
   *   Id of the parent menu item.
   */
  private function addSeparatorToTheLastMenuOf($parentId) {
    $childMenuItemWithMaxWeight = civicrm_api3('Navigation', 'get', [
      'sequential' => 1,
      'parent_id' => $parentId,
      'options' => ['limit' => 1, 'sort' => "weight DESC"],
    ])['values'][0];

    civicrm_api3('Navigation', 'create', [
      'id' => $childMenuItemWithMaxWeight['id'],
      'has_separator' => 1,
    ]);
  }

}
