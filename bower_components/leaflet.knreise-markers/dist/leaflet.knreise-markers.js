/*
    Leaflet.KNreiseMarkers, svg-based markers for leaflet
    Based on Leaflet.AwesomeMarkers
*/

/*global L*/

(function () {
    'use strict';

    /*
     * Leaflet.KNreiseMarkers assumes that you have already included the Leaflet library.
     */
    L.KNreiseMarkers = {};

    var pin = 'm 17.55,4.1951017 c -9.6366105,0 -17.4496113,7.4402593 -17.4496113,16.6171183 0,5.366984 4.6259821,10.878443 7.9062546,15.588509 C 13.057202,43.652706 17.55,49.004896 17.55,49.004896 c 0,0 4.461376,-5.052713 9.506171,-12.22664 3.296987,-4.688464 7.94344,-10.282935 7.94344,-15.965121 0,-9.177774 -7.813,-16.6180333 -17.449611,-16.6180333 z';

    L.KNreiseMarkers.Icon = L.Icon.extend({

        options: {
            iconSize: [35, 45],
            iconAnchor:  [17, 42],
            popupAnchor: [1, -32],
            shadowAnchor: [10, 12],
            shadowSize: [36, 16],
            className: 'awesome-marker',
            extraClasses: '',
            markerColor: '#ff0000'
        },

        initialize: function (options) {
            options = L.Util.setOptions(this, options);
            return options;
        },

        createIcon: function (oldIcon) {
            var div, options;
            div = (oldIcon && oldIcon.tagName === 'DIV' ? oldIcon : document.createElement('div'));
            options = this.options;
            div.innerHTML = '<svg width="35px" height="45px" viewBox="0 0 35 45" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g transform="translate(0,-4)"><path d="' + pin + '" fill="' + options.markerColor + '"></path></g></svg>';
            this._setIconStyles(div, 'icon');
            this._setIconStyles(div, 'icon-' + options.markerColor);
            return div;
        },

        _setIconStyles: function (img, name) {
            var options = this.options,
                size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
                anchor;

            if (name === 'shadow') {
                anchor = L.point(options.shadowAnchor || options.iconAnchor);
            } else {
                anchor = L.point(options.iconAnchor);
            }

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            img.className = 'awesome-marker-' + name + ' ' + options.className;

            if (anchor) {
                img.style.marginLeft = (-anchor.x) + 'px';
                img.style.marginTop  = (-anchor.y) + 'px';
            }

            if (size) {
                img.style.width  = size.x + 'px';
                img.style.height = size.y + 'px';
            }
        },

        createShadow: function () {
            var div;
            div = document.createElement('div');
            this._setIconStyles(div, 'shadow');
            return div;
        }
    });

    L.KNreiseMarkers.icon = function (options) {
        return new L.KNreiseMarkers.Icon(options);
    };

}());



