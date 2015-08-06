/*global L:false, alert:false, KR:false, turf:false */

/*
    Utility for setting up a Leaflet map based on config
*/

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

    function _getFilter(buffer) {
        return function (features) {
            if (!features || !features.length) {
                return features;
            }

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
        var popupTemplate = KR.Util.getDatasetTemplate('popup');
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
        var map = L.map('map', {
            minZoom: 3,
            maxZoom: 21,
            maxBounds: L.geoJson(WORLD).getBounds()
        });

        var baseLayer = options.layer || 'norges_grunnkart_graatone';
        KR.Util.getBaseLayer(baseLayer, function (layer) {
            layer.addTo(map);
        });
        return map;
    }

    function _loadDatasets(api, datasets, fromUrl, komm, fylke) {
        if (fromUrl) {
            datasets = KR.Config.getDatasets(datasets, api, komm, fylke);
        }
        return datasets;
    }

    function _addInverted(map, geoJson) {
        var style = {
            stroke: false,
            fillColor: '#ddd',
            fillOpacity: 0.8
        };

        var data = _.reduce(geoJson.features, function (geom, feature) {
            return turf.erase(geom, feature);
        }, WORLD);
        L.geoJson(data, style).addTo(map);
    }


    function _getloader(options, api, datasets, boundsFunc, id, paramName, callback) {
        if (options.geomFilter) {
            var dataset = {
                api: 'cartodb'
            };
            dataset[paramName] = id;
            api.getData(dataset, function (geoJson) {
                if (options.showGeom) {
                    _addInverted(options.map, geoJson);
                }
                var layer = L.geoJson(geoJson);

                var filter = _getFilter(geoJson);
                callback(layer.getBounds(), datasets, filter);
            });
        } else {
            boundsFunc(id, function (bbox) {
                var bounds = L.latLngBounds.fromBBoxString(bbox);
                callback(bounds, datasets);
            });
        }
    }



    function _municipalityHandler(options, api, datasets, fromUrl, callback) {
        datasets = _loadDatasets(api, datasets, fromUrl, options.komm);

        if (_.isString(options.komm)) {
            options.komm = options.komm.split(',');
        }

        _getloader(
            options,
            api,
            datasets,
            api.getMunicipalityBounds,
            options.komm,
            'municipality',
            callback
        );
    }

    function _countyHandler(options, api, datasets, fromUrl, callback) {
        datasets = _loadDatasets(api, datasets, fromUrl, null, options.fylke);
        _getloader(
            options,
            api,
            datasets,
            api.getCountyBounds,
            options.fylke.split(','),
            'county',
            callback
        );
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

        KR.Util.getLine(api, options.line, function (line) {
            _gotLine(line, api, options, datasets, fromUrl, callback);
        });
    }

    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};
        options = _.extend({geomFilter: false, showGeom: false}, options);

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

            L.Knreise.LocateButton(null, null, {bounds: bounds}).addTo(map);

            map.fitBounds(bounds);
            var layers = datasetLoader.loadDatasets(datasets, bounds.toBBoxString(), filter);
            if (lineLayer) {
                lineLayer.addTo(map);
            }
            if (datasets.length > 1) {
                L.control.datasets(layers).addTo(map);
            }
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
