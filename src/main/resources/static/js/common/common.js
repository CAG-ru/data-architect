/*jshint esversion: 6 */
(function() {
  console.info('=== common.js ===');

  this.date_format = '99.99.9999';

  // ------------------------------------------
  this.getPageName = function() {
    var pageElements;
    console.info('*** getPageName ***');
    pageElements = document.getElementsByClassName('page-name');
    if (pageElements.length === 0) {
      return "";
    }
    return pageElements[0].id;
  };
}).call(this);