/*global L:false, alert:false, KR:false, turf:false */

/*
    Utility for setting up a Leaflet map based on config
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _loadDatasetMock(datasetId, bbox, callback) {
    setTimeout(function(){ 
        callback(null, datasetId);
    }, getRandomInt(500, 3000));
}

function toDict(arr, key, trans) {
    return _.reduce(arr, function(acc, element) {
        acc[element[key]] = _.isFunction(trans) ? trans(element) : trans;
        return acc;
    }, {});
}

function ApiLoader(api, flattenedDatasets) {
    return function(datasetId, requestedBbox, callback) {
        var dataset = flattenedDatasets[datasetId];

        if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
            var bbox = (!!dataset.fixedBbox) ? dataset.fixedBbox : requestedBbox;
            api.getBbox(
                dataset.dataset,
                bbox,
                function (data) {
                    callback(null, data);
                },
                function (error) {
                    callback(error, null);
                }
            );
        } else {
            api.getData(
                dataset.dataset,
                function (data) {
                    callback(null, data);
                },
                function (error) {
                    callback(error, null);
                }
            );
        }
    }
}

var DATASET_DEFAULTS = {
    bbox: true,
    cluster: true,
    style: {
        fillcolor: '#38A9DC',
        circle: false,
        thumbnail: true
    }
}

function DatasetLoader(datasets, map, api, initBounds, filter) {
    var currentBounds = initBounds;
    datasets = _setDefaults(datasets);
    console.log(datasets)
    var currentZoom = map.getZoom();
    _ensureId(datasets);
    

    var datasetIdMapping = _getDatasetMapping(datasets);
    var flattenedDatasets = _flattenDatasets(datasets);

    var _loadDatasetFromApi = ApiLoader(api, flattenedDatasets);

    var enabledDatsets = toDict(datasets, '_id', true);
    var currentlyLoading = toDict(datasets, '_id', false);
    var availableDatasets = toDict(datasets, '_id', _datasetAvailable);
    var prevBounds = toDict(datasets, '_id', initBounds);
    var currentData = toDict(flattenedDatasets, '_id', null);
    var currentErrors = toDict(flattenedDatasets, '_id', null);

    var onLoadStarts = [];
    var onLoadEnds = [];
    var onEnabledChanges = [];
    var onAvailableChanges = [];
    var onInduvidualLoadEnds = [];

    map.on('moveend', _mapMoved);

    function _loadDataset(children, datasetId, bounds, initialLoad) {

        if (!enabledDatsets[datasetId]) {
            return;
        }
        if (!availableDatasets[datasetId]) {
            return;
        }

        var toLoad = _.chain(children)
            .map(function (datasetId) {
                return flattenedDatasets[datasetId];
            })
            .filter(function (dataset) {
                return initialLoad || !dataset.static;
            })
            .value();
        if (toLoad.length === 0) {
            return;
        }
        currentlyLoading[datasetId] = true;
        prevBounds[datasetId] = bounds;

        //trigger datasetId
        _.each(onLoadStarts, function(callback) {
            callback(datasetId);
        });

        var completed = _.after(toLoad.length, function () {
            currentlyLoading[datasetId] = false;
            //trigger onLoadEnd
            _.each(onLoadEnds, function(callback) {
                callback(datasetId);
            });
        });

        var bbox = bounds.toBBoxString();
        _.each(toLoad, function (dataset) {
            _loadDatasetFromApi(dataset._id, bbox, function (error, data) {
                _datasetUpdated(dataset._id, data, error)
                completed();
            });
        });
    }

    function _loadDatasets(bounds, initialLoad) {
        _.each(datasetIdMapping, _.partial(_loadDataset, _, _,bounds, initialLoad));
    }

    function _datasetAvailable(d) {
        return (d.minZoom) 
            ? (currentZoom > d.minZoom)
            : true;
    }

    function _shouldGetNewData(prevBbox, newBbox) {

        var prevBounds = (_.isString(prevBbox))
            ? L.latLngBounds.fromBBoxString(prevBbox)
            : prevBbox;
        var newBounds = (_.isString(prevBbox))
            ? L.latLngBounds.fromBBoxString(newBbox)
            : newBbox;

        if (prevBounds.equals(newBounds) || prevBounds.contains(newBounds)) {
            return false;
        }
        return true;
    }

    function _toggleEnabled(datasetId) {
        var wasEnabled = enabledDatsets[datasetId];
        enabledDatsets[datasetId] = !wasEnabled;
        _.each(onEnabledChanges, function(callback) {
            callback(datasetId, !wasEnabled);
        });
        if (!wasEnabled && _shouldGetNewData(prevBounds[datasetId], currentBounds)) {
            _loadDataset(datasetIdMapping[datasetId], datasetId, currentBounds, false);
        }
    }

    function _datasetUpdated(datasetId, data, error) {
        if (error) {
            currentErrors[datasetId] = error;
        } else {
            currentErrors[datasetId] = null;
            currentData[datasetId] = data;
        }

        _.each(onInduvidualLoadEnds, function (callback) {
            callback(error, datasetId, data);
        });
    }

    function _checkAvailable() {
        _.each(datasets,  function (dataset) {
            var isAvailable = _datasetAvailable(dataset);
            if (isAvailable !== availableDatasets[dataset._id]) {
                availableDatasets[dataset._id] = isAvailable;
                 _.each(onAvailableChanges, function(callback) {
                    callback(dataset._id, isAvailable);
                });
            }
            return isAvailable;
        });
    }

    function _mapMoved(e) {
        if (map.getZoom() !== currentZoom) {
            currentZoom = map.getZoom();
            _checkAvailable();
        }

        var newBounds = map.getBounds();
        if (_shouldGetNewData(currentBounds, newBounds)) {
            _loadDatasets(newBounds, false);
        }
        currentBounds = newBounds;
    }

    function _ensureId(datasets) {
        _.each(datasets, function (dataset, i) {
            if (dataset.grouped) {
                _.each(dataset.datasets, function(sub, j) {
                    sub._id = 'dataset_' + i + '_' + j;
                });
            }
            dataset._id = 'dataset_' + i;
        });
    }

    function _flattenDatasets(datasets) {
        return _.reduce(datasets, function (acc, dataset) {
            if (dataset.grouped) {
                acc = _.extend({}, acc, _.reduce(dataset.datasets, function (acc2, subdataset) {
                    subdataset.group = dataset._id;
                    acc2[subdataset._id] = subdataset;
                    return acc2;
                }, {}));

            } else {
                acc[dataset._id] = dataset;
            }
            return acc;
        }, {});
    }

    function _getDatasetMapping(datasets) {
        return _.reduce(datasets, function (acc, dataset) {
            acc[dataset._id] = (dataset.grouped) 
                ? _.pluck(dataset.datasets, '_id')
                : [dataset._id];
            return acc;
        }, {});
    }

    function extend(a, b) {
        var allKeys = _.uniq(_.keys(a).concat(_.keys(b)));
        return _.reduce(allKeys, function (acc, key) {
            if (!_.has(a, key)) {
                acc[key] = _.clone(b[key]);
            } else if (_.isObject(a[key]) && _.has(b, key)) {
                acc[key] = extend(a[key], b[key]);
            } else {
                acc[key] = a[key];
            }
            return acc;
        }, {});
    }


    function _setDefaults(datasets, parent) {
        return _.map(datasets, function (dataset) {
            if (dataset.datasets) {
                dataset.datasets = _setDefaults(dataset.datasets, dataset);
            }
            if (parent) {
                return extend(extend(dataset, _.omit(parent, 'datasets', 'grouped')), DATASET_DEFAULTS);
            } else {
                return extend(dataset, DATASET_DEFAULTS);
            }
            
        });
    }

    function _transforDataset(dataset) {

        return {
            _id: dataset._id,
            name: dataset.name,
            isLoading: currentlyLoading[dataset._id],
            isAvailable: availableDatasets[dataset._id], // are we within the range?
            isEnabled: enabledDatsets[dataset._id], // has the user checked it?
            style: dataset.style,
            template: !!dataset.template ? dataset.template : KR.Util.getDatasetTemplate('popup'),
            description: dataset.description,
            provider: dataset.provider,
            feedbackForm: dataset.feedbackForm,
            getFeatureData: dataset.getFeatureData,
            noListThreshold: dataset.noListThreshold
        };
    }

    return {
        onLoadStart: function (callback) {
            onLoadStarts.push(callback);
        },
        onLoadEnd: function (callback) {
            onLoadEnds.push(callback);
        },
        onDataLoadEnd: function (callback) {
            onInduvidualLoadEnds.push(callback);
        },
        onEnabledChange: function (callback) {
            onEnabledChanges.push(callback);
        },
        onAvailableChange: function (callback) {
            onAvailableChanges.push(callback);
        },
        init: function () {
            _loadDatasets(currentBounds, true);
        },
        toggleEnabled: _toggleEnabled,
        getData: function (datasetId) {
            return {
                error: currentErrors[datasetId],
                data: currentData[datasetId]
            };
        },
        datasetIdMapping: _.extend({}, datasetIdMapping),
        getLayers: function () {
            return _.map(datasets, _transforDataset);
        },
        getDataset: function(datasetId) {
            var dataset = _.find(flattenedDatasets, function (d) {return d._id === datasetId});
            if (dataset) {
                return _transforDataset(dataset);
            }
            return null;
        }
    };
}


var Style = function(style) {

    var fallbacks = {
        bordercolor: 'fillcolor'
    };

    var defaults = {
        bordercolor: '#38A9DC',
        fillcolor: '#38A9DC',
        radius: 9,
        clickable: true,
        weight: 2,
        fillOpacity: 0.2
    };

    var selectOverrides = {
        bordercolor: '#72B026',
        fillcolor: '#72B026'
    };

    function get(type, feature, selected) {
        if (selected) {
            return getSelected(type, feature);
        }
        var value;
        if (_.has(style, type)) {
            value = style[type]
        } else if (_.has(fallbacks, type) && _.has(style, fallbacks[type])) {
            value = style[fallbacks[type]];
        } else {
            value = defaults[type];
        }
        if (_.isFunction(value)) {
            return value(feature);
        }
        return value;
    }

    function getSelected(type, feature) {
        if (_.has(selectOverrides, type)) {
            return selectOverrides[type];
        }
        return get(type, feature, false);
    }

    return {
        get: get,
        getSelected: getSelected,
        isCircle: style.circle,
        isThumbnail: style.thumbnail
    };
}

function getMarker(feature, latlng, styleFunc, selected) {

    var title;
    if (feature.properties && feature.properties.title) {
        title = feature.properties.title;
    }

    if (styleFunc.isThumbnail && feature.properties && feature.properties.thumbnail) {
        var color = styleFunc.get('fillcolor', feature, selected);
        var thumbnail = KR.Util.getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(\'' + thumbnail + '\');border-color:' + color + ';"></div>' +
            '</div>';

        return L.marker(latlng, {
            icon: new L.DivIcon({
                className: 'leaflet-marker-circle',
                html: html,
                iconSize: [50, 50],
                iconAnchor: [25, 25]
            }),
            title: title,
            clickable: styleFunc.get('clickable', feature, selected)
        });
    }

    if (styleFunc.isCircle) {
        return L.circleMarker(latlng, {
            radius: styleFunc.get('radius', feature, selected),
            weight: 1,
            opacity: 1,
            color: styleFunc.get('bordercolor', feature, selected),
            fillColor: styleFunc.get('fillcolor', feature, selected),
            fillOpacity: 0.4,
            title: title,
            clickable: styleFunc.get('clickable', feature, selected)
        });
    }

    return L.marker(latlng, {
        icon: L.Knreise.icon({
            markerColor: styleFunc.get('fillcolor', feature, selected)
        }),
        title: title,
        clickable: styleFunc.get('clickable', feature, selected)
    });

}

function LayerManager(map, loader, onclick) {

    var layerGroups = {};


    function init() {
        loader.onDataLoadEnd(_dataLoaded);

        loader.onEnabledChange(_toggleEnabled);

        layerGroups = _.reduce(loader.datasetIdMapping, function (acc, sublayers, groupId) {
            return _.extend(acc,  _.reduce(sublayers, function(acc, layerId) {
                acc[layerId] = L.featureGroup([]).addTo(map);
                return acc;
            }, {}));
        }, {});
    }

    function _dataLoaded(error, datasetId, data) {
        if (error) {
            //console.error("11", error, datasetId);
            console.log('err', datasetId);
        } else {
            //console.log('loadEnd', datasetId, data);
            _addData(datasetId, data);
        }
    }

    function _toggleEnabled(datasetId, enabled) {
        _.each(loader.datasetIdMapping[datasetId], function (datasetId) {
            var layerGroup = layerGroups[datasetId];
            if (enabled && !map.hasLayer(layerGroup)) {
                map.addLayer(layerGroup);
            }
            if (!enabled && map.hasLayer(layerGroup)) {
                map.removeLayer(layerGroup);
            }
        });

    }

    function _featureClicked(e, feature, datasetId) {
        console.log('click', e, feature, datasetId)
        onclick(feature, loader.getDataset(datasetId));
    }

    function _addData(datasetId, data) {
        var dataset = loader.getDataset(datasetId);
        if (!dataset) {
            console.error("did not find dataset", datasetId);
            return;
        }
        var styleFunc = Style(dataset.style);
        var layerGroup = layerGroups[datasetId];
        map.removeLayer(layerGroup);
        layerGroups[datasetId] = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
                    return getMarker(feature, latlng, styleFunc, false);
                },
                style: function (feature) {
                    return {
                        fillColor: styleFunc.get('fillcolor', feature, false),
                        color: styleFunc.get('bordercolor', feature, false),
                        weight: styleFunc.get('weight', feature, false),
                        fillOpacity: styleFunc.get('fillOpacity', feature, false),
                        title: 'test'
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function (e) {
                        return _featureClicked(e, feature, datasetId);
                    });
                }
            })
            .addTo(map);
    }


    return {
        init: init
    };
}


var KR = this.KR || {};
(function (ns) {
    'use strict';

    var DEFAULT_OPTIONS = {
        geomFilter: false,
        showGeom: false,
        loactionHash: true,
        featureHash: true
    };

    function _addInverted(map, layer) {
        var style = {
            stroke: false,
            fillColor: '#ddd',
            fillOpacity: 0.8
        };

        var data = _.reduce(layer.getLayers(), function (geom, layer) {
            return turf.erase(geom, layer.toGeoJSON());
        }, KR.Util.WORLD);
        L.geoJson(data, style).addTo(map);
    }

    function boundsToPoly(bounds) {
        return KR.Util.createFeatureCollection([
            L.polygon([
                bounds.getSouthWest(),
                bounds.getNorthWest(),
                bounds.getNorthEast(),
                bounds.getSouthEast(),
                bounds.getSouthWest()
            ]).toGeoJSON()
        ]);
    }

    function _simplify(featureCollection) {
        var features = _.map(featureCollection.features, function (feature) {
            return turf.simplify(feature, 0.01, false);
        });
        return KR.Util.createFeatureCollection(features);
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
        // enable drag and zoom handlers.
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.keyboard.enable();

        // enable tap handler, if present.
        if (map.tap) {
            map.tap.enable();
        }
    }

    function extendOptions(options) {
        return _.extend({}, DEFAULT_OPTIONS, options || {});
    }

    function addExtraLayers(map, options) {
        if (_.has(options, 'extraLayers') && _.isArray(options.extraLayers)) {
            _.each(options.extraLayers, function (extraLayer) {
                map.addLayer(extraLayer);
            });
        }
    }

    function setupSplashScreen(map, options) {
        if (options.title) {
            return KR.SplashScreen(map, options.title, options.description, options.image, null, false);
        }
    }

    function addLocateButton(map) {
        var locateBtn = L.Knreise.LocateButton(null, null, {bounds: null});
        locateBtn.addTo(map);
        return locateBtn;
    }

    function getInitBounds(api, options, callback) {

        //The three two cases requires an api call
        var boundsFunc = null;
        var boundsParam = null;
        if (options.komm) {
            boundsParam = _.isString(options.komm) ? options.komm.split(',') : options.komm;
            boundsFunc = function (komm, callback) {
                var dataset = {
                    api: 'cartodb',
                    municipality: komm
                };
                api.getData(dataset, function (geoJson) {
                    var layer = L.geoJson(geoJson);
                    var bounds = layer.getBounds();
                    callback(bounds, layer);
                });
            }
        } else if (options.fylke) {
            boundsParam = _.isString(options.fylke) ? options.fylke.split(',') : options.fylke;
            boundsFunc = function (county, callback) {
                var dataset = {
                    api: 'cartodb',
                    county: county
                };
                api.getData(dataset, function (geoJson) {
                    var layer = L.geoJson(geoJson);
                    var bounds = layer.getBounds();
                    callback(bounds, layer);
                });
            }
        } else if (options.line) {
            boundsParam = options.line;
            boundsFunc = function (line, callback) {
                KR.Util.getLine(api, options.line, function (line) {
                    var lineLayer = L.geoJson(line,{
                        color: !!options.linecolor ? options.linecolor: '#03f',
                        clickable: false
                    });
                    var bounds = lineLayer.getBounds();
                    callback(bounds, lineLayer);
                });
            }
        }
        //do the actual api call
        if (boundsFunc && boundsParam) {
            boundsFunc(boundsParam, function (bbox, filterGeom) {
                var bounds = _.isString(bbox) ? L.latLngBounds.fromBBoxString(bbox) : bbox;
                callback(null, bounds, filterGeom);
            });
            return;
        }
        //line is a bit special, since we need to add the line to the map as well
        if (options.bbox) { //or get bounds from options
            var bounds = L.latLngBounds.fromBBoxString(options.bbox);
            callback(null, bounds);
        } else {
            callback('Missing parameters!');
        }
    }

    function getUserPos(map, options, callback) {
        var locationFromUrl = KR.UrlFunctions.getLocationUrl(map);

        if (!options.initUserPos) {
            callback(locationFromUrl);
            return;
        }
        if (!navigator.geolocation) {
            callback(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    zoom: 16
                };
                callback(pos);
            },
            function () {
                callback(null);
            }
        );
    }

    function createGeomFilter(geom, buffer) {
        var fc = KR.Util.createFeatureCollection(
            _.map(geom.getLayers(), function (layer) {
                return layer.toGeoJSON();
            })
        );
        return turf.buffer(
            (fc.features.length > 5) ? _simplify(fc) : fc,
            buffer,
            'kilometers'
        );
    }

    ns.setupMap = function (api, datasets, options, fromUrl) {
        options = extendOptions(options);
        var map = KR.Util.createMap('map', options);
        freezeMap(map);
        addExtraLayers(map, options);
        var splashScreen = setupSplashScreen(map, options)
        var locateBtn = addLocateButton(map);

        var sidebar = KR.Util.setupSidebar(map, {featureHash: options.featureHash});
        function onFeatureClick(feature, dataset) {
            sidebar.showFeature(feature, dataset);
        }

        if (options.loactionHash) {
            KR.UrlFunctions.setupLocationUrl(map);
        }

        getInitBounds(api, options, function (err, bounds, filterGeom) {
            if (err) {
                alert(err);
                return;
            }
            getUserPos(map, options, function(initPos) {
                unFreezeMap(map);
                if (initPos && bounds.contains(L.latLng(initPos.lat, initPos.lon))) {
                    map.setView([initPos.lat, initPos.lon], initPos.zoom);
                } else {
                    map.fitBounds(bounds);
                }
                //restrict the map
                map.setMaxBounds(bounds);
                map.options.minZoom = map.getBoundsZoom(bounds);

                if (filterGeom && options.line) {
                    filterGeom.addTo(map);
                } 
                if (filterGeom && options.showGeom) {
                     _addInverted(map, filterGeom);
                }

                var filter;
                if (filterGeom && options.buffer) {
                    filter = createGeomFilter(filterGeom, options.buffer);
                } else if (options.geomFilter) {
                    filter = boundsToPoly(bounds);
                }

                var loader = DatasetLoader(datasets, map, api, bounds, filter);

                var layerManager = LayerManager(map, loader, onFeatureClick);

                L.control.datasets2(loader).addTo(map);

                layerManager.init();
                loader.init();

            });
        });

        return map;
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, ns.Config.getDatasets(datasetIds), options, true);
    };

}(KR));
