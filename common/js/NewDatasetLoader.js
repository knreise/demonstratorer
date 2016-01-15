var KR = this.KR || {};
(function (ns) {
    'use strict';


    var TiledGeoJsonLoader = function () {

        //the tile functions are lifted from 
        //http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Implementations

        var _trees = {};

        var MAX_BOUNDS = L.latLngBounds.fromBBoxString(
            '2.4609375,56.9449741808516,33.3984375,71.85622888185527'
        );

        function lon2tile(lon, zoom) { //x
            return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
        }

        function lat2tile(lat, zoom) { //y
            return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); //eslint-disable-line max-len
        }

        function tile2lon(x, z) {
            return (x / Math.pow(2, z) * 360 - 180);
        }
        function tile2lat(y, z) {
            var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
            return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
        }

        var getTiles = function (bbox, zoom) {
            var n = bbox.getNorth();
            var w = bbox.getWest();
            var s = bbox.getSouth();
            var e = bbox.getEast();

            var minY = lat2tile(n, zoom);
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
                    });
                })
                .flatten()
                .filter(function (tile) {
                    return MAX_BOUNDS.contains(tile.bounds);
                })
                .value();
        };

        var getTileData = function (dsId, x, y) {
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

        var saveTileData = function (dsId, x, y, data) {
            if (!_trees[dsId]) {
                _trees[dsId] = {};
            }
            if (!_trees[dsId][y]) {
                _trees[dsId][y] = {};
            }
            _trees[dsId][y][x] = data;
        };

        var _getNumUnched = function (tiles, datasetId) {
            return _.reduce(tiles, function (acc, tile) {
                if (!_isCached(datasetId, tile.x, tile.y)) {
                    return acc + 1;
                }
                return acc;
            }, 0);
        };

        var getTiledLoader = function (singleTileLoader) {
            return function (ds, bounds, callback, error) {
                var tiles = getTiles(bounds, ds.minZoom || 7);
                var features = [];
                var numUncahed = _getNumUnched(tiles, KR.Util.stamp(ds));
                var doRequest = numUncahed <= 8;

                var loaded = _.after(tiles.length, function () {
                    var poly = turf.bboxPolygon([
                        bounds.getWest(),
                        bounds.getNorth(),
                        bounds.getEast(),
                        bounds.getSouth()
                    ]);
                    features = _.filter(features, function (feature) {
                        return turf.inside(feature, poly);
                    });
                    callback(ds, {features: features});
                });

                _.each(tiles, function (tile) {
                    singleTileLoader(ds, tile, doRequest, function (ds, data) {
                        features = features.concat(data.features);
                        loaded();
                    }, loaded);
                });
            };
        };

        return {
            saveTileData: saveTileData,
            getTileData: getTileData,
            getTiles: getTiles,
            getTiledLoader: getTiledLoader
        };

    };


    ns.newDatasetLoader = function (api, map, datasets) {

        var DEFAULTS = {
            isStatic: true,
            bbox: true,
            cluster: true,
            visible: true
        };

        var _loaders;
        var _layers = {};

        var tiledLoader = TiledGeoJsonLoader();


        var _createLayers = function (datasets) {
            return _.reduce(datasets, function (acc, dataset) {
                if (dataset.cluster) {
                    acc[KR.Util.stamp(dataset)] = L.markerClusterGroup({
                        iconCreateFunction: function (cluster, selected) {
                            return KR.Style.getClusterIcon(cluster, selected);
                        },
                        zoomToBoundsOnClick: false,
                        spiderfyOnMaxZoom: false,
                        polygonOptions: {
                            fillColor: '#ddd',
                            weight: 2,
                            color: '#999',
                            fillOpacity: 0.6
                        }
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
                layer.clearLayers();
                _.chain(data.features)
                    .map(function (f) {
                        return L.geoJson(f).getLayers()[0];
                    })
                    .each(function (feature) {
                        feature.setIcon(KR.Style2.getIcon(dataset, feature.feature, false));
                        layer.addLayer(feature);
                    });
            }
        };

        var _loadError = function (err) {

        };


        var _loadDataset = function (dataset, tile, doRequest, callback, error) {

            var cached = tiledLoader.getTileData(KR.Util.stamp(dataset), tile.x, tile.y);
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
                        tiledLoader.saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                        callback(dataset, data);
                    },
                    error
                );
            } else {
                api.getBbox(
                    dataset.dataset,
                    tile.bounds.toBBoxString(),
                    function (data) {
                        tiledLoader.saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                        callback(dataset, data);
                    },
                    error
                );
            }
        };

        var _reload = function () {
            var bounds = map.getBounds();
            var zoom = map.getZoom();

            _.chain(_loaders)
                .filter(function (ds) {
                    return _shouldLoad(ds, zoom, bounds);
                })
                .each(function (loader) {
                    loader(bounds, _datasetLoaded, _loadError);
                });
        };

        var _loadTiledDataset = tiledLoader.getTiledLoader(_loadDataset);

        var _getTileLoader = function (dataset) {
            return function (bounds, success, error) {
                _loadTiledDataset(dataset, bounds, success, error);
            };
        };


        var _prepareDatasets = function (datasets) {
            return _.chain(datasets)
                .map(function (dataset) {
                    if (dataset.grouped) {
                        return dataset.datasets;
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

        var _createLoaders = function (datasets) {
            return _.chain(datasets)
                .filter(function (dataset) {
                    return !dataset.isStatic;
                })
                .map(function (dataset) {
                    return _getTileLoader(dataset);
                })
                .value();
        };

        var _loadStatic = function (datasets) {
            var bounds = map.getBounds();
            var zoom = map.getZoom();
            _.chain(datasets)
                .filter(function (dataset) {
                    return dataset.isStatic;
                })
                .each(function (dataset) {
                    api.getData(
                        dataset.dataset,
                        function (data) {
                            _datasetLoaded(dataset, data);
                        },
                        _loadError
                    );
                });
        };

        var init = function () {
            var flattened  = _prepareDatasets(datasets);
            _loaders = _createLoaders(flattened);
            _layers = _createLayers(flattened);
            map.on('moveend', _reload);
            _loadStatic(flattened);
            _reload();
        };

        return {
            init: init
        };
    };


}(KR));
