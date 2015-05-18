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

    function _addBboxDataset(api, map, dataset, mapper, bounds) {
        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        layer.visible = true;

        function _reloadData(bbox) {
            var bounds = bbox || map.getBounds().toBBoxString();
            if (dataset.minZoom) {
                if (map.getZoom() >= dataset.minZoom && layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.addGeoJSON(mapper(geoJson));
                    });
                } else {
                    layer.resetGeoJSON();
                }
            } else {
                if (layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.addGeoJSON(mapper(geoJson));
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
        _reloadData(bounds);
        return layer;
    }

    function _mapper(dataset) {
        return function (features) {
            _.each(features.features, function (feature) {
                if (_.has(dataset, 'dataset_name_override')) {
                    feature.properties.dataset = dataset.dataset_name_override;
                }
                if (_.has(dataset, 'circle')) {
                    feature.properties.circle = dataset.circle;
                }
            });
            return features;
        }
    }

    function _addFullDataset(api, map, dataset, mapper) {
        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        api.getData(dataset, function (geoJson) {
            layer.addGeoJSON(mapper(geoJson));
        });
        return layer;
    }

    function loadDatasets(datasets, bounds) {
        return _.map(datasets, function (dataset) {
            dataset = _.extend({}, _defaults, dataset);
            if (dataset.bbox) {
                return _addBboxDataset(api, map, dataset, _mapper(dataset), bounds);
            }
            return _addFullDataset(api, map, dataset, _mapper(dataset));
        });
    }

    return {
        loadDatasets: loadDatasets
    };
};
