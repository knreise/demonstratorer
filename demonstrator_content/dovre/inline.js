//template used for sidebar

var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());

//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

//the sidebar, used for displaying information
var sidebar = L.control.norvegianaSidebar('sidebar', {
    position: 'left',
    template: popupTemplate,
    listElementTemplate: listElementTemplate
});
map.addControl(sidebar);

KR.Config.templates = {
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
};

//The datasets in use
var datasets = [
    {
        api: 'cartodb',
        name: 'Pilegrimsleden',
        table: 'pilegrimsleden_dovre',
        mapper: KR.API.mappers.pilegrimsleden_dovre,
        style: function (feature) {
            return {color: '#7570b3', clickable: false, opacity: 1, weight: 3};
        },
        bbox: false
    },
    {
        api: 'norvegiana',
        name: 'Digitalt fortalt',
        dataset: 'difo',
        template: _.template($('#digitalt_fortalt_template').html())
    },
    {
        api: 'norvegiana',
        name: 'Fangstlokaliteter',
        dataset_name_override: 'fangstlokaliteter',
        dataset: {dataset: 'Kulturminnesok', query: 'delving_title:Fangstlokalitet'},
        template: _.template($('#kulturminne_template').html()),
        smallMarker: true,
        cluster: false,
        circle: {radius: 1.5, opacity: 1, color: '#000', fillOpacity: 1}
    },
    {
        api: 'norvegiana',
        name: 'Kulturminner',
        dataset_name_override: 'Kulturminnesok',
        dataset: {dataset: 'Kulturminnesok', query: '-delving_title:Fangstlokalitet'},
        template: _.template($('#kulturminne_template').html()),
        smallMarker: true
    },
    {
        api: 'cartodb',
        name: 'Verneområder',
        table: 'naturvernomrader_utm33_2',
        columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
        template: _.template($('#verneomraader_template').html()),
        style: function (feature) {
            return {color: '#7570b3', weight: 1, fillColor: '#ff0000'};
        },
        getFeatureData: function (feature, callback) {
            api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
        }
    },
    {
        api: 'norvegiana',
        name: 'Museumsdata',
        dataset: ['MUSIT', 'DiMu'],
        isStatic: false,
        thumbnails: false,
        smallMarker: true,
        minZoom: 12
    }
,                    {
        api: 'norvegiana',
        name: 'Artsobservasjoner',
        dataset: 'Artsdatabanken',
        isStatic: false,
        smallMarker: true,
        minZoom: 14
    }
];
var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
    var layers = datasetLoader.loadDatasets(datasets);

    L.control.datasets(layers).addTo(map);
});