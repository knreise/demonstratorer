/*global L:false, alert:false, KR:false, turf:false */

var KR = this.KR || {};
(function (ns) {
    'use strict';

    function _setupSidebar(map) {
        var popupTemplate = _.template($('#popup_template').html());
        var listElementTemplate = _.template($('#list_item_template').html());
        var markerTemplate = _.template($('#marker_template').html());
        var thumbnailTemplate = _.template($('#thumbnail_template').html());
        var footerTemplate = _.template($('#footer_template').html());

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
        return sidebar;
    }

    function _createMap(options) {
        //create the map
        var map = L.map('map', {maxZoom: 21});

        var baseLayer = options.layer || 'norges_grunnkart_graatone';

        if (baseLayer === 'nib') {
            KR.getNibLayer(function (layer) {
                layer.addTo(map);
            });
        } else {
            //add a background layer from kartverket
            L.tileLayer.kartverket(baseLayer).addTo(map);
        }

        L.Knreise.LocateButton().addTo(map);
        return map;
    }

    function _loadDatasets(api, datasets, fromUrl, komm) {
        if (fromUrl) {
            datasets = KR.Config.getDatasets(datasets, api, komm);
        }
        return datasets;
    }


    function _municipalityHandler(options, api, datasets, fromUrl, callback) {
        api.getMunicipalityBounds(options.komm, function (bbox) {
            datasets = _loadDatasets(api, datasets, fromUrl, options.komm);
            var bounds = L.latLngBounds.fromBBoxString(bbox);
            callback(bounds, datasets);
        });
    }

    function _bboxHandler(options, api, datasets, fromUrl, callback) {
        datasets = _loadDatasets(api, datasets, fromUrl);
        var bounds = L.latLngBounds.fromBBoxString(options.bbox);
        callback(bounds, datasets);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback) {
        if (options.line.indexOf('utno/') !== 0) {
            return;
        }
        var id = options.line.replace('utno/', '');
        var lineData = {
            api: 'utno',
            id: id,
            type: 'gpx'
        };
        api.getData(lineData, function (line) {
            var lineOptions = {};
            if (options.linecolor) {
                lineOptions.color = options.linecolor;
            }
            var lineLayer = L.geoJson(line, lineOptions);
            var bounds = lineLayer.getBounds();
            datasets = _loadDatasets(api, datasets, fromUrl);

            function filter(features) {
                if (line && options.buffer) {
                    var buffered = turf.buffer(line, options.buffer, 'kilometers');
                    var within = turf.within(features, buffered);
                    return within;
                }
                return features;
            }

            callback(bounds, datasets, filter, lineLayer);
        });
    }


    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};

        var map = _createMap(options);
        var errorHandler = KR.errorHandler($('#error_template').html());
        var sidebar = _setupSidebar(map);
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar, errorHandler);

        function showDatasets(bounds, datasets, filter, lineLayer) {
            if (options.allstatic) {
                datasets = _.map(datasets, function (dataset) {
                    dataset.isStatic = true;
                    return dataset;
                });
            }

            map.fitBounds(bounds);
            var layers = datasetLoader.loadDatasets(datasets, null, filter);
            if (lineLayer) {
                lineLayer.addTo(map);
            }
            L.control.datasets(layers).addTo(map);
            if (options.title) {
                KR.SplashScreen(map, options.title, options.description);
            }
        }

        if (options.komm) {
            _municipalityHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.line) {
            _lineHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.bbox) {
            _bboxHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else {
            alert('Missing parameters!');
        }
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, datasetIds, options, true);
    };

}(KR));
