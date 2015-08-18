/*global L:false, KR: false, audiojs:false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Control = L.Knreise.Control || {};

/*
    A Leaflet wrapper for displaying sidebar data.
*/
L.Knreise.Control.Sidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        options = options || {};
        options.autoPan = false;
        L.setOptions(this, options);

        // Find content container
        var content =  L.DomUtil.get(placeholder);
        L.DomEvent.on(content, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
        });
        // Remove the content container from its original parent
        content.parentNode.removeChild(content);


        var top = L.DomUtil.create('div', 'top-menu', content);
        this._contentContainer = L.DomUtil.create('div', 'sidebar-content', content);

        this.on('hide', this._removeContent, this);

        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container = L.DomUtil.create('div', l + 'sidebar knreise-sidebar ' + this.options.position);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = this._closeButton = L.DomUtil.create('a', 'close pull-right', top);
            close.innerHTML = '&times;';
        }
        this._top = L.DomUtil.create('span', '', top);

        // Style and attach content container
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        this.on('hide', function () {
            if (this._map) {
                this._map.fire('layerSelected');
                this._map.fire('layerDeselect');
            }

        }, this);
        this.sidebar = new KR.SidebarContent(this._container, this._contentContainer, this._top, this.options, this._map);
    },

    addTo: function (map) {
        this.sidebar.setMap(map);
        return L.Control.Sidebar.prototype.addTo.apply(this, arguments);
    },

    showFeature: function (feature, template, getData, callbacks, index, numFeatures) {

        this.show();
        this.sidebar.showFeature(feature, template, getData, callbacks, index, numFeatures);


        if (KR.UrlFunctions) {
            var div = $('<div></div>');
            var params = {
                id: feature.id,
                url: KR.UrlFunctions.getFeatureLink(feature),
                provider: feature.properties.provider
            };
            if (feature.properties.feedbackForm) {
                $(this._contentContainer).append(div);
                KR.ResponseForm(div, params);
            }

            if (feature.id && this.options.featureHash) {
                KR.UrlFunctions.setFeatureHash(feature.id);
            }
        }
    },

    showFeatures: function (features, template, getData, noListThreshold, forceList) {
        this.show();
        this.sidebar.showFeatures(features, template, getData, noListThreshold, forceList);
    },

    _removeContent: function () {
        $(this.getContainer()).html('');
        if (KR.UrlFunctions) {
            KR.UrlFunctions.setFeatureHash();
        }
    }

});

L.Knreise.Control.sidebar = function (placeholder, options) {
    return new L.Knreise.Control.Sidebar(placeholder, options);
};
