/*global window:false */

var KR = this.KR || {};
KR.UrlFunctions = {};
(function (ns) {
    'use strict';

    ns.setupLocationUrl = function (map) {
        var moved = function () {
            try {
            var c = map.getCenter();
            } catch(e) {
                return;
            }
            var locationHash = KR.Util.getPositionHash(c.lat, c.lng, map.getZoom());

            var hash = window.location.hash.split(':');
            if (hash.length > 1) {
                var prevId = _.rest(hash).join(':');
                locationHash += ':' + prevId;
            }
            window.location.hash = locationHash;
        };
        map.on('moveend', moved);
        moved();
    };

    ns.getLocationUrl = function () {
        var hash = window.location.hash;
        if (hash && hash !== '' && hash.indexOf(':') !== 1) {
            var parts = hash.replace('#', '').split('/');
            var zoom = parseInt(parts[0], 10);
            var lat = parseFloat(parts[1]);
            var lon = parseFloat(parts[2]);
            return {lat: lat, lon: lon, zoom: zoom};
        }
    };

    ns.getHashFeature = function () {
        var hash = window.location.hash.split(':');
        if (hash.length > 1) {
            return _.rest(hash).join(':');
        }
    };

    ns.setFeatureHash = function (featureId) {
        var hash = window.location.hash.split(':')[0];
        if (featureId) {
            window.location.hash = hash + ':' + encodeURIComponent(featureId);
        } else {
            window.location.hash = hash;
        }
    };

    ns.getFeatureLink = function (feature) {
        var baseUrl = window.location.href.replace(window.location.hash, '');
        var coords = feature.geometry.coordinates;
        var hash = KR.Util.getPositionHash(coords[1], coords[0], 16);

        var url = baseUrl + hash;
        if (feature.id) {
            url = url + ':' + encodeURIComponent(feature.id);
        }
        return url;
    };

}(KR.UrlFunctions));
