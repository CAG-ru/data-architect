/*jshint esversion: 6 */
// ***************************************************************************
(application = function () {
  console.info('=== Notice-page.js ===');

  // ------------------------------------------
  this.readyNotice = function () {
    if (getPageName() !== 'notice-page') {
      console.info('*** readyNotice - IGNORED ***');
      return;
    }
    console.info('=== readyNotice ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyNotice - is ready ***');

  });

}).call(this);