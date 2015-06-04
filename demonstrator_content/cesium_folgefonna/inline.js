
// config object removing timeline and other elements that are on by default
var config = {
    cesiumViewerOpts : {
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
    }
}

var viewer = new Cesium.Viewer('cesium', config.cesiumViewerOpts);
    

// Add the terrain provider (AGI)
var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world',
    requestVertexNormals : true
});
viewer.terrainProvider = cesiumTerrainProvider;


// Add kartverket WMTS
var kartverketTopo2 = new Cesium.WebMapTileServiceImageryProvider({
    url : 'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?SERVICE=WMTS&REQUEST=GetTile&LAYER=matrikkel_bakgrunn&STYLE={Style}&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&FORMAT=image/png',
    layer : 'matrikkel_bakgrunn',
    style : 'default',
    version : "1.0.0",
    format : 'image/png',
    tileMatrixSetID : 'EPSG:3857',
    maximumLevel: 19
});
//viewer.imageryLayers.addImageryProvider(kartverketTopo2);


var scene = viewer.scene;
var globe = scene.globe;

// Depth test: If this isn't on, objects will be visible through the terrain.
globe.depthTestAgainstTerrain = true;


var $sidebar = $('#sidebar');
var $loader = $('.spinner-wrapper');

    
// Setting up API and retrieving the Folgefonna geojson
var api = new KR.API();4

var tur = {
    api: 'utno',
    id: '2.8158',
    type: 'gpx'
};
var folgefonnaGeojson;

api.getData(tur, function (res) {
    folgefonnaGeojson = res;
    
    //addFolgefonna2D(folgefonnaGeojson);
    buildFolgefonna3D(folgefonnaGeojson);
    
    loadFangstgroper( getBbox(folgefonnaGeojson));
});



// Adding folgefonna to Cesium

var sparqlKulturminneTemplate = _.template($('#cesium_sparql_kulturminne_template').html());
var arcKulturminneTemplate = _.template($('#cesium_arc_kulturminne_template').html());
var folgefonna;

function addFolgefonna2D(geojson) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var folgefonnaPos = _.map(coordinates, function(coordinatePair) {
        return Cesium.Cartesian3.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });
    
    viewer.entities.add({
        polyline : {
            positions : folgefonnaPos,
            width : 10.0,
            material : new Cesium.PolylineGlowMaterialProperty({
                color : Cesium.Color.DEEPSKYBLUE,
                glowPower : 0.25
            })
        }
    });
    
}

function buildFolgefonna3D(geojson) {
    
    var coordinates = geojson.features[0].geometry.coordinates;
    var folgefonnaPos = _.map(coordinates, function(coordinatePair) {
        return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });
    
    var promise = Cesium.sampleTerrain(cesiumTerrainProvider, 14, folgefonnaPos);
    Cesium.when(promise, function(updatedPositions) {
        var heightCurve = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions);

        folgefonna = viewer.entities.add({
            polyline : {
                positions : heightCurve,
                width : 10.0,
                material : new Cesium.PolylineGlowMaterialProperty({
                    color : Cesium.Color.BLUE,
                    glowPower : 0.25
                })
            }
        });
        viewer.zoomTo(folgefonna);
        stopLoading();
        
    });
}


function showSidebar() {
    $sidebar.show();

}

function stopLoading() {    
    console.log('hide');
    $loader.delay(3000).fadeOut({duration: 5000});    
}



function getBbox(geojson) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var minLat, minLon, maxLat, maxLon;
    minLon = coordinates[0][0];
    minLat = coordinates[0][1];
    maxLon = coordinates[0][0];
    maxLat = coordinates[0][1];
    _.each(coordinates, function(coordinatePair) {
        if (coordinatePair[0] < minLon) {
            minLon = coordinatePair[0]-0.2;
        } else if (coordinatePair[1] < minLat) {
            minLat = coordinatePair[1]-0.2;
        } else if (coordinatePair[0] > maxLon) {
            maxLon = coordinatePair[0]+0.2;
        } else if (coordinatePair[1] > minLat) {
            maxLat = coordinatePair[1]+0.2;
        }
    });
    var bbox = minLon + ',' + minLat + ','  + maxLon + ',' + maxLat;
    return bbox;
}


function loadKulturminner(bbox) {
    

    var kulturminner = {
        api: 'kulturminnedata',
        layer: 0
    };

        api.getBbox(kulturminner, bbox, function (res) {
            

        });

    
    
    var folgefonnaPos = _.map(coordinates, function(coordinatePair) {
        return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });
    
    var promise = Cesium.sampleTerrain(cesiumTerrainProvider, 14, folgefonnaPos);
    Cesium.when(promise, function(updatedPositions) {
        var heightCurve = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions);

        folgefonna = viewer.entities.add({
            polyline : {
                positions : heightCurve,
                width : 10.0,
                material : new Cesium.PolylineGlowMaterialProperty({
                    color : Cesium.Color.BLUE,
                    glowPower : 0.25
                })
            }
        });
        
        
        console.log(folgefonna);
    });
    
}
/*
function addHeightsToFeatureCollection(geojson, callback) {
        _.map(geojson.features, function(feature) {
            
            console.log(feature);
            
            var featureCoordinates = _.map(feature.coordinates, function(coordinatePair) {
                return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
            });
            
            var promise = Cesium.sampleTerrain(cesiumTerrainProvider, 14, folgefonnaPos);
            
            Cesium.when(promise, function(updatedPositions) {
                var heightCurve = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions);

                folgefonna = viewer.entities.add({
                    polyline : {
                        positions : heightCurve,
                        width : 10.0,
                        material : new Cesium.PolylineGlowMaterialProperty({
                            color : Cesium.Color.BLUE,
                            glowPower : 0.25
                        })
                    }
                });
                viewer.zoomTo(folgefonna);
            });
            
        }
        
        
        
}

*/

// getting kulturminner in areas
function loadFangstgroper(bbox) {
    var fangstgroper = {
        api: 'kulturminnedata',
        layer: 0
    };

        api.getBbox(fangstgroper, bbox, function (res) {
                
            console.log(res);
            
                            
            
            var dataSource = Cesium.GeoJsonDataSource.load(res);
            viewer.dataSources.add(dataSource);
            
            

        });


    sethandler();




    /*
    
        console.log('load');
    var norvegiana_kulturminnesok = {
        api: 'norvegiana',
        dataset: 'Kulturminnesøk'
    };
    
    api.getBbox(norvegiana_kulturminnesok, bbox, function (res) {
       console.log(res);
        var dataSource = Cesium.GeoJsonDataSource.load(res);
        viewer.dataSources.add(dataSource);
        viewer.zoomTo(dataSource);

    });
    
    
    var sparql = {
        limit: 100,
        api: 'kulturminnedataSparql',
        fylke: '12'
    };

    
        api.getData(sparql, function (res) {
            console.log(res);
            
        var dataSource = Cesium.GeoJsonDataSource.load(res);
        viewer.dataSources.add(dataSource);
        viewer.zoomTo(dataSource);

        sethandler();
        
        });
*/
}



var handler;

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
                show(entity.properties);
                console.log(folgefonna);
                console.log(entity.properties);
            }
        }
        
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}



function show(properties) {
    $('#sidebar').show();
    console.log(properties);
    $('#sidebar').html($(arcKulturminneTemplate(properties)));
    
}
