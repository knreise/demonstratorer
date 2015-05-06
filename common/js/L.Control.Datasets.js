/*global L:false, KR: false */

'use strict';

L.Control.Datasets = L.Control.Layers.extend({
    options: {
        collapsed: false
    },
    initialize: function (layers, options) {
        L.setOptions(this, options);

        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        var i;
        for (i in layers) {
            if (layers.hasOwnProperty(i)) {
                this._addLayer(layers[i], layers[i].options.name, true);
            }
        }
    },

    onAdd: function (map) {
        map.on('zoomend', this._zoomEnd, this);

        var container =  L.Control.Layers.prototype.onAdd.call(this, map);
        this._zoomEnd();
        return container;
    },

    _zoomEnd: function () {
        var i, input, obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._layers[input.layerId];
            if (obj.layer.options.minZoom) {
                if (this._map.getZoom() >= obj.layer.options.minZoom) {
                    input.disabled = false;
                    input.parentNode.className = '';
                } else {
                    input.disabled = true;
                    input.parentNode.className = 'disabled';
                }
            }
        }
    },

    _onInputClick: function () {
        var i, input, obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._layers[input.layerId];

            if (input.checked) {
                if (!this._map.hasLayer(obj.layer) && obj.layer.options.isStatic) {
                    this._map.addLayer(obj.layer);
                } else {
                    obj.layer.visible = true;
                    obj.layer.fire('setVisible');
                }

            } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                if (obj.layer.options.isStatic) {
                    this._map.removeLayer(obj.layer);
                } else {
                    obj.layer.visible = false;
                    obj.layer.resetGeoJSON();
                }
            }
        }

        this._handlingClick = false;

        this._refocusOnMap();
    },

    _addItem: function (obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
        } else {
            input = this._createRadioElement('leaflet-base-layers', checked);
        }

        input.layerId = L.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;

        label.appendChild(input);
        label.appendChild(name);

        var iconMarker = KR.Util.iconForDataset(obj.layer.options.dataset);
        if (iconMarker) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa fa-' + iconMarker;
            label.appendChild(icon);
        }

        var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        container.appendChild(label);

        return label;
    }
});

L.control.datasets = function (layers, options) {
    return new L.Control.Datasets(layers, options);
};