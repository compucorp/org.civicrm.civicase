<?php

use CRM_Civicase_Hook_Helper_CaseTypeCategory as CaseTypeCategoryHelper;

/**
 * Class CRM_Civicase_Hook_BuildForm_CaseCategoryFormLabelTranslation.
 */
class CRM_Civicase_Hook_BuildForm_CaseCategoryFormLabelTranslationForNewCase {

  /**
   * Translate some case form labels that Civi did not run translation for.
   *
   * @param CRM_Core_Form $form
   *   Form Class object.
   * @param string $formName
   *   Form Name.
   */
  public function run(CRM_Core_Form &$form, $formName) {
    $caseCategoryId = $this->getCaseCategoryId($form);

    if (!$this->shouldRun($formName, $caseCategoryId)) {
      return;
    }

    if (!CaseTypeCategoryHelper::isValidCategory($caseCategoryId)) {
      return;
    }

    $this->translateFormLabels($form);
  }

  /**
   * Translate some case form labels that Civi did not run translation for.
   *
   * Some Form labels are not ran through Civ's Ts function. We need to
   * do this, so this function does that.
   *
   * @param CRM_Core_Form $form
   *   Page class.
   */
  private function translateFormLabels(CRM_Core_Form $form) {
    $caseTypeIdElement = &$form->getElement('case_type_id');
    $caseStatusElement = &$form->getElement('status_id');
    $this->translateLabel([$caseTypeIdElement, $caseStatusElement]);
  }

  /**
   * Translate the form labels for an array of form elements.
   *
   * @param array $elements
   *   For Elements array.
   */
  private function translateLabel(array $elements) {
    foreach ($elements as $element) {
      $label = $element->getLabel();
      $element->setLabel($label);
    }
  }

  /**
   * Gets the Case Category Name under consideration.
   *
   * @param CRM_Core_Form $form
   *   Form name.
   *
   * @return int|null
   *   case category Id.
   */
  private function getCaseCategoryId(CRM_Core_Form $form) {
    $urlParams = parse_url(htmlspecialchars_decode($form->controller->_entryURL), PHP_URL_QUERY);
    parse_str($urlParams, $urlParams);

    return !empty($urlParams['case_type_category']) ? $urlParams['case_type_category'] : NULL;
  }

  /**
   * Determines if the hook will run.
   *
   * @param string $formName
   *   Form name.
   * @param string $caseCategoryId
   *   Case category Id.
   *
   * @return bool
   *   returns a boolean to determine if hook will run or not.
   */
  private function shouldRun($formName, $caseCategoryId) {
    if (!$caseCategoryId) {
      return FALSE;
    }

    $isCaseForm = $formName == CRM_Case_Form_Case::class;
    $caseCategoryIdNotCase = $caseCategoryId != CRM_Civicase_Helper_CaseCategory::getOptionValue();

    return $isCaseForm && $caseCategoryId && $caseCategoryIdNotCase;
  }

}
