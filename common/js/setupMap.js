/*global L:false, alert:false, KR:false, turf:false, location: false */

/*
    Utility for setting up a Leaflet map based on config
*/

var KR = this.KR || {};
(function (ns) {
    'use strict';

    function _setupLocationUrl(map) {
        var moved = function () {
            var c = map.getCenter();
            location.hash = KR.Util.getPositionHash(c.lat, c.lng, map.getZoom());
        };
        map.on('moveend', moved);
        moved();
    }

    function _getLocationUrl() {
        var hash = location.hash;
        if (hash && hash !== '') {
            var parts = hash.replace('#', '').split('/');
            var zoom = parseInt(parts[0], 10);
            var lat = parseFloat(parts[1]);
            var lon = parseFloat(parts[2]);
            return {lat: lat, lon: lon, zoom: zoom};
        }
    }


    function _getFilter(buffer) {
        return function (featureCollection) {
            
            if (!featureCollection || !featureCollection.features.length) {
                return featureCollection;
            }
            if (featureCollection.features[0].geometry.type.indexOf('Polygon') === -1) {
                return turf.within(featureCollection, buffer);
            }
            var intersects =  _.filter(featureCollection.features, function (feature) {
                var bbox = turf.extent(feature);
                var bboxPolygon = turf.bboxPolygon(bbox);
                return !!turf.intersect(bboxPolygon, buffer.features[0]);
            });
            return KR.Util.createFeatureCollection(intersects);
        };
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
        }, KR.Util.WORLD);
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

        var map = KR.Util.createMap('map', options);
        var sidebar = KR.Util.setupSidebar(map);
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar, null, options.cluster);

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
            var datasetsLoaded = function () {
                var locationFromUrl = _getLocationUrl(map);
                if (locationFromUrl) {
                    map.setView([locationFromUrl.lat, locationFromUrl.lon], locationFromUrl.zoom);
                }
                _setupLocationUrl(map);
            };

            var skipLoadOutside;
            if (options.geomFilter && bounds) {
                skipLoadOutside = bounds.toBBoxString()
            }

            var layers = datasetLoader.loadDatasets(datasets, bounds.toBBoxString(), filter, datasetsLoaded, skipLoadOutside);

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
