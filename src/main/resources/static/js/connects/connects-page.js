/*jshint esversion: 6 */
// ***************************************************************************

(application = function () {
  console.info('=== Connects-page.js ===');

  // ------------------------------------------
  this.readyConnects = function () {
    if (getPageName() !== 'connects-page') {
      console.info('*** readyConnects - IGNORED ***');
      return;
    }
    console.info('=== readyConnects ===');
  };

  // ------------------------------------------
  $(document).ready(function () {
    console.info('*** readyConnects - is ready ***');

  });
}).call(this);
