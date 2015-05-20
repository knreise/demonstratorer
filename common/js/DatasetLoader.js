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
        return L.geoJson2(
            geoJson,
            {
                dataset: dataset,
                onEachFeature: function (feature, layer) {
                    _addFeatureClick(layer, feature, dataset);
                }
            }
        );
    }

    function _addBboxDataset(api, map, dataset, initBounds) {

        var cluster = new L.MarkerClusterGroup2({dataset: dataset}).addTo(map);
        _addClusterClick(cluster, dataset);

        //copy properties from parent
        if (dataset.datasets) {
            _copyProperties(dataset);
        }

        function checkData(geoJson) {
            if (dataset.minFeatures && geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                return KR.Util.CreateFeatureCollection([]);
            }
            return geoJson;
        }

        function _reloadData(e, bbox) {

            var newBounds = bbox || map.getBounds().toBBoxString();

            var toLoad;
            if (dataset.datasets) {
                toLoad = dataset.datasets;
            } else {
                toLoad = [dataset];
            }

            var loadedData = [];
            var finished = _.after(toLoad.length, function () {
                cluster.clearLayers();
                _.each(loadedData, function (geoJSONLayer) {
                    cluster.addLayers(geoJSONLayer.getLayers());
                });
            });
            _.each(toLoad, function (dataset) {
                var mapper = _mapper(dataset);
                api.getBbox(dataset.dataset, newBounds, function (geoJson) {
                    var geoJSONLayer = _createGeoJSONLayer(
                        mapper(checkData(geoJson)),
                        dataset
                    );
                    dataset.geoJSONLayer = geoJSONLayer;
                    loadedData.push(geoJSONLayer);
                    finished();
                });
            });
        }

        _reloadData(null, initBounds);

        if (!dataset.isStatic) {
            map.on('moveend', _reloadData);
        }

        return cluster;
    }

    function _addFullDataset(api, map, dataset) {
        var mapper = _mapper(dataset);
        var cluster = new L.MarkerClusterGroup({
            dataset: dataset
        }).addTo(map);

        api.getData(dataset.dataset, function (geoJson) {
            var geoJSONLayer = _createGeoJSONLayer(
                mapper(geoJson),
                dataset
            );
            cluster.clearLayers();
            cluster.addLayers(geoJSONLayer.getLayers());
        });
        return cluster;
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
