//template used for sidebar

var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());
var markerTemplate = _.template($('#marker_template').html());
var thumbnailTemplate = _.template($('#thumbnail_template').html());
var footerTemplate = _.template($('#footer_template').html());

//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    },
    flickr: {
        apikey: '65a0d78867596f8ccfeb9718f4d915d0'
    }
});

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

KR.Config.templates = {
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
};

L.Knreise.LocateButton().addTo(map);


//The datasets in use
var datasets = [
    {
        thumbnails: true,
        name: 'Digitalt fortalt',
        dataset: {dataset: 'difo', api: 'norvegiana'},
        template: _.template($('#digitalt_fortalt_template').html())
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
        smallMarker: true
    },
    {
        name: 'Wikipedia',
        provider: 'Wikipedia',
        dataset: {
            api: 'wikipedia'
        },
        style: {template: true},
        minZoom: 13
    },
    {
        name: 'Trondheim byarkiv',
        dataset_name_override: 'Trondheim byarkiv',
        provider: 'Trondheim byarkiv',
        dataset:  {
            api: 'flickr',
            user_id: 'trondheim_byarkiv'
        },
        template: _.template($('#flickr_template').html()),
        style: {fillcolor: '#D252B9'}
    },
    {
        name: 'Riksantikvaren',
        provider: 'Riksantikvaren',
        dataset: {
            api: 'kulturminnedataSparql',
            kommune: '1601'
        },
        template: _.template($('#ra_sparql_template').html()),
        bbox: false,
        style: {fillcolor: '#728224'}
    },
    {
        name: 'MUSIT',
        dataset: {
            api: 'norvegiana',
            dataset: 'MUSIT'
        },
        template: _.template($('#musit_template').html()),
        minZoom: 12,
        style: {thumbnail: true}
    },
    {
        name: 'DiMu',
        dataset: {
            api: 'norvegiana',
            dataset: 'DiMu'
        },
        template: _.template($('#digitalt_museum_template').html()),
        minZoom: 12,
        style: {thumbnail: true}
    }
];



var errorHandler = KR.errorHandler($('#error_template').html());


var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

var bounds = L.latLngBounds.fromBBoxString('10.338650,63.408816,10.555458,63.462016');
map.fitBounds(bounds);
var layers = datasetLoader.loadDatasets(datasets);

L.control.datasets(layers).addTo(map);
