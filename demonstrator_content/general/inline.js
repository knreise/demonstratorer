KR.Config.templates = {
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html())
};

//template used for sidebar
var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());
//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('topo2graatone').addTo(map);


//initialize the map in oslo
map.setView(new L.LatLng(59.910586, 10.734329), 16);

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

var layer = L.norvegianaGeoJSON(null, sidebar, {cluster: true});

var datasets = api.datasets();
//var selectedDataset = 'delving_spec:DiMu';
var selectedDataset = 'Artsdatabanken';
var clickFunc = L.control.mapClick(layer, api, datasets[selectedDataset]);
map.addControl(clickFunc);
clickFunc.on();

//simple control to choose datasets
var datasetChooser = L.control.datasetChooser({
    datasets: datasets,
    initialDataset: selectedDataset,
    datasetSelected: function (dataset) {
        clickFunc.setDataset(dataset);
    }
});
map.addControl(datasetChooser);
