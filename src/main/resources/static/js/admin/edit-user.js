/*jshint esversion: 6 */
var _user_id = "";
var _current_user = "";
var _user = {};


// ------------------------------------------
//
function makeForm() {
  console.info('---- makeForm ---');
  if (document.getElementById('edit_user') == null || _user_id == undefined) {
        $('#id_username').empty();
        $('#id_first_name').empty();
        $('#id_last_name').empty();
        $('#id_email').empty();
        $('#id_password').empty();
        // $('#id_username').val('');
        // $('#id_first_name').val('');
        // $('#id_last_name').val('');
        // $('#id_email').val('');
        // $('#id_password').val('');
        $('#id_is_staff').prop('checked', false);
        $('#id_is_active').prop('checked', false);
        $('#id_is_superuser').prop('checked', false);
    return;
  }

  // Заполнение данными

  $.ajax({
    url: `/admin/init-user-data?user_id=${_user_id}`,
    method: 'GET',
    dataType: "json",
    content_type: 'application/json',
    success: function (data) {
      console.log(`ajax action 'init-user-data' SUCCESS. data = ${data}`);
      _user = data.user;

      if (_user) {
        $('#id_username').val(_user.username);
        $('#id_first_name').val(_user.first_name);
        $('#id_last_name').val(_user.last_name);
        $('#id_email').val(_user.email);
        $('#id_password').val(_user.password);
        $('#id_is_staff').prop('checked', _user.is_staff);
        $('#id_is_active').prop('checked', _user.is_active);
        $('#id_is_superuser').prop('checked', _user.is_superuser);
      }


    },
    error: function (d) {
      console.error(`ajax action 'init-user-data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
    }
  });

}


// ***************************************************************************
(application = function () {
  console.info('=== edit-user-page.js ===');

  // ------------------------------------------
  this.readyEditUser = function () {
    if (getPageName() !== 'edit-user-page') {
      console.info('*** readyEditUser - IGNORED ***');
      return;
    }
    console.info('=== readyEditUser ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyEditUser - is ready ***');

    // Автоматически заполняем поля формы при добавлении новой сущности
    var action = $('#action').val();

    // Страница редактирования сущности
    if (document.getElementById('user_id') != null) {
      console.info("Редактирование существующего пользователя ");
      _user_id = $('#user_id').data('user_id');
      console.debug(`_user_id = ${_user_id}`);
    } else {
      _user_id = undefined;
      console.info("Создание нового пользователя");
    }

    makeForm();

    // if (action == 'new') {
    //   var connect_id = $('#id_connect').val();
    //   loadAllMetadataForConnectSelect(connect_id);
    // }


    $('.custom-select').select2({
      theme: 'classic',
      allowClear: true,
      placeholder: "Выберите...",
    });

  });

  // ------------------------------------------
  /* Кнопка Сохранить*/
  $("#id_button_save").on("click", function () {
    console.info('---- id_button_save click ---');

    username=$('#id_username').val();
    first_name = $('#id_first_name').val();
    last_name = $('#id_last_name').val();
    email = $('#id_email').val();
    password= $('#id_password').val();

    is_staff =$('#id_is_staff').prop('checked');
    is_active = $('#id_is_active').prop('checked');
    is_superuser = $('#id_is_superuser').prop('checked');

    $.ajax({
      url: `/admin/save`,
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify({
        "id": _user_id||null,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,
        "is_staff": is_staff,
        "is_active": is_active,
        "is_superuser": is_superuser,
      }),
      success: function (data) {
        console.log(`ajax action 'save_user' SUCCESS.`);
        if (data.length != 0) {
          window.location.href = '/admin/';
        }
      },
      error: function (d) {
        console.error(`ajax action 'save_user' ERROR`);
      }
    });
  });

  // ------------------------------------------
  /* Кнопка "Отмена" на странице редактирования сущности*/
  $("#button-id-cancel").on("click", function () {
    console.info('---- button-id-cancel click ---');
    window.location.href = "/admin/";
  });

}).call(this);