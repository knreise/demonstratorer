/*global L:false, alert:false, KR:false */

var KR = this.KR || {};

KR.setupMap = function (api, datasetIds, options) {
    'use strict';

    options = options || {};



    //template used for sidebar
    var popupTemplate = _.template($('#popup_template').html());
    var listElementTemplate = _.template($('#list_item_template').html());
    var markerTemplate = _.template($('#marker_template').html());
    var thumbnailTemplate = _.template($('#thumbnail_template').html());
    var footerTemplate = _.template($('#footer_template').html());

    //create the map
    var map = L.map('map');

    var baseLayer = options.layer || 'norges_grunnkart_graatone';
    //add a background layer from kartverket
    L.tileLayer.kartverket(baseLayer).addTo(map);

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

    var datasetLoader = new KR.DatasetLoader(api, map, sidebar, errorHandler);


    function parseLine(line, callback) {
        if (line.indexOf('utno/') === 0) {
            var id = line.replace('utno/', '');
            var tur = {
                api: 'utno',
                id: id,
                type: 'gpx'
            };
            api.getData(tur, callback);
        }
    }


    function addDatasets(bbox) {
        var datasets = KR.Config.getDatasets(datasetIds, api, options.komm, bbox);
        if (options.allstatic) {
            datasets = _.map(datasets, function (dataset) {
                dataset.isStatic = true;
                return dataset;
            });
        }
        var layers = datasetLoader.loadDatasets(datasets);
        L.control.datasets(layers).addTo(map);
    }

    function gotBounds(bbox) {
        var bounds = L.latLngBounds.fromBBoxString(bbox);
        map.fitBounds(bounds);
        addDatasets(bbox);
    }

    if (!datasetIds.length) {
        alert('No dataset specified!');
        return;
    }

    if (options.komm) {
        api.getMunicipalityBounds(options.komm, gotBounds);
    } else if (options.bbox) {
        gotBounds(options.bbox);
    } else if (options.line) {
        parseLine(options.line, function (line) {
            var layer = L.geoJson(line).addTo(map);
            var bounds = layer.getBounds().toBBoxString();
            gotBounds(bounds);
        });
    }
};
