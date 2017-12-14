import L from 'leaflet';
import * as _ from 'underscore';

import '../css/L.Control.DatasetChooser.css';
import parseError from '../util';


function _getLabel(dataset, errors) {
    var label = document.createElement('label');

    if (!dataset.isAvailable) {
        label.className = 'disabled';
    }
    var icon = document.createElement('i');
    icon.className = 'layericon fa';
    if (dataset.isEnabled) {
        icon.className += ' fa-check-square-o';
    } else {
        icon.className += ' fa-square-o';
    }
    /*if (iconAppend) {
        icon.className += ' ' + iconAppend;
    }*/

    if (dataset.isLoading) {
        icon.className = 'layericon fa fa-spinner fa-pulse';
    }

    if (dataset.isAvailable) {
        icon.style.color = dataset.color;
    } else {
        icon.style.color = '#ddd';
    }
    label.appendChild(icon);

    if (errors) {
        var fragment = document.createDocumentFragment();
        _.each(errors, function (error) {
            var errorIcon = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle');
            errorIcon.setAttribute('title', parseError(error));
            fragment.appendChild(errorIcon);
        });
        label.insertBefore(fragment, label.childNodes[0]);
    }

    var name = document.createElement('span');
    name.innerHTML = ' ' + dataset.name;
    label.appendChild(name);

    return label;
}

L.Control.DatasetChooser = L.Control.extend({

    initialize: function (loader, options) {
        L.setOptions(this, options);
        this.loader = loader;
        this.numLoading = 0;
        loader.onLoadStart(_.bind(function (datasetId) {
            this.numLoading += 1;
            this._update();
        }, this));
        loader.onLoadEnd(_.bind(function (datasetId) {
            this.numLoading -= 1;
            this._update();
        }, this));
        loader.onEnabledChange(_.bind(function (datasetId) {
            this._update();
        }, this));
        loader.onAvailableChange(_.bind(function (datasetId) {
            this._update();
        }, this));
    },

    onAdd: function (map) {
        this._map = map;
        this._initLayout();
        this._update();
        //this._expand()
        return this._container;
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
            if (this._errorIcon.className.indexOf('hidden') < 0) {
                this._errorIcon.className += ' hidden';
            }
            this._btnIcon.className = this._btnIcon.className.replace(
                ' fa-bars',
                ' fa-spinner fa-pulse'
            );
        }
    },

    _toggleError: function (hasError) {
        if (hasError) {
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

    _update: function () {
        if (!this._container) {
            return;
        }
        this._checkSpinner();
        var fragment = document.createDocumentFragment();
        var hasError = 0;
        _.each(this.loader.getLayers(), function (dataset) {
            var errors = this.loader.getErrors(dataset._id);
            if (errors.length && dataset.isAvailable && dataset.isEnabled) {
                hasError = true;
            }
            var label = _getLabel(dataset, errors);
            fragment.appendChild(label);
            label.addEventListener('click', _.bind(function (e) {
                this.loader.toggleEnabled(dataset._id);
            }, this));
        }, this);
        this._toggleError(hasError);
        while (this._overlaysList.firstChild) {
            var child = this._overlaysList.firstChild;
            this._overlaysList.removeChild(child);
        }
        this._overlaysList.appendChild(fragment);
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

L.control.datasetChooser = function (loader, options) {
    return new L.Control.DatasetChooser(loader, options);
};