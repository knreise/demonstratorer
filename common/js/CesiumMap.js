/*global Cesium:false, turf:false */
var KR = this.KR || {};

KR.CesiumMap = function (div, cesiumOptions, bounds) {
    'use strict';
    Cesium.BingMapsApi.defaultKey = '';
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

        if (bounds) {
            bounds = KR.Util.splitBbox(bounds);
            var ellipsoid = Cesium.Ellipsoid.WGS84;
            var extent = new Cesium.Rectangle(
                Cesium.Math.toRadians(bounds[0]),
                Cesium.Math.toRadians(bounds[1]),
                Cesium.Math.toRadians(bounds[2]),
                Cesium.Math.toRadians(bounds[3])
            );
            scene.camera.viewRectangle(extent, ellipsoid);
        }
    }

    function build3DLine(geojson, callback) {

        var coordinates = geojson.features[0].geometry.coordinates;

        var positions = _.map(coordinates, function (coordinatePair) {
            return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
        });

        var promise = Cesium.sampleTerrain(viewer.terrainProvider, 14, positions);
        Cesium.when(promise, function (updatedPositions) {
            callback(Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions));
        });
    }

    function createQueryParams(params) {
        return _.map(params, function (value, key) {
            return key + '=' + value;
        }).join('&');
    }

    function getTiles(url) {
        return new Cesium.UrlTemplateImageryProvider({
            url : url
        });
    }

    function _createWmtsParams(url, layer, params) {
        var urlParams = {
            SERVICE: 'WMTS',
            REQUEST: 'GetTile',
            TILEROW: '{TileRow}',
            TILECOL: '{TileCol}',
            STYLE: '{Style}',
            LAYER: layer
        };

        return {
            url: url + '?' + createQueryParams(_.extend({}, urlParams, params || {})),
            layer: '',
            tileMatrixSetID : ''
        };
    }

    function getWmts(url, layer, params) {

        var defaultParams = {
            style : 'default',
            version : '1.0.0',
            format : 'image/png',
            maximumLevel: 19
        };

        return new Cesium.WebMapTileServiceImageryProvider(
            _.extend({}, defaultParams, _createWmtsParams(url, layer, params))
        );
    }

    function getWms(url, layer) {
        return new Cesium.WebMapServiceImageryProvider({
            url : url,
            layers: layer,
            parameters: {
                service: "WMS",
                version: "1.1.1",
                request: "GetMap",
                styles: "",
                format: "image/png",
                transparent: true
            }
        });
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

    function _getHeightsForGeoJsonPoints(geojson, callback, zoomLevel, extraHeight) {
        zoomLevel = zoomLevel || 14;
        var allCoordinates = [];
        if (!extraHeight) {
            extraHeight = 0;
        }
        _.each(geojson.features, function (feature) {
            var fgeom = feature.geometry.coordinates;
            allCoordinates.push(new Cesium.Cartographic.fromDegrees(fgeom[0], fgeom[1]));
        });

        var promise = Cesium.sampleTerrain(
            viewer.terrainProvider,
            zoomLevel,
            allCoordinates
        );
        Cesium.when(promise, function (updatedPositions) {
            var allCoordinatesHeight = updatedPositions;
            _.each(geojson.features, function (feature, count) {
                var newCoor = allCoordinatesHeight[count];
                feature.geometry.coordinates = [
                    Cesium.Math.toDegrees(newCoor.longitude),
                    Cesium.Math.toDegrees(newCoor.latitude),
                    newCoor.height + extraHeight
                ];
            });
            callback(geojson);
        });
    }


    function addClickhandler(callback) {
        var pickedEntities = new Cesium.EntityCollection();

        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (movement) {

            // get an array of all primitives at the mouse position
            var pickedObjects = viewer.scene.drillPick(movement.position);
            if (Cesium.defined(pickedObjects)) {

                //Update the collection of picked entities.
                pickedEntities.removeAll();
                var objects = _.map(pickedObjects, function (pickedObj) {
                    var entity = pickedObj.id;
                    pickedEntities.add(entity);
                    return entity.properties;
                });
                callback(objects);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    function loadDataset(dataset, bbox, api, callback) {
        api.getBbox(dataset, bbox, function (res) {
            _getHeightsForGeoJsonPoints(res, function (data) {
                var dataSource = Cesium.GeoJsonDataSource.load(data);
                callback(dataSource);
            });
        });
    }

    function stopLoading() {
        $('.spinner-wrapper').delay(2000).fadeOut({duration: 200});
    }

    init();

    return {
        viewer: viewer,
        addMarkers: addMarkers,
        build3DLine: build3DLine,
        addClickhandler: addClickhandler,
        loadDataset: loadDataset,
        stopLoading: stopLoading,
        getTiles: getTiles,
        getWmts: getWmts,
        getWms: getWms,
        addImageryProvider: function (provider) {
            viewer.imageryLayers.addImageryProvider(provider);
        }
    };
};


KR.CesiumUtils = {};
KR.CesiumUtils.getBounds = function (geojson) {
    'use strict';
    var enveloped = turf.envelope(geojson);
    var coords = enveloped.geometry.coordinates[0];
    return coords[0].concat(coords[2]).join(',');
};