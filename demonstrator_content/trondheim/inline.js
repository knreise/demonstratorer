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




//The datasets in use
var datasets = [
    {
        thumbnails: true,
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
        visible: false,
        circle: {
            radius: 5,
            weight:1,
            opacity: 1,
            color: KR.Util.colorForProvider('fangstlokaliteter', 'hex'),
            fillOpacity: 0.4
        }
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
        //dataset_name_override: 'Kulturminnesok',
        dataset: {
            api: 'wikipedia'
        },
        minZoom: 13
        //template: _.template($('#kulturminne_template').html()),
        //smallMarker: true
    },
    {
        name: 'Trondheim byarkiv',
        dataset_name_override: 'Trondheim byarkiv',
        provider: 'Trondheim byarkiv',
        dataset:  {
            api: 'flickr',
            user_id: 'trondheim_byarkiv'
        },
        template: _.template($('#flickr_template').html())
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
        style: KR.Util.getVerneomrStyle(0.2),
        selectedStyle: KR.Util.getVerneomrStyle(0.5),
        getFeatureData: function (feature, callback) {
            api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
        },
        toPoint: {
            showAlways: true,
            stopPolyClick: true,
            minSize: 20,
            circle: KR.Util.getVerneomrCircleStyle(),
            circleSelected: KR.Util.getVerneomrCircleStyle("#f00"),
        },
        cluster: false
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
    }
];



var errorHandler = KR.errorHandler($('#error_template').html());


var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

var bounds = L.latLngBounds.fromBBoxString('10.338650,63.408816,10.555458,63.462016');
map.fitBounds(bounds);
var layers = datasetLoader.loadDatasets(datasets);

L.control.datasets(layers).addTo(map);
