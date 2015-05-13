/*global L:false */

'use strict';

L.Control.EasyButtons = L.Control.extend({

    options: {
        position: 'topleft',
        title: '',
        icon: 'fa-circle-o',
        toggle: false,
        toggleClass: 'easy-icon-on',
        errorOnNoCallback: false
    },

    initialize: function (callback, options) {
        L.setOptions(this, options);
        this.callback = callback;
        if (options.offCallback) {
            this.offCallback = options.offCallback;
        }
        this._isOn = false;
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        this.link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        this._addImage();
        this.link.href = '#';

        L.DomEvent.on(this.link, 'click', this._click, this);
        this.link.title = this.options.title;

        return container;
    },

    _callCallback: function (callback)  {
        if (this.callback && typeof this.callback === 'function') {
            callback();
        } else if(options.errorOnNoCallback) {
            throw new Error('no function selected');
        }
    },

    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        if (!this.options.toggle) {
            this._callCallback(this.callback);
        } else {
            if (this._isOn) {
                L.DomUtil.removeClass(this.link, this.options.toggleClass);
                this._callCallback(this.offCallback);
            } else {
                L.DomUtil.addClass(this.link, this.options.toggleClass);
                this._callCallback(this.callback);
            }
            this._isOn = !this._isOn;
        }
        
    },

    _addImage: function () {
        var extraClasses = this.options.icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';

        var icon = L.DomUtil.create('i', this.options.icon + extraClasses, this.link);
        if (this.options.id) {
            icon.id = this.options.id;
        }
    }
});

L.easyButton = function (map, callback, options) {
    var newControl = new L.Control.EasyButtons(callback, options);

    if (map && map !== '') {
        map.addControl(newControl);
    }
    return newControl;
};
