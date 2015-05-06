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

    function _addBboxDataset(api, map, dataset) {
        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        layer.visible = true;

        function _reloadData() {
            var bounds = map.getBounds().toBBoxString();
            if (dataset.minZoom) {
                if (map.getZoom() >= dataset.minZoom && layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.addGeoJSON(geoJson);
                    });
                } else {
                    layer.resetGeoJSON();
                }
            } else {
                if (layer.visible) {
                    api.getBbox(dataset, bounds, function (geoJson) {
                        layer.addGeoJSON(geoJson);
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
        _reloadData();
        return layer;
    }

    function _addFullDataset(api, map, dataset) {
        var layer = L.norvegianaGeoJSON(null, sidebar, dataset)
            .addTo(map);
        api.getData(dataset, function (geoJson) {
            layer.addGeoJSON(geoJson);
        });
        return layer;
    }

    function loadDatasets(datasets) {
        return _.map(datasets, function (dataset) {
            dataset = _.extend({}, _defaults, dataset);
            if (dataset.bbox) {
                return _addBboxDataset(api, map, dataset);
            }
            return _addFullDataset(api, map, dataset);
        });
    }

    return {
        loadDatasets: loadDatasets
    };
};
