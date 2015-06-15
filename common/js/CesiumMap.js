/*global Cesium:false */
var KR = this.KR || {};

KR.CesiumMap = function (div, cesiumOptions) {
    'use strict';

    var config = {
        cesiumViewerOpts: _.extend({
            timeline: false,
            baseLayerPicker: false,
            geocoder: false,
            infoBox: false,
            animation: false,
            orderIndependentTranslucency: false
        }, cesiumOptions || {})
    };

    var viewer;

    function _getTerrainProvider() {
        return new Cesium.CesiumTerrainProvider({
            url : '//assets.agi.com/stk-terrain/world',
            requestVertexNormals : true,
            requestWaterMask: false
        });
    }

    function getImageryProvider(mapOptions) {
        return new Cesium.WebMapTileServiceImageryProvider(_.extend({
            style : 'default',
            version : "1.0.0",
            format : 'image/png',
            maximumLevel: 19
        }, mapOptions));
    }

    function init() {
        viewer = new Cesium.Viewer(div, config.cesiumViewerOpts);

        var scene = viewer.scene;
        var globe = scene.globe;

        // Will use local time to estimate actual daylight 
        globe.enableLighting = true;

        // Depth test: If this isn't on, objects will be visible through the terrain.
        globe.depthTestAgainstTerrain = true;

        // Add the terrain provider (AGI)
        viewer.terrainProvider = _getTerrainProvider();
    }

    function addImagery(imageryLayerParams) {
        viewer.imageryLayers.addImageryProvider(getImageryProvider(imageryLayerParams));
    }

    function addMarkers(markers) {
        return _.map(markers, function (marker) {
            var cmarker =  {
                position: Cesium.Cartesian3.fromDegrees(marker.pos.lng, marker.pos.lat, 80),
                billboard: {
                    image: marker.icon,
                    show: true, // default
                    heightReference: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scale: 1
                },
                label: {
                    text: marker.text,
                    font: '14pt monospace',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 32)
                }
            };
            viewer.entities.add(cmarker);
            return cmarker;
        });
    }

    init();

    return {
        getImageryProvider: getImageryProvider,
        viewer: viewer,
        addMarkers: addMarkers,
        addImagery: addImagery
    };
};
