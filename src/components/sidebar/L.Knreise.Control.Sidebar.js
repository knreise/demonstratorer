import L from 'leaflet';
import $ from 'jquery';
import 'leaflet-sidebar';
import 'leaflet-sidebar/src/L.Control.Sidebar.css';

import {UrlFunctions} from '../../util';
import SidebarContent from './SidebarContent';

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
        var content = L.DomUtil.get(placeholder);
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
                this._map.fire('sidebarClosed');
            }

        }, this);
        this.sidebar = new SidebarContent(this._container, this._contentContainer, this._top, this.options, this._map);
    },

    addTo: function (map) {
        this.sidebar.setMap(map);
        return L.Control.Sidebar.prototype.addTo.apply(this, arguments);
    },

    showFeature: function (feature, dataset, callbacks, index, numFeatures) {
        this.show();
        this.sidebar.showFeature2(feature, callbacks, index, numFeatures);
        if (UrlFunctions) {
            if (feature.id && this.options.featureHash) {
                UrlFunctions.setFeatureHash(feature.id);
            }
        }
    },

    showFeatures: function (features, dataset, forceList) {
        this.show();
        this.sidebar.showFeatures2(features, dataset.noListThreshold, forceList);
    },

    _removeContent: function () {
        $(this.getContainer()).html('');
        if (UrlFunctions) {
            UrlFunctions.setFeatureHash();
        }
    }

});

L.Knreise.Control.sidebar = function (placeholder, options) {
    return new L.Knreise.Control.Sidebar(placeholder, options);
};