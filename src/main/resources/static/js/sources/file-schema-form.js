/*jshint esversion: 6 */

(application = function () {
  console.info('=== file-schema-form.js ===');

  $('button.add').click(function () {
    console.info('---- add click ---');
    $this = $(this);

    $form_group = $this.parents(".form-group")

    $form_row = $form_group.children('.first_row').clone()
    $form_row.removeClass('first_row')
    $form_row.find('button.remove').prop("disabled", false)
    $form_row.find('input:text').val('')
    $form_row.appendTo($form_group)
  });

  $('.form-group').on('click', '.remove', function () {
    console.info('---- remove click ---');
    $this = $(this);
    $this.parents(".form-row").remove()
  });

  $('#modal_file_schema_save').click(function () {
    console.info('---- save click ---');
    const $file_type = $('#id_file_type').val();

    if ($file_type === 'EXCEL') {
        attributes = {};
        attributes.attrs = get_attrs_list($('#attr_list'));
        attributes.columns = get_attrs_list($('#columns'));
        attributes.start_string_pattern = get_attrs_list($('#start_string_pattern'));
        attributes.types = get_attrs_list($('#types'));
        attributes.count_columns_AB = get_attrs_list($('#count_columns_AB'));

        file_schema = {};
        file_schema.file_schema_id = $('#file_schema_id').val();
        file_schema.name = $('#common #name').val();
        file_schema.description = $('#common #description').val();
        file_schema.file_type = $file_type;
        file_schema.attributes = attributes;

        $.ajax({
            url: `${location.origin + '/sources/file-schema/'}`,
            method: 'POST',
            data: {
              "action": "save_new_file_schema",
              "file_schema": JSON.stringify(file_schema)
            },
            content_type: 'application/json',
            success: function (data) {
                console.log('success added');

                if (typeof file_schema.file_schema_id === 'undefined') {
                    $('#id_file_schema').append($('<option>', {
                        value: data,
                        text: file_schema.name
                    }));
                }

                file_schema_form = $('#modal_add_file_schema').detach()
            },

        });
    } else {

        file_schema = $("form").serializeArray();
        file_schema.push({'name': 'action', 'value': 'save_new_xml_schema'});
        file_schema.push({'name': 'name', 'value': $('#common #name').val()});
        file_schema.push({'name': 'description', 'value': $('#common #description').val()});

        $.ajax({
            url: `${location.origin + '/sources/file-schema/'}`,
            method: 'POST',
            data: file_schema,
            content_type: 'application/json',
            success: function (data) {
                console.log('success added');

                if (typeof file_schema.file_schema_id === 'undefined') {
                    $('#id_file_schema').append($('<option>', {
                        value: data,
                        text: file_schema.name
                    }));
                }

                file_schema_form = $('#modal_add_file_schema').detach()
            },

        });
    }
  });

  $('#modal_file_schema_close').click(function () {
    console.info('---- close click ---');
    file_schema = $('#modal_add_file_schema').detach()
  });

  $('#modal_file_schema_delete').click(function () {
    console.info('---- delete click ---');
    file_schema_selector = $('#id_file_schema')
    file_schema_id = file_schema_selector.val()

    $.ajax({
        url: `${location.origin + '/sources/file-schema/'}`,
        method: 'POST',
        data: {
          "action": "file_schema_delete",
          "file_schema_id": file_schema_id
        },
        success: function (data, textStatus, xhr) {
            $(file_schema_selector).find('option[value='+file_schema_id+']').remove();
            file_schema = $('#modal_add_file_schema').detach()
            console.log(xhr.status)
        }
    });

  });

}).call(this);


function get_attrs_list(form_attr_list) {
    attrs_list = [];

    form_attr_list.children('.form-row').each(function () {
        attrs_row = {};

        $(this).find('input').each(function () {
            attrs_row[$(this).attr("placeholder")] = $(this).val();
        });
        $(this).find('select').each(function () {
            attrs_row[$(this).attr("id")] = $(this).find(":selected").text();
        });

        attrs_list.push(attrs_row);
    });

    return attrs_list;
}
