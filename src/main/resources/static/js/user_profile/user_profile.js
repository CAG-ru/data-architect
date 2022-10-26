/*jshint esversion: 6 */
$(document).ready(function () {
  $("#menubar_position").on("click", function () {
    let menubar_position = $(this).hasClass("menu-pin");
    setMenubarPosition(menubar_position);
  });
});

// Функция сохраняет выбранное пользователем положение меню слева (свернуто или раскрыто по -умолчанию)
function setMenubarPosition(menubar_position) {
  $.ajax({
    url: '/utils/ui/?action=set_menubar_position',
    method: 'POST',
    data: {
      'menubar_position': menubar_position,
    },
    dataType: 'json',
  });
}
