<?php
class CRM_Civicase_XMLProcessor_Report extends CRM_Case_XMLProcessor_Report {
  /**
   * @param int $clientID
   * @param int $caseID
   * @param $activityTypes
   * @param $activities
   * @param $selectedActivities
   */
  public function getActivities($clientID, $caseID, $activityTypes, &$activities, $selectedActivities) {

    // get all activities for this case that in this activityTypes set
    foreach ($activityTypes as $aType) {
      $map[$aType['id']] = $aType;
    }

    // get all core activities
    $coreActivityTypes = CRM_Case_PseudoConstant::caseActivityType(FALSE, TRUE);

    foreach ($coreActivityTypes as $aType) {
      $map[$aType['id']] = $aType;
    }

    $activityTypeIDs = implode(',', array_keys($map));
    $query = "
SELECT a.*, c.id as caseID
FROM   civicrm_activity a,
       civicrm_case     c,
       civicrm_case_activity ac
WHERE  a.is_current_revision = 1
AND    a.is_deleted =0
AND    a.activity_type_id IN ( $activityTypeIDs )
AND    c.id = ac.case_id
AND    a.id = ac.activity_id
AND    ac.case_id = %1
";

    $params = array(1 => array($caseID, 'Integer'));
    $dao = CRM_Core_DAO::executeQuery($query, $params);
    while ($dao->fetch()) {
      $activityTypeInfo = $map[$dao->activity_type_id];
      if (count($selectedActivities) === 0 || in_array($dao->id, $selectedActivities)) {
        $activities[] = $this->getActivity($clientID,
          $dao,
          $activityTypeInfo
        );
      }
    }
  }

  /**
   * @param int $clientID
   * @param int $caseID
   * @param string $activitySetName
   * @param array $params
   * @param CRM_Core_Form $form
   * @param array $selectedActivities
   *
   * @return mixed
   */
  public static function getCaseReport($clientID, $caseID, $activitySetName, $params, $form, $selectedActivities) {

    $template = CRM_Core_Smarty::singleton();

    $template->assign('caseId', $caseID);
    $template->assign('clientID', $clientID);
    $template->assign('activitySetName', $activitySetName);

    if (!empty($params['is_redact'])) {
      $form->_isRedact = TRUE;
      $template->assign('_isRedact', 'true');
    }
    else {
      $form->_isRedact = FALSE;
      $template->assign('_isRedact', 'false');
    }

    // first get all case information
    $case = $form->caseInfo($clientID, $caseID);
    $template->assign_by_ref('case', $case);

    if ($params['include_activities'] == 1) {
      $template->assign('includeActivities', '');
    }
    else {
      $template->assign('includeActivities', 'Missing activities only');
    }

    $xml = $form->retrieve($case['caseTypeName']);

    $activitySetNames = CRM_Case_XMLProcessor_Process::activitySets($xml->ActivitySets);
    $pageTitle = CRM_Utils_Array::value($activitySetName, $activitySetNames);
    $template->assign('pageTitle', $pageTitle);

    if ($activitySetName) {
      $activityTypes = $form->getActivityTypes($xml, $activitySetName);
    }
    else {
      $activityTypes = CRM_Case_XMLProcessor::allActivityTypes();
    }

    if (!$activityTypes) {
      return FALSE;
    }

    // next get activity set Information
    $activitySet = array(
      'label' => $form->getActivitySetLabel($xml, $activitySetName),
      'includeActivities' => 'All',
      'redact' => 'false',
    );
    $template->assign_by_ref('activitySet', $activitySet);

    //now collect all the information about activities
    $activities = array();
    $form->getActivities($clientID, $caseID, $activityTypes, $activities, $selectedActivities);
    $template->assign_by_ref('activities', $activities);
    // now run the template
    $contents = $template->fetch('CRM/Case/XMLProcessor/Report.tpl');
    return $contents;
  }

  public static function printCaseReport() {
    $caseID = CRM_Utils_Request::retrieve('caseID', 'Positive');
    $clientID = CRM_Utils_Request::retrieve('cid', 'Positive');
    $activitySetName = CRM_Utils_Request::retrieve('asn', 'String');
    $selectedActivities = array_filter(explode (",", CRM_Utils_Request::retrieve('sact', 'CommaSeparatedIntegers')));
    $isRedact = CRM_Utils_Request::retrieve('redact', 'Boolean');
    $includeActivities = CRM_Utils_Request::retrieve('all', 'Positive');
    $params = $otherRelationships = $globalGroupInfo = array();
    $report = new CRM_Civicase_XMLProcessor_Report($isRedact);
    if ($includeActivities) {
      $params['include_activities'] = 1;
    }

    if ($isRedact) {
      $params['is_redact'] = 1;
      $report->_redactionStringRules = array();
    }
    $template = CRM_Core_Smarty::singleton();

    //get case related relationships (Case Role)
    $caseRelationships = CRM_Case_BAO_Case::getCaseRoles($clientID, $caseID);
    $caseType = CRM_Case_BAO_Case::getCaseType($caseID, 'name');

    $xmlProcessor = new CRM_Case_XMLProcessor_Process();
    $caseRoles = $xmlProcessor->get($caseType, 'CaseRoles');
    foreach ($caseRelationships as $key => & $value) {
      if (!empty($caseRoles[$value['relation_type']])) {
        unset($caseRoles[$value['relation_type']]);
      }
      if ($isRedact) {
        if (!array_key_exists($value['name'], $report->_redactionStringRules)) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($value['name'] => 'name_' . rand(10000, 100000))
          );
        }
        $value['name'] = $report->redact($value['name'], TRUE, $report->_redactionStringRules);
        if (!empty($value['email']) &&
          !array_key_exists($value['email'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($value['email'] => 'email_' . rand(10000, 100000))
          );
        }

        $value['email'] = $report->redact($value['email'], TRUE, $report->_redactionStringRules);

        if (!empty($value['phone']) &&
          !array_key_exists($value['phone'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($value['phone'] => 'phone_' . rand(10000, 100000))
          );
        }
        $value['phone'] = $report->redact($value['phone'], TRUE, $report->_redactionStringRules);
      }
    }

    $caseRoles['client'] = CRM_Case_BAO_Case::getContactNames($caseID);
    if ($isRedact) {
      foreach ($caseRoles['client'] as &$client) {
        if (!array_key_exists(CRM_Utils_Array::value('sort_name', $client), $report->_redactionStringRules)) {

          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array(CRM_Utils_Array::value('sort_name', $client) => 'name_' . rand(10000, 100000))
          );
        }
        if (!array_key_exists(CRM_Utils_Array::value('display_name', $client), $report->_redactionStringRules)) {
          $report->_redactionStringRules[CRM_Utils_Array::value('display_name', $client)] = $report->_redactionStringRules[CRM_Utils_Array::value('sort_name', $client)];
        }
        $client['sort_name'] = $report->redact(CRM_Utils_Array::value('sort_name', $client), TRUE, $report->_redactionStringRules);
        if (!empty($client['email']) &&
          !array_key_exists($client['email'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($client['email'] => 'email_' . rand(10000, 100000))
          );
        }
        $client['email'] = $report->redact(CRM_Utils_Array::value('email', $client), TRUE, $report->_redactionStringRules);

        if (!empty($client['phone']) &&
          !array_key_exists($client['phone'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($client['phone'] => 'phone_' . rand(10000, 100000))
          );
        }
        $client['phone'] = $report->redact(CRM_Utils_Array::value('phone', $client), TRUE, $report->_redactionStringRules);
      }
    }
    // Retrieve ALL client relationships
    $relClient = CRM_Contact_BAO_Relationship::getRelationship($clientID,
      CRM_Contact_BAO_Relationship::CURRENT,
      0, 0, 0, NULL, NULL, FALSE
    );
    foreach ($relClient as $r) {
      if ($isRedact) {
        if (!array_key_exists($r['name'], $report->_redactionStringRules)) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['name'] => 'name_' . rand(10000, 100000))
          );
        }
        if (!array_key_exists($r['display_name'], $report->_redactionStringRules)) {
          $report->_redactionStringRules[$r['display_name']] = $report->_redactionStringRules[$r['name']];
        }
        $r['name'] = $report->redact($r['name'], TRUE, $report->_redactionStringRules);

        if (!empty($r['phone']) &&
          !array_key_exists($r['phone'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['phone'] => 'phone_' . rand(10000, 100000))
          );
        }
        $r['phone'] = $report->redact($r['phone'], TRUE, $report->_redactionStringRules);

        if (!empty($r['email']) &&
          !array_key_exists($r['email'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['email'] => 'email_' . rand(10000, 100000))
          );
        }
        $r['email'] = $report->redact($r['email'], TRUE, $report->_redactionStringRules);
      }
      if (!array_key_exists($r['id'], $caseRelationships)) {
        $otherRelationships[] = $r;
      }
    }

    // Now global contact list that appears on all cases.
    $relGlobal = CRM_Case_BAO_Case::getGlobalContacts($globalGroupInfo);
    foreach ($relGlobal as & $r) {
      if ($isRedact) {
        if (!array_key_exists($r['sort_name'], $report->_redactionStringRules)) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['sort_name'] => 'name_' . rand(10000, 100000))
          );
        }
        if (!array_key_exists($r['display_name'], $report->_redactionStringRules)) {
          $report->_redactionStringRules[$r['display_name']] = $report->_redactionStringRules[$r['sort_name']];
        }

        $r['sort_name'] = $report->redact($r['sort_name'], TRUE, $report->_redactionStringRules);
        if (!empty($r['phone']) &&
          !array_key_exists($r['phone'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['phone'] => 'phone_' . rand(10000, 100000))
          );
        }
        $r['phone'] = $report->redact($r['phone'], TRUE, $report->_redactionStringRules);

        if (!empty($r['email']) &&
          !array_key_exists($r['email'], $report->_redactionStringRules)
        ) {
          $report->_redactionStringRules = CRM_Utils_Array::crmArrayMerge($report->_redactionStringRules,
            array($r['email'] => 'email_' . rand(10000, 100000))
          );
        }
        $r['email'] = $report->redact($r['email'], TRUE, $report->_redactionStringRules);
      }
    }

    // Retrieve custom values for cases.
    $customValues = CRM_Core_BAO_CustomValueTable::getEntityValues($caseID, 'Case');
    $extends = array('case');
    $groupTree = CRM_Core_BAO_CustomGroup::getGroupDetail(NULL, NULL, $extends);
    $caseCustomFields = array();
    foreach ($groupTree as $gid => $group_values) {
      foreach ($group_values['fields'] as $id => $field_values) {
        if (array_key_exists($id, $customValues)) {
          $caseCustomFields[$gid]['title'] = $group_values['title'];
          $caseCustomFields[$gid]['values'][$id] = array(
            'label' => $field_values['label'],
            'value' => $customValues[$id],
          );
        }
      }
    }
    $template->assign('caseRelationships', $caseRelationships);
    $template->assign('caseRoles', $caseRoles);
    $template->assign('otherRelationships', $otherRelationships);
    $template->assign('globalRelationships', $relGlobal);
    $template->assign('globalGroupInfo', $globalGroupInfo);
    $template->assign('caseCustomFields', $caseCustomFields);
    $contents = self::getCaseReport($clientID,
      $caseID,
      $activitySetName,
      $params,
      $report,
      $selectedActivities
    );
    $printReport = CRM_Case_Audit_Audit::run($contents, $clientID, $caseID, TRUE);
    echo $printReport;
    CRM_Utils_System::civiExit();
  }
}
