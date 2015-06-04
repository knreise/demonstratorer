
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
    requestWaterMask : true,
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
    });
}


function showSidebar() {
    $('#').show();

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
            minLon = coordinatePair[0]-1;
        } else if (coordinatePair[1] < minLat) {
            minLat = coordinatePair[1]-1;
        } else if (coordinatePair[0] > maxLon) {
            maxLon = coordinatePair[0]+1;
        } else if (coordinatePair[1] > minLat) {
            maxLat = coordinatePair[1]+1;
        }
    });
    var bbox = minLon + ',' + minLat + ','  + maxLon + ',' + maxLat;
    return bbox;
}

// getting kulturminner in areas
function loadFangstgroper(bbox) {
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
        limit: 6100,
        api: 'kulturminnedataSparql',
        fylke: '12'
    };

    
        api.getData(sparql, function (res) {
            console.log(res);
            
        var dataSource = Cesium.GeoJsonDataSource.load(res);
        viewer.dataSources.add(dataSource);
        viewer.zoomTo(dataSource);

        
        });

}
