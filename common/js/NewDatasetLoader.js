var KR = this.KR || {};
(function (ns) {
    'use strict';


    var TiledGeoJsonLoader = function (maxBounds) {

        //the tile functions are lifted from 
        //http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Implementations

        var _trees = {};

        var MAX_BOUNDS = L.latLngBounds.fromBBoxString(
            '2.4609375,56.9449741808516,33.3984375,71.85622888185527'
        );

        maxBounds = maxBounds || MAX_BOUNDS;

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
                    return maxBounds.contains(tile.bounds) || maxBounds.intersects(tile.bounds);
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
            return function (ds, bounds, callback, error, loadstart) {
                var tiles = getTiles(bounds, ds.minZoom || 7);

                if (tiles.length === 0) {
                    return;
                }
                loadstart();
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

        var selectFeature = function (dataset, layer) {
            _sidebarHandler.showLayer(layer, dataset);
            if (layer.setIcon) {
                layer.setIcon(KR.Style2.getIcon(dataset, layer.feature, true));
                layer.setZIndexOffset(1000);
            }
            if (dataset.linkedLayer) {
                dataset.linkedLayer.featureSelected(layer.feature);
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

                if (dataset.linkedLayer) {
                    dataset.linkedLayer.deselectAll();
                }
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
            selectFeature(dataset, layer);
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
            deselectAll: deselectAll,
            selectFeature: selectFeature
        };
    };


    ns.newDatasetLoader = function (api, map, datasets, sidebar, bounds, filter) {

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
        var tiledLoader = TiledGeoJsonLoader(bounds);
        var featureSelector;

        var _loadCounter = (function () {
            var loading = {};
            return function (datasetId, increase) {
                if (!loading[datasetId]) {
                    loading[datasetId] = 0;
                }
                if (increase) {
                    loading[datasetId] += 1;
                } else {
                    loading[datasetId] -= 1;
                }
                return loading[datasetId];
            };
        }());

        var _getDataset = function (datasetId) {
            return _.find(_flattened, function (dataset) {
                return (KR.Util.stamp(dataset) === parseInt(datasetId, 10));
            });
        };

        var _getDatasetTopLevel = function (datasetId) {
            return _.find(datasets, function (dataset) {
                return (KR.Util.stamp(dataset) === parseInt(datasetId, 10));
            });
        };


        var _loadstart = function (datasetId) {
            var dataset = _getDataset(datasetId);
            if (dataset && dataset.parentId) {
                datasetId = dataset.parentId;
            }
            var numLoading = _loadCounter(datasetId, true);
            if (numLoading === 1) {
                _datasetToggle.toggleDatasetLoading(datasetId, true);
            }
        };

        var _loadend = function (datasetId) {
            var dataset = _getDataset(datasetId);
            if (dataset && dataset.parentId) {
                datasetId = dataset.parentId;
            }
            var numLoading = _loadCounter(datasetId, false);
            if (numLoading === 0) {
                _datasetToggle.toggleDatasetLoading(datasetId, false);
            }
        };

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

        ns.updateLayerFeatures = function (layerGroup, features, styleFunc, layerCreated) {
            //get the ids of the new features after load
            var newIds = _.pluck(features, 'id');

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
            _.chain(features)
                .filter(function (feature) {
                    return (existingIds.indexOf(feature.id) === -1);
                })
                .map(function (feature) {
                    return L.geoJson(feature).getLayers()[0];
                })
                .each(function (layer) {
                    if (layer.setIcon) {
                        layer.setIcon(styleFunc(layer.feature));
                    } else {
                        layer.setStyle(styleFunc(layer.feature));
                    }
                    if (layerCreated) {
                        layerCreated(layer);
                    }
                    layerGroup.addLayer(layer);
                });
        };

        var _datasetLoaded = function (dataset, data) {
            var layerGroup = _layers[KR.Util.stamp(dataset)];
            if (layerGroup) {

                if (filter) {
                    data = filter(data);
                }

                ns.updateLayerFeatures(layerGroup, data.features, function (feature) {
                    return KR.Style2.getIcon(dataset, feature, false);
                });
                _loadend(KR.Util.stamp(dataset));
            }
        };

        var _loadError = function (err, dataset) {
            _loadend(KR.Util.stamp(dataset));
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
                /*
                dataset.bboxFunc(
                    api,
                    dataset.dataset,
                    tile.bounds.toBBoxString(),
                    function (data) {
                        //tiledLoader.saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                        callback(dataset, data);
                    },
                    function (e) {
                        error(e, dataset);
                    }
                );
                */
            } else {
                api.getBbox(
                    dataset.dataset,
                    tile.bounds.toBBoxString(),
                    function (data) {
                        tiledLoader.saveTileData(KR.Util.stamp(dataset), tile.x, tile.y, data);
                        callback(dataset, data);
                    },
                    function (e) {
                        error(e, dataset);
                    },
                    {checkCancel: false}
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
                _loadTiledDataset(dataset, bounds, success, error, function () {
                    _loadstart(KR.Util.stamp(dataset));
                });
            };
        };

        var _getBboxFuncLoader = function (dataset) {
            return function (bounds, success, error) {
                _loadstart(KR.Util.stamp(dataset));
                _loadTiledDataset(dataset, bounds, success, error, function () {
                    dataset.bboxFunc(
                        api,
                        dataset.dataset,
                        bounds.toBBoxString(),
                        function (data) {
                            success(dataset, data);
                        },
                        function (e) {
                            error(e, dataset);
                        }
                    );
                });
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
                        var parentId = KR.Util.stamp(dataset);
                        return _.map(dataset.datasets, function (ds) {
                            ds.parentId = parentId;
                            return ds;
                        });
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
                    if (dataset.bboxFunc) {
                        acc[KR.Util.stamp(dataset)] = _getBboxFuncLoader(dataset);
                    } else {
                        acc[KR.Util.stamp(dataset)] = _getTileLoader(dataset);
                    }
                    
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
                    _loadstart(KR.Util.stamp(dataset));
                    api.getData(
                        dataset.dataset,
                        function (data) {
                            _datasetLoaded(dataset, data);
                            if (dataset.linkedLayer) {
                                dataset.linkedLayer.dataChanged();
                            }
                        },
                        _loadError
                    );
                });
        };

        var _showDataset = function (datasetId) {
            var dataset = _getDataset(datasetId);
            if (dataset.isStatic) {
                map.addLayer(_layers[datasetId]);
            } else {
                var bounds = map.getBounds();
                var zoom = map.getZoom();
                if (_shouldLoad(datasetId, zoom, bounds)) {
                    var loader = _loaders[datasetId];
                    if (loader) {
                        loader(bounds, _datasetLoaded, _loadError);
                    } else {
                        console.error('no loader found for ', datasetId);
                    }
                }
            }
        };

        var _hideDataset = function (datasetId) {
            var dataset = _getDataset(datasetId);
            if (dataset.isStatic) {
                map.removeLayer(_layers[datasetId]);
            } else {
                _layers[datasetId].clearLayers();
            }
            
        };

        var _toggleDatasetGroup = function (datasets, callback) {

            var finished = _.after(datasets.length, function (visible) {
                callback(visible);
            });
            _.each(datasets, function (dataset) {
                toggleDataset(KR.Util.stamp(dataset), finished);
            });
        };

        var toggleDataset = function (datasetId, callback) {

            var dataset = _getDatasetTopLevel(datasetId);
            if (dataset && dataset.grouped) {
                _toggleDatasetGroup(dataset.datasets, callback);
                return;
            }
            dataset = _getDataset(datasetId);
            dataset.visible = !dataset.visible;
            if (dataset.visible) {
                _showDataset(datasetId);
            } else {
                _hideDataset(datasetId);
            }
            callback(dataset.visible);
            if (dataset.linkedLayer) {
                dataset.linkedLayer.toggleVisible(dataset.visible);
            }
        };

        var featureClicked = function (feature, dataset) {
            if (dataset.linkedLayer) {
                var layers = _layers[KR.Util.stamp(dataset)].getLayers();
                var layer = dataset.linkedLayer.findFeature(feature, layers);
                if (layer) {
                    featureSelector.deselectAll();
                    featureSelector.selectFeature(dataset, layer);
                }
            }
        };

        var _setupLinked = function () {
            _.chain(_flattened)
            .filter(function (dataset) {
                return _.has(dataset, 'linkedLayer');
            }).
            each(function (dataset) {
                dataset.linkedLayer.init(
                    map,
                    _layers[KR.Util.stamp(dataset)],
                    dataset,
                    featureClicked
                );
            });
        };

        var init = function () {
            _.each(datasets, KR.Util.stamp);

            _datasetToggle = L.control.datasets(
                datasets,
                {toggleDataset: toggleDataset}
            ).addTo(map);
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

            _setupLinked();

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
