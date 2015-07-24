var cesiumOptions = {
    animation: false,
   // baseLayerPicker: false,
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


function getDatasets(ids, api, komm) {
    var datasets = KR.Config.getDatasets(ids, api, komm);
    return _.flatten(_.map(datasets, function (dataset) {

        if (dataset.datasets) {
            return _.map(dataset.datasets, function (d) {
                return d.dataset;
            });
        }
        return dataset.dataset;
    }));
}

function simplify(geojson) {
    return turf.featurecollection([turf.simplify(
        geojson.features[0], 0.001, false
    )]);
}

function createPolyline(heightCurve, options) {
    options = options || {};
    return {
        polyline: {
            positions: heightCurve,
            width: options.width || 10.0,
            material: new Cesium.PolylineGlowMaterialProperty({
                color: options.color || Cesium.Color.BLUE ,
                glowPower: options.glow || 0.1,
            })
        }
    };
}


function createMap(div, bbox) {
    return new KR.CesiumMap(
        div,
        cesiumOptions,
        bbox
    );
}

function addBaseLayer(map, options, callback) {
    var layer = options.layer || 'topo2';
    var provider;
    if (layer === 'hist') {
        callback(map.getWms(
            'http://wms.geonorge.no/skwms1/wms.historiskekart',
            'historiskekart'
        ));
    } else if (layer === 'nib') {
            //var SKTokenUrl = 'http://knreise.no/nib/?type=token';
            var SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';
            KR.Util.sendRequest(SKTokenUrl, null, function (token) {
                if (token.indexOf('**') !== 0) {
                    callback(map.getWmts(
                        'http://crossorigin.me/http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts',
                        'NiB',
                        {
                            TILEMATRIXSET: 'EPSG:900913',
                            TILEMATRIX: 'EPSG:900913:{TileMatrix}',
                            FORMAT: 'image/jpeg',
                            GKT: token
                        }
                    ));
                } else { //fallback 
                    callback(map.getWms(
                        'http://wms.geonorge.no/skwms1/wms.historiskekart',
                        'historiskekart'
                    ));
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

function showLine(map, geojson, callback) {
    map.build3DLine(geojson, function (heightCurve) {

        var line = createPolyline(heightCurve, {
            color: Cesium.Color.DEEPSKYBLUE,
            glow: 0.25
        });
        map.viewer.zoomTo(map.viewer.entities.add(line));
        callback();
    });
}

function Playpause(pathTracer) {
    var btn = $('#playpause');

    function play() {
        btn.find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');
        pathTracer.start();
    }

    function pause () {
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

function closed() {
    /*if (pathTracer && wasRunning) {
        playpause.play();
    }*/
}

var sidebar = KR.CesiumSidebar($('#cesium-sidebar'), {
    /*wikipediaTemplate: _.template($('#cesium_wikipedia_template').html()),
    arcKulturminneTemplate: _.template($('#cesium_arc_kulturminne_template').html()),
    sparqlKulturminneTemplate: _.template($('#cesium_sparql_kulturminne_template').html())
    */
}, closed);


function setupLine(api, datasetIds, options) {
    var pathTracer;
    var playpause;
    var wasRunning = false;
    var datasets = getDatasets(datasetIds, api);
    KR.Util.getLine(api, options.line, function (line) {
        var bbox = KR.CesiumUtils.getBounds(line);
        var map = createMap('cesium-viewer', bbox);
        map.viewer.scene.imageryLayers.removeAll();
        addBaseLayer(map, options, map.addImageryProvider);
        showLine(map, line, function () {
            map.stopLoading();

            _.each(datasets, function (dataset) {
                map.loadDataset(dataset, bbox, api, function (res) {
                    map.viewer.dataSources.add(res);
                });
            });

            map.addClickhandler(function (properties) {
                wasRunning = pathTracer.isRunning();
                playpause.pause();

                pathTracer.stop();
                sidebar.show(properties);
            });

        });

        if (options.player) {
            var simple = simplify(line);
            map.build3DLine(simple, function (heightCurve) {
                pathTracer = new KR.PathTracer(map.viewer, heightCurve, simple);
                pathTracer.setPitchCorr(0.1);
                playpause  = new Playpause(pathTracer);
                $('#playpause').removeClass('hidden');
                $('#playpause').click(playpause.toggle);
            });
        }
    });

}


function setupCesiumMapFromUrl(api, datasetIds, options) {
    options = options || {};
    options = _.extend({player: true}, options);

    if (options.line) {
       setupLine(api, datasetIds, options);
    } else {
        alert('Missing parameters!');
    }
}




var qs = KR.Util.parseQueryString(window.location.search);

if (!qs) {
    alert("Missing parameters!");
    return;
}

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    },
    flickr: {
        apikey: 'ab1f664476dabf83a289735f97a6d56c'
    }
});


setupCesiumMapFromUrl(api, qs.datasets.split(','), qs);
