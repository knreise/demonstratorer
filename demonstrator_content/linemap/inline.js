'use strict';

function getSteps(length, steps) {
    var stepLength = length / steps;
    return _.map(_.range(0, steps + 1), function (step) {
        return stepLength * step;
    });
}

function initScroll(map, line, positionCallback) {
    var length = turf.lineDistance(line.feature, 'kilometers');
    var steps = getSteps(length, 100);
    var layer = L.geoJson().addTo(map);
    var index = 4;
    function zoomToIndex(index) {
        var step = steps[index];
        if (step !== undefined) {
            var along = turf.along(line.feature, step, 'kilometers');
            layer.clearLayers().addData(along);
            var pos = layer.getLayers()[0].getLatLng();
            map.panTo(pos);
            if (positionCallback) {
                positionCallback(pos);
            }
        }
    }
    zoomToIndex(index);

    function move(delta) {
        if (delta === 1) {
            if (index > 0) {
                index--;
                zoomToIndex(index);
            }
        } else if (delta === -1) {
            if (index < steps.length - 1) {
                index++;
                zoomToIndex(index);
            }
        }
    }

    document.onkeydown = function (e) {
        e = e || window.event;
        var key = e.which || e.keyCode;
        if (key === 38) {
            move(1);
        }
        if (key === 40) {
            move(-1);
        }
    }

    L.DomEvent.on($('#map')[0], 'mousewheel', function (e) {
        var delta = L.DomEvent.getWheelDelta(e);
        move(delta);
    });

    $('#map').swipe({
        swipe: function (e, direction) {
            if (direction === 'up' || direction === 'left') {
                move(-1);
            }
            if (direction === 'down' || direction === 'right') {
                move(1);
            }
        },
    });
}

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
/*
L.tileLayer.kartverket('topo2graatone').addTo(map);
*/

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var api = new KR.API();

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

var sidebar = new L.Control.Sidebar('sidebar', {autoPan: false});
map.addControl(sidebar);

var f = L.geoJson().addTo(map);
var popupTemplate = _.template($('#digitalt_fortalt_template').html());
f.on('click', function (e) {
    var feature = e.layer.feature;
    sidebar.setContent(popupTemplate(feature.properties)).show();
});


map.on('moveend', function ()  {
    var bbox = map.getBounds().toBBoxString();
    api.getBbox(dataset, bbox, function (features) {
        var features = filterByBbox(features, bbox);
        f.clearLayers().addData(features);
        previewStrip.showFeatures(f.getLayers());
    }, null, {allPages: true});
});

var url = 'https://gist.githubusercontent.com/anonymous/5a83eafe1e5cd369f6c9/raw/a58b4dfdd9d4a8772745009cb789baa187ef6202/map.geojson';
KR.Util.sendRequest(url, null, function (geoJson) {
    var layer = L.geoJson(JSON.parse(geoJson)).addTo(map);
    var line = layer.getLayers()[0]
    var start = line.getLatLngs()[0];
    map.setZoom(15);
    initScroll(map, line, function (pos) {
        previewStrip.setPosition(pos);
    });
});