var ResponseForm = function (div, id, url) {
    var COL_NAMES = {
        comment: 'entry.868210343',
        email: 'entry.1581354915',
        item_id: 'entry.819887708',
        url: 'entry.795495135',
        provider: 'entry.2062104757'
    };

    var template = $('response_form_template');
    div.append(template):
    div.on('click', _submitForm




}



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
