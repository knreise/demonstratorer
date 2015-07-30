//template used for sidebar

var popupTemplate = KR.Util.getDatasetTemplate('popup');
var listElementTemplate = _.template($('#list_item_template').html());

//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

//set up an instance of the Norvegiana API
var api = new KR.API();

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
        style: {
            circle: true,
            fillcolor: KR.Util.colorForProvider('Kulturminnesok', 'hex'),
            bordercolor: '#7570b3'
        }
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