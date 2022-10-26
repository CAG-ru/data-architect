/*jshint esversion: 6 */
var _activeTabId = '';
var _prevTabId = '';
var _handbook = [];
var $dialog_window = '';
var handbooks_titles = {
  TYPE_OF_DATA_SOURCE:"Вид источника данных",
  RELATION_TO_THE_DATA_LIFECYCLE:"Отношение к ЖЦ данных",
  LICENSE:"Лицензия / условия использования",
  SET_CATEGORIES:"Категории набора",
  AGGREGATION_LEVEL:"Уровень агрегации",
  HANDBOOKS_AND_CLASSIFIERS:"Справочники и классификаторы",
  TAGS:"Тэги",
  LOGICAL_TYPES:"Логические типы данных",
};

// ------------------------------------------
function create_modal_dialog() {
  console.info('*** create_modal_dialog ***');

  $dialog_window = $('<div/>')
    .addClass('modal fade')
    .attr('id', 'edit_row_modal')
    .attr('role', 'dialog')
    .append($('<div/>')
      .addClass('modal-dialog')
      .append($('<div/>')
        .addClass('modal-content')
        .append($('<div/>')
          .addClass('modal-header')
          .append($('<h4/>')
            .addClass('modal-title')
            .attr('id', 'dialog_title')
            .append('Создание/редактирование строки справочника')
          )
          .append($('<button/>')
            .attr('type', 'button')
            .addClass('close')
            .attr('aria-label', 'Закрыть')
            .attr('data-dismiss', 'modal')
            .append($('<span/>')
              .attr('aria-hidden', 'true')
              .append('×')
            )
          )
        )
        .append($('<div/>')
          .addClass('modal-body')
          .append($('<form/>')
            .addClass('was-validated')
            .attr('id', 'edit_form')
            .append($('<div/>')
              .attr('id', 'row_id')
              .addClass('hidden')
            )
            .append($('<div/>')
              .addClass('form-group required')
              .append($('<label/>')
                .attr('for', 'name_input')
                // .addClass('col-sm-3 control-label')
                .append('Название')
              )
              .append($('<input/>')
                .attr('type', 'text')
                .addClass('form-control')
                .attr('id', 'name_input')
                .attr('name', 'name_input')
                .attr('placeholder', 'Введите имя')
                .attr('required', 'required')
                .attr('aria-required', 'true')
              )
              .append($('<div/>')
                .addClass('invalid-feedback')
                .append('Поле не должно быть пустым')
              )
            )
            .append($('<div/>')
              .addClass('form-group')
              .append($('<label/>')
                .attr('for', 'description_input')
                // .addClass('col-sm-3 control-label')
                .append('Название')
              )
              .append($('<textarea/>')
                .addClass('form-control')
                .attr('rows', '5')
                .attr('id', 'description_input')
                .attr('name', 'description_input')
                .attr('placeholder', 'Введите описание')
              )
              .append($('<div/>')
                .addClass('invalid-feedback')
                .append('Поле не должно быть пустым')
              )
            )
          )
        )
        .append($('<div/>')
          .addClass('modal-footer')
          .append($('<div/>')
            .addClass('center btn-group ')
            .append($('<button/>')
              .addClass('btn btn-outline-primary btn-sm')
              .attr('type', 'submit')
              .attr('id', 'save_row_modal')
              .attr('data-dismiss', 'modal')
              .attr('disabled', 'disabled')
              .append('Сохранить')
            )
            .append($('<button/>')
              .addClass('btn btn-outline-danger btn-sm')
              .attr('type', 'button')
              .attr('data-dismiss', 'modal')
              .append('Отмена')
            )
          )
        )
      )
    );
}

// ------------------------------------------
function validate_inputs() {
  console.info('*** validate_inputs ***');

  var save_row_modal = $('#save_row_modal');
  var name_input = $('#name_input');
  var name_input_val = name_input.val();

  var validated = false;
  if (name_input_val) {
    save_row_modal.removeAttr('disabled');
    validated = true;
  } else {
    if (save_row_modal.attr('disabled') === undefined) {
      save_row_modal.attr('disabled', 'disabled');
      validated = false;
    }
  }
  console.debug(`validated = ${validated}`);
  return validated;
}

// ------------------------------------------
function getHandebookType() {
  var handbookType = '';
  switch (_activeTabId) {
    case '#type_of_data_source_tab':
      handbookType = 'TYPE_OF_DATA_SOURCE';
      break;
    case '#relations_datas_tab':
      handbookType = 'RELATION_TO_THE_DATA_LIFECYCLE';
      break;
    case '#license_tab':
      handbookType = 'LICENSE';
      break;
    case '#set_categories_tab':
      handbookType = 'SET_CATEGORIES';
      break;
    case '#aggregation_level_tab':
      handbookType = 'AGGREGATION_LEVEL';
      break;
    case '#handbooks_and_classifiers_tab':
      handbookType = 'HANDBOOKS_AND_CLASSIFIERS';
      break;
    case '#tags_tab':
      handbookType = 'TAGS';
    case '#tags_tab':
      handbookType = 'TAGS';
      break;
    case '#logical_types_tab':
      handbookType = 'LOGICAL_TYPES';
      break;
    default:
      handbookType = '';
  }
  return handbookType;
}

// ------------------------------------------
function makeActiveTabContent() {
  console.info('*** makeActiveTabContent ***');

  $.ajax({
    url: `/handbooks/get-by-type/${getHandebookType()}`,
    method: 'GET',
    success: function (data) {
      console.log(`ajax action 'get_handbook' SUCCESS.`);
      if (data.length != 0) {
        var handbook_name = handbooks_titles[getHandebookType()];
        _handbook = data.handbooks;

        var activeTab = $(_activeTabId);
        activeTab.empty();
        activeTab
          .append(tabPlace = $('<div/>')
            .addClass('mb_panel with-shadow white-background')
          );

        tabPlace.append($('<h5/>')
          .append(`Справочник '${handbook_name}'`)
        );
        tabPlace
          .append($('<button/>')
            .attr('id', 'create_handbook_row')
            .attr('type', 'button')
            .addClass('btn btn-outline-primary btn-sm')
            .append($('<i/>')
              .addClass('fa fa-plus icon')
            )
            .append('Добавить строку')
          )
          .append($('<br/>'))
          .append($('<br/>'))
          .append($('<div/>')
            .attr('id', 'filter-form-container')
            .addClass('right')
          );


        tabPlace.append(tableHandbook = $('<table/>')
          .attr('id', 'table_handbook')
          .addClass('table table-hover table-sm table-bordered')
          // .attr('data-filtering', 'true')
        );

        var tableHandbookColumns = [];
        tableHandbookColumns.push({
          'name': 'name',
          'title': 'Имя',
        });

        tableHandbookColumns.push({
          'name': 'description',
          'title': 'Описание',
        });
        tableHandbookColumns.push({
          'name': 'operations',
          'title': '',
          'classes': 'center'
        });

        var tableHandbookRows = [];
        for (var i = 0; i < _handbook.length; i++) {
          var one_row = _handbook[i];
          row = {};
          // row.name = one_metadata.name;
          row.name = one_row.name;
          row.description = one_row.description;
          row.operations = $('<td/>')
            .addClass('btn-group')
            .append($('<button/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('type', 'button')
              .attr('id', 'edit_handbook_row')
              .attr('row_id', one_row.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Изменить строку')
              .append($('<i/>')
                .addClass('far fa-edit icon')
              )
            )
            .append($('<button/>')
              .addClass("btn btn-outline-danger btn-sm")
              .attr('type', 'button')
              .attr('id', 'remove_handbook_element')
              .attr('row_id', one_row.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Удалить строку')
              .attr('onclick', "return confirm('Вы уверены, что хотите удалить строку справочника?')")
              .append($('<i/>')
                .addClass('far fa-trash-alt icon')
              )
            );
          tableHandbookRows.push(row);
        }
        tb = $('#table_handbook').footable({
          "paging": {
            "enabled": true,
            "size": 20,
            "countFormat": "{CP} из {TP}",
          },
          "filtering": {
            "enabled": false,
            // "position": "center",
            "focus": true,
            "placeholder": "Поиск",
            "dropdownTitle": "Искать в:",
            "container": "#filter-form-container"
          },
          "columns": tableHandbookColumns,
          'rows': tableHandbookRows,
        });
      }
    },
    error: function (request, status, error) {
      console.error(`ajax action 'get_handbook' ERROR.`);
      console.debug(request);
      console.debug(status);
      console.debug(error);
    }
  });

}

// ***************************************************************************
(application = function () {
  console.info('=== Entities-page.js ===');

  // ------------------------------------------
  this.readyHandbooks = function () {
    console.debug(getPageName());
    if (getPageName() !== 'handbooks-page') {
      console.info('*** readyHandbooks - IGNORED ***');
      return;
    }
    console.info('=== readyHandbooks ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyHandbooks - is ready ***');

    type_of_data_source_tab = $('#type_of_data_source_tab');
    relations_datas_tab = $('#relations_datas_tab');
    license_tab = $('#license_tab');
    set_categories_tab = $('#set_categories_tab');
    aggregation_level_tab = $('#aggregation_level_tab');
    handbooks_and_classifiers_tab = $('#handbooks_and_classifiers_tab');
    tags_tab = $('#tags_tab');
    logical_types_tab = $('#logical_types_tab');

    // Опредедим, какая закладка активна
    if (type_of_data_source_tab.hasClass('active')) {
      _activeTabId = '#type_of_data_source_tab';
    } else if (relations_datas_tab.hasClass('active')) {
      _activeTabId = '#relations_datas_tab';
    } else if (license_tab.hasClass('active')) {
      _activeTabId = '#license_tab';
    } else if (set_categories_tab.hasClass('active')) {
      _activeTabId = '#set_categories_tab';
    } else if (aggregation_level_tab.hasClass('active')) {
      _activeTabId = '#aggregation_level_tab';
    } else if (handbooks_and_classifiers_tab.hasClass('active')) {
      _activeTabId = '#handbooks_and_classifiers_tab';
    } else if (tags_tab.hasClass('active')) {
      _activeTabId = '#tags_tab';
    } else if (logical_types_tab.hasClass('active')) {
      _activeTabId = '#logical_types_tab';
    } else {
      _activeTabId = '';
    }
    console.debug(`_activeTabId = ${_activeTabId}`);
    makeActiveTabContent();
    create_modal_dialog();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('.nav-tabs a').on('shown.bs.tab', function (event) {
    _activeTabId = $(event.target).attr('href');
    _prevTabId = $(event.relatedTarget).attr('href');
    $(_prevTabId).empty();
    makeActiveTabContent();
    console.debug(`_activeTabId = ${_activeTabId}`);
    console.debug(`_prevTabId = ${_prevTabId}`);
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#create_handbook_row', function () {
    console.info('*** create_handbook_row - click ***');

    $dialog_window.find('#dialog_title').val('Создание строки');
    var test = $dialog_window.find('#row_id');
    $dialog_window.find('#row_id').removeAttr('row_id');
    $dialog_window.find('#name_input').val('');
    $dialog_window.find('#description_input').val('');
    $dialog_window.modal({
      backdrop: "static"
    });
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#edit_handbook_row', function () {
    console.info('*** edit_handbook_row - click ***');

    var rowId = $(this).attr('row_id');
    var row_name = '';
    var description = '';
    for (var i = 0; i < _handbook.length; i++) {
      var one_row = _handbook[i];
      if (one_row.id == rowId) {
        row_name = one_row.name;
        description = one_row.description;
        break;
      }
    }
    $dialog_window.find('#dialog_title').val('Редактирование строки');
    var test = $dialog_window.find('#row_id');
    $dialog_window.find('#row_id').attr('row_id', rowId);
    $dialog_window.find('#name_input').val(row_name);
    $dialog_window.find('#description_input').val(description);
    $dialog_window.modal({
      backdrop: "static"
    });
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#remove_handbook_element', function () {
    console.info('*** remove_handbook_element - click ***');

    var rowId = $(this).attr('row_id');
    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      data: {
        'action': 'remove_handbook_element',
        'cid': rowId,
      },
      success: function (data) {
        console.log(`ajax action 'remove_handbook_element' SUCCESS.`);
        makeActiveTabContent();

      },
      error: function (request, status, error) {
        console.error(`ajax action 'remove_handbook_element' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#save_row_modal', function () {
    console.info('---- #save_row_modal on click ---');

    if (validate_inputs()) {
      var rowId = $dialog_window.find('#row_id').attr('row_id');
      var row_name = $dialog_window.find('#name_input').val();
      var description = $dialog_window.find('#description_input').val();

      $.ajax({
        url: `/handbooks/save`,
        contentType: "application/json",
        method: 'POST',
        data: JSON.stringify({
          'type': getHandebookType(),
          'id': rowId == undefined ? '' : rowId,
          'name': row_name,
          'description': description,
        }),
        success: function (data) {
          console.log(`ajax action 'save_handbook_element' SUCCESS.`);
          makeActiveTabContent();

        },
        error: function (request, status, error) {
          console.error(`ajax action 'save_handbook_element' ERROR.`);
          console.debug(request);
          console.debug(status);
          console.debug(error);
        }
      });

    }
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('change', '#name_input', function () {
    console.info('---- #name_input on change ---');

    validate_inputs();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('blur', '#name_input', function () {
    console.info('---- #name_input on blur ---');

    validate_inputs();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('ready.ft.table', '#table_handbook', function () {
    console.info('ready.ft.table');
    // изменим стили у таблицы
    var table = $('#table_handbook');
    table.removeClass('table-bordered');

    th = table.find('thead');
    th.addClass('thead-dark');
    tr = th.find('tr');
    tr.removeClass('footable-header');
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('shown.bs.modal', "#edit_row_modal", function () {
    console.info('shown.bs.modal');
    validate_inputs();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('hidden.bs.modal', "#edit_row_modal", function () {
    console.info('hidden.bs.modal');
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('mouseenter', '.btn', function () {
    // console.debug('mouseenter');
    $(this).tooltip();
  });

}).call(this);