import * as _ from 'underscore';
import L from 'leaflet';
import booleanContainsTurf from '@turf/boolean-contains';
import booleanOverlap from '@turf/boolean-overlap';
import intersect from '@turf/intersect';
import center from '@turf/center';

import itemLoaders from './itemLoaders';
import ApiLoader from './ApiLoader';
import Style from '../LayerManager/Style';
import DATASET_DEFAULTS from '../../config/datasetDefaults';
import {
    getDatasetTemplate,
    createFeatureCollection,
    boundsToPoly,
    polyToBounds,
    flattenGeom
} from '../../util';



function booleanContains(a, b) {
    return booleanContainsTurf(flattenGeom(a), flattenGeom(b));
}


function toDict(arr, key, trans) {
    return _.reduce(arr, function (acc, element) {
        acc[element[key]] = _.isFunction(trans) ? trans(element) : trans;
        return acc;
    }, {});
}

function extend(a, b) {
    var allKeys = _.uniq(_.keys(a).concat(_.keys(b)));
    return _.reduce(allKeys, function (acc, key) {
        if (!_.has(a, key)) {
            acc[key] = _.clone(b[key]);
        } else if (_.isObject(a[key]) && _.has(b, key)) {
            acc[key] = extend(a[key], b[key]);
        } else {
            acc[key] = a[key];
        }
        return acc;
    }, {});
}

function filterData(filterGeom, data) {
    var insideFeatures = _.filter(data.features, function (feature) {
        var inside = _.map(filterGeom.features, function (filter) {
            if (!feature.geometry) {
                return false;
            }
            if (feature.geometry.type === 'MultiPolygon' || feature.geometry.type === 'MultiLineString') {
                //TODO: turf does not handle multi geoms
                return true;
            }
            if (feature.geometry.type === 'Polygon') {
                return booleanContains(filter, feature) || booleanOverlap(filter, feature);
            }
            return booleanContains(filter, feature);
        });
        return inside.indexOf(true) > -1;
    });
    return createFeatureCollection(insideFeatures);
}


function filterData2(filter, data) {
    var insideFeatures = _.filter(data.features, function (feature) {
        if (!feature.geometry) {
            return false;
        }
        if (feature.geometry.type !== 'Point') {
            return booleanContains(filter, center(feature));
        }
        return booleanContains(filter, feature);
    });
    return createFeatureCollection(insideFeatures);
}




function getBounds(filterPoly, bounds) {
    if (filterPoly.type === 'FeatureCollection') {
        if (filterPoly.features.length > 1) {
            console.warn('large filter!');
        }
        filterPoly = filterPoly.features[0];
    }
    var boundsPoly = boundsToPoly(bounds);


    if (booleanContains(filterPoly, boundsPoly)) {
        //bounds are inside the filter: use bounds
        return bounds;
    }
    if (booleanContains(boundsPoly, filterPoly)) {
        //bounds contains the filter: use the filter
        return polyToBounds(filterPoly);
    }
    if (booleanOverlap(filterPoly, boundsPoly)) {
        //poly and bounds overlap: use the intersection
        return polyToBounds(intersect(filterPoly, boundsPoly));
    }
    return null;
}

export default function DatasetLoader(datasets, map, api, initBounds, filter) {

    var currentBounds = initBounds;
    datasets = _setDefaults(datasets);

    var currentZoom = map.getZoom();
    _ensureId(datasets);

    var datasetIdMapping = _getDatasetMapping(datasets);
    var flattenedDatasets = _flattenDatasets(datasets);

    var _loadDatasetFromApi = ApiLoader(api, flattenedDatasets);

    var enabledDatsets = toDict(datasets, '_id', true);

    var currentlyLoading = toDict(datasets, '_id', false);
    var availableDatasets = toDict(datasets, '_id', _datasetAvailable);
    var prevBounds = toDict(datasets, '_id', initBounds);
    var currentData = toDict(flattenedDatasets, '_id', null);
    var currentErrors = toDict(flattenedDatasets, '_id', null);

    var onLoadStarts = [];
    var onLoadEnds = [];
    var onEnabledChanges = [];
    var onAvailableChanges = [];
    var onInduvidualLoadEnds = [];

    map.on('moveend', _mapMoved);

    function _loadDataset(children, datasetId, bounds, initialLoad) {
        if (!enabledDatsets[datasetId]) {
            return;
        }
        if (!availableDatasets[datasetId]) {
            return;
        }

        var toLoad = _.chain(children)
            .map(function (datasetId) {
                return flattenedDatasets[datasetId];
            })
            .filter(function (dataset) {
                return initialLoad || !dataset.isStatic;
            })
            .value();
        if (toLoad.length === 0) {
            return;
        }
        if (filter) {
            bounds = getBounds(filter, bounds);
            if (!bounds) {
                return;
            }
        }

        currentlyLoading[datasetId] = true;
        prevBounds[datasetId] = bounds;

        //trigger datasetId
        _.each(onLoadStarts, function (callback) {
            callback(datasetId);
        });

        var completed = _.after(toLoad.length, function () {
            currentlyLoading[datasetId] = false;
            //trigger onLoadEnd
            _.each(onLoadEnds, function (callback) {
                callback(datasetId);
            });
        });

        var bbox = bounds.toBBoxString();

        var zoom = map.getBoundsZoom(bounds);
        _.each(toLoad, function (dataset) {
            _loadDatasetFromApi(dataset._id, bbox, zoom, function (error, data) {
                _datasetUpdated(dataset._id, data, error);
                completed();
            });
        });
    }

    function _loadDatasets(bounds, initialLoad) {
        _.each(datasetIdMapping, function (children, datasetId) {
            _loadDataset(children, datasetId, bounds, initialLoad);
        });
    }

    function _datasetAvailable(d) {
        return (d.minZoom)
            ? (currentZoom > d.minZoom)
            : true;
    }

    function _shouldGetNewData(prevBbox, newBbox) {

        var prevBounds = (_.isString(prevBbox))
            ? L.latLngBounds.fromBBoxString(prevBbox)
            : prevBbox;
        var newBounds = (_.isString(prevBbox))
            ? L.latLngBounds.fromBBoxString(newBbox)
            : newBbox;

        if (prevBounds.equals(newBounds) || prevBounds.contains(newBounds)) {
            return false;
        }
        return true;
    }

    function _toggleEnabled(datasetId) {
        var wasEnabled = enabledDatsets[datasetId];
        enabledDatsets[datasetId] = !wasEnabled;
        _.each(onEnabledChanges, function (callback) {
            callback(datasetId, !wasEnabled);
        });
        if (!wasEnabled && _shouldGetNewData(prevBounds[datasetId], currentBounds)) {
            _loadDataset(datasetIdMapping[datasetId], datasetId, currentBounds, false);
        }
    }

    function _datasetUpdated(datasetId, data, error) {
        if (error) {
            if (error.statusText === 'abort') {
                error = null;
            }
            currentErrors[datasetId] = error;
            if (error) {
                console.error(error, data);
            }
        } else {
            currentErrors[datasetId] = null;

            if (filter) {
                data = filterData2(filter, data);
            }

            currentData[datasetId] = data;
        }
        _.each(onInduvidualLoadEnds, function (callback) {
            callback(error, datasetId, data);
        });
    }

    function _checkAvailable(newBounds) {

        _.each(datasets, function (dataset) {
            var isAvailable = _datasetAvailable(dataset);
            if (isAvailable !== availableDatasets[dataset._id]) {
                availableDatasets[dataset._id] = isAvailable;

                if (isAvailable) {
                    _loadDataset(datasetIdMapping[dataset._id], dataset._id, newBounds, false);
                }

                _.each(onAvailableChanges, function (callback) {
                    callback(dataset._id, isAvailable);
                });
            }
            return isAvailable;
        });
    }

    function _mapMoved(e) {
        var newBounds = map.getBounds();
        if (map.getZoom() !== currentZoom) {
            currentZoom = map.getZoom();
            _checkAvailable(newBounds);
        }
        if (_shouldGetNewData(currentBounds, newBounds)) {
            _loadDatasets(newBounds, false);
        }
        currentBounds = newBounds;
    }

    function _ensureId(datasets) {
        _.each(datasets, function (dataset, i) {
            if (dataset.grouped) {
                _.each(dataset.datasets, function (sub, j) {
                    sub._id = 'dataset_' + i + '_' + j;
                });
            }
            dataset._id = 'dataset_' + i;
            if (dataset.sublayerConfig) {
                dataset.sublayerConfig._id = dataset._id + '_sub';
            }
        });
    }

    function _flattenDatasets(datasets) {
        return _.reduce(datasets, function (acc, dataset) {
            if (dataset.grouped) {
                acc = _.extend({}, acc, _.reduce(dataset.datasets, function (acc2, subdataset) {
                    subdataset.group = dataset._id;
                    acc2[subdataset._id] = subdataset;
                    return acc2;
                }, {}));

            } else {
                acc[dataset._id] = dataset;
            }
            return acc;
        }, {});
    }

    function _getDatasetMapping(datasets) {
        return _.reduce(datasets, function (acc, dataset) {
            acc[dataset._id] = (dataset.grouped)
                ? _.pluck(dataset.datasets, '_id')
                : [dataset._id];
            return acc;
        }, {});
    }

    function _setDefaults(datasets, parent) {
        return _.map(datasets, function (dataset) {
            if (dataset.datasets) {
                dataset.datasets = _setDefaults(dataset.datasets, dataset);
            }
            if (dataset.sublayerConfig) {
                dataset.sublayerConfig = extend(dataset.sublayerConfig, DATASET_DEFAULTS);
            }
            if (parent) {
                return extend(
                    extend(dataset, _.omit(parent, 'datasets', 'grouped')),
                    DATASET_DEFAULTS
                );
            } else {
                return extend(dataset, DATASET_DEFAULTS);
            }
        });
    }

    function _loadItem(feature, dataset, callback) {
        function success(data) {
            if (data.type === 'Feature') {
                feature.properties = _.extend({}, feature.properties, data.properties);
            } else {
                feature.properties = _.extend({}, feature.properties, data);
            }
            callback(feature);
        }
        function error(err) {
            console.error(err);
            callback(feature);
        }

        if (dataset.getItem && _.has(itemLoaders, dataset.getItem)) {
            itemLoaders[dataset.getItem](api, feature, success, error);
        } else {
            var itemDataset = _.extend({feature: feature}, dataset.dataset);
            api.getItem(itemDataset, success, error);
        }
    }

    function loadSubLayer(datasetId, feature, callback) {
        var dataset = flattenedDatasets[datasetId];
        var itemDataset = _.extend({feature: feature}, dataset.dataset);

        function success(data) {
            callback(null, data);
        }
        function error(err) {
            callback(err);
        }

        api.getSublayer(itemDataset, success, error);
    }

    function _transformDataset(dataset) {
        var styleFunc = Style(dataset.style);

        return {
            _id: dataset._id,
            name: dataset.name,
            isLoading: _.has(currentlyLoading, dataset._id) ? currentlyLoading[dataset._id] : null,
            isAvailable: _.has(availableDatasets, dataset._id) ? availableDatasets[dataset._id] : null, // are we within the range?
            isEnabled: _.has(enabledDatsets, dataset._id) ? enabledDatsets[dataset._id] : null, // has the user checked it?
            style: dataset.style,
            color: styleFunc.get('fillcolor', null, false),
            template: !!dataset.template ? getDatasetTemplate(dataset.template) : getDatasetTemplate('popup'),
            description: dataset.description,
            provider: dataset.provider,
            feedbackForm: dataset.feedbackForm,
            noListThreshold: dataset.noListThreshold,
            polygonsAsPoints: dataset.polygonsAsPoints,
            cluster: dataset.cluster,
            commonCluster: dataset.commonCluster,
            polygonsAsPointsPixelThreshold: dataset.polygonsAsPointsPixelThreshold,
            polygonsAsPointsZoomThreshold: dataset.polygonsAsPointsZoomThreshold,
            loadSubLayer: dataset.loadSubLayer,
            sublayerConfig: dataset.sublayerConfig,
            useCentroid: dataset.useCentroid,
            getItem: dataset.loadExtraData
                ? function (feature, callback) {
                    _loadItem(feature, dataset, callback);
                }
                : undefined
        };
    }

    function getDataset(datasetId) {
        var dataset = _.find(flattenedDatasets, function (d) {
            return d._id === datasetId;
        });
        if (dataset) {
            return _transformDataset(dataset);
        }
        dataset = _.find(datasets, function (d) {
            return d._id === datasetId;
        });
        if (dataset) {
            return _transformDataset(dataset);
        }

        if (datasetId.endsWith('_sub')) {
            dataset = getDataset(datasetId.replace('_sub', ''));
            if (dataset && dataset.sublayerConfig) {
                return _transformDataset(dataset.sublayerConfig);
            }
        }

        return null;
    }

    return {
        onLoadStart: function (callback) {
            onLoadStarts.push(callback);
        },
        onLoadEnd: function (callback) {
            onLoadEnds.push(callback);
        },
        onDataLoadEnd: function (callback) {
            onInduvidualLoadEnds.push(callback);
        },
        onEnabledChange: function (callback) {
            onEnabledChanges.push(callback);
        },
        onAvailableChange: function (callback) {
            onAvailableChanges.push(callback);
        },
        init: function () {
            _loadDatasets(currentBounds, true);
        },
        loadSubLayer: loadSubLayer,
        toggleEnabled: _toggleEnabled,
        getData: function (datasetId) {
            return {
                error: currentErrors[datasetId],
                data: currentData[datasetId]
            };
        },
        getErrors: function (parentId) {
            return _.compact(_.map(datasetIdMapping[parentId], function (datasetId) {
                if (currentErrors[datasetId]) {
                    return {
                        parent: parentId,
                        id: datasetId,
                        error: currentErrors[datasetId]
                    };
                }
                return null;
            }));
        },
        datasetIdMapping: _.extend({}, datasetIdMapping),
        getLayers: function () {
            return _.map(datasets, _transformDataset);
        },
        getDatasets: function () {
            return _.map(flattenedDatasets, _transformDataset);
        },
        getDataset: getDataset
    };
}