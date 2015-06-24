/*global Cesium:false */
var KR = this.KR || {};

KR.CesiumSidebar = function (element, templates) {
    'use strict';

    function show(properties) {
        element.show('slide', {direction: 'left'}, 100);
        if (properties.dataset === 'Wikipedia') {
            element.find('.cesium-sidebar-body').html($(templates.wikipediaTemplate(properties)));
        } else {
            element.find('.cesium-sidebar-body').html($(templates.arcKulturminneTemplate(properties)));
        }
    }

    function _close() {
        element.hide('slide', {direction: 'left'}, 100);
    }

    element.find('.close-sidebar').on('click', function () {
        _close();
    });

    return {
        show: show
    };
};
