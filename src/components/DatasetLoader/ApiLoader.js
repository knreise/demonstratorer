import * as _ from 'underscore';
import L from 'leaflet';

import {createFeatureCollection, filter} from '../../util';
import getTiles from './Tiles';
import Cache from './Cache';


export default function ApiLoader(api, flattenedDatasets) {

    var cache = Cache();

    function loadBbox(datasetId, dataset, requestedBbox, callback) {
        var bbox = (!!dataset.fixedBbox)
            ? dataset.fixedBbox
            : requestedBbox;

        var tileBounds = getTiles(bbox, dataset.minZoom);

        var res = [];
        var errors = [];
        var finished = _.after(tileBounds.length, function () {
            var features = createFeatureCollection(_.flatten(_.map(res, r=> r.features)));
            if (errors.length) {
                callback(errors);
            } else {
                callback(null, filter(L.latLngBounds.fromBBoxString(bbox), features));
            }
        });

        _.each(tileBounds, function (tileBound) {
            var fromCache = cache.get(datasetId, tileBound);
            if (fromCache) {
                res.push(fromCache);
                finished();
            } else {
                api.getBbox(
                    dataset.dataset,
                    tileBound,
                    function (data) {
                        cache.set(datasetId, tileBound, data);
                        res.push(data);
                        finished();
                    },
                    function (error) {
                        errors.push(error);
                        finished();
                    }
                );
            }
        });
    }

    return function (datasetId, requestedBbox, callback) {
        var dataset = flattenedDatasets[datasetId];
        try {
            if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
                loadBbox(datasetId, dataset, requestedBbox, callback);
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