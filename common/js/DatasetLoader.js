/*global L:false */
var KR = this.KR || {};

KR.DatasetLoader = function (api, map, sidebar) {
    'use strict';

    var _defaults = {
        isStatic: true,
        bbox: true,
        cluster: true,
        smallMarker: false,
        thumbnails: true
    };

    function _getTemplateForFeature(feature, dataset) {
        if (dataset.datasets) {
            var d = _.find(dataset.datasets, function (dataset) {
                return (dataset._knreise_id === feature.properties.datasetID);
            });
            return d.template;
        }
        return dataset.template;
    }

    function _addClusterClick(clusterLayer, dataset) {
        clusterLayer.on('clusterclick', function (e) {
            var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                var feature = marker.feature;
                feature.template = _getTemplateForFeature(feature, dataset);
                return feature;
            });
            sidebar.showFeatures(features);
        });
    }

    function _addFeatureClick(layer, feature, dataset) {
        layer.on('click', function () {
            sidebar.showFeature(
                feature,
                dataset.template,
                dataset.getFeatureData
            );
        });
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
            });
            return features;
        };
    }

    function _copyProperties(dataset) {
        var params = _.reduce(_.without(_.keys(dataset), 'datasets'), function (acc, key) {
            acc[key] = dataset[key];
            return acc;
        }, {});
        _.each(dataset.datasets, function (dataset) {
            _.extend(dataset, params);
        });
        return dataset;
    }

    function _createGeoJSONLayer(geoJson, dataset) {
        var options = {
            dataset: dataset,
            onEachFeature: function (feature, layer) {
                _addFeatureClick(layer, feature, dataset);
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
        layer.addData(KR.Util.CreateFeatureCollection(features));
    }

    function _resetClusterData(clusterLayer, featurecollections) {
        clusterLayer.clearLayers();
        var layers = _.reduce(featurecollections, function (acc, geoJSONLayer) {
            return acc.concat(geoJSONLayer.getLayers());
        }, []);
        clusterLayer.addLayers(layers);
    }

    function _setupToggle(layer, reloadFunc) {
        layer.on('hide', function () {
            layer.clearLayers();
        });

        layer.on('show', function () {
            reloadFunc();
        });
    }

    function _createVectorLayer(dataset, map) {
        var vectorLayer;
        if (dataset.cluster) {
            vectorLayer = new L.Knreise.MarkerClusterGroup({dataset: dataset}).addTo(map);
            _addClusterClick(vectorLayer, dataset);
        } else {
            vectorLayer = _createGeoJSONLayer(null, dataset).addTo(map);
        }
        var enabled = true
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

    function _checkShouldLoad(dataset, vectorLayer) {

        if (!dataset.minZoom) {
            return true;
        }
        if (map.getZoom() < dataset.minZoom) {
            vectorLayer.clearLayers();
            if (vectorLayer.enabled) {
                vectorLayer.enabled = false;
                vectorLayer.fire('changeEnabled');
            }
            return false;
        }
        if (!vectorLayer.enabled) {
            vectorLayer.enabled = true;
            vectorLayer.fire('changeEnabled');
        }
        return true;
    }


    function _addBboxDataset(api, map, dataset, initBounds) {
        var vectorLayer = _createVectorLayer(dataset, map);

        //copy properties from parent
        if (dataset.datasets) {
            _copyProperties(dataset);
        }

        function checkData(geoJson, vectorLayer) {
            if (dataset.minFeatures) {
                if(geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                    _toggleEnabled(vectorLayer, false);
                    return KR.Util.CreateFeatureCollection([]);
                }
                _toggleEnabled(vectorLayer, true);
            }
            return geoJson;
        }

        function _reloadData(e, bbox) {
            var shouldLoad = _checkShouldLoad(dataset, vectorLayer);
            if (!shouldLoad) {
                return;
            }

            var newBounds = bbox || map.getBounds().toBBoxString();
            var toLoad;
            if (dataset.datasets) {
                toLoad = dataset.datasets;
            } else {
                toLoad = [dataset];
            }

            var featurecollections = [];
            var finished = _.after(toLoad.length, function () {
                if (dataset.cluster) {
                    _resetClusterData(vectorLayer, featurecollections);
                } else {
                    _resetDataGeoJson(vectorLayer, featurecollections);
                }
            });
            _.each(toLoad, function (dataset) {
                var mapper = _mapper(dataset);
                api.getBbox(dataset.dataset, newBounds, function (geoJson) {
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
                });
            });
        }

        _reloadData(null, initBounds);

        if (!dataset.isStatic || dataset.minZoom) {
            map.on('moveend', _reloadData);
        }

        _setupToggle(vectorLayer, _reloadData);

        return vectorLayer;
    }

    function _addFullDataset(api, map, dataset) {
        var mapper = _mapper(dataset);
        var vectorLayer = _createVectorLayer(dataset, map);

        api.getData(dataset.dataset, function (geoJson) {
            var geoJSONLayer = _createGeoJSONLayer(
                mapper(geoJson),
                dataset
            );
            vectorLayer.clearLayers();
            vectorLayer.addLayers(geoJSONLayer.getLayers());
        });
        return vectorLayer;
    }

    function loadDatasets(datasets, bounds) {
        return _.map(datasets, function (dataset) {
            dataset = _.extend({}, _defaults, dataset);
            if (dataset.bbox) {
                return _addBboxDataset(api, map, dataset, bounds);
            }
            return _addFullDataset(api, map, dataset);
        });
    }

    return {
        loadDatasets: loadDatasets
    };
};
