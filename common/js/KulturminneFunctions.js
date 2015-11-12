/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {
/*
        var _vectorLayer;
        var loadedIds = [];



        function findLayer(lok) {
            if (!_vectorLayer) {
                return null;
            }

            return _.find(_vectorLayer.getLayers(), function (layer) {
                return (layer.feature.properties.id === lok);
            });
        }

        var loadKulturminnePoly = function (map, dataset, features) {
            if (features) {
                var ids = _.map(features, function (feature) {
                    return feature.properties.id;
                });

                var idsToLoad = _.filter(ids, function (id) {
                    return loadedIds.indexOf(id) === -1;
                });

                loadedIds = loadedIds.concat(idsToLoad);

                if (idsToLoad.length) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'lokalitetpoly',
                        lokalitet: idsToLoad
                    };
                    api.getData(q, function (geoJson) {
                        dataset.extraFeatures.addData(geoJson);
                        if (!geoJson.features) {
                            return
                        }
                        _.chain(geoJson.features)
                            .map(function (f) {
                                return f.properties.lok;
                            })
                            .uniq()
                            .each(function (lok) {
                                var l = findLayer(lok);
                                if (l) {
                                    l.setOpacity(0);
                                }
                            });
                    });
                }
            }
        };

        var initKulturminnePoly = function (map, dataset, vectorLayer) {
            console.log(vectorLayer);
            _vectorLayer = vectorLayer;
            var showEnkeltminner = true;
            if (_.has(dataset, 'showEnkeltminner')) {
                showEnkeltminner = dataset.showEnkeltminner;
            }
            var enkeltMinneLayer;
            var loadEnkeltminner;
            if (showEnkeltminner) {

                if (!_.has(dataset, 'enkeltminner')) {
                    dataset.enkeltminner = {};
                }

                var enkeltminneStyle = dataset.enkeltminner.style || {
                    color: '#fff',
                    weight: 1,
                    fillColor: '#B942D0'
                };

                enkeltMinneLayer = L.geoJson(null, {
                    onEachFeature: function (feature, layer) {
                        feature.properties.provider = dataset.enkeltminner.provider || 'Enkeltminne';
                        feature.properties.color = dataset.enkeltminner.sidebarColor || '#B942D0';
                        layer.on('click', function () {
                            if (map.sidebar) {
                                map.sidebar.showFeature(
                                    feature,
                                    dataset.enkeltminner.template || KR.Util.getDatasetTemplate('ra_enkeltminne')
                                );
                            }
                        });
                    },
                    style: function () {
                        return enkeltminneStyle;
                    }
                }).addTo(map);
                loadEnkeltminner = function (feature) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'enkeltminner',
                        lokalitet: feature.properties.lok
                    };
                    api.getData(q, function (geoJson) {
                        enkeltMinneLayer.clearLayers();
                        enkeltMinneLayer.addData(geoJson);
                    });
                };
            }

            var highlightPolygons = true;
            var onPolyClick;
            if (highlightPolygons) {

                var deselectPolys = function () {
                    _.each(dataset.extraFeatures.getLayers(), function (l) {
                        l.setStyle(KR.Style.getPathStyle(l.feature, true));
                    });
                };

                onPolyClick = function (e) {
                    deselectPolys();
                    var lok = e.layer.feature.properties.id;
                    var poly = _.find(dataset.extraFeatures.getLayers(), function (l) {
                        return (l.feature.properties.lok === lok);
                    });
                    console.log(poly);
                    if (! poly) {
                        return;
                    }
                    poly.setStyle({
                        weight: 1,
                        color: '#436978',
                        fillColor: '#72B026',
                        clickable: true,
                        opacity: 0.8,
                        fillOpacity: 0.4
                    });
                }

                vectorLayer.on('click', onPolyClick);

                map.on('layerDeselect', function (e) {
                    deselectPolys();
                });
            }

            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }

                    layer.on('click', function () {

                        if (loadEnkeltminner) {
                            loadEnkeltminner(feature);
                        }

                        var parent = _.find(dataset.geoJSONLayer.getLayers(), function (parentLayer) {
                            return (parentLayer.feature.properties.id === feature.properties.lok);
                        });

                        if (parent) {
                            parent.fire('click');
                            if (onPolyClick) {
                                onPolyClick({layer: parent})
                            }
                        }
                    });
                }
            }).addTo(map);


            map.on('zoomend', function () {
                var shouldShow = !(map.getZoom() < 13);
                if (shouldShow) {
                    if (!map.hasLayer(dataset.extraFeatures)) {
                        map.addLayer(dataset.extraFeatures);
                    }
                } else {
                    if (map.hasLayer(dataset.extraFeatures)) {
                        map.removeLayer(dataset.extraFeatures);
                    }
                }
            });

            vectorLayer.on('hide', function () {
                map.removeLayer(dataset.extraFeatures);
                if (enkeltMinneLayer) {
                    map.removeLayer(enkeltMinneLayer)
                }
            });

            vectorLayer.on('show', function () {
                map.addLayer(dataset.extraFeatures);
                if (enkeltMinneLayer) {
                    map.addLayer(enkeltMinneLayer)
                }
            });
        };
        */

        var _vectorLayer;
        var _map;
        var _polygonLayer;
        var _loadedIds = [];
        var _createPolygonLayer = function (dataset) {
            return L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }
                }
            }).addTo(_map);
        };

        var _hidePolygonLayer = function () {
            map.removeLayer(_polygonLayer);
        };

        var _showPolygonLayer = function () {
            map.addLayer(_polygonLayer);
        };


        var _checkRemove = function () {
            var shouldShow = !(_map.getZoom() < 13);
            if (shouldShow) {
                if (!map.hasLayer(dataset.extraFeatures)) {
                    map.addLayer(dataset.extraFeatures);
                }
            } else {
                if (map.hasLayer(dataset.extraFeatures)) {
                    map.removeLayer(dataset.extraFeatures);
                }
            }
        };

        var _checkThresholdPassed = function (map, threshold, callback) {
            var prevZoom;
            map.on('zoomstart', function (e) {
                prevZoom = map.getZoom();
            });
            map.on('zoomend', function (e) {
                var currentZoom = map.getZoom();
                console.log('end:', prevZoom, currentZoom);
            });
        }

        var initKulturminnePoly = function (map, dataset, vectorLayer) {
            _vectorLayer = vectorLayer;
            _map = map;
            vectorLayer.on('hide', _hidePolygonLayer);
            vectorLayer.on('show', _showPolygonLayer);
            _polygonLayer = _createPolygonLayer(dataset)
            _checkThresholdPassed(_map, 13);
        };

        var _dataLoaded = function (geoJson) {
            _polygonLayer.addData(geoJson);
            var newIds = _.chain(geoJson.features)
                .map(function (f) {
                    return f.properties.lok;
                })
                .uniq()
                .value();
            _loadedIds = _loadedIds.concat(newIds);

            console.log("new ids", newIds);
        }

        var loadKulturminnePoly = function (map, dataset, features) {
            if (!features) {
                console.log('no features to show for');
                return;
            }

            var idsToLoad = _.chain(features)
                .map(function (feature) {
                    return feature.properties.id;
                })
                .filter(function (id) {
                    return _loadedIds.indexOf(id) === -1;
                })
                .value()

            if (!idsToLoad.length) {
                console.log("no new features to load");
                return;
            }
            var q = {
                api: 'kulturminnedataSparql',
                type: 'lokalitetpoly',
                lokalitet: idsToLoad
            };
            api.getData(q, _dataLoaded);
        };

        return {
            loadKulturminnePoly: loadKulturminnePoly,
            initKulturminnePoly: initKulturminnePoly
        };
    };
}(KR.Config));
