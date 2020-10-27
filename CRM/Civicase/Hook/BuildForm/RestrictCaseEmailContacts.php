<?php

/**
 * Restricts case emails to case contacts only.
 */
class CRM_Civicase_Hook_BuildForm_RestrictCaseEmailContacts {

  /**
   * The current form's instance.
   *
   * @var CRM_Core_Form
   */
  private $form;

  /**
   * Handles the hook's implementation.
   *
   * @param CRM_Core_Form $form
   *   The current form's instance.
   * @param string $formName
   *   The name for the current form.
   */
  public function run(CRM_Core_Form $form, $formName) {
    $this->form = $form;

    if (!$this->shouldRun()) {
      return;
    }

    $this->addListOfCaseContactsToSettings();
  }

  /**
   * Determines if the hook should run.
   *
   * Only runs for Case Email forms and when the "Restrict Case Email Contacts"
   * setting is set.
   *
   * @return bool
   *   True when the hook can run.
   */
  private function shouldRun() {
    $isEmailForm = get_class($this->form) === CRM_Contact_Form_Task_Email::class;
    $isCaseEmail = !empty($this->form->getVar('_caseId'));
    $shouldRestrictContacts = (bool) Civi::settings()->get('civicaseRestrictCaseEmailContacts');

    return $isEmailForm && $isCaseEmail && $shouldRestrictContacts;
  }

  /**
   * Adds the list of contacts for the case to the front-end settings object.
   *
   * The list of contacts is exported as a JSON string to avoid CiviCRM from
   * extending the list instead of replacing it. This would cause problems when
   * switching cases or updating the contacts for the existing one.
   */
  private function addListOfCaseContactsToSettings() {
    $caseId = $this->form->getVar('_caseId');

    $caseDetailsResponse = civicrm_api3('Case', 'getdetails', [
      'id' => $caseId,
      'options' => ['limit' => 1],
    ]);
    $caseDetails = CRM_Utils_Array::first($caseDetailsResponse['values']);

    $caseContacts = array_map(function ($caseContact) {
      return [
        'role' => $caseContact['role'],
        'email' => $caseContact['email'],
        'value' => $caseContact['contact_id'] . '::' . $caseContact['email'],
        'display_name' => $caseContact['display_name'],
      ];
    }, $caseDetails['contacts']);

    CRM_Core_Resources::singleton()
      ->addScriptFile('uk.co.compucorp.civicase', 'js/restrict-case-email-contacts.js')
      ->addSetting([
        'civicase-base' => [
          'case_contacts' => json_encode($caseContacts),
        ],
      ]);
  }

}
