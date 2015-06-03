
// config object removing timeline and other elements that are on by default
var config = {
    cesiumViewerOpts : {
        timeline: false, 
        baseLayerPicker: false, 
        geocoder : false, 
        infoBox: false, 
        animation: false,
        orderIndependentTranslucency: false
    }
}

var viewer = new Cesium.Viewer('cesium', config.cesiumViewerOpts);
    
    
    
// Setting up API and retrieving the Folgefonna 

var api = new KR.API();

var tur = {
    api: 'utno',
    id: '2.8158',
    type: 'gpx'
};
var folgefonnaCoords;

api.getData(tur, function (res) {
    console.log(res);
    buildFolgefonna(res);
});


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


viewer.terrainProvider = cesiumTerrainProvider;
//viewer.imageryLayers.addImageryProvider(kartverketTopo2);


function buildFolgefonna(geojson) {
    var coordinates = geojson.features[0].geometry.coordinates;
    var folgefonnaPos = _.map(coordinates, function(coordinatePair) {
        return Cesium.Cartesian3.fromDegrees(coordinatePair[0], coordinatePair[1]);
    });
    console.log(folgefonnaPos);
    //folgefonnaCoords = _.flatten(geojson.features[0].geometry.coordiantes);
       
   /*
    var stripeMaterial = new Cesium.StripeMaterialProperty({
        evenColor : Cesium.Color.WHITE.withAlpha(0.5),
        oddColor : Cesium.Color.BLUE.withAlpha(0.5),
        repeat : 5.0
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

    
    
    var promise = Cesium.sampleTerrain(cesiumTerrainProvider, 11, folgefonnaPos);
    Cesium.when(promise, function(updatedPositions) {
        
        var positions = [];
        _.each(updatedPositions, function(coordinate) {
            positions.push(coordinate.longitude);
            positions.push(coordinate.latitude);
            positions.push(coordinate.height);
        });
        
        console.log(positions);
        

    });
    
    
    
    */
    
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

    
        var polyline = new Cesium.SimplePolylineGeometry({
          positions : folgefonnaPos
        });
        
}

var entities = viewer.entities;

var i;
var height;
var positions;
var stripeMaterial = new Cesium.StripeMaterialProperty({
    evenColor : Cesium.Color.WHITE.withAlpha(0.5),
    oddColor : Cesium.Color.BLUE.withAlpha(0.5),
    repeat : 5.0
});

positions = [];
for (i = 0; i < 40; ++i) {
    positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 15.0));
}
console.log(positions);
entities.add({
    polyline : {
        positions : positions,
        width : 10.0,
        material : new Cesium.PolylineGlowMaterialProperty({
            color : Cesium.Color.DEEPSKYBLUE,
            glowPower : 0.25
        })
    }
});


    