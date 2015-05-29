//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});


//toggles
function setupToggle(strip) {
    var leftBtn = strip.find('.js-left');
    var rightBtn = strip.find('.js-right');
    function checkLeft() {
        if (strip.find('.panel.hidden').length > 0) {
            leftBtn.removeClass('hidden');
        } else {
            leftBtn.addClass('hidden');
        }
    }

    function checkRight() {
        if (strip.find('.panel').not('.hidden').length < 2) {
            rightBtn.addClass('hidden');
        } else {
            rightBtn.removeClass('hidden');
        }
    }

    checkLeft();

    rightBtn.on('click', function () {
        strip.find('.panel').not('.hidden').first().addClass('hidden');
        checkLeft();
        checkRight();
    });
    leftBtn.on('click', function () {
        strip.find('.panel.hidden').last().removeClass('hidden');
        checkLeft();
        checkRight();
    });
}

setupToggle($('#strip'));

$('#strip').find('.js-close').on('click', function () {
    $('#strip').addClass('hidden');
});

function setupLocate(map, callback) {
    var icon = L.icon({
        iconUrl: '../common/img/locate.gif',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
    var marker;

    function locateClick() {
        map.locate({setView: true, maxZoom: 15});
    }

    var locate = L.easyButton(
        map,
        locateClick,
        {icon: 'fa-user', title: 'Finn meg'}
    );
    map.on('locationfound', function (e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng, {icon: icon}).addTo(map);
        callback(e);
    });
}



var datasets = [
    {
        name: 'Digitalt fortalt',
        dataset: {
            dataset: 'difo',
            api: 'norvegiana'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    }/*,
    {
        name: 'MUSIT',
        dataset: {
            api: 'norvegiana',
            dataset: 'MUSIT'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    },
    {
        name: 'DiMu',
        dataset: {
            api: 'norvegiana',
            dataset: 'DiMu'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    }*/
];

_.each(datasets, function (dataset) {
    dataset.visible = false;
});

/*
KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'artsobservasjon': _.template($('#artsobservasjon_template').html()),
};
*/

function showFeature(feature) {
    //map.panTo(feature.getLatLng());
    console.log(feature);
}


var datasetLoader = new KR.DatasetLoader(api, map);


var panelTemplate = _.template($('#panel_template').html());


map.on('movestart', function () {
    $('#strip').find('.strip-container').html($('#spinner_template').html());
});


function formatDistance(meters) {
    var km = meters / 1000;
    return Math.round(km * 10) / 10;
}



var position;
var layers = [];
function dataReloaded() {

    var features = _.flatten(_.map(layers, function (layer) {
        return layer.getLayers();
    }));


    if (position) {
        features = _.map(features, function (feature) {
            feature.feature.properties.distance = feature.getLatLng().distanceTo(position);
            return feature;
        });
        features = features.sort(function (a, b) {
            if (a.feature.properties.distance < b.feature.properties.distance) {
                return -1;
            }
            if (a.feature.properties.distance > b.feature.properties.distance) {
                return 1;
            }
            return 0;
        });
    }

    var panels = _.map(features, function (feature) {
        feature.feature.properties.icon = KR.Util.iconForContentType(feature.feature);
        feature.feature.properties.distance = formatDistance(feature.feature.properties.distance) || null;
        var el = $(panelTemplate(feature.feature.properties));
        el.on('click', function () {
            showFeature(feature);
        });
        return el;
    });

    $('#strip').find('.strip-container').html(panels);
    $('#strip').removeClass('hidden');
}

map.on('moveend', function () {
    //$('#strip').addClass('hidden');
    datasetLoader.reload(true, dataReloaded);
});


setupLocate(map, function (e) {
    position = e.latlng;
    dataReloaded();
});




//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);

    //TODO callback here
    layers = datasetLoader.loadDatasets(datasets);
    dataReloaded();

    datasetLoader.reload(true, dataReloaded);
});
