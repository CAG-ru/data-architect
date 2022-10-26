var _mart_id = '';
var _mart = [];
var _THE_ESSENCE_OF_DATA_EMERGENCE = [];
var _ACCESS_MODE = [];
var _REGULARITY_OF_DATA_SET_UPDATE = [];
var _license_handbook = [];
var _set_categories_handbook = [];
var _aggregation_level_handbook = [];
var _handbooks_and_classifiers_handbook = [];
var _tags_handbook = [];

var _ACCESS_MODE_TRANSLATE = {
    OPEN: 'открытый',
    AGREEMENT: 'продвинутый',
    LAW: 'оффлайн',
};

var _REGULARITY_OF_DATA_SET_UPDATE_TRANSLATE = {
    CONTINUOUSLY: 'Постоянно',
    DAILY: 'Ежедневно',
    QUARTERLY: 'Ежеквартально',
    CHANGED: 'по мере изменения',
    MONTHLY: 'Ежемесячно',
    ANNUALLY: 'Ежегодно',
    OTHER: 'Иное',
}
var _THE_ESSENCE_OF_DATA_EMERGENCE_TRANSLATE = {
    PRIMARY: "первичные", AGGREGATED: "агрегированные", PUBLISHED: "опубликованные"
}


function makeForm() {
    console.info('*** makeForm ***');

    if (_mart_id) {
        $.ajax({
            url: `/marts/get-by-id/${_mart_id}`,
            method: 'GET',
            success: function (data) {
                console.log(`ajax action 'get_handbook' SUCCESS.`);
                if (data.length != 0) {
                    _mart = data.mart;
                    _THE_ESSENCE_OF_DATA_EMERGENCE = data.THE_ESSENCE_OF_DATA_EMERGENCE || [];
                    _ACCESS_MODE = data.ACCESS_MODE || [];
                    _REGULARITY_OF_DATA_SET_UPDATE = data.REGULARITY_OF_DATA_SET_UPDATE || [];
                    _license_handbook = data.license_handbook || [];
                    _set_categories_handbook = data.set_categories_handbook || [];
                    _aggregation_level_handbook = data.aggregation_level_handbook || [];
                    _handbooks_and_classifiers_handbook = data.handbooks_and_classifiers_handbook || [];
                    _tags_handbook = data.tags_handbook || [];

                    _mart.mart_additional=_mart.mart_additional||{}
                    // Признак публикации
                    if (_mart.mart_info.is_published) {
                        $('#id_published').prop('checked');
                    }

                    // Дата публикации данных
                    if (_mart.mart_info.publication_date) {
                        $('#id_publication_date').val(_mart.mart_info.publication_date.toString().substr(0, 10));
                    }

                    // Для цитирования
                    $('#id_for_citations').val(_mart.mart_additional.for_citations);

                    // Внутренний идентификатор набора данных
                    $('#id_internal_data_set_identifier').val(_mart.mart_additional.internal_data_set_identifier);

                    // DOI - метка набора данных
                    $('#id_doi_tag').val(_mart.mart_additional.doi_tag);

                    // Cсылка на описание набора данных
                    $('#id_link_to_dataset_description').val(_mart.mart_additional.link_to_dataset_description);

                    // Краткое наименование набора данных
                    $('#id_short_description').val(_mart.mart_additional.short_description);

                    // Полное наименование набора данных
                    $('#id_full_description').val(_mart.mart_additional.full_description);

                    // Регулярность обновления набора данных
                    $('#id_regularity_of_data_set_update').empty();
                    for (let i = 0; i < _REGULARITY_OF_DATA_SET_UPDATE.length; i++) {
                        const element = _REGULARITY_OF_DATA_SET_UPDATE[i];

                        $('#id_regularity_of_data_set_update').append(opt = $('<option/>')
                            .text(_REGULARITY_OF_DATA_SET_UPDATE_TRANSLATE[element]).attr('value', element));
                        if (_mart.mart_additional.regularity_of_data_set_update == element) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Лицензия / условия использования
                    $('#id_licence').empty();
                    for (let i = 0; i < _license_handbook.length; i++) {
                        const element = _license_handbook[i];

                        $('#id_licence').append(opt = $('<option/>').text(element.name).attr('value', element.id));
                        if (_mart.mart_additional.license == element.id) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Режим доступа
                    $('#id_access_mode').empty();
                    for (let i = 0; i < _ACCESS_MODE.length; i++) {
                        const element = _ACCESS_MODE[i];

                        $('#id_access_mode').append(opt = $('<option/>')
                            .text(_ACCESS_MODE_TRANSLATE[element]).attr('value', element));
                        if (_mart.mart_additional.access_mode == element) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // API - url
                    $('#id_api_url').val(_mart.mart_additional.api_url);

                    // Приоритет
                    $('#id_priority').val(_mart.mart_additional.priority);

                    // Категории набора
                    $('#id_set_categories').empty();
                    for (let i = 0; i < _set_categories_handbook.length; i++) {
                        const element = _set_categories_handbook[i];

                        $('#id_set_categories').append(opt = $('<option/>').text(element.name).attr('value', element.id));
                        if (_mart.mart_additional.set_categories == element.id) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Уровень агрегации
                    $('#id_aggregation_level').empty();
                    for (let i = 0; i < _aggregation_level_handbook.length; i++) {
                        const element = _aggregation_level_handbook[i];

                        $('#id_aggregation_level').append(opt = $('<option/>').text(element.name).attr('value', element.id));
                        if (_mart.mart_additional.aggregation_level == element.id) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Справочники и классификаторы
                    $('#id_handbooks_and_classifiers').empty();
                    for (let i = 0; i < _handbooks_and_classifiers_handbook.length; i++) {
                        const element = _handbooks_and_classifiers_handbook[i];

                        $('#id_handbooks_and_classifiers').append(opt = $('<option/>').text(element.name).attr('value', element.id));
                        if (_mart.mart_additional.handbooks_and_classifiers == element.id) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Сущность возникновения данных
                    $('#id_the_essence_of_data_emergence').empty();
                    for (let i = 0; i < _THE_ESSENCE_OF_DATA_EMERGENCE.length; i++) {
                        const element = _THE_ESSENCE_OF_DATA_EMERGENCE[i];

                        $('#id_the_essence_of_data_emergence')
                            .append(opt = $('<option/>')
                            .text(_THE_ESSENCE_OF_DATA_EMERGENCE_TRANSLATE[element]).attr('value', element));
                        if (_mart.mart_additional.the_essence_of_data_emergence == element) {
                            opt.attr('selected', 'selected');
                        }
                    }

                    // Тэги
                    $('#id_tags').empty();
                    for (let i = 0; i < _tags_handbook.length; i++) {
                        const element = _tags_handbook[i];

                        $('#id_tags').append(opt = $('<option/>').text(element.name).attr('value', element.id));
                        for (let k = 0; k < _mart.mart_additional.tags.length; k++) {
                            const one_tag = _mart.mart_additional.tags[k];

                            if (one_tag == element.id) {
                                opt.attr('selected', 'selected');
                            }
                        }
                    }


                }
            },
            error: function (request, status, error) {
                console.error(`ajax action 'get_handbook' ERROR.`);
                console.debug(request);
                console.debug(status);
                console.debug(error);
            }
        });
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
    $(document).ready(function () {
        console.info('*** readyMarts - is ready ***');

        _mart_id = $('#mart_id').attr('data-mart_id');
        makeForm();

    });

    $('#id_published').on('change', function () {
        console.info('---- id_published on change ---');

        if ($(this).prop('checked')) {
            var current_date = new Date();
            $('#id_publication_date').val(current_date.toISOString().substr(0, 10));
        } else {
            $('#id_publication_date').val('');
        }
    });

    $('#id_button_save').on('click', function (event) {
        console.info('---- id_button_save on click ---');

        event.stopPropagation();

        // Признак публикации
        var published = $('#id_published').val();
        // Дата публикации данных
        var publication_date = $('#id_publication_date').val();
        // Для цитирования
        var for_citations = $('#id_for_citations').val();
        // Внутренний идентификатор набора данных
        var internal_data_set_identifier = $('#id_internal_data_set_identifier').val();
        // DOI - метка набора данных)
        var doi_tag = $('#id_doi_tag').val();
        // Cсылка на описание набора данных
        var link_to_dataset_description = $('#id_link_to_dataset_description').val();
        // Краткое наименование набора данных
        var short_description = $('#id_short_description').val();
        // Полное наименование набора данных
        var full_description = $('#id_full_description').val();
        // Регулярность обновления набора данных
        var regularity_of_data_set_update = $('#id_regularity_of_data_set_update').val();
        // Лицензия / условия использования
        var licence = $('#id_licence').val();
        // Режим доступа
        var access_mode = $('#id_access_mode').val();
        // API - url
        var api_url = $('#id_api_url').val();
        // Приоритет
        var priority = $('#id_priority').val();
        // Категории набора
        var set_categories = $('#id_set_categories').val();
        // Уровень агрегации
        var aggregation_level = $('#id_aggregation_level').val();
        // Справочники и классификаторы
        var handbooks_and_classifiers = $('#id_handbooks_and_classifiers').val();
        // Сущность возникновения данных
        var the_essence_of_data_emergence = $('#id_the_essence_of_data_emergence').val();
        // Тэги
        var selected_tags = $('#id_tags').select2("val");

        if (_mart_id) {
            $.ajax({
                url: `/marts/save-additional/${_mart_id}`,
                method: 'POST',
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    'action': 'save_mart_addition',
                    'published': published,
                    'publication_date': publication_date,
                    'for_citations': for_citations,
                    'internal_data_set_identifier': internal_data_set_identifier,
                    'doi_tag': doi_tag,
                    'link_to_dataset_description': link_to_dataset_description,
                    'short_description': short_description,
                    'full_description': full_description,
                    'regularity_of_data_set_update': regularity_of_data_set_update,
                    'licence': licence,
                    'access_mode': access_mode,
                    'api_url': api_url,
                    'priority': priority,
                    'set_categories': set_categories,
                    'aggregation_level': aggregation_level,
                    'handbooks_and_classifiers': handbooks_and_classifiers,
                    'the_essence_of_data_emergence': the_essence_of_data_emergence,
                    'tags': selected_tags,
                }),
                success: function () {
                    console.log(`ajax action 'save_mart_addition' SUCCESS.`);
                    window.location.href = '/marts/';
                },
                error: function (request, status, error) {
                    if(request.status===200){
                        window.location.href = '/marts/';
                        return;
                    }
                    console.error(`ajax action 'save_mart_addition' ERROR.`);
                    console.debug(request);
                    console.debug(status);
                    console.debug(error);
                }
            });
        }
    });

}).call(this);