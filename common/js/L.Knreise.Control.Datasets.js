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

    var Label = function (dataset, toggleDataset) {
        var _enabled = true;
        var _visible = true;
        var _loading = false;
        var _error = null;
        var label, _icon;

        function _getIcon(iconAppend) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa';
            if (_visible) {
                icon.className += ' fa-check-square-o';
            } else {
                icon.className += ' fa-square-o';
            }
            if (iconAppend) {
                icon.className += ' ' + iconAppend;
            }
            if (_loading) {
                icon.className = 'layericon fa fa-spinner fa-pulse';
            }
            if (_enabled) {
                icon.style.color = KR.Style2.colorForDataset(dataset, true, true);
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

        function _toggleVisible() {
            if (!_enabled) {
                return;
            }
            toggleDataset(KR.Util.stamp(dataset), function (visible) {
                _visible = visible;
                _redrawIcon();
            });
        }

        function toggleEnabled(enabled) {
            _enabled = enabled;
            _redrawIcon();
        }

        function toggleLoading(loading) {
            _loading = loading;
            _redrawIcon();
        }
        /*
        function _showError(error) {
            if (!_error) {
                _error = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle');
                _error.setAttribute('title', KR.parseError(error));
                label.insertBefore(_error, label.childNodes[0]);
            } else {
                _error.setAttribute(
                    'title',
                    _error.getAttribute('title') + ', ' + KR.parseError(error)
                );
            }
        }
        */

        function _createLabel() {
            label = document.createElement('label');
            if (_.isUndefined(dataset.visible)) {
                dataset.visible = true;
            }

            var name = document.createElement('span');
            name.innerHTML = ' ' + dataset.name;

            _icon = _getIcon(null, dataset.visible);
            label.appendChild(_icon);
            label.appendChild(name);

            /*
            if (layer.error) {
                _showError(layer.error);
            }

            if (!layer.enabled) {
                label.className = 'disabled';
            }
            */
            L.DomEvent.on(label, 'click', _toggleVisible);
        }

        _createLabel();
        /*
        layer.on('error', _showError);
        */
        function getLabel() {
            return label;
        }

        return {
            getLabel: getLabel,
            toggleEnabled: toggleEnabled,
            toggleLoading: toggleLoading,
            hasError: function () {
                return false;
            }
        };
    };


    L.Control.Datasets = L.Control.extend({

        initialize: function (datasets, options) {
            L.setOptions(this, options);
            this._labels = {};
            this._handlingClick = false;
            this.expanded = false;
            this.numLoading = 0;
            this._toggleDataset = options.toggleDataset;
            var i;
            for (i in datasets) {
                if (datasets.hasOwnProperty(i)) {
                    this._addDataset(datasets[i]);
                }
            }
        },

        _addDataset: function (dataset) {
            var label = new Label(dataset, this._toggleDataset);
            this._labels[KR.Util.stamp(dataset)] = label;
        },

        toggleDatasetEnabled: function (datasetId, enabled) {
            if (!this._labels[datasetId]) {
                return;
            }
            this._labels[datasetId].toggleEnabled(enabled);
        },

        toggleDatasetLoading: function (datasetId, loading) {
            if (!this._labels[datasetId]) {
                return;
            }
            if (loading) {
                this.numLoading += 1;
            } else {
                this.numLoading -= 1;
            }
            this._checkSpinner();
            this._labels[datasetId].toggleLoading(loading);
        },
        /*
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
        */
        _checkSpinner: function () {
            if (!this._btnIcon) {
                return;
            }
            if (this.numLoading === 0) {
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-spinner fa-pulse',
                    ' fa-bars'
                );
               // this._checkError();
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
            var id, label;
            for (id in this._labels) {
                label = this._labels[id];
                this._overlaysList.appendChild(label.getLabel());
            }
            //this._checkError();
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

            this._errorIcon = L.DomUtil.create(
                'i',
                'error-icon fa fa-exclamation-triangle hidden',
                closeBtn
            );
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

    L.control.datasets = function (datasets, options) {
        return new L.Control.Datasets(datasets, options);
    };
}());
