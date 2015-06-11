


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

var dataset = {
    api: 'norvegiana',
    dataset: 'difo'
};

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
var sidebar = new L.Knreise.Control.sidebar('sidebar', {
    autoPan: false,
    footerTemplate: footerTemplate
});

map.addControl(sidebar);

var f = L.geoJson().addTo(map);

var popupTemplate = _.template($('#digitalt_fortalt_template').html());
f.on('click', function (e) {
    var feature = e.layer.feature;
    sidebar.showFeature(feature, popupTemplate);
});

var marker;

function moved(position) {
    map.panTo(position);
    if (!marker) {
        marker = L.circleMarker(position, {stroke: false, fillColor: '#f00', radius: 10, fillOpacity: 0.8}).addTo(map);
    } else {
        marker.setLatLng(position);
    }


    previewStrip.setPosition(position);
    var bbox = map.getBounds().toBBoxString();

    function gotFeatures(features) {
        var features = filterByBbox(features, bbox);
        f.clearLayers().addData(features);
        previewStrip.showFeatures(f.getLayers());
        if (!features.features.length) {
            previewStrip.showMessage('<em>Ingen funnet!</em>');
        }
    }
    function error() {
        previewStrip.showMessage('En feil oppstod!');
    }
    api.getBbox(dataset, bbox, gotFeatures, error, {allPages: true});
}

var pilegrimsledenDovre = {
    api: 'cartodb',
    name: 'Pilegrimsleden',
    table: 'pilegrimsleden_dovre',
    mapper: KR.API.mappers.pilegrimsleden_dovre
};

var linemap = new KR.LineMap(api, map, pilegrimsledenDovre);
linemap.init(moved);

