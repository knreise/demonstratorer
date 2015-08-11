'use strict';

var ResponseForm = function (div, baseData) {
    var COL_NAMES = {
        comment: 'entry.868210343',
        email: 'entry.1581354915',
        item_id: 'entry.819887708',
        url: 'entry.795495135',
        provider: 'entry.2062104757'
    };

    function _submitForm() {
        var data = _.extend({}, baseData, {
            email: div.find('#form_email').val(),
            message: div.find('#form_message').text()
        });
        console.log(data);
    }

    var template = $('#response_form_template').html();
    console.log(template)
    div.append(template);
    div.find('form').on('submit', _submitForm);
};


/*
function postToForm(data, callback) {


    var gData = _.reduce(data, function(acc, value, key) {
      acc[COL_NAMES[key]] = value;
      return acc;
    }, {});

    var url = 'https://docs.google.com/forms/d/19mND_7aFPj2ocUEJV9J2I6bK0RlVkx7IcKJb4pMNo7I/formResponse';
    $.ajax({
        url: url,
        data: gData,
        type: 'POST',
        dataType: 'xml',
        success: callback,
        error: callback
    });
}
*/