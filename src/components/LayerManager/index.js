import * as _ from 'underscore';
import L from 'leaflet';
import 'leaflet.markercluster';
import centroid from '@turf/centroid';

import Style from './Style';
import {getIcon, getMarker, getClusterIcon, getLeafletStyleFunction} from './getMarker';

function getPixelSize(map, bounds) {

    var swLL = bounds.getSouthWest();
    var nwLL = bounds.getNorthWest();
    var seLL = bounds.getSouthEast();

    var swP = map.project(swLL);
    var nwP = map.project(nwLL);
    var seP = map.project(seLL);

    var height = swP.distanceTo(nwP);
    var width = swP.distanceTo(seP);

    return _.min([height, width]);
}


export default function LayerManager(map, loader) {

    var currentZoom = map.getZoom();

    map.on('zoomend', _mapZoomed);

    var selectedLayer = null;
    var selectedDataset = null;
    var layerGroups = {};
    var polygonToPoints = [];

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

        polygonToPoints = _.chain(loader.getDatasets())
            .filter(function (dataset) {
                return dataset.polygonsAsPoints;
            })
            .map(function (dataset) {
                return dataset._id;
            })
            .value();
    }

    function _mapZoomed() {
        var newZoom = map.getZoom();
        if (newZoom === currentZoom) {
            return;
        }
        currentZoom = newZoom;
        _.each(polygonToPoints, function (datasetId) {
            var dataset = loader.getDataset(datasetId);
            if (dataset.cluster && dataset.commonCluster) {
                var layers = _getLayersFromCommonCluster(dataset);
                _updateInCommonCluster(dataset, _polygonToPoints(layers, dataset));
            } else {
                var layer = layerGroups[datasetId];
                var newLayerGroup = _polygonToPoints(layer, dataset);
                if (dataset.cluster) {
                    _updateSingleCluser(dataset, newLayerGroup);
                } else {
                    _updateUnclustered(dataset, newLayerGroup);
                }
            }
        });
    }

    function _polygonToPoints(layerGroup, dataset) {
        var layers = _.isArray(layerGroup)
            ? layerGroup
            : layerGroup.getLayers();

        var newLayerGroup = _geoJsonLayer(null, dataset);

        var newLayers = _.map(layers, function (layer) {

            var bounds = L.geoJson(layer.originalFeature).getBounds();
            if (currentZoom >= dataset.polygonsAsPointsZoomThreshold || getPixelSize(map, bounds) > dataset.polygonsAsPointsPixelThreshold) {
                var polygonLayer = _geoJsonLayer(layer.originalFeature, dataset).getLayers()[0];
                polygonLayer.originalFeature = layer.originalFeature;
                return polygonLayer;
            }

            var center = centroid(layer.originalFeature);
            center.properties = _.clone(layer.originalFeature.properties);
            var centerLayer = _geoJsonLayer(center, dataset).getLayers()[0];
            centerLayer.originalFeature = layer.originalFeature;
            return centerLayer;
        });
        newLayerGroup._layers = newLayers;
        return newLayerGroup;
    }

    function _getParent(datasetId) {
        var parentId = _.findKey(loader.datasetIdMapping, function (children) {
            return children.indexOf(datasetId) !== -1;
        });
        return parentId;
    }

    function _dataLoaded(error, datasetId, data) {
        if (!error) {
            _addData(datasetId, data);
        } else {
            //pass
        }
    }


    function _toggleLayer(layerId, enabled) {
        var layerGroup = layerGroups[layerId];
        if (enabled && !map.hasLayer(layerGroup)) {
            map.addLayer(layerGroup);
        }
        if (!enabled && map.hasLayer(layerGroup)) {
            map.removeLayer(layerGroup);
            if (selectedDataset === layerId) {
                _deselectLayer();
            }
        }
    }

    function _toggleEnabled(datasetId, enabled) {

        if (_.has(layerGroups, datasetId)) {
            _toggleLayer(datasetId, enabled);
            return;
        }

        _.each(loader.datasetIdMapping[datasetId], function (datasetId) {
            _toggleLayer(datasetId, enabled);
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
                selectedLayer.setStyle(getLeafletStyleFunction(styleFunc, false)(selectedLayer.feature));
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
            layer.setStyle(getLeafletStyleFunction(styleFunc, true)(layer.feature));
        }
        selectedLayer = layer;
        selectedDataset = datasetId;
    }

    function _getClusterLayer(dataset) {
        var styleFunc = Style(dataset.style);
        return L.markerClusterGroup({
            zoomToBoundsOnClick: false,
            spiderfyOnMaxZoom: false,
            polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6},
            iconCreateFunction: function (cluster) {
                return getClusterIcon(cluster, styleFunc, false);
            }
        });
    }

    function _updateUnclustered(dataset, newLayerGroup) {
        var layerGroup = layerGroups[dataset._id];
        map.removeLayer(layerGroup);
        layerGroups[dataset._id] = newLayerGroup;
        newLayerGroup.addTo(map);
    }

    function _updateSingleCluser(dataset, newLayerGroup) {
        var clusterLayer = _getClusterLayer(dataset);
        var layerGroup = layerGroups[dataset._id];
        map.removeLayer(layerGroup);
        clusterLayer.addLayers(newLayerGroup.getLayers());
        map.addLayer(clusterLayer);
        clusterLayer.on('clusterclick', function (e) {
            return _clusterClicked(e, dataset._id);
        });
        layerGroups[dataset._id] = clusterLayer;
    }

    function _createCommonCluster(parent) {
        if (!_.has(layerGroups, parent._id)) {
            var commonClusterLayer = _getClusterLayer(parent);
            map.addLayer(commonClusterLayer);
            commonClusterLayer.on('clusterclick', function (e) {
                return _clusterClicked(e, parent._id);
            });
            layerGroups[parent._id] = commonClusterLayer;
        }
    }

    function _getLayersFromCommonCluster(dataset) {
        var clusterLayer = layerGroups[_getParent(dataset._id)];
        var prevLayers = [];
        clusterLayer.eachLayer(function (layer) {
            if (layer.feature.dataset._id === dataset._id) {
                prevLayers.push(layer);
            }
        });
        return prevLayers;
    }

    function _updateInCommonCluster(dataset, newLayerGroup) {
        var clusterLayer = layerGroups[_getParent(dataset._id)];
        var prevLayers = _getLayersFromCommonCluster(dataset);
        clusterLayer.removeLayers(prevLayers);
        var newLayers = newLayerGroup.getLayers();
        //console.log(dataset._id, 'add', newLayers.length);
        clusterLayer.addLayers(newLayers);
    }

    function _addClusteredData(dataset, data) {
        var parentId = _getParent(dataset._id);
        var commonCluster = false;
        if (parentId !== dataset._id) {
            var parent = loader.getDataset(parentId);
            commonCluster = !!parent.commonCluster;
        }
        var newLayerGroup = _createGeoJsonLayer(data, dataset);
        if (commonCluster) {
            _createCommonCluster(parent);
            console.log('update', dataset._id);
            _updateInCommonCluster(dataset, newLayerGroup);
        } else {
            _updateSingleCluser(dataset, newLayerGroup);
        }
    }

    function _geoJsonLayer(data, dataset) {
        var styleFunc = Style(dataset.style);
        return L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                return getMarker(feature, latlng, styleFunc, false);
            },
            style: getLeafletStyleFunction(styleFunc, false),
            onEachFeature: function (feature, layer) {
                layer.feature.dataset = dataset;
                layer.on('click', function (e) {
                    return _featureClicked(e, feature, dataset._id);
                });
            }
        });
    }

    function _createGeoJsonLayer(data, dataset) {
        var layer = _geoJsonLayer(data, dataset);
        if (dataset.polygonsAsPoints) {
            layer.eachLayer(function (layer) {
                layer.originalFeature = layer.feature;
            });
            return _polygonToPoints(layer, dataset);
        }
        return layer;
    }

    function _addData(datasetId, data) {
        var dataset = loader.getDataset(datasetId);

        if (!dataset) {
            console.error('did not find dataset', datasetId);
            return;
        }

        if (dataset.cluster) {
            _addClusteredData(dataset, data);
        } else {
            var newLayerGroup = _createGeoJsonLayer(data, dataset);
            _updateUnclustered(dataset, newLayerGroup);
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