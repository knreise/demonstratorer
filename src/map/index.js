import * as _ from 'underscore';
import L from 'leaflet';
import 'tilelayer-kartverket';

import './boundsUtil';
import 'leaflet/dist/leaflet.css';
import '../css/fullscreenmap.css';
import WORLD from '../config/world';


function getBaseLayer(layerName, callback) {
    var layers = {
        'hist': function (callback) {
            callback(L.tileLayer.wms('http://wms.geonorge.no/skwms1/wms.historiskekart', {
                layers: 'historiskekart',
                format: 'image/png',
                attribution: 'Kartverket'
            }));
        }
    };
    if (_.has(layers, layerName)) {
        layers[layerName](callback);
    } else if (L.tileLayer.kartverket.getLayers().indexOf(layerName) > -1) {
        var isSafari = navigator.userAgent.indexOf('Safari') > -1;
        var useCache = !isSafari;
        callback(L.tileLayer.kartverket(layerName, {useCache: useCache}));
    } else {
        callback(L.tileLayer(layerName));
    }
}

export function createMap(div, options) {
    options = options || {};

    //create the map
    var map = L.map(div, {
        minZoom: options.minZoom || 3,
        maxZoom: options.maxZoom || 18,
        maxBounds: L.geoJson(WORLD).getBounds()
    });

    var baseLayer = options.layer || 'norges_grunnkart_graatone';
    if (_.isString(baseLayer)) {
        getBaseLayer(baseLayer, function (layer) {
            layer.addTo(map);
        });
    } else {
        baseLayer.addTo(map);
    }
    if (options.showScaleBar) {
        L.control.scale({imperial: false}).addTo(map);
    }
    return map;
};

export function freezeMap(map) {
    // Disable drag and zoom handlers.
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.keyboard.disable();
    if (map.zoomControl) {
        map.zoomControl.removeFrom(map);
    }
    // Disable tap handler, if present.
    if (map.tap) {
        map.tap.disable();
    }
}

export function unFreezeMap(map) {
    // enable drag and zoom handlers.
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.keyboard.enable();
    if (map.zoomControl) {
        map.zoomControl.addTo(map);
    }

    // enable tap handler, if present.
    if (map.tap) {
        map.tap.enable();
    }
}

export function addExtraLayers(map, options) {
    if (_.has(options, 'extraLayers') && _.isArray(options.extraLayers)) {
        _.each(options.extraLayers, function (extraLayer) {
            map.addLayer(extraLayer);
        });
    }
}
