/*global L:false, alert:false, KR:false, turf:false */

var KR = this.KR || {};
(function (ns) {
    'use strict';

    function _stringEndsWith(a, str) {
        var lastIndex = a.lastIndexOf(str);
        return (lastIndex !== -1) && (lastIndex + str.length === a.length);
    }

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

    function _getBaseLayer(layerName, callback) {
        var layers = {
            'nib': KR.getNibLayer,
            'hist': function (callback) {
                callback(L.tileLayer.wms('http://wms.geonorge.no/skwms1/wms.historiskekart', {
                    layers: 'historiskekart',
                    format: 'image/png',
                    attribution: 'Kartverket'
                }));
            }
        };
        if (_.has(layers, layerName)) {
            layers[layerName](callback);
        } else {
            callback(L.tileLayer.kartverket(layerName));
        }
    }

    function _createMap(options) {
        //create the map
        var map = L.map('map', {maxZoom: 21});

        var baseLayer = options.layer || 'norges_grunnkart_graatone';

        _getBaseLayer(baseLayer, function (layer) {
            layer.addTo(map);
        });

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

    function _flattenCollections(featureCollection) {

        var features = [];

        _.each(featureCollection.features, function (feature) {
            if (feature.geometry.type === 'GeometryCollection') {
                _.each(feature.geometry.geometries, function (geometry) {
                    features.push(KR.Util.createGeoJSONFeatureFromGeom(geometry, feature.properties));
                });
            } else {
                features.push(feature);
            }
        });
        return KR.Util.createFeatureCollection(features);
    }

    function _simplify(featureCollection) {
        var features = _.map(featureCollection.features, function (feature) {
            return turf.simplify(feature, 0.01, false);
        });
        return KR.Util.createFeatureCollection(features);
    }

    function _gotLine(line, api, options, datasets, fromUrl, callback) {
        var lineOptions = {};
        if (options.linecolor) {
            lineOptions.color = options.linecolor;
        }
        var lineLayer = L.geoJson(line, lineOptions);
        var bounds = lineLayer.getBounds();
        datasets = _loadDatasets(api, datasets, fromUrl);

        function filter(features) {
            if (line && options.buffer) {
                line = _flattenCollections(line);
                if (line.features.length > 5) {
                    line = _simplify(line);
                }
                var buffered = turf.buffer(line, options.buffer, 'kilometers');
                var within = turf.within(features, buffered);
                return within;
            }
            return features;
        }

        callback(bounds, datasets, filter, lineLayer);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback) {

        var lineData;

        if (options.line.indexOf('utno/') === 0) {
            var id = options.line.replace('utno/', '');
            lineData = {
                api: 'utno',
                id: id,
                type: 'gpx'
            };
        } else if (options.line.indexOf('http') === 0) {
            if (_stringEndsWith(options.line, 'kml')) {
                lineData = {
                    api: 'kml',
                    url: options.line
                };
            }
        }
        if (lineData) {
            api.getData(lineData, function (line) {
                _gotLine(line, api, options, datasets, fromUrl, callback);
            });
        }
    }


    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};

        var map = _createMap(options);
        var sidebar = _setupSidebar(map);
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

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
                KR.SplashScreen(map, options.title, options.description, options.image);
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
