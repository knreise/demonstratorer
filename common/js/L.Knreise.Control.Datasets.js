/*global L:false, KR: false */

'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Control = L.Knreise.Control || {};

L.Control.Datasets = L.Control.extend({

    initialize: function (layers, options) {
        L.setOptions(this, options);
        this._datasets = {};
        this._handlingClick = false;
        this.expanded = false;
        this.numLoading = 0;
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
            if (dataset.grouped) {
                this._addDataset(dataset, layer, false, true);
            } else {
                for (i = 0; i < dataset.datasets.length; i++) {
                    this._addDataset(dataset.datasets[i], layer, true);
                }
            }
        } else {
            this._addDataset(dataset, layer, false);
        }
    },

    _addDataset: function (dataset, layer, multi, grouped) {
        if (layer.isLoading) {
            this.numLoading += 1;
            this._checkSpinner();
        }

        var id = L.stamp(dataset);

        layer.on('dataloadstart', function () {this._loadStart(id);}, this);
        layer.on('dataloadend', function () {this._loadEnd(id);}, this);

        layer.on('changeEnabled', this._enabledChanged, this);
        this._datasets[id] = {
            layer: layer,
            dataset: dataset,
            multi: multi,
            grouped: grouped,
            id: id
        };
    },

    _loadStart: function (id) {
        this.numLoading += 1;
        this._checkSpinner();
        var element = document.getElementById('dataset_chooser_icon_' + id);
        element.className = element.className.replace(' fa-square', ' fa-spinner fa-pulse');
    },

    _loadEnd: function (id) {
        this.numLoading -= 1;
        this._checkSpinner();
        var element = document.getElementById('dataset_chooser_icon_' + id);
        element.className = element.className.replace(' fa-spinner fa-pulse', ' fa-square');
    },

    _checkSpinner: function () {
        if (!this._btnIcon) {
            return;
        }
        if (this.numLoading === 0) {
            this._btnIcon.className = this._btnIcon.className.replace(' fa-spinner fa-pulse', ' fa-bars');
        } else {
            this._btnIcon.className = this._btnIcon.className.replace(' fa-bars', ' fa-spinner fa-pulse');
        }
    },

    onAdd: function (map) {
        this._initLayout();
        this._update();
        return this._container;
    },

    _enabledChanged: function () {
        this._update();
    },

    _update: function () {
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
            //TODO: Move
            if (visible && !obj.dataset.visible) {
                obj.layer.addLayers(obj.dataset.geoJSONLayer.getLayers());
                obj.dataset.visible = true;
            } else if (!visible && obj.dataset.visible) {
                var id = KR.Util.stamp(obj.dataset);
                obj.layer.eachLayer(function (layer) {
                    if (layer.feature.properties.datasetID === id) {
                        obj.layer.removeLayer(layer);
                    }
                });
                obj.dataset.visible = false;
            }
        } else {
            obj.dataset.visible = visible;
            if (visible && !this._map.hasLayer(obj.layer)) {
                this._map.addLayer(obj.layer);
            } else if (!visible && this._map.hasLayer(obj.layer)) {
                this._map.removeLayer(obj.layer);
            } else if (obj.dataset.notLoaded) {
                obj.dataset.notLoaded = false;
                obj.layer.fire('show');
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
            obj = this._datasets[input.datasetId];

            if (obj.dataset.isStatic) {
                this._toggleStaticDataset(input.checked, obj);
            } else {
                if (input.checked !== obj.dataset.visible) {
                    obj.dataset.visible = input.checked;
                    if (input.checked) {
                        obj.layer.fire('show');
                    } else {
                        obj.layer.fire('hide');
                    }
                }
            }
        }

        this._handlingClick = false;
    },

    _addItem: function (obj) {
        var label = document.createElement('label');
        if (_.isUndefined(obj.dataset.visible)) {
            obj.dataset.visible = true;
        }

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

        var datasetName;
        if (obj.grouped) {
            datasetName = obj.dataset.name;
        } else {
             datasetName = obj.dataset.dataset.dataset;
        }

        var datasetId;
        if (obj.dataset.cluster && obj.dataset.grouped) {
            datasetId = obj.dataset.datasets[0].extras.datasetId;
        } else {
            datasetId = obj.dataset.extras.datasetId;
        }


        var icon = document.createElement('i');
        icon.id = 'dataset_chooser_icon_' + obj.id;
        icon.className = 'layericon fa fa-square';
        if (obj.layer.isLoading) {
            icon.className = 'layericon fa fa-spinner fa-pulse';
        }

        icon.style.color = KR.Style.colorForFeature({properties: {datasetId: datasetId}}, true);
        label.appendChild(icon);


        this._overlaysList.appendChild(label);

        if (!obj.layer.enabled) {
            input.disabled = true;
            label.className = 'disabled';
        }

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

        this._map.on('click', this._collapse, this);
        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

        this._closeDiv = L.DomUtil.create('div', 'clearfix');
        var closeBtn = L.DomUtil.create('button', 'btn btn-default pull-right', this._closeDiv);
        closeBtn.title = 'Kartlag';
        L.DomEvent.on(closeBtn, 'click', function () {
            this._toggle();
        }, this);
        if (this.numLoading > 0) {
            this._btnIcon = L.DomUtil.create('i', 'fa fa-spinner fa-pulse', closeBtn);
        } else {
            this._btnIcon = L.DomUtil.create('i', 'fa fa-bars', closeBtn);
        }

        container.appendChild(this._closeDiv);
        container.appendChild(form);
    },

    _toggle: function () {
        if (this.expanded) {
            this._collapse();
        } else {
            this._expand();
        }
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
        this.expanded = true;
    },

    _collapse: function () {
        this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
        this.expanded = false;
    }

});

L.control.datasets = function (layers, options) {
    return new L.Control.Datasets(layers, options);
};