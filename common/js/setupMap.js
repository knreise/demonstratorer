/*global L:false, alert:false, KR:false, turf:false */

/*
    Utility for setting up a Leaflet map based on config
*/

var KR = this.KR || {};
(function (ns) {
    'use strict';

    var DEFAULT_OPTIONS = {
        geomFilter: false,
        showGeom: false,
        loactionHash: true,
        featureHash: true
    };


    function _getFilter(buffer) {
        return function (featureCollection) {

            if (!featureCollection || !featureCollection.features.length) {
                return featureCollection;
            }

            var type = featureCollection.features[0].geometry.type;

            if (type.indexOf('Polygon') > -1) {
                var intersects =  _.filter(featureCollection.features, function (feature) {
                    var bbox = turf.extent(feature);
                    var bboxPolygon = turf.bboxPolygon(bbox);
                    return !!turf.intersect(bboxPolygon, buffer.features[0]);
                });
                return KR.Util.createFeatureCollection(intersects);
            }

            if (type.indexOf('MultiLineString') > -1) {
                var intersects =  _.filter(featureCollection.features, function (feature) {
                    var bbox = turf.extent(feature);
                    var bboxPolygon = turf.bboxPolygon(bbox);
                    return !!turf.intersect(bboxPolygon, buffer.features[0]);
                });
                return KR.Util.createFeatureCollection(intersects);
            }

            return turf.within(featureCollection, buffer);

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


    function _getloader(options, api, datasets, boundsFunc, id, paramName, callback, initPos) {
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

                callback(layer.getBounds(), datasets, filter, null, initPos);
            });
        } else {
            boundsFunc(id, function (bbox) {
                var bounds = L.latLngBounds.fromBBoxString(bbox);
                callback(bounds, datasets, null, null, initPos);
            });
        }
    }



    function _municipalityHandler(options, api, datasets, fromUrl, callback, initPos) {
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
            callback,
            initPos
        );
    }

    function _countyHandler(options, api, datasets, fromUrl, callback, initPos) {
        datasets = _loadDatasets(api, datasets, fromUrl, null, options.fylke);

        if (_.isString(options.fylke)) {
            options.fylke = options.fylke.split(',');
        }

        _getloader(
            options,
            api,
            datasets,
            api.getCountyBounds,
            options.fylke,
            'county',
            callback,
            initPos
        );
    }

    function _bboxHandler(options, api, datasets, fromUrl, callback, initPos) {
        datasets = _loadDatasets(api, datasets, fromUrl);
        var bounds = L.latLngBounds.fromBBoxString(options.bbox);
        callback(bounds, datasets, null, null, initPos);
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

    function _gotLine(line, api, options, datasets, fromUrl, callback, initPos) {
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
        callback(bounds, datasets, filter, lineLayer, initPos);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback, initPos) {

        KR.Util.getLine(api, options.line, function (line) {
            _gotLine(line, api, options, datasets, fromUrl, callback, initPos);
        });
    }

    function _checkLoadItemFromUrl(featurecollections) {
        var featureId = KR.UrlFunctions.getHashFeature();

        if (featureId) {
            var findLayer = function (l) {
                return (decodeURIComponent(l.feature.id) === decodeURIComponent(featureId) || l.feature.id === decodeURIComponent(featureId));
            };

            var datasetLayer = _.find(_.flatten(featurecollections), function (layer) {
                return _.find(layer.getLayers(), findLayer);
            });

            if (datasetLayer) {
                var selectedLayer = _.find(datasetLayer.getLayers(), findLayer);
                selectedLayer.fire('click');
                datasetLayer.setLayerSelected(selectedLayer);
            }
        }
    }


    function _addBBox(datasets, bbox) {
        return _.map(datasets, function (dataset) {
            if (dataset.isStatic) {
                dataset.fixedBbox = bbox;
            }
            if (dataset.datasets) {
                dataset.datasets = _.map(dataset.datasets, function (dataset) {
                    if (dataset.isStatic) {
                        dataset.fixedBbox = bbox;
                    }
                    return dataset;
                });
            }
            return dataset;
        });
    }


    function _setAllStatic(datasets) {
        return _.map(datasets, function (dataset) {
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


    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};
        options = _.extend({}, DEFAULT_OPTIONS, options);

        var map = KR.Util.createMap('map', options);
        var sidebar = KR.Util.setupSidebar(map, {featureHash: options.featureHash});
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar, null, options.cluster, options.clusterRadius);

        //HACK: in order for enkeltminner to trigger sidebar I have to expose this here.. 
        map.sidebar = sidebar;

        var splashScreen;
        if (options.title) {
            splashScreen = KR.SplashScreen(map, options.title, options.description, options.image, null, false);
        }

        function showDatasets(bounds, datasets, filter, lineLayer, initPos) {
            if (options.allstatic) {
                datasets = _setAllStatic(datasets);
            }
            datasets = _addBBox(datasets, bounds.toBBoxString());

            var locateBtn = L.Knreise.LocateButton(null, null, {bounds: bounds});
            locateBtn.addTo(map);

            var initMapPos = function (initPos) {
                if (initPos) {
                    map.setView([initPos.lat, initPos.lon], initPos.zoom);
                    bounds = map.getBounds();
                } else {
                    map.fitBounds(bounds);
                }

                if (options.loactionHash) {
                    KR.UrlFunctions.setupLocationUrl(map);
                }

                var datasetsLoaded = function (featurecollections) {
                    _checkLoadItemFromUrl(featurecollections);

                    if (splashScreen) {
                        splashScreen.finishedLoading();
                    }
                };

                var skipLoadOutside;
                if (options.geomFilter && bounds) {
                    skipLoadOutside = bounds.toBBoxString();
                }

                var layers = datasetLoader.loadDatasets(
                    datasets,
                    bounds.toBBoxString(),
                    filter,
                    datasetsLoaded,
                    skipLoadOutside
                );

                if (lineLayer) {
                    lineLayer.addTo(map);
                }
                if (datasets.length > 1) {
                    L.control.datasets(layers).addTo(map);
                }
            };

            if (options.initUserPos) {
                map.addOneTimeEventListener('locationChange', function () {
                    var pos = {lat: map.userPosition.lat, lon: map.userPosition.lng, zoom: 16};
                    initMapPos(pos);
                });
                map.addOneTimeEventListener('locationError', function () {
                    initMapPos(initPos);
                });
                locateBtn.getLocation();
            } else {
                initMapPos(initPos);
            }
        }

        var locationFromUrl = KR.UrlFunctions.getLocationUrl(map);

        var initPos;
        if (!options.initUserPos) {
            initPos = locationFromUrl;
        }

        options.map = map;
        if (options.komm) {
            _municipalityHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.fylke) {
            _countyHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.line) {
            _lineHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.bbox) {
            _bboxHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else {
            alert('Missing parameters!');
        }

        return map;
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, datasetIds, options, true);
    };

}(KR));
