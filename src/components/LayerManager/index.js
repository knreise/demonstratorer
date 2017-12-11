import * as _ from 'underscore';
import L from 'leaflet';
import '../../../bower_components/leaflet.markercluster/dist/leaflet.markercluster-src.js';

import Style from './Style';
import {getIcon, getMarker, getClusterIcon} from './getMarker';

export default function LayerManager(map, loader) {

    var selectedLayer = null;
    var selectedDataset = null;
    var layerGroups = {};

    var onSelects = [];
    var onDeSelects = [];

    function init() {
        loader.onDataLoadEnd(_dataLoaded);
        loader.onEnabledChange(_toggleEnabled);
        map.on('sidebarClosed', _deselectLayer);

        layerGroups = _.reduce(loader.datasetIdMapping, function (acc, sublayers, groupId) {
            return _.extend(acc, _.reduce(sublayers, function (acc, layerId) {
                acc[layerId] = L.featureGroup([]).addTo(map);
                return acc;
            }, {}));
        }, {});
    }

    function _dataLoaded(error, datasetId, data) {
        if (error) {
            //console.error("11", error, datasetId);
            console.log('err', datasetId, error);
        } else {
            //console.log('loadEnd', datasetId, data);
            _addData(datasetId, data);
        }
    }

    function _toggleEnabled(datasetId, enabled) {
        _.each(loader.datasetIdMapping[datasetId], function (datasetId) {
            var layerGroup = layerGroups[datasetId];
            if (enabled && !map.hasLayer(layerGroup)) {
                map.addLayer(layerGroup);
            }
            if (!enabled && map.hasLayer(layerGroup)) {
                map.removeLayer(layerGroup);
                if (selectedDataset === datasetId) {
                    _deselectLayer();
                }
            }
        });

    }

    function _featureClicked(e, feature, datasetId) {
        _.each(onSelects, function (callback) {
            callback(feature, loader.getDataset(datasetId));
        });
        _selectLayer(e.target, datasetId);
    }

    function _clusterClicked(e, datasetId) {
        var features = _.map(e.layer.getAllChildMarkers(), function (child) {
            var feature = _.clone(child.feature);
            feature.dataset = loader.getDataset(datasetId);
            return feature;
        });
        _.each(onSelects, function (callback) {
            callback(features, loader.getDataset(datasetId));
        });
        _selectLayer(e.layer, datasetId);
    }


    function _deselectLayer(silent) {
        if (selectedLayer && selectedDataset) {
            var dataset = loader.getDataset(selectedDataset);
            var styleFunc = Style(dataset.style);

            if (selectedLayer.getAllChildMarkers) {
                selectedLayer.setIcon(getClusterIcon(selectedLayer, styleFunc, false));
                selectedLayer.setZIndexOffset(0);
            } else if (selectedLayer.setIcon) {
                selectedLayer.setIcon(getIcon(selectedLayer.feature, styleFunc, false));
                selectedLayer.setZIndexOffset(0);
            } else if (selectedLayer.setStyle) {

            }
            if (!silent) {
                _.each(onDeSelects, function (callback) {
                    callback();
                });
            }
            selectedLayer = null;
            selectedDataset = null;
        }
    }

    function _selectLayer(layer, datasetId) {
        _deselectLayer(true);
        var dataset = loader.getDataset(datasetId);
        var styleFunc = Style(dataset.style);

        if (layer.getAllChildMarkers) {
            layer.setIcon(getClusterIcon(layer, styleFunc, true));
            layer.setZIndexOffset(1000);
        } else if (layer.setIcon) {
            layer.setIcon(getIcon(layer.feature, styleFunc, true));
            layer.setZIndexOffset(1000);
        } else if (layer.setStyle) {

        }
        selectedLayer = layer;
        selectedDataset = datasetId;
    }

    function _addData(datasetId, data) {
        var dataset = loader.getDataset(datasetId);
        if (!dataset) {
            console.error('did not find dataset', datasetId);
            return;
        }
        var styleFunc = Style(dataset.style);
        var layerGroup = layerGroups[datasetId];
        map.removeLayer(layerGroup);

        var layerGroup = L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                return getMarker(feature, latlng, styleFunc, false);
            },
            style: function (feature) {
                return {
                    fillColor: styleFunc.get('fillcolor', feature, false),
                    color: styleFunc.get('bordercolor', feature, false),
                    weight: styleFunc.get('weight', feature, false),
                    fillOpacity: styleFunc.get('fillOpacity', feature, false),
                    title: 'test'
                };
            },
            onEachFeature: function (feature, layer) {
                layer.datasetId = datasetId;
                layer.on('click', function (e) {
                    return _featureClicked(e, feature, datasetId);
                });
            }
        });

        if (dataset.cluster) {
            var markers = L.markerClusterGroup({
                zoomToBoundsOnClick: false,
                spiderfyOnMaxZoom: false,
                polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6},
                iconCreateFunction: function (cluster) {
                    return getClusterIcon(cluster, styleFunc, false);
                }
            });
            markers.addLayers(layerGroup.getLayers());
            map.addLayer(markers);
            markers.on('clusterclick', function (e) {
                return _clusterClicked(e, datasetId);
            });
            layerGroups[datasetId] = markers;
        } else {
            layerGroups[datasetId] = layerGroup;
            layerGroup.addTo(map);
        }
    }


    return {
        init: init,
        onSelect: function (callback) {
            onSelects.push(callback);
        },
        onDeSelect: function (callback) {
            onDeSelects.push(callback);
        }
    };
}