/*jshint esversion: 6 */
// ***************************************************************************
(application = function () {
  console.info('=== Admin-page.js ===');

  // ------------------------------------------
  this.readyAdmin = function () {
    if (getPageName() !== 'admin-page') {
      console.info('*** readyAdmin - IGNORED ***');
      return;
    }
    console.info('=== readyAdmin ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyAdmin - is ready ***');

  });



}).call(this);