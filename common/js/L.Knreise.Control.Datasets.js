/*global L:false, KR: false */

/*
    A Leaflet control that behaves in much the same way as L.Control.Layer, 
    but works with KNreise datasets. 

    Handles loading, toggleling and error feedback.
*/


(function () {
    'use strict';

    L.Knreise = L.Knreise || {};
    L.Knreise.Control = L.Knreise.Control || {};

    var Label = function (dataset, layer) {
        var enabled = layer.enabled;
        var _error = null;
        var label, _icon;

        function _getDatasetId() {
            if (dataset.grouped) {
                return dataset.datasets[0].extras.datasetId;
            }
            return dataset.extras.datasetId;
        }

        function _getIcon(iconAppend) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa';
            if (dataset.visible) {
                icon.className += ' fa-check-square-o';
            } else {
                icon.className += ' fa-square-o';
            }
            if (iconAppend) {
                icon.className += ' ' + iconAppend;
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

        function _showError(error) {
            _error = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle');
            _error.setAttribute('title', KR.parseError(error));
            label.insertBefore(_error, label.childNodes[0]);
        }

        function _createLabel() {
            label = document.createElement('label');
            if (_.isUndefined(dataset.visible)) {
                dataset.visible = true;
            }

            var name = document.createElement('span');
            name.innerHTML = ' ' + dataset.name;

            _icon = _getIcon();
            label.appendChild(_icon);
            label.appendChild(name);

            if (layer.error) {
                _showError(layer.error);
            }

            if (!layer.enabled) {
                label.className = 'disabled';
            }

            L.DomEvent.on(label, 'click', function () {
                var canToggle = layer.enabled && !layer.isLoading;
                if (canToggle) {
                    _toggle();
                }
            });
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

        _createLabel();
        layer.on('changeEnabled', _enabledChanged);
        layer.on('dataloadstart', function () {
            if (_error) {
                label.removeChild(_error);
                _error = null;
            }
            _redrawIcon();
        });
        layer.on('dataloadend', _redrawIcon);
        layer.on('error', _showError);
        function getLabel() {
            return label;
        }

        return {
            getLabel: getLabel,
            hasError: function () {
                return !!layer.error;
            }
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

        _hasErrors: function () {
            return !!_.find(this._labels, function (label) {
                return label.hasError();
            });
        },

        _checkError: function () {
            if (this._hasErrors()) {
                this._errorIcon.className = this._errorIcon.className.replace(
                    ' hidden',
                    ''
                );
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
            }
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
                this._checkError();
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
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
            this._checkError();
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

            this._errorIcon = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle hidden', closeBtn);
            closeBtn.appendChild(document.createTextNode(' '));
            if (this.numLoading > 0) {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-spinner fa-pulse', closeBtn);
            } else {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-bars', closeBtn);
            }

            this._container.appendChild(this._closeDiv);

            this._listContainer = L.DomUtil.create('div', className + ' hidden');
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
            this._listContainer.className = this._listContainer.className.replace(
                ' hidden',
                ''
            );
        },

        _collapse: function () {
            this._listContainer.className = this._listContainer.className.replace(
                ' leaflet-control-layers-expanded',
                ''
            );
            L.DomUtil.addClass(
                this._listContainer,
                'hidden'
            );
            this.expanded = false;
        }
    });

    L.control.datasets = function (layers, options) {
        return new L.Control.Datasets(layers, options);
    };
}());
