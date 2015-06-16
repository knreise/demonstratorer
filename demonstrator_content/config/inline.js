//template used for sidebar


function parseQueryString() {
    var queryString = decodeURIComponent(window.location.search);
    return _.reduce(queryString.replace('?', '').split('&'), function (acc, qs) {
        qs = qs.split('=');
        acc[qs[0]] = qs[1];
        return acc;
    }, {});
}


function setupMap(api, komm, datasets) {

    var popupTemplate = _.template($('#popup_template').html());
    var listElementTemplate = _.template($('#list_item_template').html());
    var markerTemplate = _.template($('#marker_template').html());
    var thumbnailTemplate = _.template($('#thumbnail_template').html());
    var footerTemplate = _.template($('#footer_template').html());

    //create the map
    var map = L.map('map');

    //add a background layer from kartverket
    L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

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

    L.Knreise.LocateButton().addTo(map);

    KR.Config.templates = {
        'Musit': _.template($('#musit_template').html()),
        'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    };

    var errorHandler = KR.errorHandler($('#error_template').html());

    var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

    api.getMunicipalityBounds(komm, function (bbox) {
        var bounds = L.latLngBounds.fromBBoxString(bbox);
        map.fitBounds(bounds);
        var layers = datasetLoader.loadDatasets(datasets);

        L.control.datasets(layers).addTo(map);
    });
}


var qs = parseQueryString();

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

var datasetConfig = getDatasetList(api, qs.komm);

var datasets = _.map(qs.datasets.split(','), function (dataset) {
    console.log(dataset);
    return datasetConfig[dataset];
});

setupMap(api, qs.komm, datasets);