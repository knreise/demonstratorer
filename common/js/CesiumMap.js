/*global Cesium:false, turf:false */
var KR = this.KR || {};

KR.CesiumMap = function (div, cesiumOptions, bounds) {
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
            version : '1.0.0',
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

    function addImagery(imageryLayerParams) {
        viewer.imageryLayers.addImageryProvider(getImageryProvider(imageryLayerParams));
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

    function addNorgeIBilder() {
        //var SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';
        var SKTokenUrl = 'http://knreise.no/nib/?type=token';

        KR.Util.sendRequest(SKTokenUrl, null, function (token) {

            if (token.indexOf('**') === 0) {
                addImagery({
                    url : 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?SERVICE=WMTS&REQUEST=GetTile&LAYER=matrikkel_bakgrunn&STYLE={Style}&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&FORMAT=image/png',
                    layer : 'matrikkel_bakgrunn',
                    tileMatrixSetID : 'EPSG:3857'
                });
            } else {
                var urlParams = {
                    SERVICE: 'WMTS',
                    REQUEST: 'GetTile',
                    LAYER: 'NiB',
                    STYLE: 'normal',
                    TILEMATRIXSET: 'EPSG:900913',
                    TILEMATRIX: 'EPSG:900913:{TileMatrix}',
                    TILEROW: '{TileRow}',
                    TILECOL: '{TileCol}',
                    FORMAT: 'image/jpeg',
                    GKT: token
                };
                var url = 'http://crossorigin.me/http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts';
                url = url + '?' + createQueryParams(urlParams);
                addImagery({
                    url : url,
                    layer : 'matrikkel_bakgrunn',
                    tileMatrixSetID : 'EPSG:3857'
                });
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
            //var pickedObject = viewer.scene.pick(movement.position);

            if (Cesium.defined(pickedObjects)) {

                //Update the collection of picked entities.
                pickedEntities.removeAll();
                //for (var i = 0; i < pickedObjects.length; ++i) {
                _.each(pickedObjects, function (pickedObj) {
                    var entity = pickedObj.id;
                    pickedEntities.add(entity);
                    callback(entity.properties);
                });

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
        getImageryProvider: getImageryProvider,
        viewer: viewer,
        addMarkers: addMarkers,
        addImagery: addImagery,
        build3DLine: build3DLine,
        addNorgeIBilder: addNorgeIBilder,
        addClickhandler: addClickhandler,
        loadDataset: loadDataset,
        stopLoading: stopLoading
    };
};


KR.CesiumUtils = {};
KR.CesiumUtils.getBounds = function (geojson) {
    'use strict';
    var enveloped = turf.envelope(geojson);
    var coords = enveloped.geometry.coordinates[0];
    return coords[0].concat(coords[2]).join(',');
};