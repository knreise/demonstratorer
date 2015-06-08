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


KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'artsobservasjon': _.template($('#artsobservasjon_template').html()),
};



var datasets = [
    /*{
        name: 'Digitalt fortalt',
        dataset: {
            layer: 1,
            api: 'kulturminnedata'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false,
        dataset_name_override: 'Kulturminnesok',
        panelMap: function (properties) {
            properties.title = properties.Navn;
            properties.contentType = 'TEXT';
            properties.thumbnail = null;
            properties.content = null;
            return properties;
        }
    },
    */
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
    },
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
    }
];





var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());
var markerTemplate = _.template($('#marker_template').html());
var thumbnailTemplate = _.template($('#thumbnail_template').html());
var footerTemplate = _.template($('#footer_template').html());

//the sidebar, used for displaying information
var sidebar = L.Knreise.Control.sidebar('sidebar', {
    position: 'left',
    template: popupTemplate,
    listElementTemplate: listElementTemplate,
    markerTemplate: markerTemplate,
    thumbnailTemplate: thumbnailTemplate,
    footerTemplate: footerTemplate
});
map.addControl(sidebar);


var previewStrip;

sidebar.on('shown', function () {
    previewStrip.on();
});

function showFeature(feature) {
    if (!sidebar.isVisible()) {
        previewStrip.off();
    }
    sidebar.showFeature.apply(sidebar, arguments);
}

previewStrip = new KR.PreviewStrip($('#strip'), map, api, datasets, showFeature);

setupLocate(map, function (e) {
    previewStrip.setPosition(e.latlng);
});


//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);
    previewStrip.init();
});
