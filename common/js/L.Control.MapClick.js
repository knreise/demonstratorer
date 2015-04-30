/*global L:false*/

'use strict';

L.Control.MapClick = L.Control.extend({

    initialize: function (layer, api, initialDataset) {
        this._layer = layer;
        this._api = api;
        this._dataset = initialDataset;
    },

    _display: function (geoJson) {
        if (this._layer) {
            this._layer.clearLayers();
        }
        this._layer.addGeoJSON(geoJson);
    },

    _getData: function () {
        var dataset = this._dataset;
        this._api.getWithin(dataset, this._pos, 5000, _.bind(this._display, this));
    },

    _mapClicked: function (e) {
        this._pos = e.latlng;
        this._getData();
    },

    onAdd: function (map) {
        this._map = map;
        //Leaflet chokes if we don't return a DOM-element
        return L.DomUtil.create('div', '');
    },

    setDataset: function (newDataset) {
        this._dataset = newDataset;
        if (this._pos) {
            this._getData(this._pos, this._dataset);
        }
    },


    on: function () {
        if (this._map) {
            this._layer.addTo(this._map);
            this._map.on('click', this._mapClicked, this);
        }
    },

    off: function () {
        if (this._map) {
            this._map.off('click', this._mapClicked, this);
            this._map.removeLayer(this._layer);
            this._layer.clearLayers();
        }
    }
});

L.control.mapClick = function (layer, api, initialDataset) {
    return new L.Control.MapClick(layer, api, initialDataset);
};
