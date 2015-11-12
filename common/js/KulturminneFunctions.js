/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {

        var _vectorLayer;
        var _map;
        var _polygonLayer;
        var _loadEnkeltminner;
        var _enkeltMinneLayer;
        var _loadedIds = [];
        var _hideMarker = false;
        var _showEnkeltminner = true;

        var _hidePolygonLayer = function () {
            map.removeLayer(_polygonLayer);
        };

        var _showPolygonLayer = function () {
            map.addLayer(_polygonLayer);
        };

        var _checkRemove = function (direction) {
            var shouldShow = (direction === 'down');
            if (shouldShow) {
                _map.addLayer(_polygonLayer);
                if (_enkeltMinneLayer) {
                    _map.addLayer(_enkeltMinneLayer);
                }
            } else {
                _map.removeLayer(_polygonLayer);
                if (_enkeltMinneLayer) {
                    _map.removeLayer(_enkeltMinneLayer);
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
                if (prevZoom > threshold && currentZoom <= threshold) {
                    callback('up');
                }
                if (prevZoom <= threshold && currentZoom > threshold) {
                    callback('down');
                }
            });
        }

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

        var _polygonClicked = function (feature, layer) {
            var parent = _getMarkerForId(feature.properties.lok);
            if (parent) {
                parent.fire('click');
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
                        _polygonClicked(feature, layer);
                    });
                }
            }).addTo(_map);
        };

        var _checkCluster = function () {
            /*
            if (!_loadedIds.length) {
                return;
            }
            _.each(_loadedIds, function (loadedId) {
                var marker = _getMarkerForId(loadedId);
                var visibleOne = _vectorLayer.getVisibleParent(marker);
                //console.log(visibleOne._leaflet_id, marker._leaflet_id);
                //console.log(marker, visibleOne);
            });
            */
        };

        var _deselectPolygons = function () {
            _.each(_polygonLayer.getLayers(), function (l) {
                l.setStyle(KR.Style.getPathStyle(l.feature, true));
            });
        };


        var _markerClicked = function (e) {
            _deselectPolygons();
            var id = e.layer.feature.properties.id;
            var poly = _getPolygonForId(id);
            if (!poly) {
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
            if (_loadEnkeltminner) {
                _loadEnkeltminner(e.layer.feature);
            }
        }

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
                    layer.on('click', function () { _enkeltminneClick(feature, dataset)});
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
        }


        var initKulturminnePoly = function (map, dataset, vectorLayer) {
            _vectorLayer = vectorLayer;
            _map = map;
            _vectorLayer.on('hide', _hidePolygonLayer);
            _vectorLayer.on('show', _showPolygonLayer);
            _polygonLayer = _createPolygonLayer(dataset)
            _checkThresholdPassed(_map, 13, _checkRemove);
            _map.on('zoomend', _checkCluster);
            _map.on('layerDeselect', _deselectPolygons);
            _vectorLayer.on('click', _markerClicked);

            if (_.has(dataset, 'showEnkeltminner')) {
                _showEnkeltminner = dataset.showEnkeltminner;
            }

            if (_showEnkeltminner) {
                _setupEnkeltminner(dataset);
            }
        };

        var _dataLoaded = function (geoJson) {
            _polygonLayer.addData(geoJson);
            var newIds = _.chain(geoJson.features)
                .map(function (f) {
                    return f.properties.lok;
                })
                .uniq()
                .value();

            if (_hideMarker) {
                _.each(newIds, function (newId) {
                    var marker = _getMarkerForId(newId);
                    if (marker) {
                        //marker.setOpacity(0);
                    }
                })
            }
            _loadedIds = _loadedIds.concat(newIds);
        }

        var loadKulturminnePoly = function (map, dataset, features) {
            if (!features) {
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
