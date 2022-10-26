/*jshint esversion: 6 */
// -------------------------------------------
// HTML-строка для спинера
function getSpinner() {
    var spinner = $('<div/>')
        .addClass('center')
        .append($('<i/>')
            .addClass('fa fa-sync fa-pulse fa-2x text-primary')
        );
    return spinner;
}

// -------------------------------------------
// Определяет позицию DOM элемета
function getPositionODOMElement(elem) {
    var top = 0,
        left = 0;
    while (elem) {
        top = top + parseInt(elem.offsetTop);
        left = left + parseInt(elem.offsetLeft);
        elem = elem.offsetParent;
    }
    return {
        top: top,
        left: left
    };
}