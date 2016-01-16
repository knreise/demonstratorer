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


    var SidebarHandler = function (sidebar) {

        var _getClusterFeatures = function (cluster, dataset) {
            return _.map(cluster.getAllChildMarkers(), function (marker) {
                var feature = marker.feature;
                if (dataset && !feature.template) {
                    feature.template = KR.Util.getTemplateForFeature(feature, dataset);
                }
                return feature;
            });
        };

        var showCluster = function (cluster, dataset) {
            var props = _.extend(
                {},
                {template: null, getFeatureData: null, noListThreshold: null},
                dataset
            );
            sidebar.showFeatures(
                _getClusterFeatures(cluster, dataset),
                dataset,
                props.getFeatureData,
                props.noListThreshold
            );
        };

        var showLayer = function (layer, dataset) {
            sidebar.showFeature(
                layer.feature,
                dataset,
                dataset.getFeatureData
            );
        };

        return {
            showCluster: showCluster,
            showLayer: showLayer
        };
    };

    var FeatureSelector = function (layerGroups, datasets, sidebar) {

        var _sidebarHandler = SidebarHandler(sidebar);

        var _selectFeature = function (dataset, layer) {
            _sidebarHandler.showLayer(layer, dataset);
            if (layer.setIcon) {
                layer.setIcon(KR.Style2.getIcon(dataset, layer.feature, true));
                layer.setZIndexOffset(1000);
            }
        };

        var _selectCluster = function (dataset, layer) {
            _sidebarHandler.showCluster(layer, dataset);
            layer.createIcon = function () {
                return KR.Style2.getClusterIcon(dataset, layer, true).createIcon();;
            };
            layer.selected = true;
            layer._updateIcon();
        };

        var _deselectClusters = function (layer) {
            _.each(layer._gridClusters, function (g) {
                _.each(g._grid, function (h) {
                    _.each(h, function (i) {
                        _.each(i, function (cluster) {
                            if (cluster.selected) {
                                cluster.createIcon = _.bind(
                                    L.MarkerCluster.prototype.createIcon,
                                    cluster
                                );
                                cluster._updateIcon();
                                cluster.selected = false;
                            }
                        });
                    });
                });
            });
        };

        var _deselectFeature = function (dataset, layer) {
            if (layer.setIcon) {
                layer.setIcon(KR.Style2.getIcon(dataset, layer.feature, false));
                layer.setZIndexOffset(0);
            }
        };

        var deselectAll = function () {
            _.each(datasets, function (dataset) {
                var datasetId = KR.Util.stamp(dataset);
                var layerGroup = layerGroups[datasetId];
                if (layerGroup) {
                    _.each(layerGroup.getLayers(), function (layer) {
                        _deselectFeature(dataset, layer);
                    });
                    if (_.has(layerGroup, '_gridClusters')) {
                        _deselectClusters(layerGroup);
                    }
                }
            });
        };

        var featureClicked = function (dataset, layer) {
            deselectAll();
            var datasetId = KR.Util.stamp(dataset);
            var layerGroup = layerGroups[datasetId];
            _selectFeature(dataset, layer);
        };

        var clusterClicked = function (dataset, layer) {
            deselectAll();
            var datasetId = KR.Util.stamp(dataset);
            var layerGroup = layerGroups[datasetId];
            _selectCluster(dataset, layer);
        };

        sidebar.on('hide', deselectAll);

        return {
            featureClicked: featureClicked,
            clusterClicked: clusterClicked,
            deselectAll: deselectAll
        };
    };


    ns.newDatasetLoader = function (api, map, datasets, sidebar) {

        var DEFAULTS = {
            isStatic: true,
            bbox: true,
            cluster: true,
            visible: true
        };

        var _loaders;
        var _layers = {};
        var _flattened = [];

        var _datasetToggle;
        var tiledLoader = TiledGeoJsonLoader();
        var featureSelector;

        var _createClusterLayer = function (dataset) {
            return L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    return KR.Style2.getClusterIcon(dataset, cluster, false);
                },
                zoomToBoundsOnClick: false,
                spiderfyOnMaxZoom: false,
                polygonOptions: {
                    fillColor: '#ddd',
                    weight: 2,
                    color: '#999',
                    fillOpacity: 0.6
                }
            }).on('clusterclick', function (e) {
                featureSelector.clusterClicked(dataset, e.layer);
            }).on('click', function (e) {
                featureSelector.featureClicked(dataset, e.layer);
            });
        };

        var _createLayer = function (dataset) {
            return L.featureGroup([])
                .on('click', function (e) {
                    featureSelector.featureClicked(dataset, e.layer);
                });
        };

        var _createLayers = function (datasets) {
            return _.reduce(datasets, function (acc, dataset) {
              if (dataset.cluster) {
                    acc[KR.Util.stamp(dataset)] = _createClusterLayer(dataset);
                } else {
                    acc[KR.Util.stamp(dataset)] = _createLayer(dataset);
                }
                return acc;
            }, {});
        };

        var _getDataset = function (datasetId) {
            return _.find(_flattened, function (dataset) {
                return (KR.Util.stamp(dataset) === parseInt(datasetId, 10));
            });
        };

        var _datasetLoaded = function (dataset, data) {
            var layerGroup = _layers[KR.Util.stamp(dataset)];
            if (layerGroup) {

                //get the ids of the new features after load
                var newIds = _.pluck(data.features, 'id');

                //remove layers not on map anymore
                _.each(layerGroup.getLayers(), function (layer) {
                    if (newIds.indexOf(layer.feature.id) === -1) {
                        layerGroup.removeLayer(layer);
                    } 
                });

                //get ids of existing layers
                var existingIds = _.map(layerGroup.getLayers(), function (layer) {
                    return layer.feature.id;
                });


                //only add new layers
                _.chain(data.features)
                    .filter(function (feature) {
                        return (existingIds.indexOf(feature.id) === -1);
                    })
                    .map(function (feature) {
                        return L.geoJson(feature).getLayers()[0];
                    })
                    .each(function (layer) {
                        layer.setIcon(KR.Style2.getIcon(dataset, layer.feature, false));
                        layerGroup.addLayer(layer);
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

        var _shouldLoad = function (datasetId, zoom, bounds) {
            var dataset = _getDataset(datasetId);
            if (dataset.minZoom && zoom <= dataset.minZoom) {
                return false;
            }
            if (!dataset.visible) {
                return false;
            }
            return true;
        };

        var _toggleEnabledBasedOnScale = function () {
            var zoom = map.getZoom();
            var shouldHide = function (dataset) {
                if (!dataset.minZoom) {
                    return false;
                }
                return (zoom <= dataset.minZoom);
            };
            _.chain(_flattened)
                .filter(shouldHide)
                .each(function (dataset) {
                    _hideDataset(KR.Util.stamp(dataset));
                });

            _.each(_flattened, function (dataset) {
                var datasetId = KR.Util.stamp(dataset);
                _datasetToggle.toggleDatasetEnabled(datasetId, !shouldHide(dataset));
            });
        };

        var _reload = function () {
            var bounds = map.getBounds();
            var zoom = map.getZoom();
            _toggleEnabledBasedOnScale();
            _.chain(_loaders)
                .filter(function (loader, datasetId) {
                    return _shouldLoad(datasetId, zoom, bounds);
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

        /*
            Prepare datasets for usage: 
                - flatten them
                - stamp them
                - set defaults
        */
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

        /*
            Create tile loader functions for all 
            non-static datasets
        */
        var _createLoaders = function (datasets) {
            return _.chain(datasets)
                .filter(function (dataset) {
                    return !dataset.isStatic;
                })
                .reduce(function (acc, dataset) {
                    acc[KR.Util.stamp(dataset)] = _getTileLoader(dataset);
                    return acc;
                }, {})
                .value();
        };

        var _loadStatic = function (datasets) {
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

        var _showDataset = function (datasetId) {
            var bounds = map.getBounds();
            var zoom = map.getZoom();
            if (_shouldLoad(datasetId, zoom, bounds)) {
                var loader = _loaders[datasetId];
                loader(bounds, _datasetLoaded, _loadError);
            }
        };

        var _hideDataset = function (datasetId) {
            _layers[datasetId].clearLayers();
        };

        var toggleDataset = function (datasetId, callback) {
            var dataset = _getDataset(datasetId);
            dataset.visible = !dataset.visible;
            if (dataset.visible) {
                _showDataset(datasetId);
            } else {
                _hideDataset(datasetId);
            }
            callback(dataset.visible);

        };

        var init = function () {

            _datasetToggle = L.control.datasets(datasets, {toggleDataset: toggleDataset}).addTo(map);

            //flatten the list of datasets in order to send requests for the sub-datasets
            _flattened  = _prepareDatasets(datasets);

            //create loader functions for the non-static
            _loaders = _createLoaders(_flattened);

            //create leaflet layers for all datasets
            _layers = _createLayers(_flattened);

            //set up a feature selector and tie it to the sidebar
            featureSelector = FeatureSelector(_layers, _flattened, sidebar);

            //add the layers to the map
            _.each(_layers, function (layer) {
                layer.addTo(map);
            });

            //register for moveend to reload non-static
            map.on('moveend', _reload);

            //load the static datasets once
            _loadStatic(_flattened);

            //reload the non-static datasets
            _reload();

            
        };

        return {
            init: init
        };
    };


}(KR));
