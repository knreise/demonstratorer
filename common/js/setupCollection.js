/*global L:false, turf:false */

var KR = this.KR || {};

KR.setupCollectionMap = function (api, collectionName, layer) {
    'use strict';

    var templates = {
        'Digitalt fortalt': KR.Util.getDatasetTemplate('digitalt_fortalt'),
        'DigitaltMuseum': KR.Util.getDatasetTemplate('digitalt_museum'),
        'Musit': KR.Util.getDatasetTemplate('musit'),
        'Artsdatabanken': KR.Util.getDatasetTemplate('popup')
    };

    function _showCollection(collection) {

        var map = KR.Util.createMap('map', {layer: layer});
        KR.SplashScreen(
            map,
            collection.title,
            collection.description,
            collection.image,
            collection.creator
        );
        $('title').append(collection.title);

        var bounds = L.latLngBounds.fromBBoxArray(turf.extent(collection.geo_json));

        _.each(collection.geo_json.features, function (feature) {
            feature.properties.datasetId = feature.properties.provider;
            if (_.has(templates, feature.properties.provider)) {
                feature.template = templates[feature.properties.provider];
            }
        });

        var sidebar = KR.Util.setupSidebar(map);

        var _addClusterClick = KR.Util.clusterClick(sidebar);
        var _addFeatureClick = KR.Util.featureClick(sidebar);

        L.Knreise.LocateButton(null, null, {bounds: bounds}).addTo(map);
        map.fitBounds(bounds);

        var featureLayer = L.Knreise.geoJson(collection.geo_json, {
            onEachFeature: function (feature, layer) {
                _addFeatureClick(feature, layer);
            }
        });

        var clusterLayer = new L.Knreise.MarkerClusterGroup().addTo(map);
        clusterLayer.addLayers(featureLayer.getLayers());
        _addClusterClick(clusterLayer);
    }

    api.getCollection(collectionName, _showCollection);
};
