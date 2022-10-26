/*jshint esversion: 6 */
var _root_diagram_data = [];
var _mart = {
  "mart_name": '',
  "mart_description": '',
  "mart_dest_table": '',
  "mart_permanent": '',
  "mart_due_date": '',
  "mart_subscribers": '',
  "source_data_rows_limit": '',
  "mart_columns_count": '',
  "mart_rows_count": '',
};

// ------------------------------------------
// Проверим, ес
function hasSelected() {
  console.info('---- hasSelected ---');
  ret = false;

  for (let i = 0; i < _root_diagram_data.length; i++) {
    const element = _root_diagram_data[i];
    if (element.selected) {
      ret = true;
      break;
    }

  }
  return ret;
}

// ------------------------------------------
// Заполним список сущностей (для диаграммы)
function fillEntities() {
  console.info('---- fillEntities ---');
  elem = document.getElementById('entity_select');
  if (elem == null) {
    return;
  }
  $('#entity_select').empty();

  mart_id = '';
  if ($('#mart_id')) {
    mart_id = $('#mart_id').attr('mart_id');
  }

  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    data: {
      "action": "get_entities",
      "mart_id": mart_id
    },
    success: function (data) {
      console.log(`ajax action 'get_entities' SUCCESS`);
      if (data.length != 0) {
        entities = data.entities;
        source_mart = data.mart;
        entity_id = undefined;

        //  Если витрина не пустая - вытащим данные из нее
        if (typeof source_mart._id != 'undefined') {
          _mart = source_mart.mart_info;
          for (let i = 0; i < source_mart.mart_data.length; i++) {
            const element = source_mart.mart_data[i];
            if (element.type == 'entity') {
              entity_id = element.id;
              break;
            }

            // _mart.mart_name = source_mart.name;
            // _mart.mart_description = source_mart.description;
            // _mart.mart_dest_table = source_mart.dest_tablename;
            // _mart.mart_permanent = source_mart.permanent;
            // _mart.mart_due_date = source_mart.due_date;
            // _mart.mart_subscribers = source_mart.subscribers;
          }
        }
        for (let i = 0; i < entities.length; i++) {
          const element = entities[i];
          id = element[0];
          name = element[1];

          one_line = $('<\option>')
            .text(name)
            .val(id);
          if (id == entity_id) {
            one_line.attr("selected", "selected");
          }
          $('#entity_select').append(one_line);
        }

        $('#entity_select').select2({
          theme: 'classic',
        });
        // Вместо:
        //$('#entity_select').trigger('change');
        // сделаем вызов отрисовки графа
        // callPaintMartGraph()
      }
    },
    error: function (d) {
      console.error(`ajax action 'get_entities' ERROR`);
    }
  });

}

// ------------------------------------------
function save_mart(mart, diagram_data) {
  console.info('---- save_mart ---');
  mart_id = '';
  if ($('#mart_id')) {
    mart_id = $('#mart_id').attr('mart_id');
  }

  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    dataType: 'json',
    data: {
      "action": "save_mart",
      "mart_id": mart_id,
      "mart_info": JSON.stringify(mart),
      "mart_data": JSON.stringify(diagram_data)
    },
    content_type: 'application/json',
    success: function (data) {
      console.log(`ajax action 'save_mart' SUCCESS`);
    },
    error: function (d) {
      console.error(`ajax action 'save_mart' ERROR`);
    }
  });


}


// Функция генерации названия таблицы витрины из названия витрины
function makeMartTableName(mart_title_cyrillic) {
  if (mart_title_cyrillic == null || mart_title_cyrillic == '') {
    return false;
  }
  var translitMartTableName = '';
  translitMartTableName = $.trim(mart_title_cyrillic);
  translitMartTableName = translitMartTableName.toLowerCase();
  translitMartTableName = translitCyrillic(translitMartTableName);
  // Ограничиваем длина названия таблицы
  translitMartTableName = translitMartTableName.replace(/\s/g, '_');
  translitMartTableName = translitMartTableName.replace(/\W+\D+/g, '_');
  translitMartTableName = translitMartTableName.replace(/[\_]{2,}/g, '_');

  translitMartTableName = translitMartTableName.substring(0, 16);

  var uuid = uuid_short();
  uuid = uuid.replace(/-/g, '_');
  translitMartTableName += '_' + uuid;
  translitMartTableName = translitMartTableName.replace(/[\_]{2,}/g, '_');
  return translitMartTableName;
}

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

  for (var i = 0; i < cyrillic_string.length; ++i) {
    n_str.push(
      ru[cyrillic_string[i]] ||
      ru[cyrillic_string[i].toLowerCase()] == undefined && cyrillic_string[i] ||
      ru[cyrillic_string[i].toLowerCase()].toUpperCase()
    );
  }

  return n_str.join('');
}

function uuid_short() {
  return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

    // for Markdown
    window.editor = {};

    fillEntities();
  });

  $('#mart_name').on('blur', function () {
    var mart_name = $(this).val();
    if (mart_name != '') {
      var mart_table_name = '';
      mart_table_name = makeMartTableName(mart_name);
      console.log(mart_table_name);
      if (($('#mart_dest_table').val() == '') || ($('#action').val() == 'new')) {
        $('#mart_dest_table').val(mart_table_name);
      }
    }
  });

  /*
  // ------------------------------------------
  // Нажата кнопка "сохранить" для витрины (на основной странице)
  $('#button_save').click(function () {
    if ($(this).hasClass('disabled')) {
      return;
    }
    console.info('---- button_save click ---');

    $('#mart_name').val(_mart.mart_name);
    // console.debug($('#mart_name').val())
    $('#mart_description').html(_mart.mart_description);
    $('#mart_dest_table').val(_mart.mart_dest_table);

    //console.log(_mart);
    if (typeof (_mart.source_data_rows_limit) == 'undefined' && _mart.mart_rows_count != '') {
      _mart.source_data_rows_limit = _mart.mart_rows_count;
    }
    $('#source_data_rows_limit').val(_mart.source_data_rows_limit);

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

    if (_mart.mart_permanent) {
      $('#mart_permanent').prop('checked', _mart.mart_permanent);
      $('#mart_due_date').prop("disabled", true);
    } else if (_mart.mart_due_date) {
      //console.log(_mart.mart_due_date);
      //due_date = new Date(_mart.mart_due_date);
      //console.log(due_date);
      //formatted_due_date = due_date.toISOString();
      //console.log(formatted_due_date);
      formatted_due_date = _mart.mart_due_date.toString().substr(0, 10);
      //console.log(formatted_due_date);
      $('#mart_due_date').val(formatted_due_date);
    }

    now = new Date();
    str_now = now.toISOString().substr(0, 10);
    $('#mart_due_date').attr("min", str_now);

    $('#modal_edit_mart').modal({
      backdrop: "static"
    });

  });
  */
 
  // ------------------------------------------
  // Помечена витрина как постояннпя
  $("#mart_permanent").click(function () {
    console.info('---- mart_permanent click ---');
    $("#mart_due_date").prop("disabled", this.checked);
  });

  // ------------------------------------------
  // Нажата кнопка в модальном диалоге сохранения витрины
  // ЭТОТ МЕТОД НЕ ИСПОЛЬЗУЕТСЯ (он перенесен в файл edit_marts_jsPlumb.js)
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

    _mart.source_data_rows_limit = $('#source_data_rows_limit option:selected').val();
    _mart.mart_permanent = $('#mart_permanent').prop('checked');
    _mart.mart_due_date = $('#mart_due_date').val();

    if (_mart.mart_permanent) {
      _mart.mart_due_date = '';
    } else if (!_mart.mart_permanent && !_mart.mart_due_date) {
      // ! Почему-то переходит на предыдущую страницу
      alert('Не выбран срок окончания действия');
      return false;
    }
    
    console.debug(_mart);
    if (_mart.mart_name.length && _mart.mart_dest_table.length) {
      if (!hasSelected()) {
        alert('Не выбраны элементы для витрины');
        // ! Почему-то переходит на предыдущую страницу
        return false;
      } else {
        // А теперь соберем все помеченные элементы
        diagram_data = [];
        for (let i = 0; i < _root_diagram_data.length; i++) {
          const element = _root_diagram_data[i];
          if (element.selected) {
            diagram_data.push(element);
          }
        }
        save_mart(_mart, diagram_data);
      }
    }
  });

  // ------------------------------------------
  // отработка списка выбора сущности (для диаграммы)
  $('#entity_select').change(function () {
    console.info('---- entity_select change ---');
    // makeMultiselect();
    id__id = $('#id__id').val();
    mart_id = '';
    if ($('#mart_id')) {
      mart_id = $('#mart_id').attr('mart_id');
    }

    $("#d3_diagram").empty();
    $('#d3_diagram').append('<br><br><i class="fas fa-spinner fa-pulse fa-7x text-success"></i>');

    // Запросим элементы, которые были уже сохранены
    // ----------
    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      data: {
        "action": "get_diagram_data",
        // "entity_id": $('#entity_select').val(), // id набора данных
        "entity_id": $(this).val(), // id набора данных
        "mart_id": mart_id
      },
      success: function (data) {
        console.log(`ajax action 'entity_select - change' SUCCESS`);
        if (data.length != 0) {
          _root_diagram_data = data.diagram_data;

          $("#d3_diagram").empty();

          console.debug(_root_diagram_data);
          viewTreeDiagramD3(d3.stratify()(_root_diagram_data));
        }
      },
      error: function (d) {
        console.error(`ajax action 'entity_select - change' ERROR`);
      }
    });
  });

  // $(".delete_mart").click(function () {
  //   href = $(this).attr('data-val');
  //   var res = false;
  //   if (href) {
  //     $.ajax({
  //       url: "manage-mart/",
  //       data: {
  //         action: "check-delete",
  //         cid: href
  //       },
  //       async: false,
  //       success: function (data) {
  //         if (data.permanent && !data.is_staff) {
  //           alert("Невозможно удалить втирину, витрина постоянная");
  //         } else if (data.has_subscribers) {
  //           alert("Невозможно удалить втирину, на витрину подписаны другие пользователи");
  //         } else if (confirm("Удалить витрину?")) {
  //           res = true;
  //         }
  //       }
  //     });
  //     return res;
  //   }
  // });

  $('#tab_marts .nav-link').click(function () {
    console.info('*** .nav-link - click ***');
    $this = $(this);
    active_tab = $this.attr('data-val');

    $.ajax({
      url: `${location.href}`,
      method: 'GET',
      data: {
        "active_tab": active_tab,
      },
      success: function (data) {
        $('#tab-content').html(data);
      }
    });
  });

  // Список витрин с истекющим сроком действия
  $('#expired a').click(function () {
    console.info('*** expired - click ***');
    $this = $(this);
    days = $this.attr('data-val');

    active_tab = $('#tab_marts li a.active').attr('data-val');
    console.log(active_tab);

    $.ajax({
      url: `${location.href}`,
      method: 'GET',
      data: {
        "action": "expiring_marts",
        "active_tab": active_tab,
        "days": days
      },
      success: function (data) {
        $('#tab-content').html(data);
      }
    });
  });



  // ------------------------------------------
  // $('#id_permanent').change(function () {
  //   console.info('---- id_permanent change ---');

  //   checked = $(this).prop('checked');
  //   $due_data = $('#id_due_date');
  //   if (checked == true) {
  //     $due_data.attr('disabled', 'disabled');
  //     $due_data.removeAttr('required');
  //   } else {
  //     $due_data.removeAttr('disabled');
  //     $due_data.attr('required', 'required');
  //   }
  // });

  $('.btn-statistics').on('click', function () {
    var title = $(this).attr('data-title');
    var text = $(this).attr('data-text');
    $('#dialog-mart-statistics').html(text);
    $('#dialog-mart-statistics').dialog({
      title: 'Статистика витрины: ' + title,
      autoOpen: true,
      modal: true,
      width: 800,
    });
  });

}).call(this);

//
function isMartDestTableNameCorrect(mart_dest_table) {
  var result = false;
  var mart_table_name_mask = /^[\w]{2,127}$/gm;
  if (mart_table_name_mask.test(mart_dest_table)) {
    result = true;
  }
  return result;
}


// diagram d3

function bindViewDiagramScrollTop() {
  var view_diagram_width = $("svg#d3_diagram_svg").width();
  $(".view_diagram_scrollbar_content").css("width", view_diagram_width);

  $(".view_diagram").scroll(function () {
    $(".view_diagram_scrollbar_top").scrollLeft($(".view_diagram").scrollLeft());
  });

  $(".view_diagram_scrollbar_top").scroll(function () {
    $(".view_diagram").scrollLeft($(".view_diagram_scrollbar_top").scrollLeft());
  });
}

// ------------------------------------------
// Диаграмма в виде дерева
function viewTreeDiagramD3(data) {

  var scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  var scrollWidth = document.documentElement.clientWidth;

  margin = ({
    top: 10,
    right: 20,
    bottom: 10,
    left: 40
  });

  var width = scrollWidth,
    height = scrollHeight;

  var max_dept = 0;
  // Расстояние между шариками по вертикали 
  dx = 35;
  // расстояние по горизонтали
  dy = width / 6;

  all_nodes = data.descendants();
  num_nodes = all_nodes.length;

  // console.debug(`height = ${height}`);
  // console.debug(`num_nodes = ${num_nodes}`);
  // console.debug(`num_nodes * dx + 50 = ${num_nodes * dx + 50}`);

  height = Math.max(height, num_nodes * dx + 50);

  // d3.select("#d3_diagram").style('height', height + 'px');

  tree = d3.tree().nodeSize([dx, dy]);
  treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  graph(data);

  w = d3.select("#d3_diagram_svg").style('width');
  console.debug(`w =  ${w}`);
  w2 = d3.select("#d3_diagram").style('width');
  console.debug(`w2 =  ${w2}`);

  // ------------------------------------------
  function graph(root, {
    name = d => d.data.name,
    comment = d => d.data.comment,
    short_comment = d => d.data.comment.length > 25 ? d.data.comment.slice(0, 25) + '...' : d.data.comment,
    description = d => d.data.description,
    tooltip_title = d => d.data.comment + '\n' + d.data.description,
    // highlight = () => false,
    highlight = d => d.data.selected,
    node_type = d => d.data.type,
    marginLeft = 200
  } = {}) {
    root = tree(root);

    // highlight = (1, 2)
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
      max_dept = Math.max(max_dept, d.depth);
    });

    d3.select("#d3_diagram").style('width', max_dept*dy);
    d3.select("#d3_diagram").style('height', height + 'px');

    // const svg = d3.create("svg")
    const svg = d3.select("#d3_diagram").append('svg')
      .attr('id', 'd3_diagram_svg')
      .style('width', (max_dept + 2) * dy)
      // .attr("viewBox", [0, 0, width, x1 - x0 + dx * 2])
      .style("overflow", "visible");

    update(root);


    // Кнопки
    const buttons = svg.append('g')
      .attr("font-family", "inherit")
      .attr("font-size", 14)
      .attr("ont-weight", 400)
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    const ButtonClearSelected = buttons.append('g')
      .on("click", clickButtonClearSelected)
      .on("mouseover", function (d) {
        ButtonClearSelectedRect.attr("fill", '#28a745');
        ButtonClearSelectedText.attr("fill", 'white');
      })
      .on("mouseout", function (d) {
        ButtonClearSelectedRect.attr("fill", 'transparent'); //   // d3.select(this).attr("fill", "transparent");
        ButtonClearSelectedText.attr("fill", '#28a745');
      });

    const ButtonClearSelectedRect = ButtonClearSelected.append("rect")
      // .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      .attr("fill", "transparent")
      // атрибуты 
      .attr("stroke", '#28a745')
      .attr("rx", "3.2px")
      .attr("ry", "3.2px")
      .attr("width", 130)
      .attr("height", 31);

    const ButtonClearSelectedText = ButtonClearSelected.append('text')
      .attr("dy", "1.4em")
      .attr("x", 14)
      .attr('fill', '#28a745')
      .text('Снять пометку');

    const ButtonSelectAll = buttons.append('g')
      .attr("fill", "transparent")
      .attr("transform", `translate(${140},${0})`)
      .on("click", clickButtonSelectAll)
      .on("mouseover", function (d) {
        ButtonSelectAllRect.attr("fill", '#28a745');
        ButtonSelectAllText.attr("fill", 'white');
      })
      .on("mouseout", function (d) {
        ButtonSelectAllRect.attr("fill", 'transparent'); //   // d3.select(this).attr("fill", "transparent");
        ButtonSelectAllText.attr("fill", '#28a745');
      });

    const ButtonSelectAllRect = ButtonSelectAll.append("rect")
      // .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      // атрибуты 
      .attr("stroke", '#28a745')
      .attr("rx", "3.2px")
      .attr("ry", "3.2px")
      .attr("width", 120)
      .attr("height", 31);

    const ButtonSelectAllText = ButtonSelectAll.append('text')
      .attr("dy", "1.4em")
      .attr("x", 14)
      .attr('fill', '#28a745')
      .text('Пометить все');

    // ------------------------------------------
    function update(source) {
      console.info('---- update ---');
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();
      tree(root);

      // Обновим у глобального набора выбранные элементы
      data.descendants().forEach(element => {
        for (let i = 0; i < _root_diagram_data.length; i++) {
          const el = _root_diagram_data[i];
          if (el.id == element.data.id) {
            el.selected = element.data.selected;
          }
        }
      });

      // Обшщая группа для всех элемментов с общими характеристиками
      const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("transform", `translate(${marginLeft},${dx - x0})`);

      const gLink = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.5)
        .selectAll("path") // ? не понятно
        .data(root.links())
        .join("path") // ? не понятно
        .attr("stroke", d => highlight(d.source) && highlight(d.target) ? '#28a745' : null)
        .attr("stroke-opacity", d => highlight(d.source) && highlight(d.target) ? 1 : null)
        .attr("d", treeLink); // ? не понятно

      // Узлы
      const gNode = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g") // ? не понятно
        .data(root.descendants())
        .join("g") // ? не понятно
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("cursor", "pointer")
        .attr("pointer-events", "all")
        // .on("click", checkNode)
        .attr('id', d => d.id)
        .attr('data-toggle', 'tooltip')
        .attr('title', tooltip_title)
        // .attr('title', d => d.data.description.length ? d.data.description : "Описание отсутствует")
        .on("click", checkNode)
        .on("mouseover", function (d) {
          console.debug(`mouseover: id = ${d.id}`);
          $(`#${d.id}`).tooltip();
        });

      gNode.append("circle")
        .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#555" : "#999")
        // Диаметр шарика
        .attr("r", d => d.data.type == 'column' ? 9 : d.data.type == 'entity' ? 5 : 20)
        // Размер прямоугольника
        .attr("width", 9)
        .attr("height", 9);
      // .attr("data-toggle","tooltip")
      // .attr("title", "Привет! Это я!")

      // gNode.append("rect")
      //   .attr("fill", d => highlight(d) ? '#28a745' : d.children ? "#777" : "#999")
      //   // .attr("fill", "#777")
      //   // атрибуты 
      //   // .attr("stroke", "black")
      //   // .attr("rx", 5)
      //   // .attr("ry", 5)
      //   .attr("width", 9)
      //   .attr("height", 9)


      gNode.append("text")
        .attr("fill", d => highlight(d) ? '#28a745' : (d => d.data.type == 'metadata' ? '#2350b1' : null))
        .attr("dy", "0.20em") // Смещение по вертикали
        .attr("x", d => d.children ? -12 : 12)
        .attr("text-anchor", d => d.data.type == 'metadata' ? "end" : "start")
        .text(short_comment)
        .clone(true).lower() // ? не понятно
        .attr("stroke", "white");

      gNode.append("text")
        .attr("fill", d => highlight(d) ? '#28a745' : null)
        // .style("font-family","verdana")
        .style("font-size", "80%")
        .attr("dy", "1.31em") // Смещение по вертикали
        .attr("x", d => d.children ? -12 : 12)
        .attr("text-anchor", d => d.data.type == 'metadata' ? "end" : "start")
        .text(name)
        .clone(true).lower() // ? не понятно
        .attr("stroke", "white");

      checkSelected();
      bindViewDiagramScrollTop();
    }



    // ------------------------------------------
    function changeSelected(selected) {
      console.info('---- view_diagram -> changeSelected ---');

      descendants = root.descendants();
      for (let i = 0; i < descendants.length; i++) {
        descendants[i].data.selected = selected;
      }
    }

    // ------------------------------------------
    function checkSelected() {
      console.info('---- view_diagram -> checkSelected ---');

      let selected = false;

      descendants = root.descendants();
      for (let i = 0; i < descendants.length; i++) {
        if (descendants[i].data.selected == true) {
          selected = true;
          break;
        }
      }

      selected ? $('#button_save').removeClass('disabled') : $('#button_save').addClass('disabled');
      return selected;
    }

    // ------------------------------------------
    function clickButtonClearSelected(d) {
      console.info('---- view_diagram -> clickButtonClearSelected ---');
      changeSelected(false);
      update(root);
    }

    // ------------------------------------------
    function clickButtonSelectAll(d) {
      console.info('---- view_diagram -> clickButtonSelectAll ---');
      changeSelected(true);
      update(root);
    }

    // ------------------------------------------
    function checkNode(d) {
      console.info('---- view_diagram -> checkNode ---');
      if (!d.data.selected) { // Если не помечено, то помечаем
        // Возьмем всех родителей
        ancestors = d.ancestors(); // Текущий с родительскими
        for (let i = 0; i < ancestors.length; i++) {
          const element = ancestors[i]; // Родитель
          element.data.selected = true; // Пометим родителя
          // ПОищем непомеченное метаданное 
          if (element.data.type == 'column') {
            metadata_id = element.data.id.split('-')[0]
            child = element.children;
            if (child != undefined) {
              for (let k = 0; k < child.length; k++) {
                const child_elemet = child[k];
                if (child_elemet.data.type == 'metadata' && child_elemet.data.id == metadata_id && child_elemet.data.selected == false) {
                  child_elemet.data.selected = true;
                }
              }
            }
          }
        }
        descendants = d.descendants();
        for (let i = 0; i < descendants.length; i++) {
          const element = descendants[i]; // Дочерний
          element.data.selected = true; // Пометимдочерний элемент
        }
      } else { // Еслм помечено - снимаем пометку
        descendants = d.descendants();
        for (let i = 0; i < descendants.length; i++) {
          const element = descendants[i]; // Текущий с дочерними
          element.data.selected = false; // Снимем пометку в том числе с дочернего элемента
        }

      }
      // d.data.selected = !d.data.selected;

      // d.children = d.children ? null : d._children;
      update(d);
    }
    return svg.node();
  }

}