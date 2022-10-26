/*jshint esversion: 6 */
// ***************************************************************************
var _edit_connect_id = "";
var _mart_con = {};
var _DIGITAL_PLATFORM_INTEGRATION = false;

const connect_messages = {
  connect_success: {
    text: "Успешное соединение с базой данных!",
    class: 'alert alert-success'
  },
  not_all_parameters_filled: {
    text: "Не все параметры заполнены! Должны быть заполнены: хост, порт, база данных, логин и пароль (если есть)",
    class: "alert alert-error"
  },
  connect_danger: {
    text: "Не удалось соединиться с базой данных!",
    class: "alert alert-danger"
  },
  connect_in_proccess: {
    text: "...Попытка соединения с базой данных ...",
    class: "alert alert-info"
  }
};

// ------------------------------------------
//
function show_connect_message(con_message) {
  var check_db_text = $('#id_check_db_text');
  if (check_db_text.length == 0) {
    return;
  }

  check_db_text.removeClass('alert');
  check_db_text.removeClass('alert-info');
  check_db_text.removeClass('alert-success');
  check_db_text.removeClass('alert-danger');
  check_db_text.removeClass('alert-error');

  check_db_text.text(con_message.text).addClass(con_message.class);
}

// ------------------------------------------
// Проверка соединения с базой данных
function testDbConnection(saved_schemas_with_tables) {
  dbapi = 'PGSQL';
  host = $('#id_host').val();
  port = $('#id_port').val();
  database = $('#id_database').val();
  ssl_ca_certs = $('#id_ssl_ca_certs').val();
  username = $('#id_username').val();
  password = $('#id_password').val();

  if (dbapi && host && port && database && username) {
    show_connect_message(connect_messages.connect_in_proccess);
    // $('#id_check_db_text').text(text_connect_process_checked).addClass('alert alert-info');
    $.ajax({
      url: `/connects/test-connection`,
      method: 'POST',
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        "dbapi": dbapi,
        "host": host,
        "port": port,
        "database": database,
        "username": username,
        "password": password,
      }),
      success: function (data) {
        console.log(`ajax action 'test-connection' SUCCESS.`);
        result = data.result;
        schemas = data.schemas;

        console.debug(`schemas = ${schemas}`);

        result ? show_connect_message(connect_messages.connect_success) : show_connect_message(connect_messages.connect_danger);

        if (result) {
          schema = $('#id_schema');
          schema_tmp_tables = $('#id_schema_tmp_tables');
          schema_quality_check_tables = $('#id_schema_quality_check_tables');
          schema_handbooks_tables = $('#id_schema_handbooks_tables');
          schema.empty();
          schema_tmp_tables.empty();
          schema_quality_check_tables.empty();
          schema_handbooks_tables.empty();
          for (i = 0; i < schemas.length; i++) {
            schema.append($('<option/>')
              .text(schemas[i])
              .attr('value', schemas[i])
              .attr((_mart_con != null && _mart_con.schema != undefined && schemas[i] == _mart_con.schema) ? {
                'selected': 'selected'
              } : {}));
            schema_tmp_tables.append($('<option/>')
              .text(schemas[i])
              .attr('value', schemas[i])
              .attr((_mart_con != null && _mart_con.schema_tmp_tables != undefined && schemas[i] == _mart_con.schema_tmp_tables) ? {
                'selected': 'selected'
              } : {}));
            if (_DIGITAL_PLATFORM_INTEGRATION) {
              schema_quality_check_tables.append($('<option/>')
                .text(schemas[i])
                .attr('value', schemas[i])
                .attr((_mart_con != null && _mart_con.schema_quality_check_tables != undefined && schemas[i] == _mart_con.schema_quality_check_tables) ? {
                  'selected': 'selected'
                } : {}));
              schema_handbooks_tables.append($('<option/>')
                .text(schemas[i])
                .attr('value', schemas[i])
                .attr((_mart_con != null && _mart_con.schema_handbooks_tables != undefined && schemas[i] == _mart_con.schema_handbooks_tables) ? {
                  'selected': 'selected'
                } : {}));
            }
          }

          if (_DIGITAL_PLATFORM_INTEGRATION) {
            schema_handbooks_tables.trigger('change');
          }
        }
      },
      error: function (d) {
        show_connect_message(connect_messages.connect_danger)
        console.error("ajax action 'test-connection' ERROR.");
      }
    });
  } else {
    show_connect_message(connect_messages.not_all_parameters_filled);
  }
}
// ------------------------------------------
//
function make_form() {
  console.info('---- make_form ---');
  // if (document.getElementById('edit_source_mart_con') == null) {
  //   return;
  // }

  show_connect_message(connect_messages.not_all_parameters_filled);

  if (document.getElementById('edit_source_mart_con') != null) {
    // Страница редактирования соединения с источников
    if (document.getElementById('edit_connect_id') != null) {
      // Редактирование существующего соединения
      console.info("Редактирование существующего соединения с источником ");
      _edit_connect_id = $('#edit_connect_id').data('edit_connect_id');
      console.debug(`_edit_connect_id = ${_edit_connect_id}`);
    } else {
      console.info("Создание нового соединения с источником ");
      // создание нвого соединения
    }
  }

  // Заполнение данными
  $.ajax({
    url: `/connects/find-by-type-connection/mart`,
    method: 'GET',
    dataType: "json",
    data: {
    },
    success: function (data) {
      console.log(`ajax action 'get_mart_con_data' SUCCESS. data = ${data}`);
      _mart_con = data.length>0?data[0]:null;
      _DIGITAL_PLATFORM_INTEGRATION = false;

      if (_mart_con != null) {
        $('#id').val(_mart_con.id);
        $('#id_name').val(_mart_con.name);
        $('#id_host').val(_mart_con.host ? _mart_con.host : 'localhost');
        $('#id_port').val(_mart_con.port);
        $('#id_database').val(_mart_con.database);
        $('#id_description').val(_mart_con.description);
        $('#id_ssl_ca_certs').val(_mart_con.ssl_ca_certs);
        $('#id_username').val(_mart_con.username);
        $('#id_password').val(_mart_con.password);
        if (_mart_con.create_csv_file) {
          $('#id_create_csv_file').prop('checked');
        }
        $('#id_csv_file_path').val(_mart_con.csv_file_path);
        testDbConnection();
      } else {
        // Поставим значения по умолчнию для базы postres
        $('#id_host').val('localhost');
        $('#id_port').val('5432');
      }


      window.editor = {};

      if (document.getElementById('id_description')) {
        // markdown
        if (window.editor.id_description == undefined) {
          MarkdownEditor
            .create(document.querySelector('#id_description'))
            .then(editor => {
              window.editor.id_description = editor;
            })
            .catch(error => {
              console.error('MarkdownEditor common info editor.', error);
            });
        }
      }

      $('.custom-select').select2({
        theme: 'classic',
      });

    },
    error: function (d) {
      console.error(`ajax action 'get_mart_con_data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
    }
  });
}


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

    make_form();

    // if ($('id_type_source').length) {
    //   $('#submit-id-save').hide();
    // }
    /* Кнопка "Отмена" на странице редактирования сущности*/
    $("#button-id-cancel").on("click", function () {
      console.info('---- button-id-cancel click ---');
      window.location.href = "/connects/";
    });


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_host', function () {
      console.info('---- id_host on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_mart_con') {
        testDbConnection();
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_database', function () {
      console.info('---- id_database on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_mart_con') {
        testDbConnection();
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_port', function () {
      console.info('---- id_port on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_mart_con') {
        testDbConnection();
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_username', function () {
      console.info('---- id_username on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_mart_con') {
        testDbConnection();
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_password', function () {
      console.info('---- id_password on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_mart_con') {
        testDbConnection();
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('click', '#id_check_mart_base_connect', function () {
      console.info('---- id_check_mart_base_connect on click ---');

      testDbConnection();
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_schema_handbooks_tables', function () {
      console.info('---- id_schema_handbooks_tables on change ---');

      dbapi = 'PGSQL';
      host = $('#id_host').val();
      port = $('#id_port').val();
      database = $('#id_database').val();
      //ssl_ca_certs = $('#id_ssl_ca_certs').val();
      username = $('#id_username').val();
      password = $('#id_password').val();
      schema_handbooks_tables = $(this).val();

      if (dbapi && host && port && database && username) {
        // $('#id_check_db_text').text(text_connect_process_checked).addClass('alert alert-info');
        $.ajax({
          url: `${location.href}`,
          method: 'POST',
          dataType: "json",
          data: {
            "action": "get_list_tables_for_schema",
            "dbapi": dbapi,
            "host": host,
            "port": port,
            "database": database,
            "username": username,
            "password": password,
            "schema": schema_handbooks_tables,
          },
          success: function (data) {
            console.log(`ajax action 'get_list_tables_for_schema' SUCCESS.`);
            tables = data.tables;

            console.debug(`tables = ${tables}`);

            handbook_doc_types = $('#id_handbook_doc_types');
            handbook_doc_types.empty();
            for (i = 0; i < tables.length; i++) {
              handbook_doc_types.append($('<option/>')
                .text(tables[i])
                .attr('value', tables[i])
                .attr((_mart_con != null && _mart_con.handbook_doc_types != undefined && tables[i] == _mart_con.handbook_doc_types) ? {
                  'selected': 'selected'
                } : {}));
            }
          },
          error: function (d) {
            console.error("ajax action 'get_list_tables_for_schema' ERROR.");
          }
        });
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Сохранить 
    $('body').on('submit', function (event) {
      console.info('---- submit on click ---');
      event.preventDefault();

      dbapi = 'PGSQL';
      con_name = $('#id_name').val();
      description = $('#id_description').val();
      host = $('#id_host').val();
      port = $('#id_port').val();
      database = $('#id_database').val();
      ssl_ca_certs = $('#id_ssl_ca_certs').val();
      username = $('#id_username').val();
      password = $('#id_password').val();
      schema = $('#id_schema').val();
      schema_tmp_tables = $('#id_schema_tmp_tables').val();
      schema_quality_check_tables = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_schema_quality_check_tables').val() : '';
      schema_handbooks_tables = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_schema_handbooks_tables').val() : '';
      handbook_doc_types = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_handbook_doc_types').val() : '';
      create_csv_file = $('#id_create_csv_file').prop('checked');
      csv_file_path = $('#id_csv_file_path').val();
      typeConnection = $('#id_type_connection').val();
      id = $('#id').val();

      if (dbapi && host && port && database && username) {
        // $('#id_check_db_text').text(text_connect_process_checked).addClass('alert alert-info');
        $.ajax({
          url: `/connects/save`,
          method: 'POST',
          dataType: "json",
          contentType: "application/json",
          data: JSON.stringify({
            "id": id,
            "type_connection": typeConnection,
            "name": con_name,
            "description": description,
            "dbapi": dbapi,
            "type_source": "DB",
            "host": host,
            "port": port,
            "database": database,
            "ssl_ca_certs": ssl_ca_certs,
            "username": username,
            "password": password,
            "schema": schema,
            "schema_tmp_tables": schema_tmp_tables,
            "schema_quality_check_tables": schema_quality_check_tables,
            "schema_handbooks_tables": schema_handbooks_tables,
            "handbook_doc_types": handbook_doc_types,
            "create_csv_file": create_csv_file,
            "csv_file_path": csv_file_path,
          }),
          success: function (data) {
            console.log(`ajax action 'save_mart_con' SUCCESS.`);
            window.location.href = '/connects/';
          },
          error: function (d) {
            console.error(d);
            console.error("ajax action 'save_mart_con' ERROR.");
          }
        });
      }
    });


  });
}).call(this);