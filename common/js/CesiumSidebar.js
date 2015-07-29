/*global Cesium:false */
var KR = this.KR || {};

KR.CesiumSidebar = function (element, err, closeCallback, options) {
    'use strict';

    options = options || {
        footerTemplate: _.template($('#footer_template').html()),
        listElementTemplate: _.template($('#list_item_template').html()),
        markerTemplate: _.template($('#marker_template').html()),
        thumbnailTemplate: _.template($('#thumbnail_template').html())
    };

    var _parentContainer = $('<div id="sidebar"></div>');
    element.append(_parentContainer);


    var _top = $('<div class="top-menu"></div>');
    _parentContainer.append(_top);

    var _close = $('<a class="close pull-right">×</a>');
    _top.append(_close);

    var _topContainer = $('<span></span>');
    _top.append(_topContainer);

    var _contentContainer = $('<div class="sidebar-content"></div>');
    _parentContainer.append(_contentContainer);

    var sidebarContent = new KR.SidebarContent(_parentContainer, _contentContainer, _topContainer, options);

    var closeCb = closeCallback;

    element.addClass('knreise-sidebar');

    function _setContent(content) {
        _contentContainer.html('');
    }

    function mapProperties(properties) {
        return {
            properties: properties,
            template: properties.template
        };
    }

    function showFeature(properties) {
        sidebarContent.showFeature(mapProperties(properties));
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

    function showList(propertiesArray) {
        var features = _.map(propertiesArray, mapProperties);
        sidebarContent.showFeatures(features);
    }

    function show(properties) {

        element.show('slide', {direction: 'left'}, 100);
        if (properties.length === 1) {
            showFeature(properties[0]);
        } else {
            showList(properties);
        }
    }

    function _closeFunc() {
        element.hide('slide', {direction: 'left'}, 100);
        _setContent('');
        if (closeCb) {
            closeCb();
        }
    }

    _close.click(_closeFunc);

    return {
        show: show,
        addCloseCb: function (cb) {
            closeCb = cb;
        }
    };
};
