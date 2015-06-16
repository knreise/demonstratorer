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
        name: 'Fangstgroper',
        dataset_name_override: 'fangstlokaliteter',
        dataset: {
            query: "Navn='Fangstgrop'",
            layer: 0,
            api: 'kulturminnedata'
        },
        template: _.template($('#fangstgrop_template').html()),
        smallMarker: true,
        cluster: false,
        style: {radius: 1.5, opacity: 1, fillcolor: '#000', fillOpacity: 1, circle: true}
    }
];
var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
    var layers = datasetLoader.loadDatasets(datasets, bbox);

    L.control.datasets(layers).addTo(map);
});