/*jshint esversion: 6 */
var _mart_id = '';

// ------------------------------------------
function fillDataTable() {

  console.info('---- fillDataTable ---');
  if (document.getElementById('id_view_mart') == null) {
    return;
  }

  if (_mart_id.length) {

    // Заполнение данными
    $.ajax({
      url: `/marts/get-data-by-mart-table/${_mart_id}`,
      method: 'GET',
      dataType: "json",
      success: function (data) {
        console.log(`ajax action 'get_mart_table_data' SUCCESS. data = ${data}`);
        const tableData = data.table_data.map(data=>data.data);
        const tableColumns = data.table_columns.map(column=>{
          return{
            ...column,
            name:column.id
          }
        });

        var viewMart = $('#id_view_mart');
        viewMart.empty();
        viewMart.append(martDataTable = $('<table/>').attr('id', 'table_mart_data_view'));
        martDataTable.addClass('table table-hover table-sm table-bordered table-responsive view-mart-table-data');

        var martDataTableColumns = [];

        for (let i = 0; i < tableColumns.length; i++) {
          const oneColumn = tableColumns[i];

          martDataTableColumns.push({
            'name': oneColumn.id,
            'title': oneColumn.comment ? oneColumn.name : oneColumn.name,
          });

        }

        var martDataTableRows = [];
        for (let i = 0; i < tableData.length; i++) { // по колонкам
          var row = {};
          const tableDataRow = tableData[i];
          for (let j = 0; j < tableColumns.length; j++) {
            const nameColumn = tableColumns[j].id;
            const oneDataCell = tableDataRow[nameColumn];
            row[nameColumn] = oneDataCell;
          }
          martDataTableRows.push(row);
        }
        tb = $('#table_mart_data_view').footable({
          "paging": {
            "enabled": true,
            "size": 10,
            "countFormat": "{CP} из {TP}",
          },
          "columns": martDataTableColumns,
          'rows': martDataTableRows,
        });

      },
      error: function (d) {
        console.error(`ajax action 'get_mart_table_data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
      }
    });

    // $('#table_view_mart').footable({
    //   "paging": {
    //     "enabled": true,
    //     "size": 10,
    //   },
    //   "sorting": {
    //     "enabled": true,
    //   }
    // });
  }

}

// ***************************************************************************
(application = function () {
  console.info('=== Marts-page.js ===');

  // ------------------------------------------
  this.readyMarts = function () {
    if (getPageName() !== 'marts-page') {
      console.info('*** readyMarts - IGNORED ***');
      return;
    }
    console.info('=== readyMarts ===');
  };

  // ------------------------------------------
  //
  $(document).ready(function () {
    console.info('*** readyMarts - is ready ***');

    // Страница редактирования соединения с источников
    if (document.getElementById('mart_id') != null) {
      // Редактирование существующего соединения
      console.info("Редактирование существующего соединения с источником ");
      _mart_id = $('#mart_id').data('mart_id');
      console.debug(`_mart_id = ${_mart_id}`);
    } else {
      console.info("Создание нового соединения с источником ");
      // создание нвого соединения
    }


    fillDataTable();

  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('ready.ft.table', '#table_mart_data_view', function () {
    console.info('ready.ft.table');
    // изменим стили у таблицы
    table = $('#table_mart_data_view');
    table.removeClass('table-bordered');

    th = table.find('thead');
    th.addClass('thead-dark');
    tr = th.find('tr');
    tr.removeClass('footable-header');
  });

}).call(this);