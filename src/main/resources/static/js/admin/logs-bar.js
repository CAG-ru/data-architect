


(application = function () {
  console.info('=== logs-bar.js ===');

  $(document).ready(function () {
        console.info('*** ready-logs-bar - is ready ***');

        $.ajax({
          url: "/logs_page/users_list",
          method: 'GET',
          success: function (data) {
            $('#user-select').html(data);
          }
        });

        $.ajax({
          url: "/logs_page/actions_list",
          method: 'GET',
          success: function (data) {
            $('#action-select').html(data);
          }
        });

    });

  $('#filters').on('change', function () {
    console.info('*** #filters - click ***');
    $this = $(this);

    user = $this.children('#user-select').val();
    action = $this.children('#action-select').val();
    rows = $this.children('#rows-select').val();

    console.info(user, action, rows)


    $.ajax({
      url: "/logs_page/logs_list",
      method: 'GET',
      data: {
        "user": user,
        "action": action,
        "rows": rows,
      },
      success: function (data) {
        $('#logs-list').html(data);
      }
    });
  });

}).call(this);