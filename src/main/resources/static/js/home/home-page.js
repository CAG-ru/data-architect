/*jshint esversion: 6 */
// ***************************************************************************
(application = function () {
  console.info('=== home-page.js ===');

  // ------------------------------------------
  this.readyHome = function() {
    if (getPageName() !== 'home-page') {
      console.info('*** readyHome - IGNORED ***');
      return;
    }
    console.info('=== readyHome ===');
  }
  
  // ------------------------------------------
  $( document ).ready(function() {
    console.info('*** readyHome - is ready ***');

  });   


}).call(this);