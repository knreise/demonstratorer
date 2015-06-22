/*global L:false */
var KR = this.KR || {};

KR.DatasetLoader = function (api, map, sidebar, errorCallback) {
    'use strict';

    var reloads = [];

    var _defaults = {
        isStatic: true,
        bbox: true,
        cluster: true,
      //  smallMarker: false,
      //  thumbnails: true,
        visible: true
    };

    var _addClusterClick, _addFeatureClick;
    if (sidebar) {
        _addClusterClick = KR.Util.clusterClick(sidebar);
        _addFeatureClick = KR.Util.featureClick(sidebar);
    }

    function _mapper(dataset) {
        var id = KR.Util.stamp(dataset);
        return function (features) {
            if (!features || !features.features.length) {
                return features;
            }
            _.each(features.features, function (feature) {
                feature.properties.datasetID = id;
                if (_.has(dataset, 'circle')) {
                    feature.properties.circle = dataset.circle;
                }
                if (_.has(dataset, 'provider')) {
                    feature.properties.provider = dataset.provider;
                }
                if (_.has(dataset, 'extras')) {
                    feature.properties = _.extend(feature.properties, dataset.extras);
                }
                if (_.has(dataset, 'mappings')) {
                    _.each(dataset.mappings, function (value, key) {
                        feature.properties[key] = feature.properties[value];
                    });
                }

            });
            return features;
        };
    }

    function _copyProperties(dataset) {
        var params = _.reduce(_.without(_.keys(dataset), 'datasets'), function (acc, key) {
            acc[key] = dataset[key];
            return acc;
        }, {});
        dataset.datasets  = _.map(dataset.datasets, function (dataset) {
            return _.extend({}, params, dataset);
        });
        return dataset;
    }

    function _createGeoJSONLayer(geoJson, dataset) {
        var options = {
            dataset: dataset,
            onEachFeature: function (feature, layer) {
                if (_addFeatureClick) {
                    _addFeatureClick(feature, layer, dataset);
                }
            }
        };
        if (dataset.style) {
            options.style = dataset.style;
        }
        return L.Knreise.geoJson(geoJson, options);
    }

    function _resetDataGeoJson(layer, featurecollections) {
        layer.clearLayers();
        var features = _.reduce(featurecollections, function (acc, data) {
            return acc.concat(data.toGeoJSON().features);
        }, []);
        layer.addData(KR.Util.createFeatureCollection(features));
    }

    function _resetClusterData(clusterLayer, featurecollections) {
        clusterLayer.clearLayers();
        var layers = _.reduce(featurecollections, function (acc, geoJSONLayer) {
            geoJSONLayer.setMap(map);
            return acc.concat(geoJSONLayer.getLayers());
        }, []);
        clusterLayer.addLayers(layers);
    }

    function _setupToggle(layer, reloadFunc) {
        layer.on('hide', function () {
            reloadFunc();
        });

        layer.on('show', function () {
            reloadFunc();
        });
    }

    function _createVectorLayer(dataset, map) {
        var vectorLayer;
        if (dataset.cluster) {
            vectorLayer = new L.Knreise.MarkerClusterGroup({dataset: dataset}).addTo(map);
            if (_addClusterClick) {
                _addClusterClick(vectorLayer, dataset);
            }
        } else {
            vectorLayer = _createGeoJSONLayer(null, dataset).addTo(map);
        }
        var enabled = true;
        if (dataset.minFeatures) {
            enabled = false;
        }
        vectorLayer.enabled = enabled;
        return vectorLayer;
    }

    function _toggleEnabled(vectorLayer, enabled) {

        if (vectorLayer.enabled !== enabled) {
            vectorLayer.enabled = enabled;
            vectorLayer.fire('changeEnabled');
        }
    }

    function _getvisible(dataset) {
        if (dataset.datasets && !dataset.grouped) {
            var numVisible = _.filter(dataset.datasets, function (d) {
                return d.visible;
            }).length;
            return (numVisible > 0);
        }

        return dataset.visible;
    }

    function _checkShouldLoad(dataset) {
        if (!dataset.minZoom) {
            return _getvisible(dataset);
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return _getvisible(dataset);
    }

    function _checkEnabled(dataset) {
        if (!dataset.minZoom) {
            return true;
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return true;
    }

    function _isStatic(dataset) {
        if (dataset.datasets) {
            return _.filter(dataset.datasets, function (dataset) {
                return (dataset.isStatic === false);
            }).length === 0;
        }
        return dataset.isStatic;
    }


    function _addBboxDataset(dataset, initBounds, filter) {
        var vectorLayer = _createVectorLayer(dataset, map);



        function checkData(geoJson, vectorLayer) {
            if (dataset.minFeatures) {
                if (geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                    _toggleEnabled(vectorLayer, false);
                    return KR.Util.createFeatureCollection([]);
                }
                _toggleEnabled(vectorLayer, true);
            }
            return geoJson;
        }

        var _reloadData = function (e, bbox, forceVisible, callback) {
            var first = !e;

            vectorLayer.enabled = _checkEnabled(dataset);
            vectorLayer.fire('changeEnabled');
            var shouldLoad = forceVisible || _checkShouldLoad(dataset);
            if (!shouldLoad) {
                vectorLayer.clearLayers();
                return;
            }

            var newBounds = bbox || map.getBounds().toBBoxString();
            var toLoad;
            if (dataset.datasets) {
                toLoad = _.filter(dataset.datasets, function (d) {
                    return d.visible;
                });
            } else {
                toLoad = [dataset];
            }

            var featurecollections = [];
            var finished = _.after(toLoad.length, function () {
                vectorLayer.isLoading = false;
                vectorLayer.fire('dataloadend');
                if (dataset.cluster) {
                    _resetClusterData(vectorLayer, featurecollections);
                } else {
                    _resetDataGeoJson(vectorLayer, featurecollections);
                }
                if (callback) {
                    callback();
                }
            });

            vectorLayer.isLoading = true;
            vectorLayer.fire('dataloadstart');
            _.each(toLoad, function (dataset) {
                var mapper = _mapper(dataset);

                function dataLoaded(geoJson) {

                    if (dataset.isStatic && first) {
                        dataset.geoJson = geoJson;
                    }
                    if (filter) {
                        geoJson = filter(geoJson);
                    }
                    var geoJSONLayer;
                    if (dataset.cluster) {
                        geoJSONLayer = _createGeoJSONLayer(
                            mapper(checkData(geoJson, vectorLayer)),
                            dataset
                        );
                        dataset.geoJSONLayer = geoJSONLayer;
                    } else {
                        geoJSONLayer = L.geoJson(mapper(checkData(geoJson, vectorLayer)));
                    }
                    featurecollections.push(geoJSONLayer);
                    finished();
                }

                function loadError(error) {
                    finished();
                    if (error.statusText === 'abort') {
                        return;
                    }
                    if (errorCallback) {
                        errorCallback({
                            dataset: dataset.name,
                            error: error
                        });
                    }
                }

                if (!first && dataset.isStatic) {
                    dataLoaded(dataset.geoJson);
                    return;
                }


                if (dataset.bbox) {
                    api.getBbox(
                        dataset.dataset,
                        newBounds,
                        dataLoaded,
                        loadError
                    );
                } else {
                    api.getData(
                        dataset.dataset,
                        dataLoaded,
                        loadError
                    );
                }
            });


        };

        _reloadData(null, initBounds);

        if (!_isStatic(dataset) || dataset.minZoom) {
            map.on('moveend', _reloadData);
        }
        _setupToggle(vectorLayer, _reloadData);

        return {layer: vectorLayer, reload: _reloadData};
    }

    function reload(setVisible, callback) {

        var finished = _.after(reloads.length, function () {
            if (callback) {
                callback();
            }
        });

        _.each(reloads, function (reload) {
            reload(null, null, setVisible, finished);
        });
    }

    /*
    function _addFullDataset(dataset, filter) {
        var mapper = _mapper(dataset);
        var vectorLayer = _createVectorLayer(dataset, map);

        vectorLayer.isLoading = true;
        vectorLayer.fire('dataloadstart');

        api.getData(
            dataset.dataset,
            function (geoJson) {
                vectorLayer.isLoading = false;
                vectorLayer.fire('dataloadend');
                if (filter) {
                    geoJson = filter(geoJson);
                }
                var geoJSONLayer = _createGeoJSONLayer(
                    mapper(geoJson),
                    dataset
                );
                vectorLayer.clearLayers();
                vectorLayer.addLayers(geoJSONLayer.getLayers());
            },
            function (error) {
                vectorLayer.isLoading = false;
                vectorLayer.fire('dataloadend');
                if (errorCallback) {
                    errorCallback({
                        dataset: dataset.name,
                        error: error
                    });
                }
            }
        );
        return vectorLayer;
    }
    */

    function _setStyle(dataset) {
        var id = KR.Util.getDatasetId(dataset);
        dataset.extras = dataset.extras || {};
        dataset.extras.datasetId = id;
        if (dataset.style) {
            KR.Style.setDatasetStyle(id, dataset.style);
        }
    }

    function _addDataset(dataset, bounds, filter) {
        return _addBboxDataset(dataset, bounds, filter);
    }


    function loadDatasets(datasets, bounds, filter) {
        var res = _.map(datasets, function (dataset) {
            dataset = _.extend({}, _defaults, dataset);
            //copy properties from parent
            if (dataset.datasets) {
                _copyProperties(dataset);
            }

            if (KR.Style.setDatasetStyle) {
                if (dataset.datasets) {
                    _.each(dataset.datasets, _setStyle);
                } else {
                    _setStyle(dataset);
                }
            }

            if (!dataset.visible) {
                dataset.notLoaded = true;
            }
            if (dataset.minZoom && dataset.bbox) {
                dataset.isStatic = false;
            }
            return _addDataset(dataset, bounds, filter);
        });
        reloads = _.pluck(res, 'reload');
        return _.pluck(res, 'layer');
    }

    return {
        loadDatasets: loadDatasets,
        reload: reload
    };
};
