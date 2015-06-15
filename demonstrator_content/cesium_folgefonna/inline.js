var cesiumOptions = {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    orderIndependentTranslucency: false
};

var map = new KR.CesiumMap('cesium-viewer', cesiumOptions);

var viewer = map.viewer;
var scene = map.viewer.scene;
var globe = scene.globe;

// Depth test: If this isn't on, objects will be visible through the terrain.
globe.depthTestAgainstTerrain = true;

var $sidebar = $('#cesium-sidebar');
var $loader = $('.spinner-wrapper');


// Setting up API and retrieving the Folgefonna geojson
var api = new KR.API();

var tur = {
    api: 'utno',
    id: '2.8158',
    type: 'gpx'
};
var folgefonnaGeojson;

api.getData(tur, function (geojson) {
    folgefonnaGeojson = geojson;
    //addFolgefonna2D(folgefonnaGeojson);
    buildFolgefonna3D(folgefonnaGeojson);
    loadKulturminner(getBbox(folgefonnaGeojson));
    loadWikipedia(getBboxLimit(folgefonnaGeojson, 20));
});


var sparqlKulturminneTemplate = _.template($('#cesium_sparql_kulturminne_template').html());
var arcKulturminneTemplate = _.template($('#cesium_arc_kulturminne_template').html());
var wikipediaTemplate = _.template($('#cesium_wikipedia_template').html());

var folgefonna;
var handler;

function addFolgefonna2D(geojson) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var folgefonnaPos = _.map(coordinates, function (coordinatePair) {
        return Cesium.Cartesian3.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });

    viewer.entities.add({
        polyline: {
            positions: folgefonnaPos,
            width: 10.0,
            material: new Cesium.PolylineGlowMaterialProperty({
                color: Cesium.Color.DEEPSKYBLUE,
                glowPower: 0.25
            })
        }
    });
}

function buildFolgefonna3D(geojson) {

    var coordinates = geojson.features[0].geometry.coordinates;
    var folgefonnaPos = _.map(coordinates, function (coordinatePair) {
        return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });

    var promise = Cesium.sampleTerrain(viewer.terrainProvider, 14, folgefonnaPos);
    Cesium.when(promise, function (updatedPositions) {
        var heightCurve = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions);

        folgefonna = viewer.entities.add({
            polyline: {
                positions: heightCurve,
                width: 10.0,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.DEEPSKYBLUE,
                    glowPower: 0.25
                })
            }
        });
        viewer.zoomTo(folgefonna);
        stopLoading();
    });
}

function getHeightsForGeoJsonPoints(geojson, callback, zoomLevel, extraHeight) {
    var allCoordinates = [];
    if (!extraHeight) {
        extraHeight = 0;
    }
    _.each(geojson.features, function (feature) {
        var fgeom = feature.geometry.coordinates;
        allCoordinates.push(new Cesium.Cartographic.fromDegrees(fgeom[0], fgeom[1]));
    });

    var promise = Cesium.sampleTerrain(viewer.terrainProvider, zoomLevel = 14, allCoordinates);
    Cesium.when(promise, function (updatedPositions) {
        var allCoordinatesHeight = updatedPositions;
        _.each(geojson.features, function (feature, count) {
            var newCoor = allCoordinatesHeight[count];
            feature.geometry.coordinates = [Cesium.Math.toDegrees(newCoor.longitude), Cesium.Math.toDegrees(newCoor.latitude), newCoor.height + extraHeight ];
        });
        callback(geojson);
    });
}



function getBboxLimit(geojson, limit) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var minLat, minLon, maxLat, maxLon;
    minLon = coordinates[0][0];
    minLat = coordinates[0][1];
    maxLon = coordinates[0][0];
    maxLat = coordinates[0][1];
    _.each(coordinates, function (coordinatePair) {
        if (coordinatePair[0] < minLon) {
            minLon = coordinatePair[0] - 0.05;
        } else if (coordinatePair[1] < minLat) {
            minLat = coordinatePair[1] - 0.05;
        } else if (coordinatePair[0] > maxLon) {
            maxLon = coordinatePair[0] + 0.05;
        } else if (coordinatePair[1] > minLat) {
            maxLat = coordinatePair[1] + 0.05;
        }
    });

    var bbox = minLon + ',' + minLat + ','  + maxLon + ',' + maxLat;
    return bbox;
}



function getBbox(geojson) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var minLat, minLon, maxLat, maxLon;
    minLon = coordinates[0][0];
    minLat = coordinates[0][1];
    maxLon = coordinates[0][0];
    maxLat = coordinates[0][1];
    _.each(coordinates, function (coordinatePair) {
        if (coordinatePair[0] < minLon) {
            minLon = coordinatePair[0] - 0.05;
        } else if (coordinatePair[1] < minLat) {
            minLat = coordinatePair[1] - 0.05;
        } else if (coordinatePair[0] > maxLon) {
            maxLon = coordinatePair[0] + 0.05;
        } else if (coordinatePair[1] > minLat) {
            maxLat = coordinatePair[1] + 0.05;
        }
    });
    var bbox = minLon + ',' + minLat + ','  + maxLon + ',' + maxLat;
    return bbox;
}


// getting kulturminner in areas
function loadKulturminner(bbox) {
    var fangstgroper = {
        api: 'kulturminnedata',
        layer: 0
    };
    
    api.getBbox(fangstgroper, bbox, function (res) {
        getHeightsForGeoJsonPoints(res, function (data) {
            var dataSource = Cesium.GeoJsonDataSource.load(data);
            viewer.dataSources.add(dataSource);
        });
    });
    sethandler();
}


function loadWikipedia(bbox) {
    var wikipedia = {
        api: 'wikipedia'
    };

    api.getBbox(wikipedia, bbox, function (res) {
        getHeightsForGeoJsonPoints(res, function (data) {
            var dataSource = Cesium.GeoJsonDataSource.load(data);
            viewer.dataSources.add(dataSource);
        });
    });
}


function sethandler() {
    var pickedEntities = new Cesium.EntityCollection();
    
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function(movement) {
        console.log(movement);
        // get an array of all primitives at the mouse position
        var pickedObjects = scene.drillPick(movement.position);
        var pickedObject = scene.pick(movement.position);
         
        if (Cesium.defined(pickedObjects)) {
            //Update the collection of picked entities.
            pickedEntities.removeAll();
            for (var i = 0; i < pickedObjects.length; ++i) {
                var entity = pickedObjects[i].id;
                pickedEntities.add(entity);
                console.log(entity);
                show(entity.properties);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function show(properties) {
    $sidebar.show('slide', {direction: 'left'}, 100);
    if (properties.dataset == 'Wikipedia') {
        $('.cesium-sidebar-body').html($(wikipediaTemplate(properties)));
    } else {
        $('.cesium-sidebar-body').html($(arcKulturminneTemplate(properties)));
    }
}

function stopLoading() {
    $loader.delay(2000).fadeOut({duration: 200});
}

function close() {
    $sidebar.hide('slide', {direction: 'left'}, 100);
}

$('.close-sidebar').on('click', function(e) {
    console.log('close');
    close();
});
