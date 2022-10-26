/*jshint esversion: 6 */
// ***************************************************************************
var _edit_connect_id = "";
var _connection = {};
var TYPES_KAFKA_CONNECTON = [];

const connect_messages = {
  connect_success: {
    text: "Успешное соединение с Kafka!",
    class: 'alert alert-success'
  },
  not_all_parameters_filled: {
    text: "Не все параметры заполнены",
    class: "alert alert-error"
  },
  connect_danger: {
    text: "Не удалось соединиться с Kafka!",
    class: "alert alert-danger"
  },
  connect_in_proccess: {
    text: "...Попытка соединения с Kafka ...",
    class: "alert alert-info"
  }
};

// ------------------------------------------
//
function show_connect_message(con_message) {
  var check_kafka_text = $('#id_check_kafka_text');
  if (check_kafka_text.length == 0) {
    return;
  }

  check_kafka_text.removeClass('alert');
  check_kafka_text.removeClass('alert-info');
  check_kafka_text.removeClass('alert-success');
  check_kafka_text.removeClass('alert-danger');
  check_kafka_text.removeClass('alert-error');

  check_kafka_text.text(con_message.text).addClass(con_message.class);
}

// ------------------------------------------
// Проверка соединения с Kafka
function testKafkaConnection(saved_schemas_with_tables) {
  var host = $('#id_host').val();
  var port = $('#id_port').val();
  var topic_from = $('#id_topic_from').val();
  var topic_to = $('#id_topic_to').val();

  if (host && port) {
    show_connect_message(connect_messages.connect_in_proccess);
    $.ajax({
      url: `${location.href}`,
      method: 'POST',
      dataType: "json",
      data: {
        "action": "test_kafka_connection",
        "host": host,
        "port": port,
        'topic_from': topic_from,
        'topic_to': topic_to,
      },
      success: function (data) {
        console.log(`ajax action 'testKafkaConnection' SUCCESS.`);
        result = data.result;
        list_topics = data.list_topics;
        // Сортировка топиков по алфавиту
        list_topics = list_topics.sort();
        //console.log(list_topics);

        result ? show_connect_message(connect_messages.connect_success) : show_connect_message(connect_messages.connect_danger);

        topic_from = $('#id_topic_from');
        topic_to = $('#id_topic_to');

        topic_from.empty();
        topic_to.empty();
        if (result) {
          // Заполним списком 
          for (i = 0; i < list_topics.length; i++) {
            topic_from.append($('<option/>')
              .text(list_topics[i])
              .attr('value', list_topics[i])
              .attr((_connection != null && _connection.topic_from != undefined && list_topics[i] == _connection.topic_from) ? {
                'selected': 'selected'
              } : {}));

            topic_to.append($('<option/>')
              .text(list_topics[i])
              .attr('value', list_topics[i])
              .attr((_connection != null && _connection.topic_to != undefined && list_topics[i] == _connection.topic_to) ? {
                'selected': 'selected'
              } : {}));
          }
        }
      },
      error: function (d) {
        console.error("ajax action 'testKafkaConnection' ERROR.");
      }
    });
  } else {
    show_connect_message(connect_messages.not_all_parameters_filled);

    // $('#id_check_kafka_text').text(text_not_all_parameters_filled).addClass('alert alert-error');

  }

}
// ------------------------------------------
//
function make_form() {
  console.info('---- make_form ---');
  if (document.getElementById('edit_kafka_connection') == null) {
    return;
  }

  show_connect_message(connect_messages.not_all_parameters_filled);

  if (document.getElementById('edit_kafka_connection') != null) {
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

  // Заполнение данными
  $.ajax({
    url: `${location.href}`,
    method: 'POST',
    dataType: "json",
    data: {
      "action": "get_connection_data",
      "conn_id": _edit_connect_id
    },
    success: function (data) {
      console.log(`ajax action 'get_connection_data' SUCCESS. data = ${data}`);
      _connection = data.connection;
      _TYPES_KAFKA_CONNECTON = data.TYPES_KAFKA_CONNECTON;

      type_kafka_connection = $('#id_type_kafka_connection');
      type_kafka_connection.empty();

      for (i = 0; i < _TYPES_KAFKA_CONNECTON.length; i++) {
        option_value = _TYPES_KAFKA_CONNECTON[i][0];
        option_text = _TYPES_KAFKA_CONNECTON[i][1];

        type_kafka_connection.append($('<option/>')
          .text(option_text)
          .attr('value', option_value)
          .attr((_connection != null && _connection.type_kafka_connection != undefined && option_value == _connection.type_kafka_connection) ? {
            'selected': 'selected'
          } : {}));
      }

      if (_edit_connect_id.length) {
        //  Редактирование
        // TODO: Здесь надо заполнить данными из соединения
        $('#id_name').val(_connection.name);
        $('#id_description').html(_connection.description);



        $('#id_host').val(_connection.host);
        $('#id_port').val(_connection.port);
        testKafkaConnection();
      } else {
        $('#id_host').val('localhost');
        $('#id_port').val('9092');
        testKafkaConnection();
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
      });

    },
    error: function (d) {
      console.error(`ajax action 'get_connection_data' ERROR. Статус =  ${d.statusText} Описание ошибки: = ${d.responseText}`);
    }
  });
}

// ------------------------------------------
function update_dom() {
  console.info('---- update_dom ---');

}

(application = function () {
  console.info('=== Connects-page.js ===');

  // ------------------------------------------
  this.readyConnects = function () {
    if (getPageName() !== 'connects-page') {
      console.info('*** readyConnects - IGNORED ***');
      return;
    }
    console.info('=== readyConnects ===');
  };

  // ------------------------------------------
  $(document).ready(function () {
    console.info('*** readyConnects - is ready ***');

    make_form();

    /* Кнопка "Отмена" на странице редактирования сущности*/
    $("#button-id-cancel").on("click", function () {
      console.info('---- button-id-cancel click ---');
      window.location.href = "/connects/";
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
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_database', function () {
      console.info('---- id_database on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_port', function () {
      console.info('---- id_port on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_username', function () {
      console.info('---- id_username on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('change', '#id_password', function () {
      console.info('---- id_password on change ---');

      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('click', '#id_test_connection', function () {
      console.info('---- id_test_connection on click ---');

      form = $('form')
      console.debug($('form').attr('id'));
      if ($('form').attr('id') == 'id_form_kafka_connection') {
        testKafkaConnection();
      }

    });

    $('body').on('submit', 'form', function (event) {
      console.info('---- form submit ---');

      form_id = $(this).attr('id');
      if (form_id != 'id_form_kafka_connection') {
        return;
      }
      event.preventDefault();
      form = $(this)[0];
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        alert("Не все необходимые поля заполнены");
        return;
      }

      name_connect = $('#id_name').val();
      type_kafka_connection = $('#id_type_kafka_connection').val();

      host = $('#id_host').val();
      port = $('#id_port').val();
      topic_from = $('#id_topic_from').val();
      topic_to = $('#id_topic_to').val();

      save_data = {
        'type_connection': 'kafka',
        'name': name_connect,
        'description': window.editor.id_description.getData(),
        'type_kafka_connection': type_kafka_connection,
        'host': host,
        'port': port,
        'topic_from': topic_from,
        'topic_to': topic_to,
      };

      console.debug(save_data);
      $.ajax({
        url: `${location.href}`,
        method: 'POST',
        content_type: 'application/json',
        data: {
          "action": "save_kafka_connection",
          "save_data": JSON.stringify(save_data),
          'conn_id': _edit_connect_id,
        },
        success: function (data) {
          console.log(`ajax action 'save_kafka_connection' SUCCESS.`);
          window.location.href = '/connects/';
        },
        error: function (d) {
          console.error("ajax action 'save_kafka_connection' ERROR.");
        }
      });

    });

  });
}).call(this);