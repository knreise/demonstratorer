import * as _ from 'underscore';
import L from 'leaflet';

import Style from './Style';
import getMarker from './getMarker';

export default function LayerManager(map, loader, onclick) {

    var layerGroups = {};


    function init() {
        loader.onDataLoadEnd(_dataLoaded);

        loader.onEnabledChange(_toggleEnabled);

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
            console.log('err', datasetId);
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
            }
        });

    }

    function _featureClicked(e, feature, datasetId) {
        console.log('click', e, feature, datasetId);
        onclick(feature, loader.getDataset(datasetId));
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
        layerGroups[datasetId] = L.geoJson(data, {
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
                    layer.on('click', function (e) {
                        return _featureClicked(e, feature, datasetId);
                    });
                }
            })
            .addTo(map);
    }


    return {
        init: init
    };
}