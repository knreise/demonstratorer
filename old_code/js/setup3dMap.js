/*global Cesium:false, alert:false, KR:false, turf:false */

var KR = this.KR || {};

/*
    Utility for setting up a Cesium map based on config
*/


(function (ns) {
    'use strict';

    var CESIUM_OPTS = {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: true,
        navigationInstructionsInitiallyVisible: false,
        orderIndependentTranslucency: false
    };

    function simplifyLine(geojson) {
        return turf.featurecollection([
            turf.simplify(geojson.features[0], 0.001, false)
        ]);
    }

    function createPolyline(heightCurve, options) {
        options = options || {};
        return {
            polyline: {
                positions: heightCurve,
                width: 5, //options.width || 10.0,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    //color: options.color || Cesium.Color.BLUE//,
                    //glowPower: options.glow || 0.1,
                    color: Cesium.Color.ORANGE,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.BLACK
                })
            }
        };
    }

    function getBaseLayer(options, map, callback) {
        var layer = options.layer || 'topo2';

        if (layer === 'norges_grunnkart_graatone') {
            layer = 'norges_grunnkart';
        }

        if (layer === 'hist') {
            callback(map.getWms(
                'http://wms.geonorge.no/skwms1/wms.historiskekart',
                'historiskekart'
            ));
        } else if (layer === 'nib') {
            var SKTokenUrl = 'http://knreise.no/nib/?type=token';
            //var SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';
            KR.Util.sendRequest(SKTokenUrl, null, function (token) {
                if (token.indexOf('**') !== 0) {
                    callback(map.getWmts(
                        'http://www.knreise.no/miniProxy/miniProxy.php/http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts',
                        'NiB',
                        {
                            TILEMATRIXSET: 'EPSG:900913',
                            TILEMATRIX: 'EPSG:900913:{TileMatrix}',
                            FORMAT: 'image/jpeg',
                            GKT: token
                        }
                    ));
                } else { //fallback 

                    //DO NOT USE THIS TILE SERVER WITHOUT AGREEMENT WITH Norkart AS (norkart.no)
                    callback(map.getTiles('http://www.webatlas.no/wacloud/servicerepository/combine.aspx?X={x}&Y={y}&Z={z}&layers=TMS_WEBATLAS_STANDARD:1'));
                }
            });
        } else {
            callback(map.getWmts(
                'http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts',
                layer,
                {
                    TILEMATRIXSET: 'EPSG:3857',
                    TILEMATRIX: 'EPSG:3857:{TileMatrix}',
                    FORMAT: 'image/png'
                }
            ));
        }
    }

    function Playpause(pathTracer) {
        var btn = $('#playpause');

        function play() {
            btn.find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');
            pathTracer.start();
        }

        function pause() {
            btn.find('.glyphicon').removeClass('glyphicon-pause').addClass('glyphicon-play');
            pathTracer.stop();
        }

        function toggle() {
            if (pathTracer.isRunning()) {
                pause();
            } else {
                play();
            }
        }

        return {
            play: play,
            pause: pause,
            toggle: toggle
        };
    }

    ns.setupMap3d = function (api, datasetIds, options) {
        options = options || {};
        options = _.extend({player: true, limitBounds: false}, options);

        var map, bbox;
        var sidebar = KR.CesiumSidebar($('#cesium-sidebar'), {});

        function _getDatasets() {
            var datasets = KR.Config.getDatasets(datasetIds, api);
            return _.chain(datasets)
                .map(function (dataset) {
                    if (dataset.datasets) {
                        return dataset.datasets;
                    }
                    return dataset;
                })
                .flatten()
                .filter(function (dataset) {
                    if (_.has(dataset.dataset, 'kommune') && _.isUndefined(dataset.dataset.kommune)) {
                        return false;
                    }
                    return true;
                })
                .value();
        }

        function _createMap(div, bbox) {
            return new KR.CesiumMap(
                div,
                _.extend(CESIUM_OPTS, {
                    limitBounds: options.limitBounds,
                    terrainUrl: options.terrainUrl,
                    enableLighting: options.enableLighting
                }),
                bbox
            );
        }

        function _addDatasets(datasets, bbox, callback) {
            _.each(datasets, function (dataset) {
                var datasetId = KR.Util.getDatasetId(dataset);
                var props = {
                    template: dataset.template,
                    datasetId: datasetId,
                    'marker-color': KR.Style.colorForFeature({properties: {datasetId: datasetId}}, false)
                };
                map.loadDataset2(dataset.dataset, bbox, api, props);
            });

            map.addClickhandler(function (properties) {
                sidebar.show(properties);
                if (callback) {
                    callback();
                }
            });
        }

        function _setupBounds(bbox) {
            map = _createMap('cesium-viewer', bbox);

            map.viewer.scene.imageryLayers.removeAll();

            getBaseLayer(options, map, map.addImageryProvider);

            _addDatasets(_getDatasets(), bbox);
            map.stopLoading();
        }

        function _setupLine() {
            var pathTracer;
            var playpause;
            var wasRunning = false;

            KR.Util.getLine(api, options.line, function (line) {
                bbox = KR.CesiumUtils.getBounds(line);
                map = _createMap('cesium-viewer', bbox);

                getBaseLayer(options, map, map.addImageryProvider);

                _addDatasets(_getDatasets(), bbox, function () {
                    if (options.player) {
                        wasRunning = pathTracer.isRunning();
                        playpause.pause();
                        pathTracer.stop();
                    }
                });

                map.build3DLine(line, function (heightCurve) {
                    var polyLine = createPolyline(heightCurve, {
                        color: Cesium.Color.DEEPSKYBLUE,
                        glow: 0.25
                    });
                    map.viewer.zoomTo(map.viewer.entities.add(polyLine));
                    map.stopLoading();
                });


                if (options.player) {
                    var simple = simplifyLine(line);
                    map.build3DLine(simple, function (heightCurve) {
                        pathTracer = new KR.PathTracer(map.viewer, heightCurve, simple);
                        pathTracer.setPitchCorr(0.1);
                        playpause = new Playpause(pathTracer);
                        $('#playpause').removeClass('hidden');
                        $('#playpause').click(playpause.toggle);
                    });

                    sidebar.addCloseCb(function () {
                        if (wasRunning) {
                            playpause.play();
                        }
                    });
                }
            });
        }

        function init() {
            if (options.bbox) {
                _setupBounds(options.bbox);
            } else if (options.komm) {
                api.getMunicipalityBounds(options.komm, _setupBounds);
            } else if (options.line) {
                _setupLine();
            } else {
                alert('Missing parameters!');
            }
        }

        init();
    };

}(KR));
