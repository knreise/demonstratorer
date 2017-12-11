import * as _ from 'underscore';
import L from 'leaflet';

import ApiLoader from './ApiLoader';
import DATASET_DEFAULTS from '../../config/datasetDefaults';
import {getDatasetTemplate} from '../../util';

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
                return initialLoad || !dataset.static;
            })
            .value();
        if (toLoad.length === 0) {
            return;
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
        _.each(toLoad, function (dataset) {
            _loadDatasetFromApi(dataset._id, bbox, function (error, data) {
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
            currentErrors[datasetId] = error;
        } else {
            currentErrors[datasetId] = null;
            currentData[datasetId] = data;
        }
        _.each(onInduvidualLoadEnds, function (callback) {
            callback(error, datasetId, data);
        });
    }

    function _checkAvailable() {
        _.each(datasets, function (dataset) {
            var isAvailable = _datasetAvailable(dataset);
            if (isAvailable !== availableDatasets[dataset._id]) {
                availableDatasets[dataset._id] = isAvailable;
                 _.each(onAvailableChanges, function (callback) {
                    callback(dataset._id, isAvailable);
                });
            }
            return isAvailable;
        });
    }

    function _mapMoved(e) {
        if (map.getZoom() !== currentZoom) {
            currentZoom = map.getZoom();
            _checkAvailable();
        }

        var newBounds = map.getBounds();
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
            if (parent) {
                return extend(extend(dataset, _.omit(parent, 'datasets', 'grouped')), DATASET_DEFAULTS);
            } else {
                return extend(dataset, DATASET_DEFAULTS);
            }
        });
    }

    function _transforDataset(dataset) {

        return {
            _id: dataset._id,
            name: dataset.name,
            isLoading: currentlyLoading[dataset._id],
            isAvailable: availableDatasets[dataset._id], // are we within the range?
            isEnabled: enabledDatsets[dataset._id], // has the user checked it?
            style: dataset.style,
            template: !!dataset.template ? getDatasetTemplate(dataset.template) : getDatasetTemplate('popup'),
            description: dataset.description,
            provider: dataset.provider,
            feedbackForm: dataset.feedbackForm,
            getFeatureData: dataset.getFeatureData,
            noListThreshold: dataset.noListThreshold,
            cluster: dataset.cluster
        };
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
        toggleEnabled: _toggleEnabled,
        getData: function (datasetId) {
            return {
                error: currentErrors[datasetId],
                data: currentData[datasetId]
            };
        },
        datasetIdMapping: _.extend({}, datasetIdMapping),
        getLayers: function () {
            return _.map(datasets, _transforDataset);
        },
        getDataset: function (datasetId) {
            var dataset = _.find(flattenedDatasets, function (d) {
                return d._id === datasetId;
            });
            if (dataset) {
                return _transforDataset(dataset);
            }
            return null;
        }
    };
}