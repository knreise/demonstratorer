'use strict';

function _length(lines) {
    return _.reduce(lines, function (length, line) {
        return length + turf.lineDistance(line, 'kilometers');
    }, 0);
}

function stepsForLine(line, steps, stepLength) {
    return _.map(_.range(0, steps + 1), function (step) {
        var step = stepLength * step;
        return turf.along(line, step, 'kilometers')
    });
}

function getSteps(lines, stepLength) {
    var totalLength = _length(lines);
    var steps = Math.round(totalLength / stepLength);
    return _.flatten(_.map(lines, function (line) {
        var length = _length([line])
        var lineSteps = Math.round(steps * (length / totalLength));
        return stepsForLine(line, lineSteps, stepLength);
    }));
}

function _multiToSimple(geoJson) {

    var lines = _.map(geoJson.geometry.coordinates, function (line) {
        if(_.last(line)[1] > _.first(line)[1]) {
            line = line.reverse();
        }
        return turf.linestring(line);
    });

    lines.sort(function(a, b) {
        return (b.geometry.coordinates[0][1] - a.geometry.coordinates[0][1]);
    });
    return lines;
}



function initScroll(map, geoJson, positionCallback) {

    var lines;
    if (geoJson.geometry.type === 'MultiLineString') {
        lines = _multiToSimple(geoJson);
    } else {
        lines = [geoJson];
    }

    var steps = getSteps(lines, 0.6);

    var layer = L.geoJson().addTo(map);

    function zoomToIndex(index) {
        var step = steps[index];
        if (step !== undefined) {
            layer.clearLayers().addData(step);
            var pos = layer.getLayers()[0].getLatLng();
            map.panTo(pos);
            if (positionCallback) {
                positionCallback(pos);
            }
        }

    }
    var index = 0;
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

    function gotFeatures(features) {
        var features = filterByBbox(features, bbox);
        f.clearLayers().addData(features);
        previewStrip.showFeatures(f.getLayers());
        if (!features.features.length) {
            previewStrip.showMessage('<em>Ingen funnet!</em>');
        }
    }

    function error() {
        console.log(error);
        previewStrip.showMessage('En feil oppstod!');
    }
    api.getBbox(dataset, bbox, gotFeatures, error, {allPages: true});
});


var alongLine = new AlongLine(api);
var pilegrimsleden_dovre = {
    api: 'cartodb',
    name: 'Pilegrimsleden',
    table: 'pilegrimsleden_dovre',
    mapper: KR.API.mappers.pilegrimsleden_dovre
};

alongLine.getLine(pilegrimsleden_dovre, function (res) {
    var geoJson = res.line.toGeoJSON();
    var layer = L.geoJson(geoJson).addTo(map);
    map.setZoom(15);
    initScroll(map, geoJson.features[0], function (pos) {
        previewStrip.setPosition(pos);
    });
});
