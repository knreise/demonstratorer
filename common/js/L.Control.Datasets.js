/*global L:false, KR: false */

'use strict';

L.Control.Datasets = L.Control.extend({
    options: {
        collapsed: false
    },

    initialize: function (layers, options) {
        L.setOptions(this, options);
        this._datasets = {};
        this._handlingClick = false;

        var i;
        for (i in layers) {
            if (layers.hasOwnProperty(i)) {
                this._addLayer(layers[i]);
            }
        }
    },

    _addLayer: function (layer) {
        var i;
        var dataset = layer.options.dataset;

        if (dataset.datasets) {
            for (i = 0; i < dataset.datasets.length; i++) {
                this._addDataset(dataset.datasets[i], layer, true);
            }
        } else {
            this._addDataset(dataset, layer, false);
        }
    },

    _addDataset: function (dataset, layer, multi)  {
        var id = L.stamp(dataset);

        this._datasets[id] = {
            layer: layer,
            dataset: dataset,
            multi: multi
        };
    },

    onAdd: function (map) {
        this._initLayout();
        this._update();

        /*
        map
            .on('layeradd', this._onLayerChange, this)
            .on('layerremove', this._onLayerChange, this);
        */
        return this._container;
    },

    _update: function () {
        console.log("_update");
        if (!this._container) {
            return;
        }

        this._overlaysList.innerHTML = '';
        var i, obj;
        for (i in this._datasets) {
            obj = this._datasets[i];
            this._addItem(obj);
        }
    },

    _toggleStaticDataset: function (visible, obj) {
        if (obj.multi) {
            if (visible && !obj.dataset.visible) {
                console.log("show", obj.dataset);
                obj.dataset.visible = true;
            } else if (!visible && obj.dataset.visible) {
                var id = KR.Util.stamp(obj.dataset);
                console.log("hide", obj.dataset);

                obj.layer.eachLayer(function (layer) {
                    console.log(layer.feature.properties.datasetID === id, layer.feature.properties.datasetID, id);
                })

                obj.dataset.visible = false;
            }

        } else {
            if (visible && !this._map.hasLayer(obj.layer)) {
                this._map.addLayer(obj.layer);

            } else if (!visible && this._map.hasLayer(obj.layer)) {
                this._map.removeLayer(obj.layer);
            }
        }
    },

    _onInputClick: function (e) {
        var i, input, obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._datasets[input.datasetId];
            if (obj.dataset.isStatic) {
                this._toggleStaticDataset(input.checked, obj);
            } else {
                console.log("non-static!");
            }
        }

        this._handlingClick = false;
    },

    _addItem: function (obj) {
        var label = document.createElement('label');
        obj.dataset.visible = true;

        var input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = obj.dataset.visible;

        input.datasetId = L.stamp(obj.dataset);
        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.dataset.name;

        label.appendChild(input);
        label.appendChild(name);

        var iconMarker = KR.Util.iconForDataset(datasetName);
        if (iconMarker) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa fa-' + iconMarker;
            label.appendChild(icon);
        }
        var datasetName = obj.dataset;
        
        this._overlaysList.appendChild(label);

        return label;
    },

    _initLayout: function () {
        var className = 'leaflet-control-layers',
            container = this._container = L.DomUtil.create('div', className);

        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        if (!L.Browser.touch) {
            L.DomEvent
                .disableClickPropagation(container)
                .disableScrollPropagation(container);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }

        var form = this._form = L.DomUtil.create('form', className + '-list');

        if (this.options.collapsed) {
            if (!L.Browser.android) {
                L.DomEvent
                    .on(container, 'mouseover', this._expand, this)
                    .on(container, 'mouseout', this._collapse, this);
            }
            var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
            link.href = '#';
            link.title = 'Layers';

            if (L.Browser.touch) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', this._expand, this);
            }
            else {
                L.DomEvent.on(link, 'focus', this._expand, this);
            }
            //Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
            L.DomEvent.on(form, 'click', function () {
                setTimeout(L.bind(this._onInputClick, this), 0);
            }, this);

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility
        } else {
            this._expand();
        }

        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

        container.appendChild(form);
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    },

    _collapse: function () {
        this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    }

});

L.control.datasets = function (layers, options) {
    return new L.Control.Datasets(layers, options);
};