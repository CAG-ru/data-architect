/*jshint esversion: 6 */

/* Реализация JS-логики на основе вызовы функций, определенных в sources-api.js */
var _TYPES_CONNECTON = [];
var _TYPES_DATABASES = [];
var _TYPES_FILES = [];
var _TYPES_SOURCE = [];
var _EDIT_PROCESS = false;
var _DIGITAL_PLATFORM_INTEGRATION = false;
var _QUALITY_CONTROL_STATUS = {};
var RECOGNITION_TYPES = ['PDF', 'JPG', 'TIF', 'PNG', 'BMP'];
var _SOURCE_CONNECTIONS = [];
var _USER = '';
var _USER_IS_STAFF = false;

function typeFileName(shorttName) {
  for (let i = 0; i < _TYPES_FILES.length; i++) {
    const one = _TYPES_FILES[i];
    if (one[0] == shorttName) {
      return one[1];
    }
  }
  return '';
}

// ------------------------------------------
// Вывод дерева источников данных и их таблиц
function makeTree() {
  console.info('---- makeTree ---');
  const elem = document.getElementById('sources_tree');
  if (elem == null) {
    return;
  }
  let sources_tree = $('#sources_tree');
  sources_tree.empty();
  sources_tree.append(getSpinner());

  // let button_place = $('#id_action_button_place');
  // button_place.empty();
  // button_place
  //   .append($('<a/>')
  //     .attr('href', 'edit-source-conn/?action=new')
  //     .attr('role', 'button')
  //     .addClass('btn btn-outline-primary btn-sm')
  //     .append($('<i/>')
  //       .addClass('fa fa-plus')
  //     )
  //     .append('Добавить соединение с источником')
  //   );

  // Запросим элементы, которые были уже сохранены
  // ----------
  $.ajax({
    url: `/sources/init-list-source-connections`,
    method: 'GET',
    data: {},
    success: function (data) {
      console.log(`ajax action 'get_sources' SUCCESS. data = ${data}`);
      if (data.length != 0) {
        _SOURCE_CONNECTIONS = data.source_connections;
        _METADATAS = data.metadatas;
        _TYPES_DATABASES = data.TYPES_DATABASES;
        _TYPES_FILES = data.TYPES_FILES;
        _TYPES_SOURCE = data.TYPES_SOURCE;
        _TYPES_CONNECTON = data.TYPES_CONNECTON;
        _QUALITY_CONTROL_STATUS = data.QUALITY_CONTROL_STATUS;
        _USER = data.user;
        _USER_IS_STAFF = data.user_is_staff;

        let root_li;
        let root = $('<ul/>').append(
          root_li = $('<li/>')
          .text(`Источники данных (${_SOURCE_CONNECTIONS.length})`)
          .data("jstree", {
            "icon": "fas fa-home"
          })
          .attr("type", 'root')
        );

        root_li.append(root_ul = $('<ul/>'));
        for (let i = 0; i < _SOURCE_CONNECTIONS.length; i++) {
          const one_source_conn = _SOURCE_CONNECTIONS[i];

          let source_li = $('<li/>')
            .text(`${one_source_conn.name} [${one_source_conn.dbapi}` + (one_source_conn.type_source == 'FILES' ? `:${one_source_conn.file_type}` : '') + ']')
            .attr("cid", `${one_source_conn.id}`)
            .attr("type", 'source_conn')
            .data("jstree", {
              "icon": `${getIconForType(one_source_conn.type_source, one_source_conn.file_type)} ${one_source_conn.last_version ? 'text-success' : 'text-muted'}`
            });

          // Подсчитаем количество версий для данного источника и заполним соответствующий массив
          let versions = [];
          for (let j = 0; j < _METADATAS.length; j++) {
            const one_metadata = _METADATAS[j];
            if (one_metadata.connect_id != one_source_conn.id) {
              continue;
            }
            if (versions.indexOf(one_metadata.version) == -1) {
              versions.push(one_metadata.version);
            }
          }
          let versions_ul;
          source_li.append(
            versions_ul = $('<ul/>'));

          for (let k = 0; k < versions.length; k++) {
            // Подсчитаем количество таблиц в источнике
            let cnt = 0;
            for (let j = 0; j < _METADATAS.length; j++) {
              const one_metadata = _METADATAS[j];
              if (one_metadata.connect_id == one_source_conn.id && one_metadata.version == versions[k]) {
                cnt++;
              }
            }
            let version_li;
            versions_ul.append(
              version_li = $('<li/>')
              .text(`Версия от: ${new Date(versions[k]).toLocaleDateString()}`)
              // .attr("id", `${one_metadata.id}`)
              .attr("type", 'version')
              .data("jstree", {
                "icon": "fas fa-code-branch"
              })
            );
            let tables_common_ul;
            let tables_li;
            version_li.append(tables_common_ul = $('<ul/>'));
            tables_common_ul.append(
              tables_li = $('<li/>')
              .attr("version", `${versions[k]}`)
              .text((one_source_conn.type_source == 'FILES' ? 'Файлы' : 'Таблицы') + ` (${cnt})`));
            tables_li.append(
              tables_ul = $('<ul/>'));
            tables_li.data("jstree", {
              "icon": one_source_conn.type_source == 'FILES' ? "far fa-copy" : "far fa-window-restore"
            });
            tables_li.attr("type", 'tables_group');
            tables_li.attr("cid", one_source_conn.id);


            // version_li.append(
            //   tables_ul = $('<ul/>'));
            for (let j = 0; j < _METADATAS.length; j++) {
              const one_metadata = _METADATAS[j];
              if (one_metadata.connect_id != one_source_conn.id || one_metadata.version != versions[k]) {
                continue;
              }
              columns = one_metadata.columns;
              column_names = columns.map(column => column.name);
              column_datas = Object.values(columns);
              tables_ul.append(
                one_table_li = $('<li/>')
                .text((one_metadata.schema ? `${one_metadata.schema}:` : '') + `${one_metadata.name}` + (one_source_conn.type_source == 'FILES' ? `[${one_source_conn.file_type}]` : ''))
                .attr("cid", one_metadata.id)
                .attr("type", 'table')
                .data("jstree", {
                  "icon": "far fa-window-maximize"
                })
              );
              for (let colIdx = 0; colIdx < column_names.length; colIdx++) {
                const column_name = column_names[colIdx];

                one_table_li.append($('<ul/>')
                  .append($('<li/>')
                    .text(column_name)
                    .attr("cid", one_metadata.id)
                    .attr("type", 'column')
                    .data("jstree", {
                      "icon": "fas fa-grip-vertical"
                    })
                  ));
              }

            }
          }
          root_ul.append(source_li);
        }
        sources_tree.append(root);
        sources_tree.jstree({
          "plugins": ["wholerow", "sort", "search"],
          'core': {
            'expand_selected_onload': true,
            "themes": {
              // "stripes": true,
              "dots": true,
              "ellipsis": true,
            },
          }
        });
        // Автоматически раскроем корневой узел дерева
        sources_tree.jstree('open_node', $('#j1_1_anchor'));
        //
        showSourcesInfo();
      }
    },
    error: function (request, status, error) {
      console.error(`ajax action 'get_sources' ERROR.`);
      console.debug(request);
      console.debug(status);
      console.debug(error);
    }
  });

}

// ------------------------------------------
function showSourcesInfo() {
  console.info('---- showSourcesInfo ---');


  // emptySourceTableTab('#common_info');
  // $('#common_info_tab').text('Список источников');
  //console.log(getSpinner());
  // getSourceTableTabContentObject('#common_info').html('<br><br>' + getSpinner());
  let info_place = $('#id_info_place');
  info_place.empty();
  info_place
    .append($('<h5/>')
      .append('Список соединений с источниками')
    )
    .append(button_place = $('<div/>')
      .attr('id', 'button_place')
    )
    .append(common_info = $('<div/>')
      .attr('id', 'id_common_info')
      .append(getSpinner())
    );

  common_info.empty();
  common_info.append(listSourcesView = $('<table/>').attr('id', 'tables_group_view'));
  listSourcesView.addClass('table table-hover table-sm table-bordered');

  let listSourcesViewColumns = [];
  listSourcesViewColumns.push({
    'name': 'data_type',
    'title': '',
  });

  listSourcesViewColumns.push({
    'name': 'name',
    'title': 'Имя источника',
  });

  listSourcesViewColumns.push({
    'name': 'source',
    'title': 'Источник',
  });

  listSourcesViewColumns.push({
    'name': 'last_version',
    'title': 'Последняя версия',
  });

  listSourcesViewColumns.push({
    'name': 'author',
    'title': 'Автор',
  });

  listSourcesViewColumns.push({
    'name': 'operations',
    'title': '',
  });


  let listSourcesViewRows = [];
  for (let i = 0; i < _SOURCE_CONNECTIONS.length; i++) {
    const one_source = _SOURCE_CONNECTIONS[i];
    // type_source_keys = Object.keys(_TYPES_SOURCE);
    // type_source_values = Object.values(_TYPES_SOURCE);
    // index = type_source_keys(one_source.type_source);
    let row = {};
    row.data_type = $('<td/>')
      .append('<i/>')
      .addClass(getIconForType(one_source.type_source, one_source.file_type))
      .addClass(one_source.last_version != undefined && one_source.last_version ? 'text-success' : 'text-muted');
    row.name = $('<td/>')
      // .addClass('text-body pointer')
      .append(row_name_div = $('<div/>')
        .append($('<a/>')
          .attr('href', '#')
          .attr('id', 'id_source_name')
          .attr('cid', one_source.id)
          .append(one_source.name)
        )
      );

    if (one_source.description.length) {
      row_name_div.append($('<span/>')
        .append($('<i/>')
          .addClass('fas fa-info-circle icon green ')
          .attr('data-toggle', 'tooltip')
          .attr('title', one_source.description)
        )
      );
    }
    if (one_source.type_source == 'DB') {
      row.source = `${(one_source.type_source_human)}/${one_source.dbapi_human}/${one_source.host}:${one_source.port}/${one_source.database}`;
    } else if (one_source.type_source == 'files') {
      row.source = `${(one_source.type_source_human)}/${one_source.file_type_human}`;
    } else if (one_source.type_source == 'any_files') {
      row.source = `${(one_source.type_source_human)}/${one_source.host}:${one_source.port}/${one_source.database}/${one_source.mongodb_file_src}/${one_source.file_type}`;
    }
    if (one_source.last_version != undefined && one_source.last_version) {
      row.last_version = new Date(one_source.last_version).toLocaleDateString();
    } else {
      row.last_version = 'не загружено';
    }
    row.author = one_source.created_by;


    if (one_source.created_by == _USER || _USER_IS_STAFF) {
      row.operations = $('<td/>')
        .append($('<div/>')
          .addClass('btn-group')
          .append($('<a/>')
            .addClass("btn btn-outline-primary btn-sm")
            .attr('role', 'button')
            .attr('id', 'btn_edit_source_conn')
            .attr('href', `/sources/edit-source-conn/?cid=${one_source.id}`)
            .attr('data-toggle', 'tooltip')
            .attr('title', 'Изменить настройку соединения')
            .append($('<i/>')
              .addClass('far fa-edit')
            )
          )
          .append($('<div/>')
            .addClass('dropdown dropleft float-right')
            .append($('<button/>')
              .attr('type', 'button')
              .addClass('btn btn-outline-primary btn-sm dropdown-toggle')
              .attr('data-toggle', 'dropdown')
              .append($('<i/>')
                .addClass('fas fa-tools icon')
              )
            )
            .append($('<div/>')
              .addClass('dropdown-menu')

              .append($('<p/>')
                .addClass('dropdown-header font-weight-bold text-body')
                .text(' Обработка информации ')
              )

              .append($('<button/>')
                .addClass("dropdown-item")
                .attr('id', 'btn_load_data')
                // .attr('role', 'button')
                .attr('conn_id', one_source.id)
                // .attr('href', `edit-source-conn/?action=load&cid=${one_source.id}`)
                .attr('data-toggle', 'tooltip')
                .attr('title', 'Загрузить данные из источника')
                .append($('<i/>')
                  .addClass('fas fa-download icon')
                )
                .append('Загрузить')
              )

              .append($('<div/>')
                .addClass("dropdown-divider")
              )

              .append($('<a/>')
                .addClass(`dropdown-item ${one_source.last_version && one_source.type_source == 'DB' ? '' : 'disabled'}`)
                .attr('id', 'btn_make_relations_from_foreign_key')
                .attr('conn_id', one_source.id)
                .attr('href', `/sources/make-relations/${one_source.id}`)
                .attr('data-toggle', 'tooltip')
                .attr('title', 'Обработка связей на уровне БД - Foreign key')
                .append($('<i/>')
                  .addClass('fas fa-key icon')
                )
                .append('Обработка Foreign key')
              )

            )
          )
          .append($('<div/>')
            .addClass('dropdown dropleft float-right')
            .append($('<button/>')
              .attr('type', 'button')
              .css('display', _USER_IS_STAFF ? '' : 'none')
              .addClass('btn btn-outline-danger btn-sm dropdown-toggle')
              .attr('data-toggle', 'dropdown')
              .append($('<i/>')
                .addClass('far fa-trash-alt')
              )
            )
            .append($('<div/>')
              .addClass('dropdown-menu')

              .append($('<p/>')
                .addClass('dropdown-header font-weight-bold text-danger ')
                .text('Очистка или удаление')
              )

              .append($('<a/>')
                .addClass(`dropdown-item ${one_source.last_version ? '' : 'disabled'}`)
                // .attr('role', 'button')
                .attr('id', 'btn_clear_source')
                .attr('href', `/sources/clear/${one_source.id}`)
                .attr('data-toggle', 'tooltip')
                .attr('title', one_source.marts_count ? 'Очистить настройку соединения. Внимание! Для данного соединения созданы витрины данных!' : 'Очистить настройку соединения. Удалятся все данные и метаданные')
                .attr('onclick', one_source.marts_count ? "return confirm('Для данного соединения созданы витрины данных!\nПри очистке соединения они будут удалены!\n\nВы абсолютно уверены, что хотите очистить настройку соединения?')" : "return confirm('Вы уверены, что хотите очистить настройку соединения ? ')")
                .append($('<i/>')
                  .addClass('fas fa-broom text-danger icon')
                )
                .append('Очистить')
              )
              .append($('<a/>')
                .addClass("dropdown-item")
                // .attr('role', 'button')
                .attr('id', 'btn_delete_source')
                .attr('href', `/sources/delete/${one_source.id}`)
                .attr('conn_id', one_source.id)
                .attr('data-toggle', 'tooltip')
                .attr('title', one_source.marts_count ? 'Удалить настройку соединения. Внимание! Для данного соединения созданы витрины данных!' : 'Удалить настройку соединения')
                .attr('onclick', one_source.marts_count ? "return confirm('Для данного соединения созданы витрины данных!\nПри удалении соединения они будут так же удалены!\n\nВы абсолютно уверены, что хотите удалить настройку соединения?')" : "return confirm('Вы уверены, что хотите удалить настройку соединения?')")
                .append($('<i/>')
                  .addClass('far fa-trash-alt text-danger icon')
                )
                .append('Удалить')
              )
            )
          )
        );
    }

    listSourcesViewRows.push(row);
  }

  tb = $('#tables_group_view').footable({
    "paging": {
      "enabled": true,
      "size": 12,
      "countFormat": "{CP} из {TP}",
    },
    "columns": listSourcesViewColumns,
    'rows': listSourcesViewRows,
  });
}

// ------------------------------------------
function showSourceConn(id) {
  console.info('---- showSourceConn ---');

  emptySourceTableTab('#common_info');
  $('#common_info_tab').text('Описание источника');
  if (id.length == 0) {
    return;
  }
  // Запросим элементы, которые были уже сохранены
  // ----------
  $.ajax({
    url: `/sources/find-by-id/${id}`,
    method: 'GET',
    data: {},
    success: function (data) {
      console.log(`ajax action 'get_source_conn' SUCCESS. data = ${data}`);
      if (data.length != 0) {

        const source_conn_data = data.source_conn;

        let info_place = $('#id_info_place');
        info_place.empty();
        info_place
          .append($('<h5/>')
            .append(`Информация по источнику - '${source_conn_data.name}'`)
          )
          .append(button_place = $('<div/>')
            .attr('id', 'button_place')
          )
          .append(source_conn_info = $('<div/>')
            .attr('id', 'id_source_conn_info')
          );


        // ---- кнопка
        // $('#button_place').empty();
        // tabContent = common_info.children(".tab-content");
        // tabContent.empty();
        if (source_conn_data.created_by == _USER || _USER_IS_STAFF) {
          $('#button_place').append(operations = $('<div/>')
            .addClass('btn-group')
            .append($('<a/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('role', 'button')
              .attr('id', 'btn_edit_source_conn')
              .attr('href', `/sources/edit-source-conn/?cid=${source_conn_data.id}`)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Изменить настройку соединения')
              .append($('<i/>')
                .addClass('fas fa-edit icon')
              )
              .append('Изменить настройку соединения')
            )
            .append($('<div/>')
              .addClass('dropdown float-right')
              .append($('<button/>')
                .attr('type', 'button')
                .addClass('btn btn-outline-primary btn-sm dropdown-toggle')
                .attr('data-toggle', 'dropdown')
                .append($('<i/>')
                  .addClass('fas fa-tools icon')
                )
                .append('Обработка информации')
              )
              .append($('<div/>')
                .addClass('dropdown-menu')

                .append($('<p/>')
                  .addClass('dropdown-header font-weight-bold text-body')
                  .text(' Обработка информации ')
                )

                .append($('<button/>')
                  .addClass("dropdown-item")
                  .attr('id', 'btn_load_data')
                  // .attr('role', 'button')
                  .attr('conn_id', source_conn_data.id)
                  // .attr('href', `edit-source-conn/?action=load&cid=${source_conn_data.id}`)
                  .attr('data-toggle', 'tooltip')
                  .attr('title', 'Загрузить данные из источника')
                  .append($('<i/>')
                    .addClass('fas fa-download icon')
                  )
                  .append('Загрузить')
                )

                .append($('<div/>')
                  .addClass("dropdown-divider")
                )

                .append($('<a/>')
                  .addClass(`dropdown-item ${source_conn_data.last_version && source_conn_data.type_source == 'DB' ? '' : 'disabled'}`)
                  .attr('id', 'btn_make_relations_from_foreign_key')
                  .attr('conn_id', source_conn_data.id)
                  .attr('href', `/sources/make-relations/${source_conn_data.id}`)
                  .attr('data-toggle', 'tooltip')
                  .attr('title', 'Обработка связей на уровне БД - Foreign key')
                  .append($('<i/>')
                    .addClass('fas fa-key icon')
                  )
                  .append('Обработка Foreign key')
                )

                .append($('<button/>')
                  .addClass(`dropdown-item ${source_conn_data.last_version ? '' : 'disabled'}`)
                  .attr('id', 'btn_make_tables_for_quality_control')
                  .attr('conn_id', source_conn_data.id)
                  // .attr('href', `edit-source-conn/?action=make_relations_from_foreign_key&cid=${source_conn_data.id}`)
                  .attr('data-toggle', 'tooltip')
                  .attr('title', 'Запуск создания таблиц для контроля качества данных')
                  .append($('<i/>')
                    .addClass('fas fa-check-double icon')
                  )
                  .append('Контроль качества данных')
                )

                // .append($('<a/>')
                //     .addClass(`dropdown-item ${source_conn_data.last_version ? '' : 'disabled'}`)
                //     .attr('id', 'btn_make_wiki')
                //     .attr('conn_id', source_conn_data.id)
                //     .attr('href', `edit-source-conn/?action=add_to_wiki&cid=${source_conn_data.id}`)
                //     .attr('data-toggle', 'tooltip')
                //     .attr('title', 'Создать/обновить описание в Wiki')
                //     .append($('<i/>')
                //         .addClass('fab fa-wikipedia-w')
                //     )
                //     .append('Описание в Wiki')
                // )
              )
            )
            .append($('<div/>')
              .addClass('dropdown  float-right')
              .append($('<button/>')
                .attr('type', 'button')
                .css('display', _USER_IS_STAFF ? '' : 'none')
                .addClass('btn btn-outline-danger btn-sm dropdown-toggle')
                .attr('data-toggle', 'dropdown')
                .append($('<i/>')
                  .addClass('fas fa-trash-alt icon')
                )
                .append('Очистка или удаление')
              )
              .append($('<div/>')
                .addClass('dropdown-menu')

                .append($('<p/>')
                  .addClass('dropdown-header font-weight-bold text-danger ')
                  .text('Очистка или удаление')
                )

                .append($('<a/>')
                  .addClass(`dropdown-item ${source_conn_data.last_version ? '' : 'disabled'}`)
                  // .attr('role', 'button')
                  .attr('id', 'btn_clear_source')
                  .attr('href', `/sources/clear/${source_conn_data.id}`)
                  .attr('data-toggle', 'tooltip')
                  .attr('title', source_conn_data.marts_count ? 'Очистить настройку соединения. Внимание! Для данного соединения созданы витрины данных!' : 'Очистить настройку соединения. Удалятся все данные и метаданные')
                  .attr('onclick', source_conn_data.marts_count ? "return confirm('Для данного соединения созданы витрины данных!\nПри очистке соединения они будут удалены!\n\nВы абсолютно уверены, что хотите очистить настройку соединения?')" : "return confirm('Вы уверены, что хотите очистить настройку соединения ? ')")
                  .append($('<i/>')
                    .addClass('fas fa-broom text-danger icon')
                  )
                  .append('Очистить')
                )
                .append($('<a/>')
                  .addClass("dropdown-item")
                  // .attr('role', 'button')
                  .attr('id', 'btn_delete_source')
                  .attr('href', `/sources/delete/${source_conn_data.id}`)
                  .attr('conn_id', source_conn_data.id)
                  .attr('data-toggle', 'tooltip')
                  .attr('title', source_conn_data.marts_count ? 'Удалить настройку соединения. Внимание! Для данного соединения созданы витрины данных!' : 'Удалить настройку соединения')
                  .attr('onclick', source_conn_data.marts_count ? "return confirm('Для данного соединения созданы витрины данных!\nПри удалении соединения они будут так же удалены!\n\nВы абсолютно уверены, что хотите удалить настройку соединения?')" : "return confirm('Вы уверены, что хотите удалить настройку соединения?')")
                  .append($('<i/>')
                    .addClass('fas fa-trash-alt text-danger icon')
                  )
                  .append('Удалить')
                )
              )
            )
          );
        } else {
          source_conn_info.append($('<p/>')
            .addClass('text-danger')
            .text('Вы не являетесь владельцем данного источника. Редактирование не доступно!')
          );
        }
        // --- данныe
        source_conn_info.append(bodyDiv = $('<div/>')
          .attr('id', 'bodyDiv')
        );

        bodyDiv.append($('<h6/>')
          .addClass('middle_header')
          .append('Описание:')
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'ID источника:',
            id_edit_div = 'id_source_conn_ID',
            value = source_conn_data.id,
            is_text_area = false,
            is_editable = false
          )
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Название источника:',
            id_edit_div = 'id_source_conn_data_name',
            value = source_conn_data.name,
            is_text_area = false,
            is_editable = false
          )
        );

        // bodyDiv.append($('<div/>')
        //   .addClass('card-box')
        //   .append($('<a/>')
        //     .attr('href', '#common_description')
        //     .attr('data-toggle', 'collapse')
        //     .attr('aria-expanded', 'false')
        //     .attr('aria-controls', 'common_description')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //     .append('Описание')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //   )
        // );

        // bodyDiv.append(common_description_div = $('<div/>')
        //   .attr('id', 'common_description')
        //   .attr('data-parent', '#bodyDiv')
        //   .addClass('collapse show')
        // );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Краткое описание:',
            id_edit_div = 'source_conn_data_short_description',
            value = source_conn_data.short_description,
            is_text_area = false,
            is_editable = false
            // is_editable = (source_conn_data.created_by == user || user_is_staff ? true : false)
          )
        );
        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Описание:',
            id_edit_div = 'id_source_conn_data_description',
            value = source_conn_data.description,
            is_text_area = true,
            is_editable = false
            // is_editable = (source_conn_data.created_by == user || user_is_staff ? true : false)
          )
        );


        // bodyDiv.append($('<div/>')
        //   .addClass('card-box')
        //   .append($('<a/>')
        //     .attr('href', '#source_info')
        //     .attr('data-toggle', 'collapse')
        //     .attr('aria-expanded', 'false')
        //     .attr('aria-controls', 'source_info')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //     .append('Информация об источнике')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //   )
        // );

        // bodyDiv.append(source_info_div = $('<div/>')
        //   .attr('id', 'source_info')
        //   .attr('data-parent', '#bodyDiv')
        //   .addClass('collapse')
        // );

        bodyDiv.append($('<h6/>')
          .addClass('middle_header')
          .append('Дополнительное описание:')
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Ссылка на ресурс-источник:',
            id_edit_div = 'source_conn_data_original_Url',
            value = source_conn_data.original_Url,
            is_text_area = false,
            is_editable = false
          )
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Cсылка на описание набора данных:',
            id_edit_div = 'source_conn_data_description_URL',
            value = source_conn_data.description_URL,
            is_text_area = false,
            is_editable = false
          )
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'DOI-метка набора данных:',
            id_edit_div = 'source_conn_data_doi_label',
            value = source_conn_data.doi_label,
            is_text_area = false,
            is_editable = false
          )
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Сущность возникновения данных:',
            id_edit_div = 'source_conn_data_essence_of_data_origin',
            value = source_conn_data.essence_of_data_origin_human,
            is_text_area = false,
            is_editable = false
          )
        );

        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Уровень агрегации:',
            id_edit_div = 'source_conn_data_aggregation_level',
            value = source_conn_data.aggregation_level_human,
            is_text_area = false,
            is_editable = false
          )
        );

        // bodyDiv.append($('<div/>')
        //   .addClass('card-box')
        //   .append($('<a/>')
        //     .attr('href', '#source_connection_info')
        //     .attr('data-toggle', 'collapse')
        //     .attr('aria-expanded', 'false')
        //     .attr('aria-controls', 'source_connection_info')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //     .append('Настройка соединения с источником')
        //     .append($('<i/>')
        //       .addClass('fas fa-chevron-down')
        //     )
        //   )
        // );

        // bodyDiv.append(source_connection_info_div = $('<div/>')
        //   .attr('id', 'source_connection_info')
        //   .attr('data-parent', '#bodyDiv')
        //   .addClass('collapse')
        // );

        bodyDiv.append($('<h6/>')
          .addClass('middle_header')
          .append('Характеристики соединения:')
        );
        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Тип источника:',
            id_edit_div = 'id_source_conn_data_type_source',
            value = source_conn_data.type_source == 'DB' ? 'База данных' : typeFileName(source_conn_data.file_type),
            is_text_area = false,
            is_editable = false
          )
        );

        if (source_conn_data.type_source == 'DB') {
          bodyDiv.append(
            makeElement(
              is_source = 'source_conn_info',
              cid = source_conn_data.id,
              label = 'Тип источника:',
              id_edit_div = 'id_source_conn_data_dbapi',
              value = source_conn_data.dbapi_human,
              is_text_area = false,
              is_editable = false
            )
          );

          bodyDiv.append(
            makeElement(
              is_source = 'source_conn_info',
              cid = source_conn_data.id,
              label = 'Хост:Порт:',
              id_edit_div = 'id_source_conn_data_host_port',
              value = `${source_conn_data.host}:${source_conn_data.port}`,
              is_text_area = false,
              is_editable = false
            )
          );

          bodyDiv.append(
            makeElement(
              is_source = 'source_conn_info',
              cid = source_conn_data.id,
              label = 'База данных:',
              id_edit_div = 'id_source_conn_data_database',
              value = source_conn_data.database,
              is_text_area = false,
              is_editable = false
            )
          );
        } else { // Файлы
          bodyDiv.append(
            makeElement(
              is_source = 'source_conn_info',
              cid = source_conn_data.id,
              label = 'Путь к папке с файлами:',
              id_edit_div = 'id_source_conn_data_file_path',
              value = source_conn_data.file_path,
              is_text_area = false,
              is_editable = false
            )
          );

          bodyDiv
            .append($('<div/>')
              .addClass('custom-control custom-switch')
              .attr('aria-describedby', 'help_id_files_need_scan_subdirs')
              .append($('<input/>')
                .attr('type', 'checkbox')
                .attr('id', 'id_files_need_scan_subdirs')
                .attr('value', '')
                .prop('checked', source_conn_data.files_need_scan_subdirs)
                .attr('disabled', 'disabled')
                .addClass('custom-control-input')
              )
              .append($('<label/>')
                .addClass('custom-control-label')
                .attr('for', 'id_files_need_scan_subdirs')
                .append('Сканировать подкаталоги')
              )
              .append($('<small/>')
                .attr('id', 'help_id_files_need_scan_subdirs')
                .addClass('form-text text-muted')
                .append('Указывает, есть ли необходимость сканировать подкаталоги или достаточно обработать только первый уровень?')
              )
            );


          if (source_conn_data.file_type == 'CSV') {
            bodyDiv.append(
              makeElement(
                is_source = 'source_conn_info',
                cid = source_conn_data.id,
                label = 'Разделитель колонок csv:',
                id_edit_div = 'id_source_conn_data_csv_delimiter',
                value = source_conn_data.csv_delimiter,
                is_text_area = false,
                is_editable = false,
                help_text = 'По умолчанию в качестве разделителя колонок используется запятая, но может быть задан и другой специальный символ'
              )
            );

            bodyDiv.append(
              makeElement(
                is_source = 'source_conn_info',
                cid = source_conn_data.id,
                label = 'Ограничитель данных в ячейках csv:',
                id_edit_div = 'id_source_conn_data_csv_quotechar',
                value = source_conn_data.csv_quotechar,
                is_text_area = false,
                is_editable = false,
                help_text = 'Если необходимо, можно задать символ-ограничитель данных в ячейках'
              )
            );
          }
        }
        bodyDiv.append(
          makeElement(
            is_source = 'source_conn_info',
            cid = source_conn_data.id,
            label = 'Путь с данными в хранилище:',
            id_edit_div = 'id_source_conn_data_dest_path',
            value = source_conn_data.dest_path,
            is_text_area = false,
            is_editable = false
          )
        );

        $('.custom-select').select2({
          theme: 'classic',
        });
      }
    },
    error: function (d) {
      console.log(`ajax action 'get_source_conn' ERROR.`);
      console.debug(d);
    }
  });
}

// ------------------------------------------
function showTablesGroup(id, version) {
  console.info('---- showTablesGroup ---');

  // Пока отключил вывод таблицы. пока не понятно, почему возвразается пустой запрос 
  return;

  emptySourceTableTab('#common_info');
  $('#common_info_tab').text('Список таблиц');

  getSourceTableTabContentObject('#common_info').html('<br><br>' + getSpinner());
  if (id.length == 0) {
    return;
  }
  // Запросим элементы, которые были уже сохранены
  // ----------

  $.ajax({
    url: `/meta-data/get-by-connection-id/${id}?version=${version}`,
    method: 'GET',
    success: function (data) {
      console.log(`ajax action 'get_tables' SUCCESS. data = ${data}`);
      if (data.length != 0) {
        // tables_group
        const source_conn_data = data.source_conn;
        const metadatas = data.metadatas;
        _DIGITAL_PLATFORM_INTEGRATION = data.DIGITAL_PLATFORM_INTEGRATION;
        _QUALITY_CONTROL_STATUS = data.QUALITY_CONTROL_STATUS;

        let info_place = $('#id_info_place');
        info_place.empty();
        info_place
          .append($('<h5/>')
            .append(`Список таблиц источника - '${source_conn_data.name}'`)
          )
          .append(button_place = $('<div/>')
            .attr('id', 'button_place')
          )
          .append(tables_group_info = $('<div/>')
            .attr('id', 'id_tables_group_info')
          );

        // emptySourceTableTab('#common_info');
        // getSourceTableTabContentObject('#common_info').append(tablesGroupView = $('<table/>').attr('id', 'tables_group_view'));
        tables_group_info.append(tablesGroupView = $('<table/>').attr('id', 'tables_group_view'));
        // $('#common_info').append(tablesGroupView = $('<table/>').attr('id', 'tables_group_view'));
        tablesGroupView.addClass('table');
        // tablesGroupView.addClass("table-striped");
        tablesGroupView.addClass("table-hover");
        tablesGroupView.addClass("table-sm");
        tablesGroupView.addClass("table-bordered");

        var tablesGroupViewColumns = [];
        tablesGroupViewColumns.push({
          'name': 'name',
          'title': 'Имя таблицы',
        });

        tablesGroupViewColumns.push({
          'name': 'comment',
          'title': 'Комментарий',
        });

        if (_DIGITAL_PLATFORM_INTEGRATION) {
          tablesGroupViewColumns.push({
            'name': 'need_quality_control',
            'title': 'Контроль качества',
          });
          tablesGroupViewColumns.push({
            'name': 'quality_control_status',
            'title': 'Статус контроля качества',
          });
        }
        tablesGroupViewColumns.push({
          'name': 'version',
          'title': 'Версия',
        });

        tablesGroupViewColumns.push({
          'name': 'schema',
          'title': 'Схема БД',
        });

        tablesGroupViewColumns.push({
          'name': 'columns_count',
          'title': 'Количество столбцов',
        });

        tablesGroupViewColumns.push({
          'name': 'rows_count',
          'title': 'Количество строк',
        });
        tablesGroupViewColumns.push({
          'name': 'rows_operations',
          'title': '',
        });

        var tablesGroupViewRows = [];
        for (i = 0; i < metadatas.length; i++) {
          one_metadata = metadatas[i];
          row = {};
          // row.name = one_metadata.name;
          row.name = $('<td/>')
            // .addClass('text-body pointer')
            .append(row_name_div = $('<div/>')
              .append($('<a/>')
                .attr('href', '#')
                .attr('id', 'id_table_name')
                .attr('cid', one_metadata.id)
                .append(`${one_metadata.schema}${one_metadata.schema.length ? ':' : ''}${one_metadata.name}`)
              )
            );
          if (one_metadata.description) {
            row_name_div.append($('<span/>')
              .append($('<i/>')
                .addClass('fas fa-info-circle green')
                .attr('data-toggle', 'tooltip')
                .attr('title', one_metadata.description)
              )
            );
          }
          row.comment = one_metadata.comment;
          if (_DIGITAL_PLATFORM_INTEGRATION) {
            row.need_quality_control = $('<td/>')
              .addClass('center')
              .append($('<i/>')
                .addClass(one_metadata.need_quality_control ? 'fas fa-check-square text-success' : 'fas fa-times text-muted')
                .attr('data-toggle', 'tooltip')
                .attr('title', one_metadata.need_quality_control ? 'Контролировать' : 'Без контроля')
              );

            text_class = '';
            switch (one_metadata.quality_control_status) {
              case 'uncontrolled':
                text_class = 'text-muted fas fa-times';
                break;
              case 'quality_waiting':
                text_class = 'text-warning fas fa-question';
                break;
              case 'quality_ok':
                text_class = 'text-success fas fa-check';
                break;
              case 'quality_errors':
                text_class = 'text-danger fas fa-ban';
                break;
              default:
                text_class = 'text-body';
            }
            row.quality_control_status = $('<td/>')
              .addClass('center')
              .append($('<i/>')
                .addClass(text_class)
                .attr('data-toggle', 'tooltip')
                .attr('title', _QUALITY_CONTROL_STATUS[one_metadata.quality_control_status])
              );
            // .addClass(text_class)
            // .append(one_metadata.need_quality_control ? _QUALITY_CONTROL_STATUS[one_metadata.quality_control_status] : '');
          }
          row.version = new Date(one_metadata.version).toLocaleDateString();
          row.schema = one_metadata.schema;
          cols = Object.keys(one_metadata.columns);
          row.columns_count = $('<td/>')
            .addClass('center')
            .append(cols.length);
          row.rows_count = $('<td/>')
            .addClass('center')
            .addClass(!one_metadata.rows ? 'text-danger' : 'text-body')
            .append(one_metadata.rows);
          tablesGroupViewRows.push(row);
          // row.rows_operations = $('<button/>')
          //   .addClass("btn btn-primary btn-sm2")
          //   .attr('type', 'button')
          //   .append('test');
        }

        $('#tables_group_view').footable({
          "paging": {
            "enabled": true,
            "size": 15,
            "countFormat": "{CP} из {TP}",
          },
          "columns": tablesGroupViewColumns,
          'rows': tablesGroupViewRows,
        });

      }
    },
    error: function (d) {
      console.log(`ajax action 'get_tables' ERROR.`);
      console.debug(d);
    }
  });
}

// ------------------------------------------
function renderTableCommonInfo(data) {
  console.info('*** renderTableCommonInfo ***');

  $('#common_info_tab').text('Информация о таблице');

  if (data.length != 0) {
    //emptySourceTableTab('#common_info');

    const metadata = data.metadata;
    const source_conn = data.source_conn;

    const metadata_fkeys = metadata.fkey;
    // var fkey_names = Object.keys(metadata_fkeys);
    // var fkey_datas = Object.values(metadata_fkeys);

    const metadata_columns = metadata.columns;
    // var column_names = Object.keys(metadata_columns);
    // var column_datas = Object.values(metadata_columns);

    let button_place = $('#button_place');
    button_place.empty();
    if (source_conn.created_by == _USER || _USER_IS_STAFF) {
      let operations = $('<div/>')
        .addClass('btn-group')
        .append($('<button/>')
          .addClass("btn btn-outline-primary btn-sm")
          .attr('id', 'btn_edit_table_common')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Изменить описание')
          .append($('<i/>')
            .addClass('fas fa-edit icon')
          )
          .append('Изменить описание')
        )
        .append($('<button/>')
          .addClass("btn btn-outline-success btn-sm")
          .css('display', 'none')
          .attr('id', 'btn_save_table_common')
          .attr('cid', metadata.id)
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Сохранить')
          .append($('<i/>')
            .addClass('fas fa-save icon')
          )
          .append('Сохранить')
        )
        .append($('<button/>')
          .addClass("btn btn-outline-danger btn-sm")
          .css('display', 'none')
          .attr('cid', metadata.id)
          .attr('id', 'btn_cancel_table_common')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Отменить')
          .append('Отменить')
        );
      if (_DIGITAL_PLATFORM_INTEGRATION) {
        if (source_conn.type_source == 'any_files') {
          if (typeof (metadata.Type) != 'undefined' && !RECOGNITION_TYPES.includes(metadata.Type.toUpperCase())) {
            operations.append($('<button/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('id', 'btn_documents_analysis')
              .attr('data-connect_id', metadata.connect_id)
              .attr('data-metadata_id', metadata.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Анализ документа')
              .append($('<i/>')
                .addClass('fas fa-bar-chart icon')
              )
              .append('Анализ документа')
            );
          }
        }
      }

      if (_DIGITAL_PLATFORM_INTEGRATION) {
        if ((source_conn.type_source == 'any_files')) {
          if (typeof (metadata.Type) != 'undefined' && RECOGNITION_TYPES.includes(metadata.Type.toUpperCase())) {
            operations.append($('<button/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('id', 'btn_documents_recognition')
              .attr('data-connect_id', metadata.connect_id)
              .attr('data-metadata_id', metadata.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Распознавание документа')
              .append($('<i/>')
                .addClass('fas fa-id-card icon')
              )
              .append('Распознавание документа')
            );
          }
        }
      }
      button_place.append(operations);
    } else {
      button_place
        .children(".tab-content")
        .append($('<p/>')
          .addClass('text-danger')
          .text('Вы не являетесь владельцем данного источника. Редактирование не доступно!')
        );
    }

    table_common_info = $('#id_table_common_info');
    table_common_info.children(".tab-content").empty();

    if (metadata && source_conn) {
      // --- таблица с данными
      table_common_info
        .children(".tab-content")
        .append(bodyDiv = $('<div/>')
          .attr('id', 'bodyDiv')
        );

      if (source_conn.type_source == 'DB' || ['CSV', 'EXCEL'].indexOf(source_conn.file_type) != -1) {
        if (_DIGITAL_PLATFORM_INTEGRATION) {
          bodyDiv.append($('<h6/>')
            .addClass('middle_header')
            .append('Контроль качества:')
          );

          if (metadata.rows) {
            bodyDiv
              .append($('<div/>')
                .addClass('custom-control custom-switch')
                .append($('<input/>')
                  .attr('type', 'checkbox')
                  .attr('id', 'id_need_quality_control_table')
                  .attr('value', '')
                  .prop('checked', metadata.need_quality_control)
                  .attr('disabled', 'disabled')
                  .addClass('custom-control-input')
                )
                .append($('<label/>')
                  .addClass('custom-control-label')
                  .attr('for', 'id_need_quality_control_table')
                  .append('Необходим контроль качества')
                )
              );

            bodyDiv.append(
              makeElement(
                is_source = 'table_common_info',
                cid = metadata.id,
                label = 'Статус контроля качества:',
                id_edit_div = 'id_source_table_common_quality_control_status',
                value = _QUALITY_CONTROL_STATUS[metadata.quality_control_status],
                is_text_area = false,
                is_editable = false
                // is_editable = (source_conn.created_by == user || user_is_staff ? true : false)
              )
            );
          } else {
            bodyDiv.append($('<p/>')
              .addClass('text-danger')
              .append('Контроль качества не доступен. Таблица пустая.')
            );

          }
        }
      }

      bodyDiv.append($('<h6/>')
        .addClass('middle_header')
        .append('Описание:')
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'ID таблицы:',
          id_edit_div = 'id_source_table_ID',
          value = metadata.id,
          is_text_area = false,
          is_editable = false
        )
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'Название:',
          id_edit_div = 'id_source_table_common_name',
          value = `${metadata.schema ? metadata.schema + ':' : ''}${metadata.name}`,
          is_text_area = false,
          is_editable = false
        )
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'Комментарий:',
          id_edit_div = 'id_source_table_common_comment',
          value = metadata.comment,
          is_text_area = false,
          is_editable = false
          // is_editable = (source_conn.created_by == user || user_is_staff ? true : false)
        )
      );


      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'Описание:',
          id_edit_div = 'id_source_table_common_description',
          value = metadata.description,
          is_text_area = true,
          is_editable = false
          // is_editable = (source_conn.created_by == user || user_is_staff ? true : false)
        )
      );

      bodyDiv.append($('<h6/>')
        .addClass('middle_header')
        .append('Характеристики:')
      );

      if (source_conn.type_source == 'DB' || ['CSV', 'EXCEL'].indexOf(source_conn.file_type) != -1) {
        bodyDiv.append(
          makeElement(
            is_source = 'table_common_info',
            cid = metadata.id,
            label = 'Количество строк:',
            id_edit_div = 'id_source_table_common_count_rows',
            value = metadata.rows,
            is_text_area = false,
            is_editable = false)
          .addClass(!metadata.rows ? 'text-danger' : 'text-body')
        );
      }

      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'Версия (дата загрузки):',
          id_edit_div = 'id_source_table_common_version',
          value = new Date(metadata.version).toLocaleDateString(),
          is_text_area = false,
          is_editable = false)
      );

      if (source_conn.type_source != 'DB') {
        if (metadata.file_size) {
          unit = 'байт';
          pow = 0;
          if (metadata.file_size > Math.pow(2, 10) && metadata.file_size < Math.pow(2, 20)) {
            unit = 'Кб';
            pow = 10;
          } else if (metadata.file_size > Math.pow(2, 20) && metadata.file_size < Math.pow(2, 30)) {
            unit = 'Мб';
            pow = 20;
          } else if (metadata.file_size > Math.pow(2, 30) && metadata.file_size < Math.pow(2, 40)) {
            unit = 'Гб';
            pow = 30;
          }

          bodyDiv.append(
            makeElement(
              is_source = 'table_common_info',
              cid = metadata.id,
              label = 'Размер файла: ',
              id_edit_div = 'id_source_table_common_file_size',
              value = (metadata.file_size / Math.pow(2, pow)).toFixed(2) + ' ' + unit,
              is_text_area = false,
              is_editable = false)
          );
        }

        if (metadata.file_last_modified) {
          bodyDiv.append(
            makeElement(
              is_source = 'table_common_info',
              cid = metadata.id,
              label = 'Дата последнего изменения:',
              id_edit_div = 'id_source_table_common_file_last_modified',
              value = metadata.file_last_modified,
              is_text_area = false,
              is_editable = false)
          );
        }
      }
    }
  }
}

// ------------------------------------------
//
function renderTableColumnInfo(metadata_id, column_name) {
  console.info('*** renderTableColumnInfo ***');
  if (metadata_id != undefined && column_name != undefined && metadata_id.length && column_name.length) {
    const metadata = getMetadata(metadatas = _METADATAS, id = metadata_id);
    if (metadata == undefined) {
      alert(`renderTableColumnInfo: Не найдена запись метаданного для metadata_id= ${metadata_id}`);
      return;
    }
    const metadata_columns = metadata.columns;
    // const column_names = Object.keys(metadata_columns);
    // const column_datas = Object.values(metadata_columns);
    const source_conn = getSourceConn(source_connections = _SOURCE_CONNECTIONS, id = metadata.connect_id);

    let info_place = $('#id_info_place');
    info_place.empty();
    info_place
      .append($('<h5/>')
        .append(`Колонка '${column_name}' таблицы '${metadata.schema ? metadata.schema+':' : ''}${metadata.name}' источника - '${source_conn.name}'`)
      )
      .append(button_place = $('<div/>')
        .attr('id', 'button_place')
      )
      .append(table_column_info = $('<div/>')
        .attr('id', 'id_table_column_info')
      );

    if (source_conn.created_by == _USER || _USER_IS_STAFF) {
      button_place.append(operations = $('<div/>')
        .addClass('btn-group')
        .append($('<button/>')
          .addClass("btn btn-outline-primary btn-sm")
          .attr('id', 'btn_edit_column_info')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Изменить описание')
          .append($('<i/>')
            .addClass('far fa-edit icon')
          )
          .append('Изменить описание')
        )
        .append($('<button/>')
          .addClass("btn btn-outline-success btn-sm")
          .css('display', 'none')
          .attr('id', 'btn_save_column_info')
          .attr('cid', metadata.id)
          .attr('column_name', column_name)
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Сохранить')
          .append($('<i/>')
            .addClass('far fa-save icon')
          )
          .append('Сохранить')
        )
        .append($('<button/>')
          .addClass("btn btn-outline-danger btn-sm")
          .css('display', 'none')
          .attr('cid', metadata.id)
          .attr('column_name', column_name)
          .attr('id', 'btn_cancel_edit_column_info')
          .attr('data-toggle', 'tooltip')
          .attr('title', 'Отменить')
          .append('Отменить')
        )
      );
    } else {
      button_place
        .append($('<p/>')
          .addClass('text-danger')
          .text('Вы не являетесь владельцем данного источника. Редактирование не доступно!')
        );
    }

    table_column_info.append(bodyDiv = $('<div/>')
      .attr('id', 'bodyDiv')
    );

    let one_column = getColumnData(colums = metadata_columns, nameOfColumn = column_name);
    if (one_column) {
      // if (source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1) {
      //   if (_DIGITAL_PLATFORM_INTEGRATION) {
      //     bodyDiv.append($('<h6/>')
      //       .addClass('middle_header')
      //       .append('Контроль качества:')
      //     );

      //     if (metadata.rows) {
      //       bodyDiv
      //         .append($('<div/>')
      //           .addClass('custom-control custom-switch')
      //           .append($('<input/>')
      //             .attr('type', 'checkbox')
      //             .attr('id', 'id_need_quality_control')
      //             // .attr('value', '')
      //             .prop('checked', one_column.need_quality_control)
      //             .attr('disabled', 'disabled')
      //             .addClass('custom-control-input')
      //           )
      //           .append($('<label/>')
      //             .addClass('custom-control-label')
      //             .attr('for', 'id_need_quality_control')
      //             .append('Необходим контроль качества')
      //           )
      //         );
      //       bodyDiv.append(
      //         makeElement(
      //           is_source = 'table_colunm_info',
      //           cid = metadata.id,
      //           label = 'Правило контроля:',
      //           id_edit_div = 'id_quality_control_rule',
      //           value = one_column.quality_control_rule,
      //           is_text_area = false,
      //           is_editable = false
      //         )
      //       );
      //     } else {
      //       bodyDiv.append($('<p/>')
      //         .addClass('text-danger')
      //         .append('Контроль качества не доступен. Таблица пустая.')
      //       );

      //     }
      //   }
      // }
      bodyDiv.append($('<h6/>')
        .addClass('middle_header')
        .append('Описание:')
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Название колонки:',
          id_edit_div = 'id_table_column_name',
          value = column_name,
          is_text_area = false,
          is_editable = false
        )
      );

      // bodyDiv.append(
      //   makeElement(
      //     is_source = 'table_colunm_info',
      //     cid = metadata.id,
      //     label = 'Оригинальное название колонки:',
      //     id_edit_div = 'id_table_column_original_name',
      //     value = one_column.original_name,
      //     is_text_area = false,
      //     is_editable = false,
      //     help_text = 'Оригинальное имя колонки - это имя, которое было прочитано в источнике. Оно может быть преобразовано для унификации имен колонок и возможности использования в базе данных. Преобразованное имя отображаеся в имени колонки.'
      //   )
      // );

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Комментарий:',
          id_edit_div = 'id_column_comment',
          value = one_column.comment,
          is_text_area = false,
          is_editable = false
        )
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Описание:',
          id_edit_div = 'id_column_description',
          value = one_column.description,
          is_text_area = true,
          is_editable = false
        )
      );

      // bodyDiv.append(
      //   $('<div/>')
      //   .attr('aria-describedby', 'id_logical_type_help')
      //   .append($('<label/>')
      //     .attr('for', 'logical_type')
      //     .append('Логический тип данных')
      //   )
      //   .append(logical_types_select = $('<select/>')
      //     .attr('name', 'logical_type')
      //     .attr('id', 'id_logical_type')
      //     .data('init-plugin', 'select2')
      //     .addClass('custom-select')
      //     .attr('disabled', 'disabled')
      //   )
      //   .append($('<small/>')
      //     .attr('id', 'id_logical_type_help')
      //     .addClass('form-text text-muted')
      //     .append('Логический тип данных определяет тип содержимого в данной колонке')
      //   )
      // );

      // $('#id_logical_type')
      //   .append($('<option/>')
      //     .attr('disbled', 'disbled')
      //     .attr('hidden', 'hidden')
      //     .attr('selected', 'selected')
      //     .attr('value', '')
      //     .append('--- Выберите логический тип ---')
      //   );

      // for (let j = 0; j < _LOGICAL_TYPES.length; j++) {
      //   const one_logical_type = _LOGICAL_TYPES[j];

      //   $('#id_logical_type').append(opt = $('<option/>').text(one_logical_type.name).attr('value', one_logical_type.id));
      //   if (one_column.logical_type == one_logical_type.id) {
      //     opt.attr('selected', 'selected');
      //   }
      // }

      bodyDiv.append($('<h6/>')
        .addClass('middle_header')
        .append('Характеристики:')
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Тип:',
          id_edit_div = 'id_column_type',
          value = one_column.type,
          is_text_area = false,
          is_editable = false
        )
      );

      // bodyDiv
      //   .append($('<div/>')
      //     .addClass('custom-control custom-switch')
      //     .append($('<input/>')
      //       .attr('type', 'checkbox')
      //       .attr('id', 'id_need_type_transform')
      //       // .attr('value', '')
      //       .prop('checked', one_column.need_type_transform)
      //       .attr('disabled', 'disabled')
      //       .addClass('custom-control-input')
      //     )
      //     .append($('<label/>')
      //       .addClass('custom-control-label')
      //       .attr('for', 'id_need_type_transform')
      //       .append('Изменить тип колонки')
      //     )
      //   );

      // bodyDiv.append(
      //   $('<div/>')
      //   .attr('aria-describedby', 'id_new_type_help')
      //   .append($('<label/>')
      //     .attr('for', 'new_type')
      //     .append('Новый тип данных колонки')
      //   )
      //   .append(new_types_select = $('<select/>')
      //     .attr('name', 'new_type')
      //     .attr('id', 'id_new_type')
      //     .data('init-plugin', 'select2')
      //     .addClass('custom-select')
      //     .attr('disabled', 'disabled')
      //   )
      //   .append($('<small/>')
      //     .attr('id', 'id_new_type_help')
      //     .addClass('form-text text-muted')
      //     .append('Укажите в какой тип данных надо преобразовать данные в этой колонке. Тип данных будет преобразовываться при создании витрины данных.')
      //   )
      // );

      // $('#id_new_type')
      //   .append($('<option/>')
      //     .attr('disbled', 'disbled')
      //     .attr('hidden', 'hidden')
      //     .attr('selected', 'selected')
      //     .attr('value', '')
      //     .append('--- Выберите новый тип ---')
      //   );

      // for (let j = 0; j < _PG_TYPES_2_PANDAS_TYPES_KEYS.length; j++) {
      //   const one_key = _PG_TYPES_2_PANDAS_TYPES_KEYS[j];

      //   // Здесь специально и в качестве текста и в качестве значения используется только название типа, так как они уникальны, а значения не уникальны
      //   $('#id_new_type').append(opt = $('<option/>').text(one_key).attr('value', one_key));
      //   if (one_column.new_type == one_key) {
      //     opt.attr('selected', 'selected');
      //   }
      // }


      if (one_column.str_len) {
        bodyDiv.append(
          makeElement(
            is_source = 'table_colunm_info',
            cid = metadata.id,
            label = 'Длина строки:',
            id_edit_div = 'id_column_str_len',
            value = one_column.str_len,
            is_text_area = false,
            is_editable = false)
        );
      }

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Автоувеличение:',
          id_edit_div = 'id_column_autoincrement',
          value = one_column.autoincrement,
          is_text_area = false,
          is_editable = false)
      );

      bodyDiv.append(
        makeElement(
          is_source = 'table_colunm_info',
          cid = metadata.id,
          label = 'Значение по умолчанию:',
          id_edit_div = 'id_column_default',
          value = one_column.default,
          is_text_area = false,
          is_editable = false)
      );
    } else {
      $('#table_columns').children(".tab-content").append("Нет данных для отображения");
    }
  }
}

//
// ------------------------------------------
function renderTableDataInfo(cid) {
  console.info('*** renderTableDataInfo ***');

  if (cid) {
    $.ajax({
      url: `/meta-data/get-data/${cid}`,
      method: 'GET',
      success: function (data) {
        console.log(`ajax action 'get_metadata_data' SUCCESS.`);

        if (data.length != 0) {

          // $('#button_place').empty();

          // emptySourceTableTab('#table_data');
          const source_conn = data.source_conn;
          const metadata = data.metadata;

          const metadata_fkeys = metadata.fkey;
          // const fkey_names = Object.keys(metadata_fkeys);
          // const fkey_datas = Object.values(metadata_fkeys);

          const metadata_columns = metadata.columns;
          const column_names = metadata_columns.map(column => column.name);
          const column_datas = Object.values(metadata_columns);
          // columns = data.columns;
          let table_data = data.data_json.join(",");


          table_data = "[" + table_data + "]"
          table_data = JSON.parse(table_data);
          // ====
          // table data

          $('#id_table_data').children(".tab-content").empty();
          if (table_data) {
            $('#id_table_data').children(".tab-content").append(tableDataView = $('<table/>'));
            tableDataView
              .attr('id', 'table_data_view')
              .addClass('table table-hover table-bordered table-responsive')
              .append($('<caption/>')
                .append(Object.keys(table_data).length == 0 ? 'Пустая таблица' : 'Максимум первые 10 строк'))
              .append(tableHeader = $('<thead/>').addClass("thead-dark"))
              .append(tableBody = $('<tbody/>'));

            // Header
            tableHeader.append(tableHeaderRow = $('<tr/>'));
            for (let i = 0; i < column_names.length; i++) {
              tableHeaderRow.append($('<th/>').append(column_names[i]));
            }

            console.log(column_names);
            console.log(table_data);
            // if (typeof (col_data) != 'undefined') {
            // body
            for (let k = 0; k < table_data.length; k++) {
              tableBody.append(tableDataRow = $('<tr/>'));

              for (let i = 0; i < column_names.length; i++) {
                const columnInfo = column_datas[i];
                let value = table_data[k][column_names[i]] != null ? table_data[k][column_names[i]] : '';
                switch (columnInfo.type) {
                  case 'DATE':
                    value = new Date(value).toLocaleString("ru");
                    break;
                  default:
                    value = value.toString();
                    break;
                }
                tableDataRow.append($('<td/>').append(value));
              }
            }
            // }
          } else {
            $('#id_table_data').children(".tab-content").append("Нет данных для отображения");
          }
        }
      },
      error: function (request, status, error) {
        console.error(`ajax action 'get_metadata_data' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  }
}

// ------------------------------------------
// Вывод информации о таблице
function showTableFullInfo(metadata_id) {
  console.info('---- showTableFullInfo ---');

  if (metadata_id.length == 0) {
    return;
  }

  const metadata = getMetadata(metadatas = _METADATAS, id = metadata_id);
  if (metadata == undefined) {
    alert(`renderTableColumnInfo: Не найдена запись метаданного для metadata_id= ${metadata_id}`);
    return;
  }
  const metadata_columns = metadata.columns;
  // const column_names = Object.keys(metadata_columns);
  // const column_datas = Object.values(metadata_columns);
  const source_conn = getSourceConn(source_connections = _SOURCE_CONNECTIONS, id = metadata.connect_id);

  let info_place = $('#id_info_place');
  info_place.empty();
  info_place
    .append($('<h5/>')
      .append(`Информация о ${source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1 ? 'таблице' : 'файле'} '${metadata.schema ? metadata.schema+':' : ''}${metadata.name}' источника - '${source_conn.name}'`)
    )
    .append(tab_ul = $('<ul/>')
      .addClass('nav nav-tabs')
      .append($('<li/>')
        .addClass('nav-item')
        .attr('id', 'id_nav_table_common_info')
        .append($('<a/>')
          .addClass('nav-link active')
          .attr('data-toggle', 'tab')
          .attr('id', 'id_table_common_info_tab')
          .attr('href', '#id_table_common_info')
          .append(`Информация о ${source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1 ? 'таблице' : 'файле'}`)
        )
      )
    );

  if (source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1) {
    tab_ul
      .append($('<li/>')
        .addClass('nav-item')
        .attr('id', 'id_nav_table_data')
        .append($('<a/>')
          .addClass('nav-link')
          .attr('data-toggle', 'tab')
          .attr('id', 'id_table_data_tab')
          .attr('cid', metadata.id)
          .attr('href', '#id_table_data')
          .append('Содержимое таблицы')
        )
      );
  }
  info_place
    .append(content_div = $('<div/>')
      .addClass('tab-content')
      .append($('<div/>')
        .addClass('tab-pane container active')
        .attr('id', 'id_table_common_info')
        .append($('<div/>')
          .addClass('tab-header')
          .append($('<div/>')
            .attr('id', 'button_place')
          )
        )
        .append($('<div/>')
          .addClass('tab-content')
        )
      )
    );
  if (source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1) {
    content_div
      .append($('<div/>')
        .addClass('tab-pane container fade')
        .attr('id', 'id_table_data')
        .append($('<div/>')
          .addClass('tab-content preview_file')
        )
      );
  }

  $('#common_info_tab').text('Информация о таблице');


  let button_place = $('#button_place');
  button_place.empty();
  if (source_conn.created_by == _USER || _USER_IS_STAFF) {
    let operations = $('<div/>')
      .addClass('btn-group')
      .append($('<button/>')
        .addClass("btn btn-outline-primary btn-sm")
        .attr('id', 'btn_edit_table_common')
        .attr('data-toggle', 'tooltip')
        .attr('title', 'Изменить описание')
        .append($('<i/>')
          .addClass('far fa-edit icon')
        )
        .append('Изменить описание')
      )
      .append($('<button/>')
        .addClass("btn btn-outline-success btn-sm")
        .css('display', 'none')
        .attr('id', 'btn_save_table_common')
        .attr('cid', metadata.id)
        .attr('data-toggle', 'tooltip')
        .attr('title', 'Сохранить')
        .append($('<i/>')
          .addClass('far fa-save icon')
        )
        .append('Сохранить')
      )
      .append($('<button/>')
        .addClass("btn btn-outline-danger btn-sm")
        .css('display', 'none')
        .attr('cid', metadata.id)
        .attr('id', 'btn_cancel_table_common')
        .attr('data-toggle', 'tooltip')
        .attr('title', 'Отменить')
        .append('Отменить')
      );
    if (_DIGITAL_PLATFORM_INTEGRATION) {
      if (source_conn.type_source == 'any_files') {
        if (typeof (metadata.Type) != 'undefined') {
          if ((RECOGNITION_TYPES_PDF.includes(metadata.Type.toUpperCase())) || !RECOGNITION_TYPES.includes(metadata.Type.toUpperCase())) {
            operations.append($('<button/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('id', 'btn_documents_analysis')
              .attr('data-connect_id', metadata.connect_id)
              .attr('data-metadata_id', metadata.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Анализ документа')
              .append($('<i/>')
                .addClass('far fa-bar-chart icon')
              )
              .append('Анализ документа')
            );
          }
        }
      }
    }

    if (_DIGITAL_PLATFORM_INTEGRATION) {
      if ((source_conn.type_source == 'any_files')) {
        if (typeof (metadata.Type) != 'undefined') {
          if ((RECOGNITION_TYPES_PDF.includes(metadata.Type.toUpperCase())) || RECOGNITION_TYPES.includes(metadata.Type.toUpperCase())) {
            operations.append($('<button/>')
              .addClass("btn btn-outline-primary btn-sm")
              .attr('id', 'btn_documents_recognition')
              .attr('data-connect_id', metadata.connect_id)
              .attr('data-metadata_id', metadata.id)
              .attr('data-toggle', 'tooltip')
              .attr('title', 'Распознавание документа')
              .append($('<i/>')
                .addClass('far fa-id-card icon')
              )
              .append('Распознавание документа')
            );
          }
        }
      }
    }
    button_place.append(operations);
  } else {
    button_place
      .children(".tab-content")
      .append($('<p/>')
        .addClass('text-danger')
        .text('Вы не являетесь владельцем данного источника. Редактирование не доступно!')
      );
  }

  let table_common_info = $('#id_table_common_info');
  table_common_info.children(".tab-content").empty();

  if (metadata && source_conn) {
    // --- таблица с данными
    table_common_info
      .children(".tab-content")
      .append(bodyDiv = $('<div/>')
        .attr('id', 'bodyDiv')
      );

    if (source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1) {
      if (_DIGITAL_PLATFORM_INTEGRATION) {
        bodyDiv.append($('<h6/>')
          .addClass('middle_header')
          .append('Контроль качества:')
        );

        if (metadata.rows) {
          bodyDiv
            .append($('<div/>')
              .addClass('custom-control custom-switch')
              .append($('<input/>')
                .attr('type', 'checkbox')
                .attr('id', 'id_need_quality_control_table')
                .attr('value', '')
                .prop('checked', metadata.need_quality_control)
                .attr('disabled', 'disabled')
                .addClass('custom-control-input')
              )
              .append($('<label/>')
                .addClass('custom-control-label')
                .attr('for', 'id_need_quality_control_table')
                .append('Необходим контроль качества')
              )
            );

          bodyDiv.append(
            makeElement(
              is_source = 'table_common_info',
              cid = metadata.id,
              label = 'Статус контроля качества:',
              id_edit_div = 'id_source_table_common_quality_control_status',
              value = _QUALITY_CONTROL_STATUS[metadata.quality_control_status],
              is_text_area = false,
              is_editable = false
            )
          );
        } else {
          bodyDiv.append($('<p/>')
            .addClass('text-danger')
            .append('Контроль качества не доступен. Таблица пустая.')
          );

        }
      }
    }

    bodyDiv.append($('<h6/>')
      .addClass('middle_header')
      .append('Описание:')
    );

    bodyDiv.append(
      makeElement(
        is_source = 'table_common_info',
        cid = metadata.id,
        label = 'ID таблицы:',
        id_edit_div = 'id_source_table_ID',
        value = metadata.id,
        is_text_area = false,
        is_editable = false
      )
    );

    bodyDiv.append(
      makeElement(
        is_source = 'table_common_info',
        cid = metadata.id,
        label = 'Название:',
        id_edit_div = 'id_source_table_common_name',
        value = `${metadata.schema ? metadata.schema+':' : ''}${metadata.name}`,
        is_text_area = false,
        is_editable = false
      )
    );

    bodyDiv.append(
      makeElement(
        is_source = 'table_common_info',
        cid = metadata.id,
        label = 'Комментарий:',
        id_edit_div = 'id_source_table_common_comment',
        value = metadata.comment,
        is_text_area = false,
        is_editable = false
      )
    );


    bodyDiv.append(
      makeElement(
        is_source = 'table_common_info',
        cid = metadata.id,
        label = 'Описание:',
        id_edit_div = 'id_source_table_common_description',
        value = metadata.description,
        is_text_area = true,
        is_editable = false
      )
    );

    bodyDiv.append($('<h6/>')
      .addClass('middle_header')
      .append('Характеристики:')
    );

    if (source_conn.type_source == 'DB' || ['CSV', 'excel'].indexOf(source_conn.file_type) != -1) {
      bodyDiv.append(
        makeElement(
          is_source = 'table_common_info',
          cid = metadata.id,
          label = 'Количество строк:',
          id_edit_div = 'id_source_table_common_count_rows',
          value = metadata.rows,
          is_text_area = false,
          is_editable = false)
        .addClass(!metadata.rows ? 'text-danger' : 'text-body')
      );
    }

    bodyDiv.append(
      makeElement(
        is_source = 'table_common_info',
        cid = metadata.id,
        label = 'Версия (дата загрузки):',
        id_edit_div = 'id_source_table_common_version',
        value = metadata.version,
        is_text_area = false,
        is_editable = false)
    );

    if (source_conn.type_source != 'DB') {
      if (metadata.file_size) {
        unit = 'байт';
        pow = 0;
        if (metadata.file_size > Math.pow(2, 10) && metadata.file_size < Math.pow(2, 20)) {
          unit = 'Кб';
          pow = 10;
        } else if (metadata.file_size > Math.pow(2, 20) && metadata.file_size < Math.pow(2, 30)) {
          unit = 'Мб';
          pow = 20;
        } else if (metadata.file_size > Math.pow(2, 30) && metadata.file_size < Math.pow(2, 40)) {
          unit = 'Гб';
          pow = 30;
        }

        bodyDiv.append(
          makeElement(
            is_source = 'table_common_info',
            cid = metadata.id,
            label = 'Размер файла: ',
            id_edit_div = 'id_source_table_common_file_size',
            value = (metadata.file_size / Math.pow(2, pow)).toFixed(2) + ' ' + unit,
            is_text_area = false,
            is_editable = false)
        );
      }

      if (metadata.file_last_modified) {
        bodyDiv.append(
          makeElement(
            is_source = 'table_common_info',
            cid = metadata.id,
            label = 'Дата последнего изменения:',
            id_edit_div = 'id_source_table_common_file_last_modified',
            value = metadata.file_last_modified,
            is_text_area = false,
            is_editable = false)
        );
      }
    }
  }
}

// ------------------------------------------
// Сохранение данных из для соединения с источником
function saveSourcesConnInfo(cid) {
  console.info('*** saveSourcesConnInfo ***');
  getSourceTableTabHeaderObject("#common_info").children(".notice_place").html("");

  // cid = $('.btn-sources-conn-save').attr('cid');
  // edit_type = $('#modal_edit_text').attr('edit_type');
  if (cid !== undefined && cid.length) {
    // comment = $('#id_source_table_common_comment').text();
    // console.info(`cid = ${cid}, comment= ${comment}`);

    description = $("#id_source_conn_data_description").html();
    // md_editor_data = window.editor.id_source_conn_data_description.getData();
    // console.info('md_editor_data=' + md_editor_data);
    // $("#id_source_conn_data_description").html(md_editor_data);
    // description = md_editor_data; //$("#id_source_table_common_description");
    console.info(`cid = ${cid}, description= ${description}`);

    short_description = $('#source_conn_data_short_description').text();
    original_Url = $('#source_conn_data_original_Url').text();
    access_mode = $('#source_conn_data_access_mode').val();

    // md_editor_data = window.editor.source_conn_data_short_description.getData();
    // console.info('md_editor_data=' + md_editor_data);
    // $("#source_conn_data_short_description").html(md_editor_data);
    // short_description = md_editor_data; //$("#id_source_table_common_description");
    // console.info(`cid = ${cid}, description= ${description}`);

    //$('#common_info').empty();
    //$('#common_info').append('<br><br><i class="fas fa-spinner fa-pulse fa-7x text-success"></i>');

    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      data: {
        "action": "save_conn_info",
        "cid": cid,
        "description": description,
        "short_description": short_description,
        'original_url': original_Url,
        'access_mode': access_mode,
      },
      success: function (data) {
        console.log(`ajax action 'save_conn_info' SUCCESS.`);
        let notice_place_object = getSourceTableTabHeaderObject("#common_info").children(".notice_place");
        notice_place_object.html("Сохранено");
        setTimeout(emptyElement, 5000, notice_place_object);
        //showTableInfo(cid);
      },
      error: function (request, status, error) {
        console.error(`ajax action 'save_conn_info' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  }
} // end function

// ------------------------------------------
// Сохранение данных из формы Источники
function saveSourcesTableCommonInfo(metadataId) {
  // Сохранение комментария
  console.info('*** saveSourcesTableCommonInfo ***');

  if (metadataId !== undefined && metadataId.length) {

    let tableInfo = {};
    tableInfo.comment = $('#id_source_table_common_comment').text();
    tableInfo.description = $("#id_source_table_common_description").html();
    tableInfo.need_quality_control = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_need_quality_control_table').prop('checked') : false;

    $.ajax({
      url: `/meta-data/save/${metadataId}`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(tableInfo),
      success: function (data) {
        console.log(`ajax action 'save_metadata_table_common_info' SUCCESS.`);
        let savedMetadata = data;
        let savedMetadataPos = getMetadataPos(_METADATAS, metadataId);
        if (savedMetadataPos != -1) {
          _METADATAS[savedMetadataPos] = savedMetadata;
        }
        showTableFullInfo(metadataId);

      },
      error: function (request, status, error) {
        console.error(`ajax action 'save_metadata_table_common_info' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  }
} // end function


// ------------------------------------------
// Сохранение данных из формы Источники
function saveSourcesTableColumnInfo(metadataId) {
  console.info('*** saveSourcesTableColumnInfo ***');
  // Сохранение информации о колонке

  let metadata = getMetadata(_METADATAS, metadataId);
  if (metadata == undefined) {
    alert(`saveSourcesTableColumnInfo: Не найдена запись метаданного с metadataId = %{metadataId}`);
    return;
  }
  let columns = metadata.columns;
  let columnName = $('#id_table_column_name').text();

  let columnInfo = getColumnData(columns, columnName);
  // Заполним измененнми полями
  columnInfo.comment = $('#id_column_comment').text();
  columnInfo.description = $("#id_column_description").html();
  // columnInfo.need_quality_control = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_need_quality_control').prop('checked') : false;
  // columnInfo.quality_control_rule = _DIGITAL_PLATFORM_INTEGRATION ? $('#id_quality_control_rule').text() : '';
  // columnInfo.logical_type = $('#id_logical_type').find(":selected").val();
  // columnInfo.need_type_transform = $('#id_need_type_transform').prop('checked');
  // columnInfo.new_type = $('#id_new_type').find(":selected").val();


  // metadataId = $('.btn-sources-save').attr('metadataId');
  // edit_type = $('#modal_edit_html').attr('edit_type');
  console.debug(`saveSourcesTableColumnInfo: metadataId = ${metadataId}, columnInfo = ${columnInfo}`);
  if (metadataId !== undefined && metadataId.length) {
    //description = $("#id_source_table_common_description").html();


    $.ajax({
      url: `/meta-data/save-column-info/${metadataId}`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(columnInfo),
      success: function (data) {
        console.log(`ajax action 'save_metadata_column' SUCCESS.`);
        // var notice_place_object = getSourceTableTabHeaderObject("#table_columns").children(".notice_place");
        // notice_place_object.html("Сохранено");
        // setTimeout(emptyElement, 5000, notice_place_object);
        //showTableInfo(cid);
        // Запишем сохраненную структуру метаданного в буфер
        let savedMetadata = data;
        let savedMetadataPos = getMetadataPos(_METADATAS, metadataId);
        if (savedMetadataPos != -1) {
          _METADATAS[savedMetadataPos] = savedMetadata;
        }
        renderTableColumnInfo(cid, columnInfo.name);

      },
      error: function (request, status, error) {
        console.error(`ajax action 'save_metadata_column' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  }

}

// ------------------------------------------
// отправка акции (задачи) в back 
function send_action(action, conn_id, method) {
  console.info('*** send_action ***');
  // Сохранение комментария

  // cid = $('.btn-sources-save').attr('cid');
  // edit_type = $('#modal_edit_html').attr('edit_type');
  console.debug(`send_action: action = ${action}, conn_id= ${conn_id}`);
  if (action !== undefined && action.length && conn_id !== undefined && conn_id.length) {
    $.ajax({
      url: `/sources/${action}/${conn_id}`,
      method: method,
      data: {},
      success: function (data) {
        console.log(`ajax action '${action}' SUCCESS.`);
      },
      error: function (request, status, error) {
        console.error(`ajax action '${action}' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  } else {
    console.error(`Ошибка! В функцию 'send_action' отправлены не полные параметры: action = ${action}, conn_id= ${conn_id}`);
  }

}

// ***************************************************************************
(application = function () {
  console.info('=== Sources-page.js ===');

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
    console.info('*** readySources - is ready ***');
    $('#common_info').addClass("active");
    $('#nav_table_columns').hide();
    $('#nav_table_data').hide();
    makeTree();
    window.editor = {};
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Поиск по дереву
  $("#search").submit(function (e) {
    console.info('---- search submit---');
    e.preventDefault();
    $("#sources_tree").jstree(true).search($("#search_jstree").val());
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Очистка поиска по дереву
  $("#clear_search").click(function (e) {
    console.info('---- clear_search click---');
    e.preventDefault();
    $("#search_jstree").val('');
    $("#sources_tree").jstree(true).clear_search();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // $('body').on('mouseover', '.btn', function () {
  //   // console.debug('mouseover');
  //   $(this).tooltip();

  // });

  // // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // $('body').on('mouseover', 'i', function () {
  //   // console.debug('mouseover');
  //   $(this).tooltip();

  // });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#id_source_name', function () {
    console.info('---- #id_source_name on click ---');

    let cid = $(this).attr('cid');
    let nodes = $('#sources_tree li');
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.type != 'source_conn') {
        continue;
      }
      if (node.attributes.cid.value == cid) {
        // $(`#${node.id}`).trigger('changed.jstree');
        $('#sources_tree').jstree('deselect_all');
        $('#sources_tree').jstree('close_all');
        $('#sources_tree').jstree('open_node', $('#j1_1_anchor'));
        $('#sources_tree').jstree('open_node', $(`#${node.id}`));
        $('#sources_tree').jstree('select_node', $(`#${node.id}`));
        $('#sources_tree').jstree('changed', $(`#${node.id}`));
        return;
      }
    }
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#id_table_name', function () {
    console.info('---- #id_table_name on click ---');

    cid = $(this).attr('cid');
    // $('#sources_tree').jstree('load_all');
    // $('#sources_tree').jstree('redraw', true);
    $('#sources_tree').jstree('open_all');
    let nodes = $('#sources_tree li');
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.type != 'table') {
        continue;
      }
      if (node.attributes.cid.value == cid) {
        $('#sources_tree').jstree('show_node', $(`#${node.id}`));
        $('#sources_tree').jstree('open_node', $(`#${node.id}`));
        $('#sources_tree').jstree('select_node', $(`#${node.id}`));
        $('#sources_tree').jstree('changed', $(`#${node.id}`));
        return;
      }
    }
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('ready.ft.table', '#tables_group_view', function () {
    console.info('ready.ft.table');
    // изменим стили у таблицы
    let table = $('#tables_group_view');
    table.removeClass('table-bordered');

    let th = table.find('thead');
    th.addClass('thead-dark');
    let tr = th.find('tr');
    tr.removeClass('footable-header');
  });


  // >>> Редактирование таблицы >>>
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Начать редактирование
  $('body').on('click', '#btn_edit_table_common', function () {
    console.info('---- #btn_edit_table_common on click ---');

    $('#btn_save_table_common').show();
    $('#btn_cancel_table_common').show();
    $(this).hide();

    if (_DIGITAL_PLATFORM_INTEGRATION) {
      $('#id_need_quality_control_table').removeAttr('disabled');
      $('#id_need_quality_control_table').parent('div').find('label').addClass('text-success font-weight-bold');
    }

    $('#id_source_table_common_comment').attr('contenteditable', 'true');
    $('#id_source_table_common_comment').parent('div').find('label').addClass('text-success font-weight-bold');
    $('#id_source_table_common_comment').focus();

    $('#id_source_table_common_description').attr('contenteditable', 'true');
    $('#id_source_table_common_description').parent('div').find('label').addClass('text-success font-weight-bold');
    if ($('#id_source_table_common_description').hasClass('contenteditable-textarea')) {
      MarkdownEditor
        .create(document.querySelector('#id_source_table_common_description'))
        .then(editor => {
          window.editor['#id_source_table_common_description'] = editor;
        })
        .catch(error => {
          console.error('MarkdownEditor editor.', error);
        });
    }

  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // сохранить
  $('body').on('click', '#btn_save_table_common', function () {
    console.info('---- #btn_save_table_common on click ---');

    $('#btn_edit_table_common').show();
    $('#btn_cancel_table_common').hide();
    $(this).hide();

    let cid = $(this).attr('cid');

    $('#id_source_table_common_comment').attr('contenteditable', 'false');
    $('#id_source_table_common_description').attr('contenteditable', 'false');

    // Удалим markdown editor у поля если оно textarea
    if ($('#id_source_table_common_description').hasClass('contenteditable-textarea') && window.editor['#id_source_table_common_description']) {
      window.editor['#id_source_table_common_description'].destroy();
    }

    saveSourcesTableCommonInfo(cid);
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Отменить редактирование
  $('body').on('click', '#btn_cancel_table_common', function () {
    console.info('---- #btn_cancel_table_common on click ---');

    $('#btn_edit_table_common').show();
    $('#btn_save_table_common').hide();
    $(this).hide();

    let cid = $(this).attr('cid');
    showTableFullInfo(cid);
  });
  // <<< Редактирование таблицы <<<

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // >>> Анализ документа >>>
  // Важно!!! Отправлять документы на анализ на сервер сообщений Kafka
  // можно только источники типа "Неструктурированные файлы" (any_files),
  // так как только у них есть все необходмые поля
  $('body').on('click', '#btn_documents_analysis', function () {
    console.info('---- #btn_documents_analysis on click ---');
    let connect_id = $(this).attr('data-connect_id');
    let metadata_id = $(this).attr('data-metadata_id');
    console.log('--- send_document_to_analysis ---, connect_id = ', connect_id, ', metadata_id = ', metadata_id);
    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      data: {
        "action": "send_document_to_analysis",
        "connect_id": connect_id,
        "metadata_id": metadata_id,
      },
      success: function (data) {},
      error: function (request, status, error) {
        console.error(`ajax action 'get_sources' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  });
  // <<< Анализ документа <<<

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // >>> Распознавание документа >>>
  // Важно!!! Отправлять документы на распознавание на сервер сообщений Kafka
  // можно только источники типа "Неструктурированные файлы" (any_files),
  // так как только у них есть все необходмые поля
  $('body').on('click', '#btn_documents_recognition', function () {
    console.info('---- #btn_documents_recognition on click ---');
    let connect_id = $(this).attr('data-connect_id');
    let metadata_id = $(this).attr('data-metadata_id');
    console.log('--- send_document_to_recognition ---, connect_id = ', connect_id, ', metadata_id = ', metadata_id);
    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      data: {
        "action": "send_document_to_recognition",
        "connect_id": connect_id,
        "metadata_id": metadata_id,
      },
      success: function (data) {},
      error: function (request, status, error) {
        console.error(`ajax action 'get_sources' ERROR.`);
        console.debug(request);
        console.debug(status);
        console.debug(error);
      }
    });
  });
  // <<< Распознавание документа <<<

  // >>> Редактирование колонки >>>
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Начать редактирование
  $('body').on('click', '#btn_edit_column_info', function () {
    console.info('---- #btn_edit_column_info on click ---');

    $('#btn_save_column_info').show();
    $('#btn_cancel_edit_column_info').show();
    $(this).hide();

    if (_DIGITAL_PLATFORM_INTEGRATION) {
      $('#id_need_quality_control').removeAttr('disabled');
      $('#id_need_quality_control').parent('div').find('label').addClass('text-success font-weight-bold');
    }

    $('#id_quality_control_rule').attr('contenteditable', 'true');
    $('#id_quality_control_rule').parent('div').find('label').addClass('text-success font-weight-bold');
    $('#id_quality_control_rule').focus();

    $('#id_column_comment').attr('contenteditable', 'true');
    $('#id_column_comment').parent('div').find('label').addClass('text-success font-weight-bold');

    $('#id_logical_type').removeAttr('disabled');
    $('#id_logical_type').parent('div').find('label').addClass('text-success font-weight-bold');

    $('#id_column_description').attr('contenteditable', 'true');
    $('#id_column_description').parent('div').find('label').addClass('text-success font-weight-bold');


    $('#id_need_type_transform').removeAttr('disabled');
    $('#id_need_type_transform').parent('div').find('label').addClass('text-success font-weight-bold');


    if ($('#id_need_type_transform').prop('checked')) {
      $('#id_new_type').removeAttr('disabled');
      $('#id_new_type').parent('div').find('label').addClass('text-success font-weight-bold');
    }

    if ($('#id_column_description').hasClass('contenteditable-textarea')) {
      MarkdownEditor
        .create(document.querySelector('#id_column_description'))
        .then(editor => {
          window.editor['#id_column_description'] = editor;
        })
        .catch(error => {
          console.error('MarkdownEditor editor.', error);
        });
    }

  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // сохранить
  $('body').on('click', '#btn_save_column_info', function () {
    console.info('---- #btn_save_column_info on click ---');

    // if ($('#id_need_type_transform').prop('checked') && !$('#id_new_type').find(":selected").val().length) {
    //   alert('Не все поля заполнены.');
    //   return;
    // }

    $('#btn_edit_column_info').show();
    $('#btn_cancel_edit_column_info').hide();
    $(this).hide();

    let cid = $(this).attr('cid');
    let columnName = $('#id_table_column_name').text();

    // $('#id_column_comment').attr('contenteditable', 'false');
    // $('#id_column_description').attr('contenteditable', 'false');

    // Удалим markdown editor у поля если оно textarea
    if ($('#id_column_description').hasClass('contenteditable-textarea') && window.editor['#id_column_description']) {
      window.editor['#id_column_description'].destroy();
    }

    saveSourcesTableColumnInfo(cid);
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Отменить редактирование
  $('body').on('click', '#btn_cancel_edit_column_info', function () {
    console.info('---- #btn_cancel_edit_column_info on click ---');

    $('#btn_edit_column_info').show();
    $('#btn_save_column_info').hide();
    $(this).hide();

    let cid = $(this).attr('cid');
    let columnName = $('#id_table_column_name').text();
    renderTableColumnInfo(cid, columnName);
  });
  // <<< Редактирование колонки <<<


  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Отменить редактирование
  $('body').on('click', '#table_columns_tab', function () {
    console.info('---- #table_columns_tab on click ---');

    // $('#btn_edit_table_common').show();
    $('#btn_save_table_common').hide();
    // $(this).hide();

    // cid = $(this).attr('cid');
    // showTableFullInfo(cid);
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Отменить редактирование
  $('body').on('change', '#id_new_type', function () {
    console.info('---- #id_new_type on change ---');

    $(this).removeClass('correct');
    $(this).removeClass('incorrect');
    $(this).addClass(!$(this).find(":selected").val().length ? 'incorrect' : 'correct');

  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Отменить редактирование
  $('body').on('change', '#id_need_type_transform', function () {
    console.info('---- #id_need_type_transform on change ---');

    if ($('#id_need_type_transform').prop('checked')) {
      $('#id_new_type').removeAttr('disabled');
      $('#id_new_type').parent('div').find('label').addClass('text-success font-weight-bold');
      $('#id_new_type').addClass(!$('#id_new_type').find(":selected").val().length ? 'incorrect' : 'correct');
    } else {
      $('#id_new_type').attr('disabled', 'disabled');
      $('#id_new_type').removeClass('correct');
      $('#id_new_type').removeClass('incorrect');

      $('#id_new_type').parent('div').find('label').removeClass('text-success font-weight-bold');
    }

  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Начать редактирование
  $('body').on('click', '.edit_btn', function () {
    console.info('---- .edit_btn on click ---');
    let for_id = $(this).attr('for_id');
    console.debug(`for_id = ${for_id}`);

    if (_EDIT_PROCESS) {
      console.info('_EDIT_PROCESS is active');
      $('.save_btn').trigger('click');
      return;
    }
    _EDIT_PROCESS = true;

    let btn_save = $(this).parent().find('.save_btn');
    btn_save.show();
    $(this).hide();

    $(`#${for_id}`).attr('contenteditable', 'true');
    if ($(`#${for_id}`).hasClass('contenteditable-textarea')) {
      MarkdownEditor
        .create(document.querySelector(`#${for_id}`))
        .then(editor => {
          window.editor[`#${for_id}`] = editor;
        })
        .catch(error => {
          console.error('MarkdownEditor editor.', error);
        });
    }
    // $(`#${for_id}`).focus();
    document.getElementById(for_id).focus();
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Сохранить
  $('body').on('click', '.save_btn', function () {
    console.info('---- .save_btn on click ---');

    // TODO: Тут какая-то фигня с for_id
    let for_id = $(this).attr('for_id');
    let is_source = $(`#${for_id}`).attr('is_source');

    btn_edit = $(this).parent().find('.edit_btn');
    btn_edit.show();
    $(this).hide();

    $(`#${for_id}`).attr('contenteditable', 'false');

    cid = $(`#${for_id}`).attr('cid');

    // Удалим markdown editor у поля если оно textarea
    if ($(`#${for_id}`).hasClass('contenteditable-textarea') && window.editor[`#${for_id}`]) {
      window.editor[`#${for_id}`].destroy();
    }
    switch (is_source) {
      case 'source_conn_info':
        saveSourcesConnInfo(cid);
        break;
      case 'table_common_info':
        saveSourcesTableCommonInfo(cid);
        break;
      default:
        break;
    }
    _EDIT_PROCESS = false;
  });


  // // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // $('body').on('click', '#btn_save_columns_info', function () {
  //   console.info('---- id_edit_table_comment on click ---');
  //   saveSourcesTableColumnInfo();
  // });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // $('body').on('click', '#btn_make_tables_for_quality_control', function () {
  //   console.info('---- btn_make_tables_for_quality_control on click ---');

  //   conn_id = $(this).attr('conn_id');
  //   send_action('make_tables_for_quality_control', conn_id);
  // });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  $('body').on('click', '#btn_load_data', function () {
    console.info('---- btn_load_data on click ---');

    let conn_id = $(this).attr('conn_id');
    send_action('load-data', conn_id, "GET");
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // $('body').on('click', '#btn_preload_data', function () {
  //   console.info('---- btn_preload_data on click ---');

  //   conn_id = $(this).attr('conn_id');
  //   send_action('preload_data', conn_id);
  // });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Читаем данные из таблицы и отображаем на вкладке
  $('body').on('shown.bs.tab', '.nav-tabs a', function () {
    console.info('---- .nav-tabs a on shown.bs.tab ---');
    tab_id = $(this).attr('id');
    console.debug(`tab_id = '${tab_id}'`);

    if (tab_id == 'id_table_data_tab') {
      cid = $(this).attr('cid');

      renderTableDataInfo(cid);
    }
  });

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Читаем данные из таблицы и отображаем на вкладке
  // $('body').on('click', '#id_table_data_tab', function () {

  //   // emptySourceTableTab('#table_data');
  //   // getSourceTableTabContentObject('#table_data').html('<br><br>' + getSpinner());

  //   if (cid.length == 0) {
  //     return;
  //   }

  //   $.ajax({
  //     url: `${location.href}`,
  //     method: 'POST',
  //     data: {
  //       "action": "get_metadata_data",
  //       "cid": cid,
  //     },
  //     success: function (data) {
  //       console.log(`ajax action 'get_metadata_data' SUCCESS.`);
  //       renderTableDataInfo(data);
  //     },
  //     error: function (request, status, error) {
  //       console.error(`ajax action 'get_metadata_data' ERROR.`);
  //       console.debug(request);
  //       console.debug(status);
  //       console.debug(error);
  //     }
  //   });
  // });


  // ------------------------------------------
  // Обработка событий дерева
  $('#sources_tree')
    // listen for event
    // .on('hover_node.jstree', function (e, data) {
    //   console.info('*** readySources - hover_node.jstree ***');
    // })
    .on('changed.jstree', function (e, data) {
      console.info('*** readySources - changed.jstree ***');

      if (data == undefined) {
        return;
      }

      let node_type = '';
      let version = '';
      for (i = 0, j = data.selected.length; i < j; i++) {
        // r.push(data.instance.get_node(data.selected[i]).text);
        node = data.instance.get_node(data.selected[i]);
        attr = node.li_attr;
        keys = Object.keys(attr);
        if (Object.keys(attr).length && Object.keys(attr).includes('type')) {
          node_type = attr.type;
        }
        if (Object.keys(attr).length && Object.keys(attr).includes('cid')) {
          cid = attr.cid;
        }
        if (Object.keys(attr).length && Object.keys(attr).includes('version')) {
          version = attr.version;
        }
        text = node.text;
        // r.push(data.instance.get_node(data.selected[i]).id);
      }
      // $('#event_result').html('Selected: ' + r.join(', '));
      if (node_type.length) {
        switch (node_type) {
          case 'source_conn':
            showSourceConn(cid);
            break;
          case 'tables_group': // группа таблиц
            showTablesGroup(cid, version);
            break;
          case 'version':
            $('#id_info_place').empty();
            break;
          case 'table':
            showTableFullInfo(cid);

            break;
          case 'column':
            // $('#id_info_place').empty();
            renderTableColumnInfo(metadata_id = cid, column_name = text);
            break;
          default: // root
            showSourcesInfo();
            break;
        }
      }
    });


}).call(this);