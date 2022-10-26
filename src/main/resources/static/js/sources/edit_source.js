/*jshint esversion: 6 */
var _edit_connect_id = "";
var _TYPES_CONNECTON = [];
var _TYPES_DATABASES = [];
var _TYPES_FILES = [];
var _TYPES_SOURCE = [];
var _TYPES_ANY_FILES_SOURCE = [];
var _connection = {};
var _type_of_data_source = [];
var _relation_to_the_data_lifecycle = [];
var _file_schema = {};
// var _translateEnums = {
//   PGSQL: "PostgreSQL",
//   MSSQL: "Microsoft SQL",
//   ORACLE: "Oracle SQL",
//   MYSQL: "MySQL",
//   MONGODB: "Неструктурированные файлы из MongoDB",
//   SQLITE: "SQLITE",
//   CSV: "Текстовые файты с разделителями формата 'csv'",
//   EXCEL: "Файлы формата Microsoft Excel - ['xls', 'xlsx']",
//   XML: "XML структуры",
//   JSON: "JSON структуры",
//   WORD: "Файлы формата Microsoft Word - 'doc', 'docx'",
//   PDF: "Файлы формата Adobe Acrobat - 'pdf'",
//   TXT: "Текстовые файлы формата 'txt'",
//   DB: "Базы данных",
//   FILES: "Файлы",
//   ANY_FILES: "Произвольные файлы",
// }
const connect_messages = {
  connect_success: {
    text: "Успешное соединение с базой данных!",
    class: 'alert alert-success'
  },
  not_all_parameters_filled: {
    text: "Не все параметры заполнены",
    class: "alert alert-error"
  },
  connect_dunger: {
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
  function getJsTreeFromDatabase(database) {
    function createStructireForNode(icon, id, text, state = {}) {
      return {
        state,
        id,
        icon,
        text,
      }
    }

    return {
      ...createStructireForNode("fa fa-database", null, `База данных: ${database.name}`, {
        opened: true
      }),
      children: database.schemas.map(schema => {
        return {
          ...createStructireForNode("fa fa-database", null, `Схема: ${schema.name}`, {
            opened: true
          }),
          children: schema.tables.map(table => {
            return {
              ...createStructireForNode("fa fa-table", schema.name + ":" + table.name, `Таблица: ${table.name}`, {
                opened: false
              }),
            }
          })
        }
      })
    }
  }

  let type_source = $("#id_type_source").val();
  if (type_source != 'DB') {
    return false;
  }

  let id = $('#id_id').val();
  let dbapi = $('#id_dbapi').val();
  let host = $('#id_host').val();
  let port = $('#id_port').val();
  let database = $('#id_database').val();
  let username = $('#id_username').val();
  let password = $('#id_password').val();
  let ssl_ca_certs = $('#id_ssl_ca_certs').val();

  if (dbapi && host && port && database && username) {
    show_connect_message(connect_messages.connect_in_proccess);
    // $('#id_check_db_text').text(text_connect_process_checked).addClass('alert alert-info');
    $.ajax({
      url: `/sources/test-connection?with-table-structure=true`,
      method: 'POST',
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        "id": id,
        "dbapi": dbapi,
        "host": host,
        "port": port,
        "database": database,
        "username": username,
        "password": password,
        "ssl_ca_certs": ssl_ca_certs,
      }),
      success: function (data) {
        console.log(`ajax action 'testDbConnection' SUCCESS.`);
        const result = data.result;
        const schemas_with_tables = data.schemas_with_tables;

        console.debug(`schemas_with_tables = ${schemas_with_tables}`);
        console.debug(schemas_with_tables);

        const jsTree = getJsTreeFromDatabase(schemas_with_tables);
        show_connect_message(connect_messages.connect_success);

        if (result) {
          $('#id_schema_tree').jstree('destroy');
          $('#id_schema_tree').jstree({
            'core': {
              'data': jsTree
            },
            "checkbox": {
              "keep_selected_style": false
            },
            "plugins": ["wholerow", "checkbox"]
          });

        }
      },
      error: function (d) {
        show_connect_message(connect_messages.connect_dunger)
        console.error("ajax action 'testDbConnection' ERROR.");
      }
    });
  } else {
    show_connect_message(connect_messages.not_all_parameters_filled);

    // $('#id_check_db_text').text(text_not_all_parameters_filled).addClass('alert alert-error');

  }

}

function makeForm() {
  console.info('---- makeForm ---');
  if (document.getElementById('edit_source_connection') == null) {
    return;
  }

  show_connect_message(connect_messages.not_all_parameters_filled);


  // Заполнение данными
  $.ajax({
    url: `/sources/get-connection-data`,
    method: 'GET',
    dataType: "json",
    data: {
      "conn_id": _edit_connect_id
    },
    success: function (data) {
      console.log(`ajax action 'get_connection_data' SUCCESS. data = ${data}`);
      _TYPES_DATABASES = data.TYPES_DATABASES;
      const type_databases_keys = Object.keys(_TYPES_DATABASES);
      const type_databases_values = Object.values(_TYPES_DATABASES);
      _TYPES_FILES = data.TYPES_FILES;
      const type_files_keys = Object.keys(_TYPES_FILES);
      const type_files_values = Object.values(_TYPES_FILES);
      _TYPES_SOURCE = data.TYPES_SOURCE;
      const type_source_keys = Object.keys(_TYPES_SOURCE);
      const type_source_values = Object.values(_TYPES_SOURCE);
      _TYPES_ANY_FILES_SOURCE = data.TYPES_ANY_FILES_SOURCE;
      _type_of_data_source = data.type_of_data_source;
      _relation_to_the_data_lifecycle = data.relation_to_the_data_lifecycle;
      _connection = data.connection || {};
      _file_schema = _connection != null ? _connection.file_schema : "";

      $('#id_type_source').empty();
      // $('#id_type_source')
      //   .append($('<option/>')
      //     .attr('disbled', 'disbled')
      //     .attr('hidden', 'hidden')
      //     .attr('selected', 'selected')
      //     .attr('value', '')
      //     .append('--- Выберите тип источника ---')
      //   );

      for (let i = 0; i < type_source_keys.length; i++) {
        const element = type_source_keys[i];

        $('#id_type_source').append(opt = $('<option/>')
          .text(type_source_values[i])
          .attr('value', element)
          .attr((_connection.type_source != undefined && element == _connection.type_source) ? {
            'selected': 'selected'
          } : {})
        );
      }

      $('#id_type_any_files_source').empty();
      for (let i = 0; i < _TYPES_ANY_FILES_SOURCE.length; i++) {
        const element = _TYPES_ANY_FILES_SOURCE[i];

        $('#id_type_any_files_source').append(opt = $('<option/>')
          .text(getTranslateEnums(element))
          .attr('value', element)
          .attr((_connection.type_any_files_source != undefined && element == _connection.type_any_files_source) ? {
            'selected': 'selected'
          } : {})
        );
      }

      $('#id_dbapi').empty();
      for (let i = 0; i < type_databases_keys.length; i++) {
        const element = type_databases_keys[i];

        $('#id_dbapi').append($('<option/>')
          .text(type_databases_values[i])
          .attr('value', element)
          .attr((_connection.dbapi != undefined && element == _connection.dbapi) ? {
            'selected': 'selected'
          } : {})
        );
        // if (_connection.dbapi != undefined && element[0] == _connection.dbapi) {
        //   opt.attr('selected', 'selected');
      }


      $('#id_file_type').empty();
      for (let i = 0; i < type_files_keys.length; i++) {
        const element = type_files_keys[i];

        $('#id_file_type').append(opt = $('<option/>').text(type_files_values[i]).attr('value', element));
        if (_connection.file_type == element) {
          opt.attr('selected', 'selected');
        }
      }

      $('#id_file_schema').val(_file_schema);
      // $('#id_file_schema').empty();
      // for (let i = 0; i < file_schemas.length; i++) {
      //   const element = file_schemas[i];

      //   $('#id_file_schema').append(opt = $('<option/>').text(element.name).attr('value', element._id));
      //   if (_connection.file_schema == element._id) {
      //     opt.attr('selected', 'selected');
      //   }
      // }

      $('#id_type_of_data_source').empty();
      for (let i = 0; i < _type_of_data_source.length; i++) {
        const element = _type_of_data_source[i];

        $('#id_type_of_data_source').append(opt = $('<option/>').text(element.name).attr('value', element.id));
        if (_connection.type_of_data_source == element.id) {
          opt.attr('selected', 'selected');
        }
      }

      $('#id_relation_to_the_data_lifecycle').empty();
      for (let i = 0; i < _relation_to_the_data_lifecycle.length; i++) {
        const element = _relation_to_the_data_lifecycle[i];

        $('#id_relation_to_the_data_lifecycle').append(opt = $('<option/>').text(element.name).attr('value', element.id));
        if (_connection.relation_to_the_data_lifecycle == element.id) {
          opt.attr('selected', 'selected');
        }
      }

      // $('.custom-select').select2({
      //   theme: 'classic',
      // });


      console.log(_connection);
      if (_edit_connect_id.length) {
        //  Редактирование
        // TODO: Здесь надо заполнить данными из соединения
        $('#id_id').val(_connection.id);
        $('#id_name').val(_connection.name);
        $('#id_description').html(_connection.description);
        $('#id_host').val(_connection.host);
        $('#id_port').val(_connection.port);
        $('#id_database').val(_connection.database);
        $('#id_mongodb_collection').val(_connection.mongodb_collection);
        $('#id_mongodb_file_src').val(_connection.mongodb_file_src);
        $('#id_threads').val(_connection.threads);
        $('#id_ssl_ca_certs').val(_connection.ssl_ca_certs);
        $('#id_chunks').val(_connection.chunks ? _connection.chunks : 128);
        $('#id_lim_lob_size').val(_connection.lim_lob_size ? _connection.lim_lob_size : 8);
        $('#id_versions_count_for_load').val(_connection.versions_count_for_load ? _connection.versions_count_for_load : 10);
        $('#id_username').val(_connection.username);
        $('#id_password').val("");
        $('#id_file_path').val(_connection.file_path);
        $('#id_files_need_scan_subdirs').prop('checked', _connection.files_need_scan_subdirs);
        // $('#id_file_schema').val(_connection.file_schema);
        $('#id_csv_delimiter').val(_connection.csv_delimiter);
        $('#id_csv_quotechar').val(_connection.csv_quotechar);
        $('#id_short_description').val(_connection.short_description);

        $('#id_original_Url').val(_connection.original_Url);
        $('#id_internal_identifier').val(_connection.internal_identifier);
        $('#id_regulatory_documents').val(_connection.regulatory_documents);
        $('#id_data_owner').val(_connection.data_owner);
        $('#id_data_operator').val(_connection.data_operator);
        $('#id_relation_to_the_data_lifecycle').val(_connection.relation_to_the_data_lifecycle);

        // $('#id_need_quality_control').prop('checked', _connection.need_quality_control);

        // $('#id_schema_tree').val(_connection.);
        testDbConnection();

      } else {
        $('#id_dbapi').trigger('change');
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
        allowClear: true,
        placeholder: "Выберите...",
      });

      $('#id_type_source').trigger('change');


    },
    error: function (d) {
      console.error(`ajax action 'get_connection_data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
    }
  });
}

// ------------------------------------------
function update_dom() {
  console.info('---- update_dom ---');

  var type_source = $('#id_type_source').val();
  var file_type = $('#id_file_type').val();
  var type_any_files_source = $('#id_type_any_files_source').val();
  console.debug(`type_source = ${type_source}, file_type = ${file_type}, type_any_files_source = ${type_any_files_source}`);

  switch (type_source) {
    case 'DB':
      $('#id_dbapi').attr('required', 'required').closest('div').show(500);
      $('#id_host').attr('required', 'required').closest('div').show(500);
      $('#id_port').attr('required', 'required').closest('div').show(500);
      $('#id_database').attr('required', 'required').closest('div').show(500);
      $('#id_mongodb_collection').removeAttr('required').closest('div').hide(500);
      $('#id_mongodb_file_src').removeAttr('required').closest('div').hide(500);
      $('#id_threads').attr('required', 'required').closest('div').show(500);
      $('#id_ssl_ca_certs').show(500);
      $('#id_chunks').attr('required', 'required').closest('div').show(500);
      $('#id_lim_lob_size').attr('required', 'required').closest('div').show(500);
      $('#id_username').attr('required', 'required').closest('div').show(500);
      $('#id_password').attr('required', 'required').closest('div').show(500);
      $('#id_test_connection').show(500);
      $('#id_schema_tree').show(500);
      $('#id_check_db_text').show(500);
      $('#id_label_schema_tree').show(500);

      file_type = '';
      $('#id_file_type').removeAttr('required').closest('div').hide(500);
      $('#id_file_path').removeAttr('required').closest('div').hide(500);
      $('#id_files_need_scan_subdirs').closest('div').hide(500);
      $('#id_test_files').hide(500);
      $('#id_file_schema').removeAttr('required').closest('div').hide(500);
      $('#id_csv_delimiter').closest('div').hide(500);
      $('#id_csv_quotechar').closest('div').hide(500);

      type_any_files_source = '';
      $('#id_type_any_files_source').removeAttr('required').closest('div').hide(500);
      break;

    case 'FILES':
      $('#id_dbapi').removeAttr('required').closest('div').hide(500);
      $('#id_host').removeAttr('required').closest('div').hide(500);
      $('#id_port').removeAttr('required').closest('div').hide(500);
      $('#id_database').removeAttr('required').closest('div').hide(500);
      $('#id_mongodb_collection').removeAttr('required').closest('div').hide(500);
      $('#id_mongodb_file_src').removeAttr('required').closest('div').hide(500);
      $('#id_threads').removeAttr('required').closest('div').hide(500);
      $('#id_ssl_ca_certs').removeAttr('required').closest('div').hide(500);
      $('#id_chunks').removeAttr('required').closest('div').hide(500);
      $('#id_lim_lob_size').removeAttr('required').closest('div').hide(500);
      $('#id_username').removeAttr('required').closest('div').hide(500);
      $('#id_password').removeAttr('required').closest('div').hide(500);
      $('#id_test_connection').hide(500);
      $('#id_schema_tree').hide(500);
      $('#id_check_db_text').hide(500);
      $('#id_label_schema_tree').hide(500);
      $('#id_type_any_files_source').removeAttr('required').closest('div').hide(500);

      $('#id_file_type').attr('required', 'required').closest('div').show(500);
      $('#id_file_path').attr('required', 'required').closest('div').show(500);
      $('#id_files_need_scan_subdirs').closest('div').show(500);
      $('#id_test_files').show(500);
      $('#id_file_schema').removeAttr('required').closest('div').hide(500);
      $('#id_csv_delimiter').closest('div').hide(500);
      $('#id_csv_quotechar').closest('div').hide(500);


      type_any_files_source = '';
      break;

    case 'ANY_FILES':
      $('#id_dbapi').removeAttr('required').closest('div').hide(500);
      $('#id_host').attr('required', 'required').closest('div').show(500);
      $('#id_port').attr('required', 'required').closest('div').show(500);
      $('#id_database').attr('required', 'required').closest('div').show(500);
      $('#id_mongodb_collection').attr('required', 'required').closest('div').show(500);
      $('#id_mongodb_file_src').attr('required', 'required').closest('div').show(500);
      $('#id_threads').removeAttr('required').closest('div').hide(500);
      $('#id_ssl_ca_certs').removeAttr('required').closest('div').hide(500);
      $('#id_chunks').removeAttr('required').closest('div').hide(500);
      $('#id_lim_lob_size').removeAttr('required').closest('div').hide(500);
      $('#id_username').removeAttr('required').closest('div').hide(500);
      $('#id_password').removeAttr('required').closest('div').hide(500);
      $('#id_test_connection').hide(500);
      $('#id_schema_tree').hide(500);
      $('#id_check_db_text').hide(500);
      $('#id_label_schema_tree').hide(500);
      $('#id_type_any_files_source').attr('required', 'required').closest('div').show(500);

      file_type = '';
      $('#id_file_type').removeAttr('required').closest('div').hide(500);
      $('#id_file_path').removeAttr('required').closest('div').show(500);
      $('#id_file_schema').removeAttr('required').closest('div').hide(500);
      $('#id_csv_delimiter').closest('div').hide(500);
      $('#id_csv_quotechar').closest('div').hide(500);
      break;
  }

  if (type_source == 'FILES') {
    switch (file_type) {
      case 'CSV':
        $('#id_csv_delimiter').closest('div').show(500);
        $('#id_csv_quotechar').closest('div').show(500);
        // $('#id_file_schema').removeAttr('required').closest('div').hide(500);
        $('#id_file_schema').attr('required', 'required').closest('div').show(500);
        break;
      case 'EXCEL':
        $('#id_file_schema').attr('required', 'required').closest('div').show(500);
        break;
      case 'WORD':
      case 'PDF':
      case 'TXT':
      case 'PICTURES':
        $('#id_csv_delimiter').closest('div').hide(500);
        $('#id_csv_quotechar').closest('div').hide(500);
        $('#id_file_schema').removeAttr('required').closest('div').hide(500);
        break;
    }
  }

  if (type_source == 'ANY_FILES') {
    switch (type_any_files_source) {
      case 'MONGODB':
        $('#id_host').attr('required', 'required').closest('div').show(500);
        $('#id_port').attr('required', 'required').closest('div').show(500);
        $('#id_database').attr('required', 'required').closest('div').show(500);
        $('#id_mongodb_collection').attr('required', 'required').closest('div').show(500);
        $('#id_mongodb_file_src').attr('required', 'required').closest('div').show(500);
        $('#id_file_path').removeAttr('required').closest('div').hide(500);
        break;
      case 'fastapi':
        $('#id_host').removeAttr('required').closest('div').hide(500);
        $('#id_port').removeAttr('required').closest('div').hide(500);
        $('#id_database').removeAttr('required').closest('div').hide(500);
        $('#id_mongodb_collection').removeAttr('required').closest('div').hide(500);
        $('#id_mongodb_file_src').removeAttr('required').closest('div').hide(500);
        $('#id_file_path').attr('required', 'required').closest('div').show(500);
        break;
      case 'directory':
        $('#id_host').removeAttr('required').closest('div').hide(500);
        $('#id_port').removeAttr('required').closest('div').hide(500);
        $('#id_database').removeAttr('required').closest('div').hide(500);
        $('#id_mongodb_collection').removeAttr('required').closest('div').hide(500);
        $('#id_mongodb_file_src').removeAttr('required').closest('div').hide(500);
        $('#id_file_path').attr('required', 'required').closest('div').show(500);
        break;
    }
  }

}

// ------------------------------------------
function insert_file_schemas_to_selector(selector, file_type) {
  console.info('---- insert_file_schemas_to_selector ---');

  cid = '';
  searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('cid')) {
    cid = searchParams.get('cid');
  }

  $.ajax({
    url: `${location.origin + '/sources/file-schema/'}`,
    method: 'GET',
    data: {
      "action": "file_schema_list",
      "file_type": file_type,
      "cid": cid
    },
    success: function (data) {
      selector.html(data);
    }
  });
}

// ------------------------------------------
function fill_modal_add_csv_file_schema() {
  console.info('---- fill_modal_add_csv_file_schema ---');

  const file_type = $('#id_file_type').val();

  const file_path = $('#id_file_path').val();
  const files_need_scan_subdirs = $('#id_files_need_scan_subdirs').prop('checked');


  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    content_type: 'application/json',
    data: {
      'action': 'get_list_csv_files',
      'file_type': file_type,
      'path': file_path,
      'need_scan_subdirs': files_need_scan_subdirs,
    },
    success: function (data) {
      console.log(`ajax action 'get_list_csv_files' SUCCESS.`);
      const file_list = data.file_list;

      $('#id_schema_name').val('name' in _file_schema ? _file_schema.name : '');
      $('#id_schema_description').val('description' in _file_schema ? _file_schema.description : '');

      let files_list_select = $('#id_files_list');
      files_list_select.empty();
      for (let i = 0; i < file_list.length; i++) {
        const element = file_list[i];

        files_list_select.append($('<option/>')
          .text(element.file_name)
          .attr('value', element.file_path)
          .attr(('source_file' in _file_schema && element.file_path == _file_schema.source_file) ? {
            'selected': 'selected'
          } : {}));
      }

      $('#id_files_list').trigger('change');
    },
    error: function (d) {
      console.error("ajax action 'get_list_csv_files' ERROR.");
    }
  });

}

// ------------------------------------------
function fill_modal_add_csv_file_schema_content(file_path) {
  console.info('---- fill_modal_add_csv_file_schema_content ---');

  console.debug(`file_path = ${file_path}`);
  const csv_delimiter = $('#id_csv_delimiter').val();
  const csv_quotechar = $('#id_csv_quotechar').val();

  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    content_type: 'application/json',
    data: {
      'action': 'get_csv_file_content',
      'file_path': file_path,
      'csv_delimiter': csv_delimiter,
      'csv_quotechar': csv_quotechar,
    },
    success: function (data) {
      console.log(`ajax action 'get_csv_file_content' SUCCESS.`);
      const table_data = JSON.parse(data.table_data);
      const column_names = Object.keys(table_data);
      const column_datas = Object.values(table_data);

      $('#id_modal_csv_file_schema_save').val(column_names);
      console.debug(`content = ${content}`);

      $('#id_table_data').empty();
      if (table_data) {
        $('#id_table_data').append(tableDataView = $('<table/>'));
        tableDataView
          .attr('id', 'table_data_view')
          .addClass('table table-hover table-bordered')
          .append($('<caption/>')
            .append(Object.keys(table_data).length == 0 ? 'Пустая таблица' : 'Максимум первые 10 строк'))
          .append(tableHeader = $('<thead/>').addClass("thead-dark"))
          .append(tableBody = $('<tbody/>'));

        // Header
        tableHeader.append(tableHeaderRow = $('<tr/>'));
        for (let i = 0; i < column_names.length; i++) {
          tableHeaderRow.append($('<th/>').append(column_names[i]));
        }

        col_data = table_data[column_names[0]];
        if (typeof (col_data) != 'undefined') {
          var kk = Object.keys(col_data);
          // body
          for (let k = 0; k < Object.keys(kk).length; k++) {
            tableBody.append(tableDataRow = $('<tr/>'));

            for (let i = 0; i < column_names.length; i++) {
              let columnInfo = column_datas[i];
              let value = Object.values(table_data[column_names[i]])[k] != null ? Object.values(table_data[column_names[i]])[k] : '';
              switch (columnInfo.type) {
                case 'DATE':
                  value = new Date(value).toLocaleString("ru");
                  break;

                default:
                  value = value.toString();
                  break;
              }
              tableDataRow.append($('<td/>').append(Object.values(value)));
            }
          }
        }
      } else {
        $('#id_table_data').append("Нет данных для отображения");
      }
    },
    error: function (d) {
      console.error("ajax action 'get_csv_file_content' ERROR.");
    }
  });

}

// ***************************************************************************
(application = function () {
  console.info('=== edit-sources.js ===');

  // ------------------------------------------
  this.readySources = function () {
    if (getPageName() !== 'sources-page') {
      console.info('*** readySources - IGNORED ***');
      return;
    }
    console.info('=== readySources ===');
  };

  // ------------------------------------------
  $(document).ready(function () {
    console.info('*** readyConnects - is ready ***');

    if (document.getElementById('edit_source_connection') != null) {
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

    makeForm();


    /* Кнопка "Отмена" на странице редактирования сущности*/
    $("#button-id-cancel").on("click", function () {
      console.info('---- button-id-cancel click ---');
      window.location.href = "/sources/";
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_type_source', function () {
      console.info('---- id_type_source on change ---');

      update_dom();
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_file_type', function () {
      console.info('---- id_file_type on change ---');

      file_type = $('#id_file_type').val();
      // $('#id_file_schema').val('file_type' in _file_schema && file_type == _file_schema.file_type ? _file_schema.name : '');
      // insert_file_schemas_to_selector(selector_schemas, file_type);

      update_dom();
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_dbapi', function () {
      console.info('---- id_dbapi on change ---');
      $('#id_host').val('localhost');
      switch ($(this).val()) {
        case 'PGSQL':
          $('#id_port').val('5432');
          break;
        case 'ORACLE':
          $('#id_port').val('1521');
          break;
        case 'MYSQL':
          $('#id_port').val('3306');
          break;
        case 'MSSQL':
          $('#id_port').val('1433');
          break;

        default:
          $('#id_port').val('');
          break;
      }
    });

    $('#id_schema_tree')
      .bind('ready.jstree', function (e, data) {
        console.info('---- id_schema_tree bind state_ready.jstree ---');
        if (_connection) {
          if (typeof (_connection.schemas_with_tables) != 'undefined') {
            for (i = 0; i < _connection.schemas_with_tables.length; i++) {
              one_node = _connection.schemas_with_tables[i];
              $('#id_schema_tree').jstree('select_node', one_node.replace(".", ":"));
            }
          }
        }
      });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $(".collapse").on('show.bs.collapse', function () {
      // alert('The collapsible content is about to be shown.');

      $('.select2-container ').removeClass('form-control form-control-sm');
      $('.select2-container ').addClass('form-control form-control-sm');
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $(".collapse").on('shown.bs.collapse', function () {
      // alert('The collapsible content is now fully shown.');
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $(".collapse").on('hide.bs.collapse', function () {
      // alert('The collapsible content is about to be hidden.');
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $(".collapse").on('hidden.bs.collapse', function () {
      // alert('The collapsible content is now hidden.');
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_name', function () {
      console.info('---- id_name on change ---');
      // ! Необходимо проверить, существует ли такое имя соединения?


    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_host', function () {
      console.info('---- id_host on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_database', function () {
      console.info('---- id_database on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_port', function () {
      console.info('---- id_port on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_username', function () {
      console.info('---- id_username on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_password', function () {
      console.info('---- id_password on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('click', '#id_test_connection', function () {
      console.info('---- id_test_connection on click ---');

      form = $('form');
      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_source_connection') {
        testDbConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // $('body').on('click', '#id_button_save', function (event) {
    $('body').on('submit', 'form', function (event) {
      console.info('---- form submit ---');

      console.debug('0');
      let form_id = $(this).attr('id');
      if (form_id != 'id_form_source_connection') {
        console.debug(form_id);
        return;
      }
      event.preventDefault();
      let form = $(this)[0];
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        alert("Не все необходимые поля заполнены");
        return;
      }

      const name_connect = $('#id_name').val();
      const type_source = $('#id_type_source').val();
      const dbapi = $('#id_dbapi').val();
      const host = $('#id_host').val();
      const port = $('#id_port').val();
      const database = $('#id_database').val();
      const ssl_ca_certs = $('#id_ssl_ca_certs').val();
      let threads = parseInt($('#id_threads').val());
      if (threads >= 1 || threads <= 10) {} else if (threads < 1) {
        threads = 1;
      } else if (threads > 10) {
        threads = 10;
      } else {
        threads = 1;
      }

      const chunks = parseInt($('#id_chunks').val());
      const lim_lob_size = parseInt($('#id_lim_lob_size').val());
      const versions_count_for_load = parseInt($('#id_versions_count_for_load').val());

      const username = $('#id_username').val();
      const password = $('#id_password').val();

      const schemas_with_tables = $('#id_schema_tree').jstree('get_json');
      //console.debug(schemas_with_tables);
      const selected = $('#id_schema_tree ul li ul li ul li').jstree("get_selected");
      console.log("selected", selected);
      //console.debug(selected);
      let selected_final = [];
      try {
        for (let i = 0; i < selected.length; i++) {
          const element = selected[i];
          if (element.split(':').length == 2) {
            selected_final.push(element.split(':').join("."));
          }
        }

        // Проверка на то, что выбрана хоть одна схема для типа источника "База данных"
        // console.debug(type_source);
        // console.debug(selected_final.length);
        if (type_source == 'DB' && selected_final.length === 0) {
          event.preventDefault();
          //event.stopPropagation();
          alert('Не выбрана ни одна схема данных для типа источника "База данных"');
          return false;
        }
      } catch (e) {

      }

      const id = $('#id_id').val();
      const file_type = $('#id_file_type').val();
      const file_path = $('#id_file_path').val();
      const files_need_scan_subdirs = $('#id_files_need_scan_subdirs').prop('checked');

      const file_schema = _file_schema;
      const csv_delimiter = $('#id_csv_delimiter').val();
      const csv_quotechar = $('#id_csv_quotechar').val();
      const short_description = $('#id_short_description').val();

      const original_Url = $('#id_original_Url').val();
      const internal_identifier = $('#id_internal_identifier').val();
      const regulatory_documents = $('#id_regulatory_documents').val();
      const data_owner = $('#id_data_owner').val();
      const data_operator = $('#id_data_operator').val();
      const relation_to_the_data_lifecycle = $('#id_relation_to_the_data_lifecycle').val();

      // need_quality_control = $('#id_need_quality_control').prop('checked');

      const type_any_files_source = $('#id_type_any_files_source').val();
      const mongodb_collection = $('#id_mongodb_collection').val();
      const mongodb_file_src = $('#id_mongodb_file_src').val();

      save_data = {
        'id': id,
        'type_connection': 'SOURCE',
        'name': name_connect,
        'description': window.editor.id_description.getData(),
        'type_source': type_source,
        // database
        'dbapi': type_source == 'DB' ? dbapi : file_type,
        'host': type_source == 'DB' || type_source == 'ANY_FILES' ? host : '',
        'port': type_source == 'DB' || type_source == 'ANY_FILES' ? port : '',
        'database': type_source == 'DB' || type_source == 'ANY_FILES' ? database : '',
        'ssl_ca_certs': type_source == 'DB' ? ssl_ca_certs : '',
        'mongodb_collection': type_source == 'ANY_FILES' ? mongodb_collection : '',
        'mongodb_file_src': type_source == 'ANY_FILES' ? mongodb_file_src : '',
        'threads': type_source == 'DB' ? threads : '',
        'chunks': type_source == 'DB' ? chunks : '',
        'lim_lob_size': type_source == 'DB' ? lim_lob_size : '',
        'versions_count_for_load': versions_count_for_load,
        'username': type_source == 'DB' ? username : '',
        'password': type_source == 'DB' ? password : '',
        'schemas_with_tables': type_source == 'DB' ? selected_final : [],
        // files
        'file_type': type_source == 'DB' ? 'UNDEFINED' : file_type,
        'file_path': type_source == 'DB' ? '' : file_path,
        'files_need_scan_subdirs': type_source == 'DB' ? false : files_need_scan_subdirs,
        'file_schema': type_source == 'DB' ? '' : file_schema,
        'csv_delimiter': type_source == 'DB' ? '' : csv_delimiter,
        'csv_quotechar': type_source == 'DB' ? '' : csv_quotechar,
        'dest_path': '',
        // additional
        'short_description': short_description,
        'original_url': original_Url,
        'internal_identifier': internal_identifier,
        'regulatory_documents': regulatory_documents,
        'data_owner': data_owner,
        'data_operator': data_operator,
        'relation_to_the_data_lifecycle': relation_to_the_data_lifecycle,
        // 'need_quality_control': need_quality_control,
        'type_any_files_source': type_source == 'ANY_FILES' ? type_any_files_source : '',
      };

      // console.debug(save_data);
      $.ajax({
        url: `/sources/save`,
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({
          ...save_data,
        }),
        success: function (data) {
          console.log(`ajax action 'save_source_connection' SUCCESS.`);
          window.location.href = '/sources/';
        },
        error: function (d) {
          console.error("ajax action 'save_source_connection' ERROR.");
        }
      });


    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('.btn-source-info').on('click', function () {
      let title = $(this).attr('data-title');
      let name = $(this).attr('data-name');
      let text = $(this).attr('data-text');
      text += '<br>';
      text += '<br><a href="/wiki/opisanie-tipov-dannykh/' + name + '/">Описание типов данных</a>';
      text += '<br><a href="/wiki/soderzhimoe-istochnikov/' + name + '/">Содержимое источников</a>';
      text += '<br><a href="/wiki/soedineniia-s-istochnikami/' + name + '/">Соединения с источниками</a>';
      $('#dialog-source-info').html(text);
      $('#dialog-source-info').dialog({
        title: 'Информация по источнику: ' + title,
        autoOpen: true,
        modal: true,
        width: 800,
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('.btn-statistics').on('click', function () {
      let title = $(this).attr('data-title');
      let text = $(this).attr('data-text');
      $('#dialog-source-statistics').html(text);
      $('#dialog-source-statistics').dialog({
        title: 'Статистика источника: ' + title,
        autoOpen: true,
        modal: true,
        width: 800,
      });
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('#modal_add_csv_file_schema').on('show.bs.modal', function () {
      console.info('---- schema_add button show.bs.modal ---');

      fill_modal_add_csv_file_schema();
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('#id_files_list').change(function () {
      console.info('---- id_files_list change ---');

      const file_path = $(this).val();
      fill_modal_add_csv_file_schema_content(file_path);
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('#id_modal_csv_file_schema_save').click(function () {
      console.info('---- id_modal_csv_file_schema_save button click ---');

      const columns = $(this).val();
      const schema_name = $('#id_schema_name').val();
      const schema_description = $('#id_schema_description').val();
      const file_type = $('#id_file_type').val();
      const source_file = $('#id_files_list').val();

      if (!columns.length || !schema_name.length) {
        alert('Не все поля заполнены');
        return false;
      }

      let attributes = {};
      attributes.columns = columns;

      _file_schema.name = schema_name;
      _file_schema.description = schema_description;
      _file_schema.file_type = file_type;
      _file_schema.source_file = source_file;
      _file_schema.attributes = attributes;

      $('#id_file_schema').val(schema_name);
      // $.ajax({
      //   url: `${location.href}`,
      //   method: 'POST',
      //   content_type: 'application/json',
      //       data: {
      //         "action": "save_new_file_schema",
      //         "file_schema": JSON.stringify(file_schema)
      //       },
      //   success: function (data) {
      //     console.log(`ajax action 'save_new_file_schema' SUCCESS.`);
      //   },
      //   error: function (d) {
      //     console.error("ajax action 'save_new_file_schema' ERROR.");
      //   }

      // });


      // _schema_csv_file.schema_name = schema_name;
      // _schema_csv_file.schema_description = schema_description;
      // _schema_csv_file.columns = columns;
    });


    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('#id_button_delete_file_schema').click(function () {
      console.info('---- id_button_delete_file_schema button click ---');

      _file_schema = {};
      $('#id_file_schema').val('');
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('#id_button_edit_file_schema').click(function () {
      console.info('---- id_button_edit_file_schema button click ---');

      const file_type = $('#id_file_type').val();

      if (file_type == 'CSV') {
        $('#modal_add_csv_file_schema').modal({
          backdrop: "static"
        });


      } else {
        $.ajax({
          url: `${location.origin + '/sources/file-schema/'}`,
          method: 'GET',
          data: {
            "action": "add_new_file_schema",
            "file_type": file_type
          },

          success: function (data) {
            $('#edit_source_connection').append(data);
            $('#modal_add_file_schema').modal({
              backdrop: "static"
            });
          }
        });
      }
    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // $('#schema-detail').click(function () {
    //   file_schema_id = $('#id_file_schema').val();

    //   $.ajax({
    //     url: `${location.origin + '/sources/file-schema/'}`,
    //     method: 'GET',
    //     data: {
    //       "action": "file_schema_detail",
    //       "file_schema_id": file_schema_id
    //     },

    //     success: function (data) {
    //       $('#edit_source_connection').append(data);
    //       $('#modal_add_file_schema').modal({
    //         backdrop: "static"
    //       });
    //     }
    //   });
    // });

  });
}).call(this);