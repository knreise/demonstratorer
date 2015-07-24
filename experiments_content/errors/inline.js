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

//set up an instance of the Norvegiana API
var api = new KR.API();


//The datasets in use
var datasets = [
    {
        dataset: {
            api: 'cartodb',
            table: 'pilegrimsleden_dovre3',
            mapper: KR.API.mappers.pilegrimsleden_dovre
        },
        name: 'Pilegrimsleden',
        bbox: false
    },
    {
        dataset: {
            api: 'utno',
            id: '2.8158',
            type: 'huh'
        },
        name: 'ut.no 1',
        bbox: false
    },
    {
        dataset: {
            api: 'utno',
            id: '2.81582222',
            type: 'gpx'
        },
        name: 'ut.no 2',
        bbox: false
    },
    {
        name: 'Fangstlokaliteter',
    
        dataset: {
            api: 'norvegiana',
            dataset: '',
            query: ''
        }
    },
    {
        name: 'Fangstgroper',
        dataset: {
            api: 'kulturminnedata',
            query: "Navn='Fangstgrop'",
            layer: 20
        }
    },
    {
        name: 'Wikipedia',
        dataset: {
            api: 'wikipedia'
        }
    },
    {
        name: 'kulturminnedata 2',
        dataset: {
                limit: 100,
                api: 'kulturminnedataSparql',
                filter: ' '
            },
        bbox: false
    },
    {
        name: 'folketelling',
        dataset: {
            api: 'folketelling',
            dataset: 'property',
            limit: 10
        }
    }
];



var errorHandler = KR.errorHandler($('#error_template').html());


var datasetLoader = new KR.DatasetLoader(api, map, null);

//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);
    var layers = datasetLoader.loadDatasets(datasets);
    L.control.datasets(layers).addTo(map);
});