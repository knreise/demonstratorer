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
        dataset: {dataset: 'difo', api: 'norvegiana'},
        template: _.template($('#digitalt_fortalt_template').html()),
        visible: false,
        cluster: false
    },
    {
        name: 'Fangstlokaliteter',
        dataset_name_override: 'fangstlokaliteter',
        dataset: {
            api: 'norvegiana',
            dataset: 'Kulturminnesok',
            query: 'delving_title:Fangstlokalitet'
        },
        template: _.template($('#kulturminne_template').html()),
        smallMarker: true,
        cluster: false,
        visible: false,
        circle: {radius: 1.5, opacity: 1, color: '#000', fillOpacity: 1}
    },
    {
        name: 'Kulturminner',
        dataset_name_override: 'Kulturminnesok',
        dataset: {
            api: 'norvegiana',
            dataset: 'Kulturminnesok',
            query: '-delving_title:Fangstlokalitet'
        },
        template: _.template($('#kulturminne_template').html()),
        smallMarker: true,
        visible: false,
        cluster: false
    },
    {
        dataset: {
            api: 'cartodb',
            table: 'naturvernomrader_utm33_2',
            columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
        },
        provider: 'Naturbase',
        name: 'Verneområder',
        template: _.template($('#verneomraader_template').html()),
        style: function (feature) {
            return {color: '#7570b3', weight: 1, fillColor: KR.Util.colorForProvider('Naturbase')};
        },
        getFeatureData: function (feature, callback) {
            api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
        },
        toPoint: 20,
        cluster: false,
        visible: false
    },
    {
        name: 'MUSIT',
        dataset: {
            api: 'norvegiana',
            dataset: 'MUSIT'
        },
        template: _.template($('#musit_template').html()),
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
        template: _.template($('#digitalt_museum_template').html()),
        visible: false,
        thumbnails: true,
        smallMarker: true,
        cluster: false
    },
    {
        name: 'Artsobservasjoner',
        dataset: {
            api: 'norvegiana',
            dataset:'Artsdatabanken'
        },
        smallMarker: true,
        visible: false,
        cluster: false
    }
];


var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

setupLocate(map, function (e) {
    datasetLoader.reload(true);
});




//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);

    var layers = datasetLoader.loadDatasets(datasets);
    //L.control.datasets(layers).addTo(map);
});