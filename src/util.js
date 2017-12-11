import * as _ from 'underscore';
import $ from 'jquery';
import L from 'leaflet';
import distance from '@turf/distance';
import bearing from '@turf/bearing';

import {imageCacheUrl} from './config';
import DEFAULT_OPTIONS from './config/defaultOptions';
import getTemplateString from './templates_gen';

export function extendOptions(options) {
    return _.extend({}, DEFAULT_OPTIONS, options || {});
}

export function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function messageDisplayer(template) {
    return function (type, message) {
        var container = $(template);
        container.find('.close').on('click', function () {
            container.find('.content').html('');
            container.remove();
        });
        container.addClass('alert-' + type);
        container.find('.content').html(message);
        $('body').append(container);
    };
};

export function getTemplate(templateId) {
    var content = getTemplateString(templateId);
    if (content) {
        return _.template(content);
    }
    console.error('template ' + templateId + ' not found');
}

export function getDatasetTemplate(name) {
    return getTemplate(name + '_template');
};

export function distanceAndBearing(point1, point2) {
    return {
        distance: distance(point1, point2, 'kilometers') * 1000,
        bearing: bearing(point1, point2)
    };
};


var cacheTemplate = _.template('<%= service %>/s/crop/<%= width %>x<%= height %>/<%= image %>');
export function getImageCache(imageUrl, width, height) {
    if (imageCacheUrl) {
        return cacheTemplate({
            service: imageCacheUrl,
            width: width,
            height: height,
            image: imageUrl
        });
    }
    return imageUrl;
};

export function hexToRgba(hex, transparency) {
    transparency = transparency || 1;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        return 0;
    }
    var rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + transparency + ')';
};

function createFeatureCollection(features) {
    return {
        'type': 'FeatureCollection',
        'features': features
    };
}

export {createFeatureCollection};

export function boundsToPoly(bounds) {
    return createFeatureCollection([
        L.polygon([
            bounds.getSouthWest(),
            bounds.getNorthWest(),
            bounds.getNorthEast(),
            bounds.getSouthEast(),
            bounds.getSouthWest()
        ]).toGeoJSON()
    ]);
}

function round(number, decimals) {
    if (_.isUndefined(decimals)) {
        decimals = 2;
    }
    var exp = Math.pow(10, decimals);
    return Math.round(number * exp) / exp;
};

export {round};

var hashTemplate = _.template('#<%= zoom %>/<%= lat %>/<%= lon %>');
function getPositionHash(lat, lng, zoom) {
    return hashTemplate({
        zoom: zoom,
        lat: round(lat, 4),
        lon: round(lng, 4)
    });
};

export {getPositionHash};

var UrlFunctions = {};
UrlFunctions.setupLocationUrl = function (map) {
    var moved = function () {
        try {
        var c = map.getCenter();
        } catch (e) {
            return;
        }
        var locationHash = getPositionHash(c.lat, c.lng, map.getZoom());

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

UrlFunctions.getLocationUrl = function () {
    var hash = window.location.hash;
    if (hash && hash !== '' && hash.indexOf(':') !== 1) {
        var parts = hash.replace('#', '').split('/');
        var zoom = parseInt(parts[0], 10);
        var lat = parseFloat(parts[1]);
        var lon = parseFloat(parts[2]);
        return {lat: lat, lon: lon, zoom: zoom};
    }
};

UrlFunctions.getHashFeature = function () {
    var hash = window.location.hash.split(':');
    if (hash.length > 1) {
        return _.rest(hash).join(':');
    }
};

UrlFunctions.setFeatureHash = function (featureId) {
    var hash = window.location.hash.split(':')[0];
    if (featureId) {
        window.location.hash = hash + ':' + encodeURIComponent(featureId);
    } else {
        window.location.hash = hash;
    }
};

UrlFunctions.getFeatureLink = function (feature) {
    var baseUrl = window.location.href.replace(window.location.hash, '');
    var coords = feature.geometry.coordinates;
    var hash = getPositionHash(coords[1], coords[0], 16);

    var url = baseUrl + hash;
    if (feature.id) {
        url = url + ':' + encodeURIComponent(feature.id);
    }
    return url;
};

export {UrlFunctions};