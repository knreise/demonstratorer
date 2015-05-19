/*global L:false */
var KR = this.KR || {};

KR.DatasetLoader = function (api, map, sidebar) {
    'use strict';

    var _defaults = {
        isStatic: true,
        bbox: true,
        cluster: true,
        smallMarker: false
    };


    function getData(api, dataset, newBounds, cluster, mapper, checkData) {
        api.getBbox(dataset.dataset, newBounds, function (geoJson) {
            var data = mapper(checkData(geoJson));
            var geoJSONLayer = L.geoJson(data);
            cluster.clearLayers();
            cluster.addLayers(geoJSONLayer.getLayers());
        });
    }

    function _addBboxDataset(api, map, dataset, initBounds) {

        var cluster = new L.MarkerClusterGroup({dataset: dataset}).addTo(map);

        function checkData(geoJson) {
            if (dataset.minFeatures && geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                return KR.Util.CreateFeatureCollection([]);
            }
            return geoJson;
        }

        function _reloadData(e, bbox) {
            var newBounds = bbox || map.getBounds().toBBoxString();
            if (dataset.datasets) {
                _.each(dataset.datasets, function (dataset) {
                    var mapper = _mapper(dataset);
                    getData(api, dataset, newBounds, cluster, mapper, checkData);
                });
            } else {
                var mapper = _mapper(dataset);
                getData(api, dataset, newBounds, cluster, mapper, checkData);
            }
        }

        _reloadData(null, initBounds);

        if (!dataset.isStatic) {
            map.on('moveend', _reloadData);
        }

        return cluster;

        /*


        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        layer.visible = true;


        console.log(dataset);

        function checkData(geoJson) {
            if (dataset.minFeatures && geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                return KR.Util.CreateFeatureCollection([]);
            }
            return geoJson;
        }

        function _reloadData(e, bbox) {
            var bounds = bbox || map.getBounds().toBBoxString();
            if (dataset.minZoom) {
                if (map.getZoom() >= dataset.minZoom && layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.resetGeoJSON(mapper(checkData(geoJson)));
                    });
                } else {
                    layer.resetGeoJSON();
                }
            } else {
                if (layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.resetGeoJSON(mapper(checkData(geoJson)));
                    });
                } else {
                    layer.resetGeoJSON();
                }
            }
        }

        layer.on('setVisible', _reloadData);
        if (!dataset.isStatic) {
            map.on('moveend', _reloadData);
        }
        _reloadData(null, bounds);
        return layer;
        */
    }

    function _mapper(dataset) {
        var id = KR.Util.stamp(dataset)
        console.log("ddataset", dataset, id)
        return function (features) {
            if (!features || !features.features.length) {
                return features;
            }
            _.each(features.features, function (feature) {
                //if (_.has(dataset, 'dataset_name_override')) {
                    feature.properties.datasetID = id;
                //}
                if (_.has(dataset, 'circle')) {
                    feature.properties.circle = dataset.circle;
                }
            });
            return features;
        };
    }

    function _addFullDataset(api, map, dataset) {
        var mapper = _mapper(dataset);
        var cluster = new L.MarkerClusterGroup({dataset: dataset}).addTo(map);
        api.getData(dataset.dataset, function (geoJson) {
            var data = mapper(geoJson);
            var geoJSONLayer = L.geoJson(data);
            cluster.clearLayers();
            cluster.addLayers(geoJSONLayer.getLayers());
        });
        return cluster;

        /*
        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        api.getData(dataset, function (geoJson) {
            layer.addGeoJSON(mapper(geoJson));
        });
        return layer;
        */
    }

    function loadDatasets(datasets, bounds) {
        return _.map(datasets, function (dataset) {
            dataset = _.extend({}, _defaults, dataset);
            console.log(dataset);
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
