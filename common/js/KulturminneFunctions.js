/*global L:false, _:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {
        var _selectedPoly;
        var _dataset;
        var _vectorLayer;
        var _map;
        var _polygonLayer;
        var _loadEnkeltminner;
        var _enkeltMinneLayer;
        var _prevLayers;
        var _showEnkeltminner = true;

        var _hidePolygonLayer = function () {
            _map.removeLayer(_polygonLayer);
            if (_enkeltMinneLayer) {
                _map.removeLayer(_enkeltMinneLayer);
            }
        };

        var _showPolygonLayer = function () {
            _map.addLayer(_polygonLayer);
            if (_enkeltMinneLayer) {
                _map.addLayer(_enkeltMinneLayer);
            }
        };

        var _getMarkerForId = function (id) {
            return _.find(_vectorLayer.getLayers(), function (layer) {
                return (layer.feature.properties.id === id);
            });
        };

        var _getPolygonForId = function (id) {
            return _.find(_polygonLayer.getLayers(), function (layer) {
                return (layer.feature.properties.lok === id);
            });
        };

        var _polygonClicked = function (feature) {
            var parent = _getMarkerForId(feature.properties.lok);
            if (parent) {
                parent.fire('click');
            } else {
                if (_map.sidebar) {
                    var layer = _.find(_prevLayers, function (prev) {
                        return prev.feature.properties.id === feature.properties.lok;
                    });
                    _highlightPolygon(_getPolygonForId(feature.properties.lok));
                    _map.sidebar.showFeature(
                        layer.feature,
                        _dataset.template,
                        _dataset.getFeatureData
                    );
                }
            }
        };

        var _createPolygonLayer = function (dataset) {
            return L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }
                    layer.on('click', function () {
                        _polygonClicked(feature);
                    });
                }
            }).addTo(_map);
        };

        var _deselectPolygons = function () {
            _selectedPoly = null;
            _.each(_polygonLayer.getLayers(), function (l) {
                l.setStyle(KR.Style.getPathStyle(l.feature, true));
            });
        };

        var _highlightPolygon = function (poly) {
            poly.setStyle({
                weight: 1,
                color: '#436978',
                fillColor: '#72B026',
                clickable: true,
                opacity: 0.8,
                fillOpacity: 0.4
            });
        };

        var _markerClicked = function (e) {

            _deselectPolygons();
            var id = e.layer.feature.properties.id;

            _selectedPoly = id;

            var poly = _getPolygonForId(id);
            if (!poly) {
                return;
            }
            _highlightPolygon(poly);
            if (_loadEnkeltminner) {
                _loadEnkeltminner(e.layer.feature);
            }
        };

        var _enkeltminneClick = function (feature, dataset) {
            if (_map.sidebar) {
                _map.sidebar.showFeature(
                    feature,
                    dataset.enkeltminner.template || KR.Util.getDatasetTemplate('ra_enkeltminne')
                );
            }
        };

        var _setupEnkeltminner = function (dataset) {
            if (!_.has(dataset, 'enkeltminner')) {
                dataset.enkeltminner = {};
            }

            var enkeltminneStyle = dataset.enkeltminner.style || {
                color: '#fff',
                weight: 1,
                fillColor: '#B942D0'
            };

            _enkeltMinneLayer = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    feature.properties.provider = dataset.enkeltminner.provider || 'Enkeltminne';
                    feature.properties.color = dataset.enkeltminner.sidebarColor || '#B942D0';
                    layer.on('click', function () {
                        _enkeltminneClick(feature, dataset);
                    });
                },
                style: function () {
                    return enkeltminneStyle;
                }
            }).addTo(_map);

            _loadEnkeltminner = function (feature) {
                var q = {
                    api: 'kulturminnedataSparql',
                    type: 'enkeltminner',
                    lokalitet: feature.properties.id
                };
                api.getData(q, function (geoJson) {
                    _enkeltMinneLayer.clearLayers();
                    _enkeltMinneLayer.addData(geoJson);
                });
            };
        };

        var _highlightPolygonById = function (id) {
            var poly = _getPolygonForId(id);
            if (!poly) {
                return;
            }
            _highlightPolygon(poly);
        };

        var _highlightMarkerById = function (id) {
            var parent = _getMarkerForId(id);
            if (parent) {
                parent.fire('click');
            }
        };


        var _polygonsLoaded = function (geoJson) {

            _polygonLayer.clearLayers().addData(geoJson);
            if (_selectedPoly) {
                _highlightPolygonById(_selectedPoly);
                _highlightMarkerById(_selectedPoly);
            }
        };

        var _reloadPoly = function (e) {
            if (e.prevLayers && e.prevLayers.length) {
                _prevLayers = e.prevLayers;
            }
            var unclustred = _vectorLayer.getUnclustredLayers();
            var ids = _.map(unclustred, function (layer) {
                return layer.feature.properties.id;
            });

            var idsToKeep = [];
            if (_vectorLayer.isUnclustred) {
                idsToKeep = _.chain(_polygonLayer.getLayers())
                    .map(function (layer) {
                        return layer.feature.properties.lok;
                    })
                    .difference(ids)
                    .value();
            }

            ids = ids.concat(idsToKeep);

            if (ids.length) {
                var q = {
                    api: 'kulturminnedataSparql',
                    type: 'lokalitetpoly',
                    lokalitet: ids
                };
                api.getData(q, _polygonsLoaded);
            } else {
                _polygonLayer.clearLayers();
                if (_enkeltMinneLayer) {
                    _enkeltMinneLayer.clearLayers();
                }
            }
        };

        var initKulturminnePoly = function (map, dataset, vectorLayer) {
            _dataset = dataset;
            _vectorLayer = vectorLayer;
            _map = map;
            _vectorLayer.on('hide', _hidePolygonLayer);
            _vectorLayer.on('show', _showPolygonLayer);
            _polygonLayer = _createPolygonLayer(dataset);

            _vectorLayer.on('dataloaded', _reloadPoly);
            _vectorLayer.on('click', _markerClicked);
            _map.on('layerDeselect', _deselectPolygons);

            if (_.has(dataset, 'showEnkeltminner')) {
                _showEnkeltminner = dataset.showEnkeltminner;
            }

            if (_showEnkeltminner) {
                _setupEnkeltminner(dataset);
            }

        };

        var getRaFeatureData = function (feature, callback) {
            var query_images = {
                api: 'kulturminnedataSparql',
                type: 'images',
                lokalitet: feature.properties.id
            };
            api.getData(query_images, function (images) {
                images = _.map(images, function (image) {
                    return {
                        type: 'captioned_image',
                        url: image.img,
                        caption: image.picturelabel + ' - ' + image.picturedescription,
                        license: image.picturelicence,
                        fullsize: image.img_fullsize
                    };
                });
                feature.properties.media = images;
                callback(feature);
            });
        };

        return {
            initKulturminnePoly: initKulturminnePoly,
            getRaFeatureData: getRaFeatureData
        };
    };


    ns.raLinkedLayer = function (api) {
        var _cache = {},
            _visible = true,
            _map,
            _parentLayer,
            _parentDataset,
            _layer,
            _minZoom,
            _clicked;

        var deselectAll = function () {
            _.each(_layer.getLayers(), function (layer) {
                var style = KR.Style2.getPathStyle(_parentDataset, layer.feature, true);
                layer.setStyle(style);
            });
        };

        var featureSelected = function (selectedFeature) {
            deselectAll();
            var layer = _.find(_layer.getLayers(), function (layer) {
                return layer.feature.id === selectedFeature.properties.id;
            });
            if (layer) {
                layer.setStyle({
                    weight: 1,
                    color: '#436978',
                    fillColor: '#72B026',
                    clickable: true,
                    opacity: 0.8,
                    fillOpacity: 0.4
                });
            }
        };

        var _layerClicked = function (feature) {
            _clicked(feature, _parentDataset);
        };

        var _layerCreated = function (layer) {
            layer.on('click', function () {
                _layerClicked(layer.feature);
            });
        };

        var _showData = function (features) {
            features = _.map(features, function (feature) {
                feature.id = feature.properties.lok;
                return feature;
            });

            KR.updateLayerFeatures(_layer, features, function (feature) {
                return KR.Style2.getPathStyle(_parentDataset, feature, true);
            }, _layerCreated);

        };

        var _getFromCache = function (ids) {
            return _.chain(ids)
                .map(function (id) {
                    return _cache[id];
                })
                .compact()
                .value();
        };

        var _getData = function (ids) {

            var cached = _.filter(ids, function (id) {
                return _cache[id];
            });
            var uncached = _.filter(ids, function (id) {
                return !_.has(_cache, id);
            });

            var q = {
                api: 'kulturminnedataSparql',
                type: 'lokalitetpoly',
                lokalitet: uncached
            };
            if (uncached.length) {
                api.getData(q, function (data) {

                    var newCache = _.reduce(data.features, function (acc, feature) {
                        acc[feature.properties.lok] = feature;
                        return acc;
                    }, {});

                    _.extend(_cache, newCache);
                    _showData(_getFromCache(ids));
                });
            } else {
                _showData(_getFromCache(ids));
            }
        };

        var shouldShow = function () {
            if (!_minZoom) {
                return true;
            }
            return _map.getZoom() >= _minZoom && _visible;
        };

        var dataChanged = function () {
            var bbox = _map.getBounds();
            if (!shouldShow()) {
                if (_map.hasLayer(_layer)) {
                    _map.removeLayer(_layer);
                }
                return;
            }
            if (!_map.hasLayer(_layer)) {
                _map.addLayer(_layer);
            }

            var ids = _.chain(_parentLayer.getLayers())
                .filter(function (layer) {
                    return bbox.pad(25).contains(layer.getLatLng());
                })
                .map(function (layer) {
                    return layer.feature.properties.id;
                })
                .value();
            _getData(ids);
        };

        var findFeature = function (feature, layers) {
            return _.find(layers, function (layer) {
                return layer.feature.properties.id === feature.id;
            });
        };

        var toggleVisible = function (visible) {
            _visible = visible;
            dataChanged();
        };

        var init = function (map, layer, dataset, clicked) {
            _map = map;
            _parentLayer = layer;
            _parentDataset = dataset;
            if (_parentDataset.linkedLayerOptions && _parentDataset.linkedLayerOptions.minZoom) {
                _minZoom = _parentDataset.linkedLayerOptions.minZoom;
            }
            _layer = new L.featureGroup([]).addTo(_map);
            _clicked = clicked;
            if (_parentDataset.isStatic) {
                map.on('moveend', dataChanged);
            }
        };

        return {
            deselectAll: deselectAll,
            init: init,
            dataChanged: dataChanged,
            featureSelected: featureSelected,
            findFeature: findFeature,
            toggleVisible: toggleVisible
        };
    };







}(KR.Config));
