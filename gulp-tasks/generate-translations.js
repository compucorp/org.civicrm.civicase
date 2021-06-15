/**
 * @file
 * Exports Gulp task to generate translation files.
 */

'use strict';

var execSync = require('child_process').execSync;

module.exports = function (done) {
  execSync('civistrings -o "l10n/civicase.pot" ./ang/ ./api/ ./Civi/ ./CRM/ ./settings/');

  done();
};
