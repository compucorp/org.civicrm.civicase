(function ($, CiviCaseBase) {
  $(document).on('crmLoad', function (eventObj) {
    var form = $(eventObj.target).find('form');
    var tokens = JSON.parse(CiviCaseBase.custom_token_tree);

    $('input.crm-token-selector', form)
      .crmSelect2({
        data: tokens,
        formatResult: formatOptions,
        formatSelection: formatOptions,
        placeholder: 'Tokens'
      })
      .on('select2-selecting', function (event) {
        selectEventHandler(event);
      });

    /**
     * Select event handler
     *
     * @param {object} event event object
     */
    function selectEventHandler (event) {
      if (!event.choice.children) {
        return;
      }

      var element = $('[data-token-select-id=' + event.choice.id + ']');
      var childElement = element.closest('.select2-result-label').siblings('.select2-result-sub');

      childElement.toggle();

      // Toggle the collapse/expand icon
      element.html(getDropdownElementText(event.choice, !childElement.is(':visible')));

      event.preventDefault();
    }

    /**
     * @param {object} item item
     * @returns {string} dropdown item markup
     */
    function formatOptions (item) {
      return getDropdownElementText(item, false);
    }

    /**
     * @param {object} item item
     * @param {object} showPlusIcon if plus icon should be shown
     * @returns {string} dropdown item markup
     */
    function getDropdownElementText (item, showPlusIcon) {
      var icon = '';

      if (item.children) {
        if (!showPlusIcon) {
          icon = '<i class="fa fa-minus-square-o" style="margin-right: 5px;"></i>';
        } else {
          icon = '<i class="fa fa-plus-square-o" style="margin-right: 5px;"></i>';
        }
      }

      return '<span data-token-select-id="' + item.id + '">' + icon + item.text + '</span>';
    }
  });
})(CRM.$, CRM['civicase-base']);