// import { viewTreeDiagramD3 } from './d3-diagram.js';

// import {
//   jsPlumbDiagram
// } from 'jsPlumbDiagram';

var _root_diagram_data = [];
var _mart = {
  "mart_name": '',
  "mart_description": '',
  "mart_dest_table": '',
  "mart_permanent": '',
  "mart_due_date": '',
  "mart_subscribers": '',
};

// ------------------------------------------
// Проверим, ес
function has_selected() {
  console.info('---- has_selected ---');
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
function fill_entities() {
  console.info('---- fill_entities ---');
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

        $('#entity_select').trigger('change');
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

    fill_entities();
  });



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
      due_date = new Date(_mart.mart_due_date);
      formatted_due_date = due_date.toISOString().substr(0, 10);
      $('#mart_due_date').val(formatted_due_date);
    }

    now = new Date();
    str_now = now.toISOString().substr(0, 10);
    $('#mart_due_date').attr("min", str_now);

    $('#modal_edit_mart').modal({
      backdrop: "static"
    });

  });

  // ------------------------------------------
  // Помечена витрина как постояннпя
  $("#mart_permanent").click(function () {
    console.info('---- mart_permanent click ---');
    $("#mart_due_date").prop("disabled", this.checked);
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
    _mart.mart_permanent = $('#mart_permanent').prop('checked');
    _mart.mart_due_date = $('#mart_due_date').val();

    if (_mart.mart_permanent) {
      _mart.mart_due_date = '';
    } else if (!_mart.mart_permanent && !_mart.mart_due_date) {
      // ! Почему-то переходит на предыдущую страницу
      alert('Не выбран срок окончания действия');
    }

    console.debug(_mart);
    if (_mart.mart_name.length && _mart.mart_dest_table.length) {
      if (!has_selected()) {
        alert('Не выбраны элементы для витрины');
        // ! Почему-то переходит на предыдущую страницу
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

          jsPlumbDiagram(_root_diagram_data);
          // viewTreeDiagramD3(d3.stratify()(_root_diagram_data));
        }
      },
      error: function (d) {
        console.error(`ajax action 'entity_select - change' ERROR`);
      }
    });
  });

  $(".delete_mart").click(function () {
    href = $(this).attr('data-val');
    var res = false;
    if (href) {
      $.ajax({
        url: "manage-mart/",
        data: {
          action: "check-delete",
          cid: href
        },
        async: false,
        success: function (data) {
          if (data.permanent && !data.is_staff) {
            alert("Невозможно удалить втирину, витрина постоянная");
          } else if (data.has_subscribers) {
            alert("Невозможно удалить втирину, на витрину подписаны другие пользователи");
          } else if (confirm("Удалить витрину?")) {
            res = true;
          }
        }
      });
      return res;
    }
  });

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

}).call(this);

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

function jsPlumbDiagram(data) {
  console.info('---- jsPlumbDiagram ---');
  console.debug(_root_diagram_data);

  div_canaas = $('<div/>')
    .addClass('jtk-demo-canvas')
    .attr('id', 'canvas');

  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    if (element['type'] == 'metadata') {
      div_canaas.append(list_div = $('<div/>')
          .addClass('list list-lhs')
          .attr('id', element.id)
          .append(
            $('<div/>')
            .append(element.name)
          )
        )
        .append(ul = $('<ul/>'));

      for (k = 0; k < data.length; k++) {
        subEement = data[k];
        if (subEement.parentId == element.id) {
          ul.append(
            $('<li/>')
            .attr('id', subEement.id)
            .append(subEement.name)
          );
        }
      }

    }
  }
  $("#d3_diagram").append(div_canaas)
}