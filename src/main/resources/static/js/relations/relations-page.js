/*jshint esversion: 6 */
function checkDisabledRelationsButton() {
  var count_checked_sources = 0;
  $('.sources-list-item-checkbox').each(function () {
    if ($(this).prop('checked')) {
      if ($(this).attr('id') == 'cid_all') {} else {
        count_checked_sources++;
      }
    }
  });
  // Если хотя бы один источник отмечен (checkbox), то сделать кнопку активной, иначе сделать неактивной
  if (count_checked_sources > 0) {
    $('#btn_index_edit_relations').prop('disabled', false);
  } else {
    $('#btn_index_edit_relations').prop('disabled', true);
  }
}

// Функция загрузки списка таблиц (или файлов) в элемент списка источников
function loadSourceTablesAndFiles(source_id) {
  if (source_id != "") {} else {
    return "Ошибка загрузки таблиц (файлов) для источника";
  }
  var html_response = '';
  //try {
  // Скроем кнопку
  $('button[data-source-id="' + source_id + '"]').hide();
  loadTablesAndFilesListFromDB(source_id);
  //} catch(e) {}
  return true;
}

// Вспомогательная функция отправки запроса к БД и получения ответа в виде json-списка таблиц (файлов)
function loadTablesAndFilesListFromDB(source_id) {
  var ar_list_tables_and_files = [];
  ar_list_tables_and_files[0] = ["-1", "Все"];

  // Запрос списка таблиц из БД (или файлов из ...) MongoDB
  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    dataType: "json",
    data: {
      'action': 'get_metadata',
      'cid': source_id,
    },
    complete: function () {},
    success: function (data) {
      //console.log(ar_list_tables_and_files[0]);
      //console.log(data);
      ar_list = data;
      //ar_list = JSON.parse(json_list);
      var ar_list_modified;
      //console.log(ar_list);
      $.each(ar_list, function (index, ar_item) {
        //console.log(ar_item);
        ar_list_modified = [
          ar_item['_id'],
          ar_item['name']
        ];
        //console.log(ar_list_modified);
        ar_list_tables_and_files[index + 1] = ar_list_modified;
        //console.log(ar_list_tables_and_files[index+1]);
      });
      //console.log(ar_list_tables_and_files);
      html_response = getHTMLTablesAndFilesList(ar_list_tables_and_files);
      showTablesFilesList(source_id, html_response);
    },
    error: function () {}
  });

  return ar_list_tables_and_files;
}

// Вспомогательная функция для генерации html-списка из json-списка
function getHTMLTablesAndFilesList(ar_list_tables_and_files) {
  var item_value = '';
  var item_title = '';
  var html_response = '';
  //console.log('getHTMLTablesAndFilesList start');
  console.log(ar_list_tables_and_files);
  //console.log('getHTMLTablesAndFilesList end');
  var ar_item;
  $.each(ar_list_tables_and_files, function (index, ar_item) {
    //console.log('item');
    //console.log(ar_item);
    item_value = ar_item[0];
    item_title = ar_item[1];
    html_item = '<option value="' + item_value + '">' + item_title + '</option>';
    html_response += html_item;
  });
  return html_response;
}

// Вспомогательная функция для отображения в браузере на странице списка таблиц (файлов)
function showTablesFilesList(source_id, html_response) {
  $('select[data-source-id="' + source_id + '"]:hidden').html(html_response);

  $('select[data-source-id="' + source_id + '"]').select2();
  // Покажем select
  $('select[data-source-id="' + source_id + '"]').show();
}


// ***************************************************************************
(application = function () {
  console.info('=== relations-page.js ===');

  // ------------------------------------------
  this.readyRelations = function () {
    if (getPageName() !== 'relations-page') {
      console.info('*** readyRelations - IGNORED ***');
      return;
    }
    console.info('=== readyRelations ===');
  }
  
  // ------------------------------------------
  $( document ).ready(function() {
    console.info('*** readyRelations - is ready ***');

  });   

  $("input[name=cid_all]").on('click change', function () {
        var cid_all_status = $(this).prop('checked');
        var cid_list = $('input[name^="cid["]');
        $.each(cid_list, function (index) {
          $(this).prop('checked', cid_all_status);
        });
  });

  $('.sources-list-item-checkbox').on('click', function () {
    checkDisabledRelationsButton();
  });

  // Подключение кнопок "Выбрать таблицу" в списке источников
  $('.relations-list-btn-show-tables').on('click', function () {
    var source_id = $(this).attr('data-source-id');
    //console.log(source_id);
    if (source_id != '') {
      loadSourceTablesAndFiles(source_id);
    }
  });


}).call(this);