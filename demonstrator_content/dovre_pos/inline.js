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
        cluster: false
    },
    {
        name: 'Kulturminner',
        dataset_name_override: 'Kulturminnesok',
        dataset: {
            api: 'norvegiana',
            dataset: 'Kulturminnesok',
            query: '-delving_title:Fangstlokalitet'
        },
        smallMarker: true,
        visible: false,
        cluster: false
    }/*,
    {
        name: 'MUSIT',
        dataset: {
            api: 'norvegiana',
            dataset: 'MUSIT'
        },
        visible: false,
        thumbnails: true,
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
        thumbnails: true,
        smallMarker: true,
        cluster: false
    },
    {
        name: 'Artsobservasjoner',
        dataset_name_override: 'artsobservasjon',
        dataset: {
            api: 'norvegiana',
            dataset:'Artsdatabanken'
        },
        smallMarker: true,
        visible: false,
        cluster: false
    }*/
];

/*
KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'artsobservasjon': _.template($('#artsobservasjon_template').html()),
};
*/

var layers = [];
var datasetLoader = new KR.DatasetLoader(api, map);


var panelTemplate = _.template($('#panel_template').html());

setupLocate(map, function (e) {
    $('#strip').addClass('hidden');
    $('#strip').find('.strip-container').html('');
    datasetLoader.reload(true, function () {
        var features = _.flatten(_.map(layers, function (layer) {return layer.getLayers();}));
        
        var panels = _.map(features, function (feature) {
            console.log(feature.feature.properties.contentType);
            var el = $(panelTemplate(feature.feature.properties));
            return el;
        });
        $('#strip').find('.strip-container').html(panels);
        $('#strip').removeClass('hidden');

    });
});




//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);
    layers = layers.concat(datasetLoader.loadDatasets(datasets));
});
