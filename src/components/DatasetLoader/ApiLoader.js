import * as _ from 'underscore';

import {createFeatureCollection} from '../../util';
import getTiles from './Tiles';
import Cache from './Cache';


export default function ApiLoader(api, flattenedDatasets) {

    var cache = Cache();

    function loadBboxTiled(bbox, zoom, datasetId, dataset, callback) {
        var tileBounds = getTiles(bbox, zoom);
        var res = [];
        var errors = [];
        var finished = _.after(tileBounds.length, function () {
            //var features = createFeatureCollection(_.flatten(_.map(res, r=> r.features)));
            if (errors.length) {
                callback(errors);
            } else {
                var features = _.flatten(_.map(res, r=> r.features));
                var filteredFeatures = _.chain(features)
                    .map(f => f.id)
                    .uniq()
                    .map(id => _.find(features, f => f.id === id))
                    .value();
                callback(null, createFeatureCollection(filteredFeatures));
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
                    },
                    {checkCancel: false}
                );
            }
        });
    }

    function loadBboxUntiled(bbox, datasetId, dataset, callback) {
        var fromCache = cache.get(datasetId, bbox);
        if (fromCache) {
            callback(null, fromCache);
        } else {
            api.getBbox(
                dataset.dataset,
                bbox,
                function (data) {
                    cache.set(datasetId, bbox, data);
                    callback(null, data);
                },
                function (error) {
                    callback(error);
                }
            );
        }
    }

    function loadBbox(datasetId, dataset, requestedBbox, zoom, callback) {
        var bbox = (!!dataset.fixedBbox)
            ? dataset.fixedBbox
            : requestedBbox;
        var useTiles = true;
        if (useTiles) {
            loadBboxTiled(bbox, zoom, datasetId, dataset, callback);
        } else {
            loadBboxUntiled(bbox, datasetId, dataset, callback);
        }
    }

    return function (datasetId, requestedBbox, zoom, callback) {
        var dataset = flattenedDatasets[datasetId];
        try {
            if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
                loadBbox(datasetId, dataset, requestedBbox, zoom, callback);
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