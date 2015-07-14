/*global L:false, alert:false, KR:false, turf:false */

var KR = this.KR || {};
(function (ns) {
    'use strict';

    var WORLD = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[
                [-180, -90],
                [-180,  90],
                [ 180,  90],
                [ 180, -90],
                [-180, -90]
            ]]
        }
    };


    function _stringEndsWith(a, str) {
        var lastIndex = a.lastIndexOf(str);
        return (lastIndex !== -1) && (lastIndex + str.length === a.length);
    }

    function _getFilter(buffer) {
        return function (features) {

            if (features.features[0].geometry.type.indexOf('Polygon') === -1) {
                return turf.within(features, buffer);
            }
            var intersects =  _.filter(features.features, function (feature) {
                var bbox = turf.extent(feature);
                var bboxPolygon = turf.bboxPolygon(bbox);
                return !!turf.intersect(bboxPolygon, buffer.features[0]);
            });
            return KR.Util.createFeatureCollection(intersects);
        };
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
        var map = L.map('map', {
            minZoom: 3,
            maxZoom: 21,
            maxBounds: L.geoJson(WORLD).getBounds()
        });

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

    function _addInverted(map, feature) {
        var style = {
            stroke: false,
            fillColor: '#ddd',
            fillOpacity: 0.8
        };
        L.geoJson(turf.erase(WORLD, feature), style).addTo(map);
    }


    function _municipalityHandler(options, api, datasets, fromUrl, callback) {
        api.getMunicipalityBounds(options.komm, function (bbox) {
            datasets = _loadDatasets(api, datasets, fromUrl, options.komm);
            var bounds = L.latLngBounds.fromBBoxString(bbox);
            callback(bounds, datasets);
        });
    }

    function _countyHandler(options, api, datasets, fromUrl, callback) {
        var county = {
            api: 'cartodb',
            query: 'SELECT ST_AsGeoJSON(the_geom) as geom FROM fylker WHERE fylkesnr = ' + options.fylke
        };

        api.getData(county, function (geoJson) {
            _addInverted(options.map, geoJson.features[0]);
            var layer = L.geoJson(geoJson);
            datasets = _loadDatasets(api, datasets, fromUrl);
            var filter = _getFilter(geoJson);
            callback(layer.getBounds(), datasets, filter);
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

        var filter;
        if (line && options.buffer) {
            line = _flattenCollections(line);
            if (line.features.length > 5) {
                line = _simplify(line);
            }
            var buffer = turf.buffer(line, options.buffer, 'kilometers');
            filter = _getFilter(buffer);
        }
        callback(bounds, datasets, filter, lineLayer);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback) {
        if (_.isFunction(options.line)) {
            options.line(function (line) {
                _gotLine(line, api, options, datasets, fromUrl, callback);
            });
            return;
        }

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
                    if (dataset.datasets) {
                        dataset.datasets = _.map(dataset.datasets, function (dataset) {
                            dataset.isStatic = true;
                            return dataset;
                        });
                    }
                    return dataset;
                });
            }

            map.fitBounds(bounds);
            var layers = datasetLoader.loadDatasets(datasets, bounds.toBBoxString(), filter);
            if (lineLayer) {
                lineLayer.addTo(map);
            }

            L.control.datasets(layers).addTo(map);
            if (options.title) {
                KR.SplashScreen(map, options.title, options.description, options.image);
            }
        }

        options.map = map;
        if (options.komm) {
            _municipalityHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.fylke) {
            _countyHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.line) {
            _lineHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.bbox) {
            _bboxHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else {
            alert('Missing parameters!');
        }
        return map;
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, datasetIds, options, true);
    };

}(KR));
