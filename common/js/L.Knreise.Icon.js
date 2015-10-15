/*global L:false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Icon = L.AwesomeMarkers.Icon.extend({
    options: {
        icon: null
    }
});

L.Knreise.icon = function (options) {
    return new L.Knreise.Icon(options);
};