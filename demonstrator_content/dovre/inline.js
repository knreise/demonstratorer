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
        dataset: {
            api: 'cartodb',
            table: 'pilegrimsleden_dovre',
            mapper: KR.API.mappers.pilegrimsleden_dovre
        },
        name: 'Pilegrimsleden',
        style: function (feature) {
            return {color: '#7570b3', clickable: false, opacity: 1, weight: 3};
        },
        bbox: false
    },
    {
        name: 'Digitalt fortalt',
        dataset: {dataset: 'difo', api: 'norvegiana'},
        template: _.template($('#digitalt_fortalt_template').html())
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
        smallMarker: true
    },
    {
        dataset: {
            api: 'cartodb',
            table: 'naturvernomrader_utm33_2',
            columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
        },
        name: 'Verneområder',
        template: _.template($('#verneomraader_template').html()),
        style: function (feature) {
            return {color: '#7570b3', weight: 1, fillColor: '#ff0000'};
        },
        getFeatureData: function (feature, callback) {
            api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
        }
    },
    {

        datasets: [
            {
                name: 'MUSIT',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'MUSIT'
                },
                template: _.template($('#musit_template').html())
            },
            {
                name: 'DiMu',

                dataset: {
                    api: 'norvegiana',
                    dataset: 'DiMu'
                },
                template: _.template($('#digitalt_museum_template').html())
            }
        ],
        minZoom: 12,
        thumbnails: true,
        smallMarker: true
    },
    {
        name: 'Artsobservasjoner',
        dataset: {
            api: 'norvegiana',
            dataset:'Artsdatabanken'
        },
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