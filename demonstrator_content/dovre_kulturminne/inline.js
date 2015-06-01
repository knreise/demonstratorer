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
var sidebar = L.Knreise.Control.sidebar('sidebar', {
    position: 'left',
    template: popupTemplate,
    listElementTemplate: listElementTemplate
});
map.addControl(sidebar);


//The datasets in use
var datasets = [
    {
        name: 'Kulturminnedata, lokaliteter',
        dataset_name_override: 'Kulturminnesok',
        provider: 'Kulturminnesøk',
        dataset: {
            layer: 4,
            api: 'kulturminnedata'
        },
        toPoint: 10,
        cluster: false,
        template: _.template($('#kulturminne2_template').html()),
        style: function (feature) {
            return {color: '#7570b3', weight: 1, fillOpacity: 0.7, fillColor: KR.Util.colorForProvider('Kulturminnesøk', 'hex')};
        },
    }
    
];
var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);
    var layers = datasetLoader.loadDatasets(datasets);

    L.control.datasets(layers).addTo(map);
});