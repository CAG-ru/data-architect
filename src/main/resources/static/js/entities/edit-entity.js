/*jshint esversion: 6 */
var _entity_id = "";
var _entity = {};
var _connects = [];
var _metadatas = [];
var _columns = [];
var _currentConnection = {};
var _currentMetadata = {};
var _currentColumn = {};

// ------------------------------------------
function fillMetadatasSelect() {
  $('#id_metadata').empty();
  for (let i = 0; i < _metadatas.length; i++) {
    const one_metadata = _metadatas[i];

    $('#id_metadata').append(opt = $('<option/>').text(`${one_metadata.schema}:${one_metadata.name} | ${one_metadata.comment}`).attr('value', one_metadata.id));
    if (_entity && _entity.metadata_name == one_metadata.name) {
      _currentMetadata = one_metadata;
      opt.attr('selected', 'selected');
    }
  }
  $('#id_metadata').trigger('change');

}

// ------------------------------------------
function fillColumnsSelect() {
  $('#id_column_name').empty();
  for (let i = 0; i < _columns.length; i++) {
    const one_column = _columns[i];

    $('#id_column_name').append(opt = $('<option/>').text(`${one_column.name} | ${one_column.comment}`).attr('value', one_column.name));
    if (_entity && _entity.column_name == one_column.name) {
      _currentColumn = one_column;
      opt.attr('selected', 'selected');
    }
  }
  $('#id_column_name').trigger('change');
}

// ------------------------------------------
//
function makeForm() {
  console.info('---- makeForm ---');
  if (document.getElementById('edit_entity') == null) {
    return;
  }

  // Заполнение данными

  $.ajax({
    url: `/entities/init-entity-data?entity_id=${_entity_id}`,
    method: 'GET',
    dataType: "json",
    content_type: 'application/json',
    success: function (data) {
      console.log(`ajax action 'init-entity-data' SUCCESS. data = ${data}`);
      _entity = data.entity;
      _connects = data.connects_list;
      // _metadatas = data.metadatas;
      // _columns = data.columns;

      if (_entity) {
        $('#id_entity_name').val(_entity.entity_name);
        $('#id_description').val(_entity.description);
      }

      $('#id_connect').empty();
      for (let i = 0; i < _connects.length; i++) {
        const one_connect = _connects[i];

        $('#id_connect').append(opt = $('<option/>').text(`${one_connect.name}  |  ${one_connect.short_description}`).attr('value', one_connect.id));
        if (_entity && _entity.connect_id == one_connect.id) {
          _currentConnection = one_connect;
          opt.attr('selected', 'selected');
        }
      }

      $('#id_connect').trigger('change');

    },
    error: function (d) {
      console.error(`ajax action 'init-entity-data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
    }
  });

}

// ------------------------------------------
/*  */
function loadAllColumnsForMetadataSelect(metadata_connect_id, metadata_id) {
  console.info('---- loadAllColumnsForMetadataSelect ---');

  // setTimeout(()=>{
    _columns=_metadatas.find(item=>item.id===metadata_id)?.columns||[];
  fillColumnsSelect();
  // },0);

  console.log(_metadatas.find(item => item.id === metadata_id));
  console.log(_columns);
  // $.ajax({
  //   url: `${location.href}`,
  //   method: 'POST',
  //   data: {
  //     "action": "get_columns_for_metadata",
  //     "connect_id": metadata_connect_id,
  //     "metadata_id": metadata_id,
  //   },
  //   success: function (data) {
  //     console.log(`ajax action 'get_columns_for_metadata' SUCCESS`);
  //     _columns = data.columns;
  //
  //     fillColumnsSelect();
  //   },
  //   error: function (d) {
  //     console.error(`ajax action 'get_columns_for_metadata' ERROR`);
  //   }
  // });
}

// ------------------------------------------
/*  */
function loadAllMetadataForConnectSelect() {
  console.info('---- loadAllMetadataForConnectSelect ---');

  console.log(_currentConnection);
  $.ajax({
    url: `/meta-data/get-by-connection-id/${_currentConnection.id}`,
    method: 'GET',
    success: function (data) {
      console.log(`ajax action 'get_metadatas_for_connect' SUCCESS`);
      _metadatas = data.metadatas;

      fillMetadatasSelect();
    },
    error: function (d) {
      console.error(`ajax action 'get_metadatas_for_connect' ERROR`);
    }
  });
}

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

    // Автоматически заполняем поля формы при добавлении новой сущности
    var action = $('#action').val();

    // Страница редактирования сущности
    if (document.getElementById('entity_id') != null) {
      console.info("Редактирование существующей сущности ");
      _entity_id = $('#entity_id').data('entity_id');
      console.debug(`_entity_id = ${_entity_id}`);
    } else {
      console.info("Создание новой сущности ");
    }

    makeForm();

    // if (action == 'new') {
    //   var connect_id = $('#id_connect').val();
    //   loadAllMetadataForConnectSelect(connect_id);
    // }

    // for Markdown
    window.editor = {};

    if (window.editor.id_description == undefined) {
      try {
        MarkdownEditor
          .create(document.querySelector('#id_description'))
          .then(editor => {
            window.editor.id_description = editor;
          })
          .catch(error => {
            console.error('MarkdownEditor common info editor.', error);
          });
      } catch (e) {}
    }

    $('.custom-select').select2({
      theme: 'classic',
      allowClear: true,
      placeholder: "Выберите...",
    });

  });

  // ------------------------------------------
  /* Загрузка списка таблиц */
  $('#id_connect').change(function () {
    console.info('---- id_connect change ---');

    connect_id = $(this).val();
    for (let i = 0; i < _connects.length; i++) {
      oneConnection = _connects[i];
      if (oneConnection.id == connect_id) {
        _currentConnection = oneConnection;
        break;
      }
    }
    loadAllMetadataForConnectSelect();
  });

  // ------------------------------------------
  /* Загрузка списка столбцов */
  $('#id_metadata').on('change click', function () {
    console.info('---- id_metadata change ---');

    var metadata_id = $(this).val();
    for (let i = 0; i < _metadatas.length; i++) {
      oneMetadata = _metadatas[i];
      if (oneMetadata.id == metadata_id) {
        _currentMetadata = oneMetadata;
        break;
      }
    }
    loadAllColumnsForMetadataSelect(
      metadata_connect_id = $('#id_connect option:selected').val(),
      metadata_id = metadata_id
    );
  });

  // ------------------------------------------

  // ------------------------------------------
  /* Загрузка списка столбцов */
  $('#id_column_name').on('change click', function () {
    console.info('---- id_column_name change ---');

    var columnName = $(this).val();
    var oneColumn = {};

    for (let i = 0; i < _columns.length; i++) {
      oneColumn = _columns[i];
      if (oneColumn.name == columnName) {
        _currentColumn = oneColumn;
        break;
      }
    }

    var entity_name = '';

    entity_name += _currentConnection.name;
    entity_name += ' | ';
    entity_name += !_currentMetadata.comment ? _currentMetadata.name : _currentMetadata.comment;
    entity_name += ' | ';
    entity_name += !_currentColumn.comment ? _currentColumn.name : _currentColumn.comment;
    $('#id_entity_name').val(entity_name);

  });

  // ------------------------------------------
  /* Кнопка Сохранить*/
  $("#id_button_save").on("click", function () {
    console.info('---- id_button_save click ---');

    // entity_id = $('#entity_id').attr('entity_id') == undefined ? '' : $('#entity_id').attr('entity_id');
    connect_id = $("#id_connect").val();
    metadata_id = $("#id_metadata").val();
    column_name = $("#id_column_name").val();
    entity_name = $("#id_entity_name").val();
    description = window.editor.id_description.getData();
    $.ajax({
      url: `/entities/save`,
      method: 'POST',
      contentType: "application/json",
      data: JSON.stringify({
        "id": _entity_id||null,
        "connect_id": connect_id,
        "metadata_id": metadata_id,
        "column_name": column_name,
        "entity_name": entity_name,
        "description": description,
      }),
      success: function (data) {
        console.log(`ajax action 'save_entity' SUCCESS.`);
        if (data.length != 0) {
          window.location.href = '/entities/';
        }
      },
      error: function (d) {
        console.error(`ajax action 'save_entity' ERROR`);
      }
    });
  });

  // ------------------------------------------
  /* Кнопка "Отмена" на странице редактирования сущности*/
  $("#button-id-cancel").on("click", function () {
    console.info('---- button-id-cancel click ---');
    window.location.href = "/entities/";
  });

}).call(this);