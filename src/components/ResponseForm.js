import * as _ from 'underscore';
import $ from 'jquery';

import {getTemplate} from '../util';

export default function ResponseForm(div, baseData) {

    var COL_NAMES = {
        message: 'entry.126368279',
        email: 'entry.748218122',
        id: 'entry.2043404140',
        url: 'entry.243673559',
        provider: 'entry.826324496'
    };
    var FORM_URL = 'https://docs.google.com/forms/d/1ah66lattC8it7OTIM6de20NSNkBeiQ0vabpsHSaPU7s/formResponse';

    function _postToForm(data, callback) {
        var gData = _.reduce(data, function (acc, value, key) {
            acc[COL_NAMES[key]] = value;
            return acc;
        }, {});


        $.ajax({
            url: FORM_URL,
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

    var template = getTemplate('response_form_template');
    div.append(template);
    div.find('form').on('submit', _submitForm);
    div.find('.show-more').click(function () {
        div.find('.show-more').addClass('hidden');
        div.find('form').removeClass('hidden');
    });
    div.find('.close ').click(_resetForm);
};