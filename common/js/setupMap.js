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

    function freezeMap(map) {
        // Disable drag and zoom handlers.
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.keyboard.disable();

        // Disable tap handler, if present.
        if (map.tap) {
            map.tap.disable();
        }
    }

    function unFreezeMap(map) {
        // Disable drag and zoom handlers.
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.keyboard.enable();

        // Disable tap handler, if present.
        if (map.tap) {
            map.tap.enable();
        }
    }

    var datasetLoader = function (api, map, datasets) {

        var DEFAULTS = {
            isStatic: true,
            bbox: true,
            cluster: true,
            visible: true
        };

        var _loaders;
        var _layers = {};
        var _trees = {};
        var maxBounds = L.latLngBounds.fromBBoxString('2.4609375,56.9449741808516,33.3984375,71.85622888185527');

        //x
        function lon2tile(lon, zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }

        //y
        function lat2tile(lat, zoom) { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

        function tile2lon(x,z) {
            return (x/Math.pow(2,z)*360-180);
        }
        function tile2lat(y,z) {
            var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
            return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
        }

        var _getTiles = function (bbox, zoom) {
            var n = bbox.getNorth();
            var w = bbox.getWest();
            var s = bbox.getSouth();
            var e = bbox.getEast();

            var minY = lat2tile(n, zoom); // eg.lat2tile(34.422, 9);
            var minX = lon2tile(w, zoom);
            var maxY = lat2tile(s, zoom);
            var maxX = lon2tile(e, zoom);

            return _.chain(_.range(minX, maxX + 1))
                .map(function (x) {
                    return _.map(_.range(minY, maxY + 1), function (y) {
                        var north = tile2lat(y, zoom);
                        var south = tile2lat(y + 1, zoom);
                        var west = tile2lon(x, zoom);
                        var east = tile2lon(x + 1, zoom);
                        return {
                            bounds: L.latLngBounds([south, west], [north, east]),
                            x: x,
                            y: y
                        };
                    })
                })
                .flatten()
                .filter(function (tile) {
                    return maxBounds.contains(tile.bounds);
                })
                .value();
        };

        var _createLayers = function (datasets) {
            return _.reduce(datasets, function (acc, dataset) {
                if (dataset.cluster) {
                    acc[KR.Util.stamp(dataset)] = L.markerClusterGroup({
                        iconCreateFunction: function (cluster, selected) {
                            return KR.Style.getClusterIcon(cluster, selected);
                        },
                        zoomToBoundsOnClick: false,
                        spiderfyOnMaxZoom: false,
                        polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6}
                    }).addTo(map);
                } else {
                    acc[KR.Util.stamp(dataset)] = L.featureGroup([]).addTo(map);
                }
                return acc;
            }, {});
        };

        var _shouldLoad = function (dataset, zoom, bounds) {
            if (dataset.minZoom && zoom <= dataset.minZoom) {
                return false;
            }
            if (dataset.isStatic) {
                return false;
            }
            return true;
        };

        var _datasetLoaded = function (dataset, data) {
            var layer = _layers[KR.Util.stamp(dataset)];
            if (layer) {
                layer.clearLayers()
                _.chain(data.features)
                    .map(function (f) {
                        return L.geoJson(f).getLayers()[0];
                    })
                    .each(function (feature) {
                        feature.setIcon(KR.Style.getIcon(feature.feature, false));
                        layer.addLayer(feature);
                    });
            }
        };

        var _loadError = function (err) {

        };

        var _getTileData = function (dsId, x, y) {
            if (_trees[dsId]) {
                if (_trees[dsId][y]) {
                    if (_trees[dsId][y][x]) {
                        return _trees[dsId][y][x];
                    }
                }
            }
            return null;
        };

        var _isCached = function (dsId, x, y) {
            if (_trees[dsId]) {
                if (_trees[dsId][y]) {
                    if (_trees[dsId][y][x]) {
                        return true;
                    }
                }
            }
            return false;
        };

        var _saveTileData = function (dsId, x, y, data) {
            if (!_trees[dsId]) {
                _trees[dsId] = {};
            }
            if (!_trees[dsId][y]) {
                _trees[dsId][y] = {};
            }
            _trees[dsId][y][x] = data;
        };


        var _loadDataset = function (dataset, tile, doRequest, callback, error) {

            if (dataset.isStatic) {
                api.getData(
                    dataset.dataset,
                    function (data) {
                        callback(dataset, data);
                    },
                    error
                );
            } else {
                var cached = _getTileData(KR.Util.stamp(dataset), tile.x, tile.y);
                if (cached) {
                    callback(dataset, cached);
                    return;
                }
                if (!doRequest) {
                    callback(dataset, {features: []});
                    return;
                }
                if (dataset.bboxFunc) {
                    //TODO: check what kommune this returns, possibly reduce to fewer requests
                    dataset.bboxFunc(
                        api,
                        dataset.dataset,
                        tile.bounds.toBBoxString(),
                        function (data) {
                            _saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                            callback(dataset, data);
                        },
                        error
                    );
                } else {
                    api.getBbox(
                        dataset.dataset,
                        tile.bounds.toBBoxString(),
                        function (data) {
                            _saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                            callback(dataset, data);
                        },
                        error
                    );
                }
            }
        };

        var _loadTiledDataset = function (ds, bounds, callback, error) {
            var tiles = _getTiles(bounds, ds.minZoom || 7);
            var features = [];
            var numUncahed = _.reduce(tiles, function (acc, tile) {
                if (!_isCached(KR.Util.stamp(ds), tile.x, tile.y)) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            var doRequest = numUncahed <= 8;

            var loaded = _.after(tiles.length, function () {
                var poly = turf.bboxPolygon([bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()]);
                features = _.filter(features, function (feature) {
                    return turf.inside(feature, poly);
                });
                callback(ds, {features: features});
            });

            _.each(tiles, function (tile) {
                _loadDataset(ds, tile, doRequest, function (ds, data) {
                    features = features.concat(data.features);
                    loaded();
                }, loaded);
            });
        }

        var _reload = function () {
            var bounds = map.getBounds();
            var zoom = map.getZoom();

            _.chain(_loaders)
                .filter(function (ds) {
                    return _shouldLoad(ds, zoom, bounds);
                })
                .each(function (ds) {
                    _loadTiledDataset(ds, bounds, _datasetLoaded, _loadError);
                });
        };

        var _flatten = function (datasets) {
            return _.chain(datasets)
                .map(function (dataset) {
                    if (dataset.grouped) {
                        return dataset.datasets
                    }
                    return dataset;
                })
                .flatten()
                .map(function (dataset) {
                    KR.Util.stamp(dataset);
                    dataset = _.extend({}, DEFAULTS, dataset);
                    if (dataset.minZoom && dataset.bbox) {
                        dataset.isStatic = false;
                    }
                    return dataset;
                })
                .value();
        };

        var _loadStatic = function () {
            var bounds = map.getBounds();
            var zoom = map.getZoom();
            _.chain(_loaders)
                .filter(function (ds) {
                    return ds.isStatic;
                })
                .each(function (ds) {
                    _loadDataset(ds, null, null, _datasetLoaded, _loadError);
                });
        };

        var init = function () {
            _loaders = _flatten(datasets);
            _layers = _createLayers(_loaders);
            map.on('moveend', _reload);
            _loadStatic();
            _reload();
        };

        return {
            init: init
        };
    }

    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};
        options = _.extend({}, DEFAULT_OPTIONS, options);

        var map = KR.Util.createMap('map', options);
        freezeMap(map);
        if (_.has(options, 'extraLayers') && _.isArray(options.extraLayers)) {
            _.each(options.extraLayers, function (extraLayer) {
                map.addLayer(extraLayer);
            });
        }

        var sidebar = KR.Util.setupSidebar(map, {featureHash: options.featureHash});
        //var datasetLoader = new KR.DatasetLoader(api, map, sidebar, null, options.cluster, options.clusterRadius);

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

            var dl = datasetLoader(api, map, datasets);

            var initMapPos = function (initPos) {
                unFreezeMap(map);
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

                dl.init();

                /*
                var layers = datasetLoader.loadDatasets(
                    datasets,
                    bounds.toBBoxString(),
                    filter,
                    datasetsLoaded,
                    skipLoadOutside
                );
                */

                if (lineLayer) {
                    lineLayer.addTo(map);
                }
                if (datasets.length > 1) {
                    //L.control.datasets(layers).addTo(map);
                }
            };
            //initMapPos(initPos);
            
            if (options.initUserPos) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        function(position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude,
                                zoom: 16
                            };
                            initMapPos(pos);
                        },
                        function () {
                            initMapPos(initPos);
                        }
                    );
                } else {
                    initMapPos(initPos);
                }
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
