

var viewer = new Cesium.Viewer('cesium', {timeline: false, baseLayerPicker: false, geocoder : false, infoBox: false, animation: false} );
    
var stryn = viewer.entities.add({
  name : 'Stryn',
  polygon : {
    hierarchy : Cesium.Cartesian3.fromDegreesArray([
      6.86339933569173,61.9377705837496,
      6.86064458723271,61.9406402731954,
      6.8571895811401,61.9441772873158,
      6.86087979967812,61.9447979617182,
      6.86344624795662,61.9423909615729,
      6.86447518088584,61.942406380056]),
    material : Cesium.Color.RED.withAlpha(0.5),
    outline : true,
    outlineColor : Cesium.Color.BLACK
  }
});
 
viewer.zoomTo(stryn);


// Add the terrain provider (AGI)
var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world',
    requestWaterMask : true,
    requestVertexNormals : true
});
viewer.terrainProvider = cesiumTerrainProviderMeshes;


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

viewer.imageryLayers.addImageryProvider(kartverketTopo2);

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

var dataset = {
    api: 'norvegiana',
    dataset: 'Kulturminnesok'
};

api.getData(dataset, function(e) {
    console.log(e); 
    }, function(e) {
    console.log(e); 
    },{}
    
    );

    
    

    