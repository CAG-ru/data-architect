/*jshint esversion: 6 */
// ------------------------------------------
function startCron() {
  setTimeout(function () {
    cron();
  }, 2000);

}

// ------------------------------------------
function hide_messages(mess_id_list) {
  console.info('*** hide_messages ***');
  console.debug(`mess_id_list = ${mess_id_list}`);

  for (let i = 0; i < mess_id_list.length; i++) {
    const one_id = mess_id_list[i];
    $(`#${one_id}`).hide(duration = 500, function () {
      $(`#${one_id}`).remove();
    });
  }
}

// ------------------------------------------
function cron() {
  //console.info('*** cron ***');
  //дергаем крон
  // $('.notification-block').removeClass('success danger');e
  $('.notification-block').children('.notification-text').empty();
  // $('.notification-block').children('.notification-title').empty();
  $.ajax({
    url: "/notice/get_notice_info",
    method: 'GET',
    async: true,
    data: {
      "action": "get_notice_info",
    },
    success: function (data) {
      //console.log(`ajax action 'get_notice_info' SUCCESS.`);
      if (data != undefined && data.length != 0) {
        const notify_info = data;
        console.log(notify_info);

        messages_place = $('#messages');
        var message_id_list = [];
        for (let i = 0; i < notify_info.length; i++) {
          const one = notify_info[i];

          let message_id = 'id_' + Number(new Date());
          // Добавим в списко на сокрытие id сообщений, кроме имеющих статус 'danger'
          if (one.kind != 'DUNGER') {
            message_id_list.push(message_id);
          }
          // console.debug(`Create message with message_id = ${message_id}`);

          let messageClass = '';
          let messageIconClass = '';
          switch (one.kind) {
            case 'INFO':
              messageClass = 'alert-info';
              messageIconClass = 'fas fa-info-circle';
              break;
            case 'SUCCESS':
              messageClass = 'alert-success';
              messageIconClass = 'far fa-thumbs-up';
              break;
            case 'WARNING':
              messageClass = 'alert-warning';
              messageIconClass = 'fas fa-exclamation';
              break;
            case 'DANGER':
              messageClass = 'alert-danger';
              messageIconClass = 'fas fa-exclamation-triangle';
              break;
            default:
              break;
          }

          messages_place.prepend($('<div/>')
            .addClass('alert')
            .css('display', 'none')
            .attr('id', message_id)
            .addClass(messageClass)
            .append($('<button/>')
              .addClass('close')
              .attr('type', 'button')
              .attr('data-dismiss', 'alert')
              // .append('&times;')
            )
            .append($('<strong/>')
              .append($('<i/>')
                .addClass(messageIconClass)
                .addClass('icon fa-lg text-body')
              )
            )
            .append(one.message)
          );
          // console.debug(`Show message with message_id = ${message_id}`);


          //  Теперь покажем это сообщение
          $(`#${message_id}`).show(duration = 500);
        }

        // Запустим с задержкой функцию сокрытия сообщений
        setTimeout(function () {
          console.info('*** setTimeout for hide_messages ***');
          hide_messages(message_id_list);
        }, 8000);
      }
      startCron();
    },
    error: function (d) {
      console.error(`ajax action 'get_notice_info' ERROR.`);
      console.debug(d);
    }
  });
}

// ------------------------------------------
function getCookie(name) {
  let cookieValue = null;
  let i = 0;
  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');
    for (i; i < cookies.length; i++) {
      let cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
var csrftoken = getCookie('csrftoken');

// ------------------------------------------
function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


// ***************************************************************************
(application = function () {
  console.info('=== application.js ===');

  // ------------------------------------------
  this.readyDocument = function () {
    let elements, i, mainMenu, pageName, shortElementName, shortPageName;
    console.info('*** readyDocument ***');
    // const newLocal = $('[data-tooltip="tooltip"]').tooltip({
    //   html: true
    // });

    $(document).on('click', '.confirm-delete', function () {
      return confirm('Удалить? Вы уверены?');
    });

    $(document).on('click', '.confirm-dont-save', function () {
      return confirm('Не сохранять? Вы уверены?');
    });

    $(document).on('click', '.confirm', function () {
      return confirm('Вы уверены?');
    });

    // Включим Popovers
    $('[data-toggle="popover"]').popover({
      html: true,
      placement: "auto",
      // trigger: "focus"
    });

    // Включим tooltip
    $('[data-toggle="tooltip"]').tooltip({
      html: true,
      placement: "auto",
    });

    // Обработка страниц по меню
    pageName = getPageName();
    switch (pageName) {
      case 'home-page':
        readyHome();
        break;
      case 'marts-page':
        readyMarts();
        break;
      case 'sources-page':
        readySources();
        break;
      case 'connects-page':
        readyConnects();
        break;
      case 'entities-page':
        readyEntities();
        break;
      case 'relations-page':
        readyRelations();
        break;
      case 'handbooks-page':
        readyHandbooks();
        break;
      case 'admin-page':
        readyAdmin();
        break;
      case 'notice-page':
        readyNotice();
        break;
      case 'edit-user-page':
        readyEditUser();
        break;
    }

    // Установка текущего элемента меню
    mainMenu = $('.side-menu');
    elements = $('.side-menu li');

    for (let i = 0; i < elements.length; i++) {
      const li = $(elements[i]);
      
      let liPageName=li.data('page-name');
      if(liPageName==pageName){
        li.addClass("current");
        // let childSvg = li.find("svg");
        // if(childSvg!=undefined){
        //   childSvg.addClass("fa-border");
        // }
      } else {
        li.removeClass("current");
        // let childSvg = li.find("svg");
        // if (childSvg != undefined) {
        //   childSvg.removeClass("fa-border");
        // }
      }

    }

    // ------------------------------------------
    $.ajaxSetup({
      crossDomain: false, // obviates need for sameOrigin test
      beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });

    cron();

  };

    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    $('body').on('mouseover', function () {
      $(this).tooltip();
    });

  // ------------------------------------------
  jQuery(document).ready(readyDocument);

}).call(this);