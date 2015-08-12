'use strict';
var KR = this.KR || {};
KR.ResponseForm = function (div, baseData) {
    var COL_NAMES = {
        message: 'entry.868210343',
        email: 'entry.1581354915',
        id: 'entry.819887708',
        url: 'entry.795495135',
        provider: 'entry.2062104757'
    };

    function _postToForm(data, callback) {
        var gData = _.reduce(data, function (acc, value, key) {
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

    function _showSuccess(provider) {
        div.find('form').addClass('hidden');
        div.find('#form-success').removeClass('hidden').find('.media-body').text(
            'Din melding er sendt til ' + provider + '. De vil ta kontakt hvis' +
                ' de har behov for ytterligere informasjon'
        );
    }

    function _submitForm(e) {
        e.preventDefault();
        var email = div.find('#form_email').val();
        var message = div.find('#form_message').val();

        if (email === '' || message === '') {
            return false;
        }

        var data = _.extend({}, baseData, {
            email: email,
            message: message
        });
        _postToForm(data, function () {
            _showSuccess(data.provider);
        });
        return false;
    }

    function _resetForm() {
        div.find('#form_email').val('');
        div.find('#form_message').val('');
        div.find('#form-success').addClass('hidden');
        div.find('form').addClass('hidden');
        div.find('.show-more').removeClass('hidden');
    }

    var template = $('#response_form_template').html();
    div.append(template);
    div.find('form').on('submit', _submitForm);
    div.find('.show-more').click(function () {
        div.find('.show-more').addClass('hidden');
        div.find('form').removeClass('hidden');
    });
    div.find('.close ').click(_resetForm);
};
