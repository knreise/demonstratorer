/*global Cesium:false */
var KR = this.KR || {};

KR.CesiumSidebar = function (element, templates, closeCallback) {
    'use strict';
    var closeCb = closeCallback;
    console.log(element)
    element.addClass('knreise-sidebar');

    function _setContent(content) {
        element.find('.cesium-sidebar-body').html(content);
    }

    function showFeature(feature) {
        _setContent(feature.template(feature));
    }

    function _createListElement(feature) {
        var li = $('<a href="#" class="list-group-item">' + feature.title + '</a>');
        li.on('click', function (e) {
            e.preventDefault();
            showFeature(feature);
            return false;
        });
        return li;
    }

    function showList(features) {
        var list = $('<div class="list-group"></ul>');
        var elements = _.map(_.compact(features), _createListElement);
        list.append(elements);
        _setContent(list);
    }

    function show(properties) {

        element.show('slide', {direction: 'left'}, 100);
        if (properties.length === 1) {
            showFeature(properties[0]);
        } else {
            showList(properties);
        }
    }

    function _close() {
        element.hide('slide', {direction: 'left'}, 100);
        _setContent('');
        if (closeCb) {
            closeCb();
        }
    }

    element.find('.close-sidebar').on('click', function () {
        _close();
    });

    return {
        show: show,
        addCloseCb: function (cb) {
            closeCb = cb;
        }
    };
};
