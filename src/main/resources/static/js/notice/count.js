/*jshint esversion: 6 */
var nyt_oldest_id = 0;
var nyt_latest_id = 0;
var nyt_update_timeout = 3000;
var nyt_update_timeout_adjust = 1.2; // factor to adjust between each timeout.

function ajaxError(){}

$.ajaxSetup({
  timeout: 7000,
  cache: false,
  error: function(e, xhr, settings, exception) {
      ajaxError();
  }
});

function jsonWrapper(url, callback) {
  $.getJSON(url, function(data) {
    if (data == null) {
      ajaxError();
    } else {
      callback(data);
    }
  });
}

function count_nyt_update() {
  jsonWrapper(URL_NYT_GET_NEW, function (data) {
    if (data.success) {

      $('.notification-cnt').html(data.total_count);
      if (data.objects) {
        $('.notification-cnt').addClass('badge-important');
        $('.notifications-empty').hide();
      } else {
        $('.notification-cnt').removeClass('badge-important');
      }
    }
  });
}


function update_timeout() {
  setTimeout(count_nyt_update, nyt_update_timeout);
  setTimeout(update_timeout, nyt_update_timeout);
  nyt_update_timeout *= nyt_update_timeout_adjust;
}

$(document).ready(function () {
  count_nyt_update();
  update_timeout();
});
