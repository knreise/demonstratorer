/*global L:false, navigator:false*/
L.Knreise = L.Knreise || {};
(function (ns) {
    'use strict';
    ns.LocateButton = function (callback, error, options) {
        options = options || {};
        options.zoom = options.zoom || 10;
        var _map;

        function showPosition(pos) {
            var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
            if (callback) {
                callback(p);
            } else {
                _map.setView(p, 16);
            }
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                if (error) {
                    error();
                }
            }
        }

        function addTo(map) {
            var title = options.title || 'Finn meg';
            var icon = options.icon || 'fa-user';
            _map = map;
            return L.easyButton(map, getLocation, {icon: icon, title: title});
        }

        return {
            addTo: addTo
        };
    };

}(L.Knreise));
