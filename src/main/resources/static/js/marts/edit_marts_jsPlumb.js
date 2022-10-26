var _mart = {
  "mart_name": '',
  "mart_description": '',
  "mart_dest_table": '',
  "mart_permanent": '',
  "mart_due_date": '',
  "mart_subscribers": '',
  "source_data_rows_limit": '10',
  "mart_columns_count": '',
  "mart_rows_count": '',
};
var _root_graph_json = [];
var _mart_filters = []; // Массив фильтров для витрины

//-------------------------------------------
// Подсчет количества отмеченных таблиц в графе
function countSelectedNodes() {
  let count = 0;
  let nodes = _root_graph_json['nodes'];
  $(nodes).each(function (index) {
    if (nodes[index]['selected']) {
      count++;
    }
  });
  return count;
}

// ------------------------------------------
// Заполним список сущностей (для диаграммы)
function fill_entities() {
  console.info('---- fill_entities ---');
  if (document.getElementById('entity_select') == null) {
    console.warn(' Отсутствует элемент - entity_select');
    return;
  }
  $('#entity_select').empty();

  let mart_id = '';
  if ($('#mart_id')) {
    mart_id = $('#mart_id').val();
  }

  $.ajax({
    url: `/marts/get-by-id/${mart_id||"null"}`,
    method: 'GET',
    success: function (get_entities_data) {
      console.log(`ajax action 'get_entities' SUCCESS`);
      if (get_entities_data.length != 0) {
        const entities = get_entities_data.entities.map(entity=>[entity.id,entity.entity_name]);
        const source_mart = get_entities_data.mart||{};
        let entity_id = '';

        //  Если витрина не пустая - вытащим данные из нее
        if (typeof source_mart?.id != 'undefined') {
          _mart = source_mart.mart_info;
          entity_id = source_mart.entity_id;

          _mart_filters = source_mart.mart_filters||[];
        }
        for (let i = 0; i < entities.length; i++) {
          const element = entities[i];
          const el_id = element[0];
          const el_name = element[1];

          let one_line = $("<\option>")
            .text(el_name)
            .val(el_id);
          if (el_id == entity_id) {
            one_line.attr("selected", "selected");
          }
          $('#entity_select').append(one_line);
        }
        // $('#entity_select').select2();
        //$('#entity_select').trigger('change');

        // Это зачение передается через GET-параметры
        if ($('#selected_entity_id').val() != '') {
          $('#entity_select').val($('#selected_entity_id').val());
        }
        // Вывов функции отрисовки графа
        callPaintMartGraph();
      }
    },
    error: function (d) {
      // console.debug(d);
      console.error(`ajax action 'get_entities' ERROR`);
    }
  });

}


// ------------------------------------------
function getGraphNodeById(node_id) {
  if (node_id && (node_id != "")) {} else {
    return false;
  }
  for (let i = 0; i < _root_graph_json.nodes.length; i++) {
    if (node_id == _root_graph_json.nodes[i].id) {
      return _root_graph_json.nodes[i];
    }
  }
  return false;
}

// ------------------------------------------
function getGraphNodeByParams(node_params) {
  if (node_params && (node_params.connect_id != "") && (node_params.schema != "") && (node_params.name != "")) {} else {
    return false;
  }
  for (let i = 0; i < _root_graph_json.nodes.length; i++) {
    if ((node_params.connect_id == _root_graph_json.nodes[i].data.connect_id) &&
      (node_params.schema == _root_graph_json.nodes[i].data.schema) &&
      (node_params.name == _root_graph_json.nodes[i].data.name)) {
      return _root_graph_json.nodes[i];
    }
  }
  return false;
}

// ------------------------------------------
function getGraphNodeColumnByName(node, column_name) {
  if (node && column_name && (column_name != "")) {} else {
    return false;
  }
  for (let i = 0; i < node.columns.length; i++) {
    if (column_name == node.columns[i].name) {
      return node.columns[i];
    }
  }
  return false;
}

// ------------------------------------------
function save_mart(mart, graph_json, mart_filters = []) {
  console.info('---- save_mart ---');
  let mart_id = '';
  if ($('#mart_id')) {
    mart_id = $('#mart_id').val();
  }
  //console.log(`${location.href}`);
  $.ajax({
    url: `/marts/save`,
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      "mart_id": mart_id,
      "mart_info": mart,
      "mart_graph": graph_json,
      "mart_filters": mart_filters,
    }),
    success: function (data) {
      console.log(`ajax action 'save_mart' SUCCESS`);
      window.location.href = '/marts/';
    },
    error: function (d) {
      if(d.status===200){
        window.location.href = '/marts/';
        return;
      }
      console.log(d);

      console.error(`ajax action 'save_mart' ERROR`);
    }
  });
}

// ------------------------------------------
// Функция генерации названия таблицы витрины из названия витрины
function makeMartTableName(mart_title_cyrillic) {
  if (mart_title_cyrillic == null || mart_title_cyrillic == '') {
    return false;
  }
  var translitMartTableName = '';
  translitMartTableName = $.trim(mart_title_cyrillic);
  translitMartTableName = translitMartTableName.toLowerCase();
  translitMartTableName = translitCyrillic(translitMartTableName);
  // Ограничиваем длину названия таблицы
  translitMartTableName = translitMartTableName.replace(/\s/g, '_');
  translitMartTableName = translitMartTableName.replace(/\W+\D+/g, '_');
  translitMartTableName = translitMartTableName.replace(/[\.\,\;\-\+\=\!\@\#\$\%\^\&\*\(\)\`\"\'\?]/g, '_');
  translitMartTableName = translitMartTableName.replace(/[\_]{2,}/g, '_');

  translitMartTableName = translitMartTableName.substring(0, 16);

  var uuid = uuid_short();
  uuid = uuid.replace(/-/g, '_');
  translitMartTableName += '_' + uuid;
  translitMartTableName = translitMartTableName.replace(/[\_]{2,}/g, '_');
  return translitMartTableName;
}

// ------------------------------------------
function translitCyrillic(cyrillic_string) {

  var ru = {
      'а': 'a',
      'б': 'b',
      'в': 'v',
      'г': 'g',
      'д': 'd',
      'е': 'e',
      'ё': 'e',
      'ж': 'j',
      'з': 'z',
      'и': 'i',
      'к': 'k',
      'л': 'l',
      'м': 'm',
      'н': 'n',
      'о': 'o',
      'п': 'p',
      'р': 'r',
      'с': 's',
      'т': 't',
      'у': 'u',
      'ф': 'f',
      'х': 'h',
      'ц': 'c',
      'ч': 'ch',
      'ш': 'sh',
      'щ': 'shch',
      'ы': 'y',
      'э': 'e',
      'ю': 'u',
      'я': 'ya'
    },
    n_str = [];

  cyrillic_string = cyrillic_string.replace(/[ъь]+/g, '').replace(/й/g, 'i');

  for (let i = 0; i < cyrillic_string.length; ++i) {
    n_str.push(
      ru[cyrillic_string[i]] ||
      ru[cyrillic_string[i].toLowerCase()] == undefined && cyrillic_string[i] ||
      ru[cyrillic_string[i].toLowerCase()].toUpperCase()
    );
  }

  return n_str.join('');
}

// ------------------------------------------
function uuid_short() {
  return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ------------------------------------------
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ------------------------------------------
//
function isMartDestTableNameCorrect(mart_dest_table) {
  var result = false;
  var mart_table_name_mask = /^[\w]{2,127}$/gm;
  if (mart_table_name_mask.test(mart_dest_table)) {
    result = true;
  }
  return result;
}

// ------------------------------------------
// Фильтры для витрины
// Основная функция для добавления и обновления фильтров витрины
function updateFilterInMartFilters(mart_filter) {
  console.log('--- update filter in mart filters start ... ---');
  var mart_filter_index = -1;
  // Если фильтр присутствует в массиве, то выясним его индекс в массиве и перезапишем
  if ((mart_filter_index = getMartFilterIndex(mart_filter)) >= 0) {
    console.log('--- update filter in mart filters with index = ' + mart_filter_index);
    _mart_filters[mart_filter_index] = mart_filter;
  }
  // Иначе если фильтр отсутствует в массиве, тогда добавим фильтр в массив
  else {
    addNewFilterInMartFilters(mart_filter);
  }
  console.log(_mart_filters);
  $('#modal_editMartFilter').modal('toggle');
}

// ------------------------------------------
// Вспомогательная функция для добавления нового фильтра в массив фильтров витрины
function addNewFilterInMartFilters(mart_filter) {
  console.log('--- add new filter in mart filters ---');
  _mart_filters.push(mart_filter);
  return _mart_filters;
}

// ------------------------------------------
// Функция для удаления фильтра витрины
function deleteFilterInMartFilters(mart_filter) {
  console.log('--- delete filter in mart filters start ... ---');
  var mart_filter_index = -1;
  // Если фильтр присутствует в массиве, то выясним его индекс в массиве и перезапишем
  if ((mart_filter_index = getMartFilterIndex(mart_filter)) >= 0) {
    console.log('--- delete filter in mart filters with index = ' + mart_filter_index);
    _mart_filters.splice(mart_filter_index, 1);
  }
  console.log(_mart_filters);
  $('#modal_editMartFilter').modal('toggle');
}

// ------------------------------------------
// Возвращает индекс фильтра в массиве фильтров витрины, если такой фильтр существует, либо false, если фильтр отсутствует
function getMartFilterIndex(mart_filter) {
  console.log('--- get filter index in mart filters ---');
  var filter_index = -1;
  for (let i = 0; i < _mart_filters.length; i++) {
    if (_mart_filters[i].connect_id == mart_filter.connect_id) {
      if (_mart_filters[i].schema == mart_filter.schema) {
        if (_mart_filters[i].metadata_name == mart_filter.metadata_name) {
          if (_mart_filters[i].column_name == mart_filter.column_name) {
            filter_index = i;
            break;
          }
        }
      }
    }
  }
  console.log('--- filter index = ' + filter_index);
  return filter_index;
}

// ------------------------------------------
//
function getMartFilterParams() {
  console.log('--- get mart filter params from form ---');
  var connect_id = $('#edit_metadata_filter_connect_id').val();
  var schema = $('#edit_metadata_filter_schema').val();
  var metadata_name = $('#edit_metadata_filter_metadata_name').val();
  var metadata_id = $('#edit_metadata_filter_metadata_id').val();
  var column_name = $('#edit_metadata_filter_column_name option:selected').val();
  var condition_type = $('#edit_metadata_filter_condition_type').val();
  var condition_values = $('input[name="edit_metadata_filter_condition_values[]"]').val(); // тип array (для возможности сохранения нескольких значений)
  var condition_min = $('#edit_metadata_filter_condition_min').val();
  var condition_max = $('#edit_metadata_filter_condition_max').val();

  var mart_filter = {
    'connect_id': connect_id,
    'schema': schema,
    'metadata_name': metadata_name,
    'metadata_id': metadata_id,
    'column_name': column_name,
    'condition_type': condition_type,
    'condition_values': condition_values, // тип array (для возможности сохранения нескольких значений)
    'condition_min': condition_min,
    'condition_max': condition_max,
  };
  console.log('--- mart_filter ---');
  console.log(mart_filter);
  return mart_filter;
}

// ------------------------------------------
//
function renderMartTableDataInfo(data) {
  console.info('*** renderMartTableDataInfo ***');
  //console.log(`ajax action 'get_metadata' SUCCESS. data = ${data}`);
  if (data.length != 0) {
    //emptySourceTableTab('#table-data-content');

    metadata = data.metadata;

    //metadata_fkeys = metadata.fkey;
    //fkey_names = Object.keys(metadata_fkeys);
    //fkey_datas = Object.values(metadata_fkeys);

    metadata_columns = metadata.columns;
    column_names = metadata_columns.map(column=>column.name);
    // columns = data.columns;
    //console.log(data.table_data);
    table_data = data.table_data.map(d=>JSON.parse(d));
    //console.log(table_data);

    // ====
    // table data
    $('#content_MartMetadataData').html('Загрузка содержимого...');
    if (table_data) {
      $('#content_MartMetadataData').html("<h4>" + metadata.name + "</h4>");
      $('#content_MartMetadataData').append(tableDataView = $('<table/>'));
      tableDataView
        .attr('id', 'table_data_view')
        .addClass('table table-hover table-bordered')
        .attr('data-paging', 'true')
        //.attr('data-paging-limit', '2')
        .append($('<caption/>')
          .append(Object.keys(table_data).length == 0 ? 'Пустая таблица' : 'Максимум первые 10 строк'))
        .append(tableHeader = $('<thead/>').addClass("thead-dark"))
        .append(tableBody = $('<tbody/>'));

      // Header
      tableHeader.append(tableHeaderRow = $('<tr/>'));
      for (let i = 0; i < column_names.length; i++) {
        tableHeaderRow.append($('<th/>').append(column_names[i]));
      }

      // body
      for (let k = 0; k < table_data.length; k++) {
        tableBody.append(tableDataRow = $('<tr/>'));
        for (let i = 0; i < column_names.length; i++) {
          console.log(table_data);
          val = table_data[k][column_names[i]];
          tableDataRow.append($('<td/>').append(val));
        }
      }
    } else {
      $('#content_MartMetadataData').html("Таблица не содержит данных");
    }
  }
  $('.table').footable({
    "paging": {
      "size": 10,
    }
  });
}

// ------------------------------------------
//
function callPaintMartGraph() {
  console.info('*** callPaintMartGraph - start ***');
  // Запросим элементы, которые были уже сохранены
  // ----------
  let mart_id = '';
  if ($('#mart_id')) {
    mart_id = $('#mart_id').val();
  }
  let current_entity_id = $('#entity_select').find(":selected").val();
  let selected_entity_id = $('#selected_entity_id').val();
  let mart_entity_id = $('#mart_entity_id').val();

  console.debug(`current_entity_id = ${current_entity_id}, selected_entity_id = ${selected_entity_id}, mart_entity_id = ${mart_entity_id}`);
  if (current_entity_id) {
    $.ajax({
      url: `/marts/get-diagram-data/?entity_id=${current_entity_id}&mart_id=${mart_id}`,
      method: 'GET',
      success: function (data) {
        console.log(`ajax action 'get_diagram_data - change' SUCCESS`);
        // if (data.length != 0) {
          _root_graph_json = data;
          // Очистим память от предыдущей загрузки (если она была)
          if (typeof window.jsPlumb != undefined && window.jsPlumb != undefined) {
            //window.jsPlumb.empty();
            window.jsPlumb.deleteEveryEndpoint();
            window.jsPlumb.reset();
            window.jsPlumb.unbind('tap');
            window.jsPlumb.clear();
            // window.jsPlumb.destroy();
            // window.jsPlumb.empty();
            // if (typeof window.toolkit != undefined && window.toolkit != undefined) {
            //   window.toolkit.unbind('tap');
            //   window.toolkit.clear();
            //   delete window.toolkit;
            // }
          }
          jsPlumbReady(_root_graph_json);
        // }
      },
      error: function (d) {
        console.error(`ajax action 'get_diagram_data - change' ERROR`);
      }
    });
  }
}

// ***************************************************************************
(application = function () {
  console.info('=== Marts-page.js ===');

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  this.readyMarts = function () {
    if (getPageName() !== 'marts-page') {
      console.info('*** readyMarts - IGNORED ***');
      return;
    }
    console.info('=== readyMarts ===');
  };

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $(document).ready(function () {
    console.info('*** readyMarts - is ready ***');

    // for Markdown
    window.editor = {};

    fill_entities();

    $('.custom-select').select2({
      theme: 'classic',
      allowClear: true,
      placeholder: "Выберите...",
    });

    // jsPlumbReady();
  });

  // ------------------------------------------
  //
  $('#btn_deleteMartFilter').on('click', function () {
    console.log('--- click delete mart filter ---');
    let mart_filter = getMartFilterParams();
    if (mart_filter) {
      deleteFilterInMartFilters(mart_filter);
    }
  });

  // ------------------------------------------
  //
  $('#btn_saveMartFilter').on('click', function () {
    console.log('--- click save mart filter ---');
    var mart_filter = getMartFilterParams();
    if (mart_filter) {
      var form = $('#modal_FormEditMartFilter')[0];
      if (!form.checkValidity()) {
        alert('Форма заполнена некорректно!');
      } else {
        updateFilterInMartFilters(mart_filter);
      }
    }
  });

  // ------------------------------------------
  // Нажата кнопка "сохранить" для витрины (на основной странице)
  $('#button_presave_mart').click(function () {
    if ($(this).hasClass('disabled')) {
      return;
    }
    console.info('---- button_presave_mart click ---');

    if (countSelectedNodes() <= 0) {
      alert('Ошибка. Не выбрана ни одна таблица. Необходимо отметить хотя бы одну таблицу.');
      return false;
    }

    $('#mart_name').val(_mart.mart_name);
    // console.debug($('#mart_name').val())
    $('#mart_description').html(_mart.mart_description);
    $('#mart_dest_table').val(_mart.mart_dest_table);

    //console.log(_mart);
    if (typeof (_mart.source_data_rows_limit) == 'undefined' && _mart.mart_rows_count != '') {
      _mart.source_data_rows_limit = _mart.mart_rows_count;
    }
    $('#id_source_data_rows_limit').val(_mart.source_data_rows_limit);

    // markdown
    if (window.editor.modal_edit_mart == undefined) {
      MarkdownEditor
        .create(document.querySelector('#mart_description'))
        .then(editor => {
          window.editor.modal_edit_mart = editor;
        })
        .catch(error => {
          console.error('MarkdownEditor common info editor.', error);
        });
    }

    now = new Date();
    str_now = now.toISOString().substr(0, 10);

    $('#id_mart_for_check_guality').prop('checked', _mart.mart_for_check_guality);

    if (_mart.mart_permanent) {
      $('#id_mart_permanent').prop('checked', _mart.mart_permanent);
      $('#id_mart_due_date').prop("disabled", true);
    } else if (_mart.mart_due_date) {
      //console.log(_mart.mart_due_date);
      //due_date = new Date(_mart.mart_due_date);
      //console.log(due_date);
      //formatted_due_date = due_date.toISOString();
      //console.log(formatted_due_date);
      formatted_due_date = _mart.mart_due_date.toString().substr(0, 10);
      //console.log(formatted_due_date);
      $('#id_mart_due_date').val(formatted_due_date);
    } else {
      $('#id_mart_due_date').val(str_now);
    }

    $('#id_mart_due_date').attr("min", str_now);

    $('#modal_edit_mart').modal({
      backdrop: "static"
    });

  });

  // ------------------------------------------
  $('#mart_name').on('blur', function () {
    let mart_name = $(this).val();
    if (mart_name != '') {
      let mart_table_name = '';
      mart_table_name = makeMartTableName(mart_name);
      console.log(mart_table_name);
      if (($('#mart_dest_table').val() == '') || ($('#action').val() == 'new')) {
        $('#mart_dest_table').val(mart_table_name);
      }
    }
  });

  // ------------------------------------------
  // отработка списка выбора сущности (для диаграммы)
  $('#entity_select').on('change', function () {
    console.info('---- entity_select change ---');
    // makeMultiselect();
    //id__id = $('#id__id').val();
    // $("#d3_diagram").empty();
    // $('#d3_diagram').append('<br><br><i class="fas fa-spinner fa-pulse fa-7x text-success"></i>');
    let action = $('#action').val();
    let mart_id = $('#mart_id').val();
    // let selected_entity_id = $('#entity_select').val();
    let selected_entity_id = $('#entity_select').find(":selected").val();
    console.debug('selected_entity_id = ' + selected_entity_id);
    window.location.href = '/marts/manage-mart/?action=' + action + '&cid=' + mart_id + '&entity_id=' + selected_entity_id;
    // callPaintMartGraph();

  });

  $('#id_mart_for_check_guality').click(function () {
    console.info('---- id_mart_for_check_guality click ---');

    $("#id_mart_permanent").prop("disabled", this.checked);
    $('#id_mart_permanent').prop('checked', true);
    $("#id_mart_due_date").prop("disabled", true);
  });

  // ------------------------------------------
  // Помечена витрина как постоянная
  $("#id_mart_permanent").click(function () {
    console.info('---- mart_permanent click ---');
    $("#id_mart_due_date").prop("disabled", this.checked);
  });

  // ------------------------------------------
  // Нажата кнопка в модальном диалоге сохранения витрины
  $('#modal_edit_mart_save').click(function () {
    console.info('---- modal_edit_mart_save click ---');

    // if ($('#modal_edit_mart').dialog("isOpen")) {
    //   return;
    // }

    _mart.mart_name = $('#mart_name').val();

    md_editor_data = window.editor.modal_edit_mart.getData();

    _mart.mart_description = md_editor_data;
    // _mart.mart_description = $('#mart_description').html(md_editor_data);
    _mart.mart_dest_table = $('#mart_dest_table').val();
    if (isMartDestTableNameCorrect(_mart.mart_dest_table)) {} else {
      $('#modal_mart_dest_table').modal({
        backdrop: "static"
      });
      return false;
    }

    _mart.source_data_rows_limit = $('#id_source_data_rows_limit option:selected').val();

    _mart.mart_for_check_guality = $('#id_mart_for_check_guality').prop('checked');
    _mart.mart_permanent = $('#id_mart_permanent').prop('checked');
    _mart.mart_due_date = $('#id_mart_due_date').val();

    _mart.entity_id = $('#entity_select').val();

    now = new Date();
    str_now = now.toISOString().substr(0, 10);
    console.log(_mart.mart_due_date);
    console.log(str_now);
    if (_mart.mart_permanent) {
      _mart.mart_due_date = '';
    } else if (!_mart.mart_permanent && !_mart.mart_due_date) {
      alert('Не выбран срок окончания действия');
      return false;
    } else if (!_mart.mart_permanent && _mart.mart_due_date < str_now) {
      alert('Выбран некорректный срок окончания действия');
      return false;
    }

    console.debug(_mart);
    if (_mart.mart_name.length && _mart.mart_dest_table.length) {

      save_mart(_mart, _root_graph_json, _mart_filters);
    }
  });


}).call(this);