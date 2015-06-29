/*global L:false, KR: false */


(function () {
    'use strict';

    L.Knreise = L.Knreise || {};
    L.Knreise.Control = L.Knreise.Control || {};

    var Label = function (dataset, layer) {
        var enabled = layer.enabled;
        var label, _icon;

        function _getDatasetId() {
            if (dataset.grouped) {
                return dataset.datasets[0].extras.datasetId;
            }
            return dataset.extras.datasetId;
        }

        function _getIcon() {
            var icon = document.createElement('i');
            icon.className = 'layericon fa';
            if (dataset.visible) {
                icon.className += ' fa-check-square-o';
            } else {
                icon.className += ' fa-square-o';
            }

            if (layer.isLoading) {
                icon.className = 'layericon fa fa-spinner fa-pulse';
            }

            if (layer.enabled) {
                icon.style.color = KR.Style.colorForFeature({
                    properties: {datasetId: _getDatasetId()}
                }, true, true);
            } else {
                icon.style.color = '#ddd';
            }
            return icon;
        }

        function _redrawIcon() {
            var newIcon = _getIcon();
            label.replaceChild(newIcon, _icon);
            _icon = newIcon;
        }

        function _toggle() {
            dataset.visible = !dataset.visible;
            _redrawIcon();
            if (dataset.visible) {
                layer.fire('show');
            } else {
                layer.fire('hide');
            }
        }

        function _createLabel() {
            var _label = document.createElement('label');
            if (_.isUndefined(dataset.visible)) {
                dataset.visible = true;
            }

            var name = document.createElement('span');
            name.innerHTML = ' ' + dataset.name;

            _icon = _getIcon();
            _label.appendChild(_icon);
            _label.appendChild(name);

            if (!layer.enabled) {
                _label.className = 'disabled';
            }

            L.DomEvent.on(_label, 'click', function () {
                var canToggle = layer.enabled && !layer.isLoading;
                if (canToggle) {
                    _toggle();
                }
            });
            return _label;
        }

        function _enabledChanged() {
            if (layer.enabled === enabled) {
                return;
            }

            enabled = layer.enabled;

            _redrawIcon();
            if (enabled) {
                label.className = label.className.replace('disabled', '');
            } else {
                label.className += 'disabled';
            }
        }

        label = _createLabel();
        layer.on('changeEnabled', _enabledChanged);
        layer.on('dataloadstart', _redrawIcon);
        layer.on('dataloadend', _redrawIcon);

        function getLabel() {
            return label;
        }

        return {
            getLabel: getLabel
        };
    };


    L.Control.Datasets = L.Control.extend({

        initialize: function (layers, options) {
            L.setOptions(this, options);
            this._labels = [];
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
                    this._addDataset(dataset, layer);
                } else {
                    for (i = 0; i < dataset.datasets.length; i++) {
                        this._addDataset(dataset.datasets[i]);
                    }
                }
            } else {
                this._addDataset(dataset, layer);
            }
        },

        _addDataset: function (dataset, layer) {
            if (layer.isLoading) {
                this.numLoading += 1;
                this._checkSpinner();
            }
            var label = new Label(dataset, layer);

            this._labels.push(label);

            layer.on('dataloadstart', function () {this._loadStart(); }, this);
            layer.on('dataloadend', function () {this._loadEnd(); }, this);
        },

        _loadStart: function () {
            this.numLoading += 1;
            this._checkSpinner();
        },

        _loadEnd: function () {
            this.numLoading -= 1;
            this._checkSpinner();
        },

        _checkSpinner: function () {
            if (!this._btnIcon) {
                return;
            }
            if (this.numLoading === 0) {
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-spinner fa-pulse',
                    ' fa-bars'
                );
            } else {
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-bars',
                    ' fa-spinner fa-pulse'
                );
            }
        },

        onAdd: function (map) {
            this._map = map;
            this._initLayout();
            this._update();
            return this._container;
        },

        _update: function () {
            if (!this._container) {
                return;
            }

            this._overlaysList.innerHTML = '';
            var i, label;
            //for (i in this._labels) {
            for (i = 0; i < this._labels.length; i++) {
                label = this._labels[i];
                this._overlaysList.appendChild(label.getLabel());
            }
        },

        _initLayout: function () {
            var className = 'leaflet-control-layers';
            this._container = L.DomUtil.create('div', '');

            //Makes this work on IE10 Touch devices by stopping it 
            //from firing a mouseout event when the touch is released
            this._container.setAttribute('aria-haspopup', true);

            if (!L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(this._container)
                    .disableScrollPropagation(this._container);
            } else {
                L.DomEvent.on(
                    this._container,
                    'click',
                    L.DomEvent.stopPropagation
                );
            }

            this._form = L.DomUtil.create('form', className + '-list');

            this._map.on('click', this._collapse, this);
            this._overlaysList = L.DomUtil.create(
                'div',
                className + '-overlays',
                this._form
            );

            this._closeDiv = L.DomUtil.create('div', 'clearfix');
            var closeBtn = L.DomUtil.create(
                'button',
                'btn btn-default pull-right',
                this._closeDiv
            );
            closeBtn.title = 'Kartlag';
            L.DomEvent.on(closeBtn, 'click', function () {
                this._toggle();
            }, this);

            if (this.numLoading > 0) {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-spinner fa-pulse', closeBtn);
            } else {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-bars', closeBtn);
            }

            this._container.appendChild(this._closeDiv);

            this._listContainer = L.DomUtil.create('div', className);
            this._listContainer.appendChild(this._form);
            this._container.appendChild(this._listContainer);
        },

        _toggle: function () {
            if (this.expanded) {
                this._collapse();
            } else {
                this._expand();
            }
        },

        _expand: function () {
            L.DomUtil.addClass(
                this._listContainer,
                'leaflet-control-layers-expanded'
            );
            this.expanded = true;
        },

        _collapse: function () {
            this._listContainer.className = this._listContainer.className.replace(
                ' leaflet-control-layers-expanded',
                ''
            );
            this.expanded = false;
        }
    });

    L.control.datasets = function (layers, options) {
        return new L.Control.Datasets(layers, options);
    };
}());
