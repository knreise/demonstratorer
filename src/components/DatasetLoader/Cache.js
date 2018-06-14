import * as _ from 'underscore';
import L from 'leaflet';

import {filter} from '../../util';


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

export default function Cache() {

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
                cacheData[datasetId] = List(10);
            }
            cacheData[datasetId].set({bbox: bbox, data: data});
        }
    };
}