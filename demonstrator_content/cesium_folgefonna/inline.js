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

var sidebar = KR.CesiumSidebar($('#cesium-sidebar'), {
    wikipediaTemplate: _.template($('#cesium_wikipedia_template').html()),
    arcKulturminneTemplate: _.template($('#cesium_arc_kulturminne_template').html()),
    sparqlKulturminneTemplate: _.template($('#cesium_sparql_kulturminne_template').html())
});

var datasets = [
    {
        api: 'kulturminnedata',
        layer: 0
    },
    {
        api: 'wikipedia'
    }
];

var tur = {
    api: 'utno',
    id: '2.8158',
    type: 'gpx'
};


// Setting up API and retrieving the Folgefonna geojson
var api = new KR.API();

api.getData(tur, function (geojson) {
    var bbox = KR.CesiumUtils.getBounds(geojson);
    var map = new KR.CesiumMap(
        'cesium-viewer',
        cesiumOptions,
        bbox
    );
    map.viewer.scene.imageryLayers.removeAll();
    map.addNorgeIBilder();
    map.build3DLine(geojson, function (heightCurve) {
        var folgefonna = map.viewer.entities.add({
            polyline: {
                positions: heightCurve,
                width: 10.0,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.DEEPSKYBLUE,
                    glowPower: 0.25
                })
            }
        });

        map.viewer.zoomTo(folgefonna);

        _.each(datasets, function (dataset) {
            map.loadDataset(dataset, bbox, api, function (res) {
                map.viewer.dataSources.add(res);
            });
        });

        map.stopLoading();
        map.addClickhandler(sidebar.show);
    });
});
