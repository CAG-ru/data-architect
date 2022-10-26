/*jshint esversion: 6 */
// ***************************************************************************
(application = function () {
  console.info('=== Entities-page.js ===');

  // ------------------------------------------
  this.readyEntities = function () {
    if (getPageName() !== 'entities-page') {
      console.info('*** readyEntities - IGNORED ***');
      return;
    }
    console.info('=== readyEntities ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyEntities - is ready ***');

  });



}).call(this);