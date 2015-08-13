/*global L:false, turf:false */

var KR = this.KR || {};

KR.setupCollectionMap = function (api, collectionName, layer) {
    'use strict';

    function _showCollection(collection) {

        console.log(collection);

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
