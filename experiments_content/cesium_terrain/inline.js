
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

var viewer = new Cesium.Viewer('cesium-viewer', config.cesiumViewerOpts);
    


var $sidebar = $('#cesium-sidebar');
var $loader = $('.spinner-wrapper');
var $loadTerrain =  $('#load-terrain');

// Add the terrain provider (AGI)
var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world',
    requestVertexNormals : true
});
viewer.terrainProvider = cesiumTerrainProvider;
//viewer.scene.imageryLayers.removeAll();

function stopLoading() {    
    $loader.delay(2000).fadeOut({duration: 200});    
}

$loadTerrain.on('click', function(event) {
    

    // Add the terrain provider (AGI)
    var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
        //url : 'http://localhost:8006/terrtiles'
        url: 'http://knreise.no/terrain/terrain.php?tile='
        //url: 'http://knreise.no/terrain/terrain.php?tile='
    });
    viewer.terrainProvider = cesiumTerrainProvider;
});





stopLoading();
