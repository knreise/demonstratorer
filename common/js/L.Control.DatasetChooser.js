/*global L: false */

'use strict';

L.Control.DatasetChooser = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {

        this._container = L.DomUtil.create('div', 'leaflet-control-dataset');
        this._map = map;
        this._select = this._createSelect();
        var key;
        for (key in this.options.datasets) {
            if (this.options.datasets.hasOwnProperty(key)) {
                this._createOption(key);
            }
        }
        return this._container;
    },

    _createSelect: function () {
        var label = L.DomUtil.create('label', '', this._container);
        label.innerHTML = 'Datasett:';
        var select = L.DomUtil.create('select', 'form-control', this._container);
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(select, 'change', this._datasetChanged, this)
            .on(select, 'click', stop)
            .on(select, 'mousedown', stop);
        return select;
    },

    _createOption: function (key) {
        var value = this.options.datasets[key];
        var option = L.DomUtil.create('option', '', this._select);
        option.innerHTML = value;
        option.value = key;
        if (key === this.options.initialDataset) {
            option.selected = true;
        }
    },

    _datasetChanged: function () {
        var selected = this._select.options[this._select.selectedIndex].value;
        this.options.datasetSelected(selected);
    }
});

L.control.datasetChooser = function (options) {
    return new L.Control.DatasetChooser(options);
};