/*jshint esversion: 6 */

/* Подключаемые функции для функционирования страницы Источники */

function getIconForType(type_source, file_type = null) {
  res = '';

  switch (type_source) {
    case 'FILES':
      switch (file_type) {
        case 'CSV':
          res = "fas fa-file-csv";
          break;
        case 'xml':
          res = "far fa-file-code";
          break;
        case 'json':
          res = "far fa-file-code";
          break;
        case 'EXCEL':
          res = "far fa-file-excel";
          break;
        case 'word':
          res = "fa fa-file-word-o";
          break;
        case 'pdf':
          res = "fa fa-file-pdf-o";
          break;
        case 'pictures':
          res = "fa fa-file-image-o";
          break;
        case 'txt':
          res = "fa fa-file-text";
          break;
        default:
          res = "far fa-file-alt";
          break;
      }
      break;
    default:
      res = "fas fa-database";
  }
  return res;
}

// ------------------------------------------
// Очистка вкладки с id=table_tab_id
function emptySourceTableTab(table_tab_id) {
  if (table_tab_id && table_tab_id != "") {
    $(table_tab_id).children(".tab-content").empty();
    return true;
  }
  return false;
}


// -------------------------------------------
// Объект вкладки (область заголовка и кнопок)
function getSourceTableTabHeaderObject(table_tab_id) {
  var tab_object = $(table_tab_id).children(".tab-header");
  return tab_object;
}


// -------------------------------------------
// Объект вкладки (область контента)
function getSourceTableTabContentObject(table_tab_id) {
  var tab_object = $(table_tab_id).children(".tab-content");
  return tab_object;
}


// -------------------------------------------
// Объект вкладки (область заголовка и кнопок)
function getSourceTableTabFooterObject(table_tab_id) {
  var tab_object = $(table_tab_id).children(".tab-footer");
  return tab_object;
}


// -------------------------------------------
//
function emptyElement(selected_object) {
  selected_object.empty();
}

function makeTableElement(is_source, cid, label, id_edit_div, value, is_text_area = false, is_editable = true) {
  element = $('<tr/>')
    .append(table_data = $('<td/>')
      .append(makeElement(is_source, cid, label, id_edit_div, value, is_text_area, is_editable))
    );
  return element;
}

function makeElement(is_source, cid, label, id_edit_div, value, is_text_area = false, is_editable = true, help_text = '') {
  element = $('<div/>')
    .append($('<label/>')
      .append(label)
      .append(span_element = $('<span/>'))
      // edit button 
    );
  if (help_text.length) {
    element.attr('aria-describedby', `help_${id_edit_div}`)
  }

  if (is_editable) {
    span_element.append($('<button/>')
      .addClass('icon btn edit_btn')
      // .attr('id', 'id_edit_table_description')
      .attr('for_id', id_edit_div)
      .append($('<i/>')
        .addClass('far fa-edit text-primary')
      )
    );
    // save button
    span_element.append($('<button/>')
      .addClass('icon btn save_btn')
      // .attr('id', 'id_save_table_description')
      .css('display', 'none')
      .attr('for_id', id_edit_div)
      .append($('<i/>')
        .addClass('far fa-save text-success')
      )
    );
  }

  element.append($('<div/>')
    .attr("cid", cid)
    .attr('is_source', is_source)
    .attr('id', id_edit_div)
    .addClass(`contenteditable ${is_text_area ? 'contenteditable-textarea' : ''}`)
    .addClass('mb_panel gray-background')
    .append(value)
  );

  if (help_text.length) {
    element.append($('<small/>')
      .attr('id', `help_${id_edit_div}`)
      .addClass('form-text text-muted')
      .append(help_text)
    );
  }
  return element;
}

// -------------------------------------------
function getSourceConn(sources_connections, id) {
  if (!id.length) {
    return {};
  }

  for (let i = 0; i < sources_connections.length; i++) {
    const one_conn = sources_connections[i];
    if (one_conn.id == id) {
      return one_conn;
    }
  }
  return {};
}

// -------------------------------------------
function getMetadata(metadatas, id) {
  if (!id.length) {
    return undefined;
  }

  for (let i = 0; i < metadatas.length; i++) {
    let one_conn = metadatas[i];
    if (one_conn.id == id) {
      return one_conn;
    }
  }
  return undefined;
}

// -------------------------------------------
function getMetadataPos(metadatas, id) {
  if (!id.length) {
    return -1;
  }

  for (let i = 0; i < metadatas.length; i++) {
    let one_conn = metadatas[i];
    if (one_conn.id == id) {
      return i;
    }
  }
  return -1;
}

// -------------------------------------------
function getColumnData(columns, nameOfColumn) {
  if (!nameOfColumn.length) {
    return {};
  }

  for (let i = 0; i < columns.length; i++) {
    let one = columns[i];
    if (one.name == nameOfColumn) {
      return one;
    }
  }
  return {};
}