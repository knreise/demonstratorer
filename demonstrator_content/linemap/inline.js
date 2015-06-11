


function filterByBbox (features, bbox) {
    var boundPoly = turf.featurecollection([turf.bboxPolygon(KR.Util.splitBbox(bbox))]);
    return turf.within(features, boundPoly);
}


var map = L.map('map', {
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomControl: false
});

L.tileLayer.kartverket('topo2graatone').addTo(map);


//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

var datasets = [
    {
        api: 'norvegiana',
        dataset: 'difo'
    },
    {
        api: 'norvegiana',
        dataset: 'MUSIT'
    }
];

var previewStrip = new KR.PreviewStrip(
    $('#strip'),
    map,
    null,
    null,
    null,
    {
        panOnClick: false,
        minimal: true
    }
);

var footerTemplate = _.template($('#footer_template').html());


KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Musit': _.template($('#musit_template').html())
};

var sidebar = new L.Knreise.Control.sidebar('sidebar', {
    autoPan: false,
    footerTemplate: footerTemplate
});

map.addControl(sidebar);

var markerLayer = L.Knreise.geoJson().addTo(map);

markerLayer.on('click', function (e) {
    var feature = e.layer.feature;
    sidebar.showFeature(feature);
});

var marker;


var circleStyle = {stroke: false, fillColor: '#f00', radius: 10, fillOpacity: 0.8};
function moved(position) {
    previewStrip.moveStart();
    markerLayer.clearLayers();
    map.panTo(position);
    if (!marker) {
        marker = L.circleMarker(position, circleStyle).addTo(map);
    } else {
        marker.setLatLng(position);
    }

    previewStrip.setPosition(position);
    var bbox = map.getBounds().toBBoxString();

    function gotFeatures(features) {
        markerLayer.clearLayers().addData(features);
        previewStrip.showFeatures(markerLayer.getLayers());
        if (!features.features.length) {
            previewStrip.showMessage('<em>Ingen funnet!</em>');
        }
    }

    var found = [];
    var featuresLoaded = _.after(datasets.length, function () {
        gotFeatures(KR.Util.createFeatureCollection(found));
    });

    function error() {
        previewStrip.showMessage('En feil oppstod!');
        featuresLoaded();
    }

    function datasetLoaded(features) {
        features = filterByBbox(features, bbox);
        found = found.concat(features.features);
        featuresLoaded();
    }

    _.each(datasets, function (dataset) {
        api.getBbox(dataset, bbox, datasetLoaded, error, {allPages: true});
    });
}

var pilegrimsledenDovre = {
    api: 'cartodb',
    name: 'Pilegrimsleden',
    table: 'pilegrimsleden_dovre',
    mapper: KR.API.mappers.pilegrimsleden_dovre
};

var linemap = new KR.LineMap(api, map, pilegrimsledenDovre);
linemap.init(moved);

