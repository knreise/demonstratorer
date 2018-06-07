import * as _ from 'underscore';
import L from 'leaflet';
import booleanContains from '@turf/boolean-contains';
import booleanOverlap from '@turf/boolean-overlap';
import {createFeatureCollection, boundsToPoly} from '../../util';


function filter(bounds, fc) {
    var boundsPoly = boundsToPoly(bounds).features[0];
    var insideFeatures = _.filter(fc.features, function (feature) {
        return booleanOverlap(boundsPoly, boundsPoly) || booleanContains(boundsPoly, feature);
    });
    return createFeatureCollection(insideFeatures);
}

function List(len) {

    var data = [];

    return {
        set: function (item) {
            if (data.length >= len) {
                data.shift();
            }
            data.push(item);
        },
        get: function () {
            return _.clone(data);
        }
    };
}

function Cache() {

    var cacheData = {};

    return {
        get: function (datasetId, bbox) {
            if (!_.has(cacheData, datasetId)) {
                return null;
            }
            var bounds = L.latLngBounds.fromBBoxString(bbox);
            var cached = cacheData[datasetId].get();
            var found = _.find(cached, function (c) {
                var cBounds = L.latLngBounds.fromBBoxString(c.bbox);
                return bounds.equals(cBounds) || bounds.contains(cBounds);
            });
            if (!found) {
 
                return null;
            }
            return filter(bounds, found.data);
        },
        set: function (datasetId, bbox, data) {
            if (!_.has(cacheData, datasetId)) {
                cacheData[datasetId] = List(5);
            }
            cacheData[datasetId].set({bbox: bbox, data: data});
        }
    };
}

export default function ApiLoader(api, flattenedDatasets) {

    var cache = Cache();

    return function (datasetId, requestedBbox, callback) {
        var dataset = flattenedDatasets[datasetId];

        if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
            var fromCache = cache.get(datasetId, requestedBbox);
            if (fromCache) {
                callback(null, fromCache);
                return;
            }
        }

        try {
            if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
                var bbox = (!!dataset.fixedBbox) ? dataset.fixedBbox : requestedBbox;
                api.getBbox(
                    dataset.dataset,
                    bbox,
                    function (data) {
                        cache.set(datasetId, requestedBbox, data);
                        callback(null, data);
                    },
                    function (error) {
                        callback(error, null);
                    }
                );
            } else {
                api.getData(
                    dataset.dataset,
                    function (data) {
                        callback(null, data);
                    },
                    function (error) {
                        callback(error, null);
                    }
                );
            }
        } catch (error) {
            callback(error, null);
        }
    };
}