var KR = this.KR || {};
(function (ns) {
    'use strict';

    ns.parseError = function (error) {
        if (error.responseJSON) {
            if (error.responseJSON.error) {
                return error.responseJSON.error.join(', ');
            }
            if (error.responseJSON.status) {
                return error.responseJSON.status;
            }
        }
        if (error.statusText) {
            return error.statusText;
        }
        if (error.error) {
            if (error.error.info) {
                return error.error.info;
            }
            if (error.error.error) {
                return error.error.error;
            }
            return error.error;
        }
        return 'Unknown error';
    };

    ns.errorHandler = function (template) {

        var alert = $(template);
        alert.find('.close').on('click', function () {
            alert.find('.content').html('');
            alert.remove();
        });
        var templ = _.template('<div><strong><%= dataset %>:</Strong> <%= error %></div>');
        return function (error) {

            var message = templ({
                dataset: error.dataset,
                error: ns.parseError(error.error)
            });
            if (alert.parent()) {
                alert.find('.content').append(message);
            } else {
                alert.find('.content').html(message);
            }
            $('body').append(alert);
        };
    };
}(KR));
/*global L: false, turf: false */

var KR = this.KR || {};

KR.Config = {
    contentIcons: {
        'IMAGE': 'camera-retro',
        'VIDEO': 'file-video-o',
        'SOUND': 'music',
        'TEXT': 'file-text',
        'default': 'file-o'
    },
    templates: {}
};

KR.Util = KR.Util || {};

(function (ns) {
    'use strict';


    /*
        Returns the name of a font-awesome icon for a 
        Norvegiana content type, or a default one
    */
    ns.iconForContentType = function (feature) {
        var contentType = feature.properties.contentType;
        if (_.has(KR.Config.contentIcons, contentType)) {
            return KR.Config.contentIcons[contentType];
        }
        return KR.Config.contentIcons['default'];
    };


    /*
        Loads a template from /templates/datasets
    */
    ns.getDatasetTemplate = function (name) {
        var content = $('#' + name + '_template').html();
        if (content) {
            return _.template(content);
        }
    };


    /*
        Gets a template from KR.Config.templates
    */
    ns.templateForDataset = function (dataset) {
        if (_.has(KR.Config.templates, dataset)) {
            return KR.Config.templates[dataset];
        }
    };


    /*
        Creates a html style siring (to put in style=""), given a dictionary
    */
    ns.createStyleString = function (styleDict) {
        return _.map(styleDict, function (value, key) {
            return key + ': ' + value;
        }).join(';');
    };


    /*
        Gets a color for a given dataset provider id, see 
        KR.Style.datasets
    */
    ns.colorForProvider = function (provider, type) {
        var hex = true;
        if (type !== 'hex') {
            hex = false;
        }
        var feature = {properties: {datasetId: provider}};
        return KR.Style.colorForFeature(feature, hex, true);
    };


    /*
        Utility function to register clicks om a feature
    */
    ns.featureClick = function (sidebar) {
        return function _addFeatureClick(feature, layer, dataset) {
            layer.on('click', function (e) {
                if (dataset.toPoint && dataset.toPoint.stopPolyClick) {
                    if (!e.parent) {
                        return;
                    }
                }

                if (dataset) {
                    sidebar.showFeature(
                        feature,
                        dataset.template,
                        dataset.getFeatureData
                    );
                } else {
                    sidebar.showFeature(feature);
                }
            });
        };
    };


    function _getTemplateForFeature(feature, dataset) {
        if (dataset.datasets) {
            var d = _.find(dataset.datasets, function (dataset) {
                return (dataset._knreise_id === feature.properties.datasetID);
            });
            return d.template;
        }
        return dataset.template;
    }


    /*
        Utility function to handle clicks on a feature cluster
    */
    ns.clusterClick = function (sidebar) {
        return function _addClusterClick(clusterLayer, dataset) {
            clusterLayer.on('clusterclick', function (e) {
                var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                    var feature = marker.feature;
                    feature.template = _getTemplateForFeature(feature, dataset);
                    return feature;
                });
                sidebar.showFeatures(
                    features,
                    dataset.template,
                    dataset.getFeatureData,
                    dataset.noListThreshold
                );
            });
        };
    };


    /*
        Converts a hex color to rgba with optional transparency
    */
    ns.hexToRgba = function (hex, transparency) {
        transparency = transparency || 1;
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (!result) {
            return 0;
        }
        var rgb = {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + transparency + ')';
    };


    /*
        Filter a GeoJSON featurecollection with a bbox-string
    */
    ns.filterByBbox = function (features, bbox) {
        var boundPoly = turf.featurecollection([turf.bboxPolygon(KR.Util.splitBbox(bbox))]);
        return turf.within(features, boundPoly);
    };


    /*
        Get id for a dataset
    */
    ns.getDatasetId = function (dataset) {
        if (dataset.dataset.api === 'norvegiana') {
            if (!dataset.dataset.query) {
                return dataset.dataset.dataset;
            }
        }
        if (dataset.dataset.api === 'wikipedia') {
            return 'wikipedia';
        }
        if (dataset.id) {
            return dataset.id;
        }
        return KR.Util.stamp(dataset);
    };

    //utility for Leaflet if defined
    if (typeof L !== 'undefined') {
        L.latLngBounds.fromBBoxString = function (bbox) {
            bbox = KR.Util.splitBbox(bbox);
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };
    }

    /*
        Parse a url query string to a dict, handles true/falsa as strings
    */
    ns.parseQueryString = function (qs) {
        var queryString = decodeURIComponent(qs);
        if (queryString === '') {
            return;
        }
        return _.reduce(queryString.replace('?', '').split('&'), function (acc, qs) {
            qs = qs.split('=');
            var value = qs[1];
            if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            }
            acc[qs[0]] = value;
            return acc;
        }, {});
    };


    /*
        Handle the persons notation from folketelling api
    */
    var personsTemplate = _.template('<%= totalt %> (<%= menn %> menn, <%= kvinner %> kvinner)');
    ns.formatPersons = function (persons) {
        var split = persons.split('-');
        if (split.length < 2) {
            return persons;
        }
        return personsTemplate({
            totalt: split[0],
            menn: split[1],
            kvinner: split[2]
        });
    };


    /*
        Returns a Leaflet layer based on layer name string
    */
    ns.getBaseLayer = function (layerName, callback) {
        var layers = {
            'nib': KR.getNibLayer,
            'hist': function (callback) {
                callback(L.tileLayer.wms('http://wms.geonorge.no/skwms1/wms.historiskekart', {
                    layers: 'historiskekart',
                    format: 'image/png',
                    attribution: 'Kartverket'
                }));
            }
        };
        if (_.has(layers, layerName)) {
            layers[layerName](callback);
        } else {
            callback(L.tileLayer.kartverket(layerName));
        }
    };

    function _stringEndsWith(a, str) {
        var lastIndex = a.lastIndexOf(str);
        return (lastIndex !== -1) && (lastIndex + str.length === a.length);
    }

    /*
        Loads a line geometry according to the setup in the generator
    */
    ns.getLine = function (api, line, callback) {
        if (_.isFunction(line)) {
            line(function (res) {
                callback(res);
            });
            return;
        }
        var lineData;
        if (line.indexOf('utno/') === 0) {
            var id = line.replace('utno/', '');
            lineData = {
                api: 'utno',
                id: id,
                type: 'gpx'
            };
        } else if (line.indexOf('http') === 0) {
            if (_stringEndsWith(line, 'kml')) {
                lineData = {
                    api: 'kml',
                    url: line
                };
            }
        }
        if (lineData) {
            api.getData(lineData, function (line) {
                callback(line);
            });
        }
    };

    ns.messageDisplayer = function (template) {
        return function (type, message) {
            var container = $(template);
            container.find('.close').on('click', function () {
                container.find('.content').html('');
                container.remove();
            });
            container.addClass('alert-' + type);
            container.find('.content').html(message);
            $('body').append(container);
        };
    };

}(KR.Util));

/*global L:false */

var KR = this.KR || {};

KR.Style = {};

/*
    Leaflet-Style-related functions
*/

(function (ns) {
    'use strict';

    var verneomrTypes = {
        landskapsvern: {
            ids: [
                'LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV',
                'NM', 'BVV', 'PO', 'DO', 'D'
            ],
            style: {
                fillColor: '#d8cb7a',
                color: '#9c8f1b'
            },
        },
        nasjonalpark: {
            ids: ['NP', 'NPS'],
            style: {
                fillColor: '#7f9aac',
                color: '#b3a721'
            },
        },
        naturreservat: {
            ids: ['NR', 'NRS'],
            style: {
                fillColor: '#ef9874',
                color: '#ef9873'
            }
        }
    };

    function getVerneOmrcolor(feature) {
        var id = feature.properties.vernef_id;
        return _.find(verneomrTypes, function (type) {
            return (type.ids.indexOf(id) !== -1);
        });
    }

    var SELECTED_COLOR = '#72B026';
    var DEFAULT_COLOR = '#38A9DC';

    var DEFAULT_STYLE = {
        fillcolor: DEFAULT_COLOR,
        circle: false,
        thumbnail: true
    };

    var mappings = {
        'difo': 'Digitalt fortalt',
        'Kulturminnesok': 'Kulturminnesok',
        'DiMu': 'DigitaltMuseum',
        'MUSIT': 'Musit',
        'Artsdatabanken': 'Artsdatabanken',
        'wikipedia': 'wikipedia',
        'riksantikvaren': 'riksantikvaren'
    };

    /*
        Pre-defined datasets and their styling
    */
    ns.datasets = {
        'Digitalt fortalt': {
            fillcolor: '#F69730',
            circle: false,
            thumbnail: true
        },
        'Kulturminnesok': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'DigitaltMuseum': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'Musit': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'Artsdatabanken': {
            fillcolor: '#5B396B',
            thumbnail: false,
            circle: true
        },
        'riksantikvaren': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: true
        },
        'verneomraader': {
            fillcolor: function (feature) {
                if (feature) {
                    var c = getVerneOmrcolor(feature);
                    if (c) {
                        return c.style.fillColor;
                    }
                }
                return "#009300";
            },
            bordercolor: function (feature) {
                if (feature) {
                    var c = getVerneOmrcolor(feature);
                    if (c) {
                        return c.style.color;
                    }
                }
                return "#009300";
            },
            thumbnail: false,
            circle: true
        },
        'wikipedia': {
            fillcolor: '#D14020',
            thumbnail: true,
        }
    };


    /*
        Gets the style config for a dataset in KR.Style.datasets
    */
    ns.getDatasetStyle = function (name) {
        var config = ns.datasets[mappings[name]];
        if (!config) {
            config = ns.datasets[name];
        }
        return config;
    };

    /*
        Sets or updates the style for a dataset in KR.Style.datasets
    */
    ns.setDatasetStyle = function (name, style) {
        if (!_.has(mappings, name)) {
            mappings[name] = name;
        }
        var old = ns.getDatasetStyle(name);
        if (!old) {
            old = DEFAULT_STYLE;
        }

        ns.datasets[mappings[name]] = _.extend({}, old, style);
    };

    var colors = {
        '#F69730': 'orange',
        '#38A9DC': 'blue',
        '#A23336': 'darkred',
        '#72B026': 'green',
        '#436978': 'cadetblue',
        '#5B396B': 'darkpurple',
        '#728224': 'darkgreen',
        '#D252B9': 'purple',
        '#D14020': 'red'
    };

    function hexToName(hex) {
        return colors[hex] || 'blue';
    }

    function valueOrfunc(dict, key, feature, dropFeature) {
        if (_.isFunction(dict[key])) {
            if (dropFeature) {
                return dict[key]();
            }
            return dict[key](feature);
        }
        return dict[key];
    }

    function getFillColor(config, feature, useBaseColor) {
        if (useBaseColor) {
            return valueOrfunc(config, 'fillcolor', feature, true);
        }
        return valueOrfunc(config, 'fillcolor', feature);
    }

    function getBorderColor(config, feature) {
        if (!config.bordercolor) {
            return getFillColor(config, feature);
        }
        return valueOrfunc(config, 'bordercolor', feature);
    }


    function getConfig(feature) {
        var config;
        if (feature.properties && feature.properties.datasetId) {
            config = ns.getDatasetStyle(feature.properties.datasetId);
        }
        if (!config) {
            return _.extend({}, DEFAULT_STYLE);
        }
        return config;
    }

    function getCircleOptions(bordercolor, fillcolor, radius) {
        radius = radius || 9;
        return {
            radius: radius,
            weight: 1,
            opacity: 1,
            color: bordercolor,
            fillColor: fillcolor,
            fillOpacity: 0.4
        };
    }

    function getCircle(latlng, bordercolor, fillcolor) {
        return L.circleMarker(latlng, getCircleOptions(bordercolor, fillcolor));
    }

    function createAwesomeMarker(color) {
        return L.Knreise.icon({
            markerColor: hexToName(color)
        });
    }

    function createMarker(feature, latlng, icon) {
        var title = '';
        if (feature.properties && feature.properties.title) {
            title = feature.properties.title;
        }

        return L.marker(latlng, {
            icon: icon,
            title: title
        });
    }

    function getThumbnail(feature, color, selected) {
        if (!feature.properties || !feature.properties.thumbnail) {
            return;
        }

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + feature.properties.thumbnail + ')'
        };

        if (selected) {
            styleDict['border-width'] = '3px';
        }

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(' + feature.properties.thumbnail + ');border-color:' + color + ';"></div>' +
            '</div>';

        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: html,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }

    function getClusterThumbnailIcon(features, color, selected) {
        var photos = _.filter(features, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (!photos.length) {
            return;
        }

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + photos[0].feature.properties.thumbnail + ');'
        };

        if (selected) {
            styleDict['border-width'] = '3px';
        }

        var html = '<div class="outer">' +
            '<div class="circle" style="' + KR.Util.createStyleString(styleDict) + '"></div>' +
            '</div>' +
            '<b>' + features.length + '</b>';

        return new L.DivIcon({
            className: 'leaflet-marker-photo',
            html: html,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
        });

    }

    function getClusterIcon(features, color) {
        var rgbaColor = KR.Util.hexToRgba(color, 0.4);
        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: '<div class="outer"><div class="circle" style="background-color: ' + rgbaColor + ';border-color:' + color + ';"></div></div><b>' + features.length + '</b>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }


    /*
        Get Leaflet icon for a cluster, optionally selected
    */
    ns.getClusterIcon = function (cluster, selected) {

        var features = cluster.getAllChildMarkers();

        var config = getConfig(features[0].feature);

        var color = selected ? SELECTED_COLOR : getFillColor(config, features[0].feature);

        if (config.thumbnail) {
            var thumbnail = getClusterThumbnailIcon(features, color, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        return getClusterIcon(features, color);
    };


    /*
        Get a leaflet Icon for a feature, optionally selected
    */
    ns.getIcon = function (feature, selected) {
        var config = getConfig(feature);
        var fillcolor = selected ? SELECTED_COLOR : getFillColor(config, feature);
        var bordercolor = selected ? SELECTED_COLOR : getBorderColor(config, feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, bordercolor, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        if (config.circle) {
            return getCircleOptions(bordercolor, fillcolor, config.radius);
        }
        return createAwesomeMarker(fillcolor);
    };


    /*
        Get a leaflet marker for a feature, optionally selected
    */
    ns.getMarker = function (feature, latlng) {
        var config = getConfig(feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, getBorderColor(config, feature), false);
            if (thumbnail) {
                return createMarker(feature, latlng, thumbnail);
            }
        }
        if (config.circle) {
            return getCircle(latlng, getBorderColor(config, feature), getFillColor(config, feature));
        }
        return createMarker(feature, latlng, ns.getIcon(feature, false));
    };


    /*
        Gets the color for a feature
    */
    ns.colorForFeature = function (feature, hex, useBaseColor) {
        var config = getConfig(feature);
        if (config) {
            if (hex) {
                return getFillColor(config, feature, useBaseColor);
            }
            return hexToName(getFillColor(config, feature));
        }
    };


    /*
        Gets Leaflet style for a path feature
    */
    ns.getPathStyle = function (feature, clickable) {
        clickable = clickable || false;
        var config = getConfig(feature);
        var fill = getFillColor(config, feature);
        var border = getBorderColor(config, feature);
        return {
            weight: 1,
            color: border,
            fillColor: fill,
            clickable: clickable,
            opacity: 0.8,
            fillOpacity: 0.4
        };
    };

}(KR.Style));

/*global Cesium:false, turf:false */
var KR = this.KR || {};

/*
    Utility for setting up a Cesiumjs map to fly along a line
*/

KR.PathTracer = function (viewer, line, geojson) {
    'use strict';

    var SPEED = 1.4; // m/s
    var MULTIPLIER = 35;

    var running = false;

    var pitchCorr = 0;

    function _addClock(start, stop) {
        //Set the random number seed for consistent results.
        Cesium.Math.setRandomNumberSeed(3);
        //Make sure viewer is at the desired time.
        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
        viewer.clock.multiplier = MULTIPLIER;
        viewer.clock.shouldAnimate = false;
    }

    function _createEntity(startTime, stopTime, position) {
        var entity = viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: startTime,
                stop: stopTime
            })]),
            position: position,
            orientation: new Cesium.VelocityOrientationProperty(position)/*,
            path : {
                resolution : 1,
                material : new Cesium.PolylineGlowMaterialProperty({
                    glowPower : 0.1,
                    color : Cesium.Color.YELLOW
                }),
                width : 10
            }*/
        });
        return entity;
    }

    function _getFlight(startTime, curve, line) {

        //reverse
        curve = curve.reverse();
        line.geometry.coordinates = line.geometry.coordinates.reverse();

        var dist = 0;
        var lastPoint = turf.point(line.geometry.coordinates[0]);
        var property = new Cesium.SampledPositionProperty();
        _.each(curve, function (pos, i) {
            var stopPoint = turf.point(line.geometry.coordinates[i]);
            dist = dist + turf.distance(lastPoint, stopPoint, 'kilometers') * 1000;
            lastPoint = stopPoint;
            var time = Cesium.JulianDate.addSeconds(startTime, dist / SPEED, new Cesium.JulianDate());
            var position = new Cesium.Cartesian3(pos.x, pos.y, pos.z + 2);
            property.addSample(time, position);
        });
        return property;
    }

    function _setupCamera(entity) {
        viewer.clock.onTick.addEventListener(function (clock) {

            if (!running) {
                return;
            }

            //get 2 positions close together timewise
            var CC3 = Cesium.Cartesian3;
            var position1 = entity.position.getValue(
                clock.currentTime,
                new CC3()
            );
            var position2 = entity.position.getValue(
                Cesium.JulianDate.addSeconds(
                    clock.currentTime,
                    1 / 60,
                    new Cesium.JulianDate()
                ),
                new CC3()
            );

            //velocity in terms of Earth Fixed
            var Wvelocity = CC3.subtract(position2, position1, new CC3());
            CC3.normalize(Wvelocity, Wvelocity);
            var Wup = new CC3();
            var Weast = new CC3();
            var Wnorth = new CC3();
            Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(position1, Wup);
            CC3.cross({x: 0, y: 0, z: 1}, Wup, Weast);
            CC3.cross(Wup, Weast, Wnorth);

            //velocity in terms of local ENU
            var Lvelocity = new CC3();
            Lvelocity.x = CC3.dot(Wvelocity, Weast);
            Lvelocity.y = CC3.dot(Wvelocity, Wnorth);
            Lvelocity.z = CC3.dot(Wvelocity, Wup);

            //angle of travel
            var Lup = new CC3(0, 0, 1);
            var Least = new CC3(1, 0, 0);
            var Lnorth = new CC3(0, 1, 0);
            var x = CC3.dot(Lvelocity, Least);
            var y = CC3.dot(Lvelocity, Lnorth);
            var z = CC3.dot(Lvelocity, Lup);
            var angle = Math.atan2(x, y);//math: y b4 x, heading: x b4 y
            var pitch = Math.asin(z);//make sure Lvelocity is unitized

            //angles offsets
            angle += 0 / 180 * Math.PI;
            pitch += -20 / 180 * Math.PI;

            var range = 800;
            var offset = new Cesium.HeadingPitchRange(angle, pitch + pitchCorr, range);
            viewer.scene.camera.lookAt(
                entity.position.getValue(clock.currentTime),
                offset
            );
        });
    }

    function _init() {
        var feature = geojson.features[0];
        var length = turf.lineDistance(feature, 'kilometers') * 1000;
        var duration = length / SPEED;
        var startTime = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
        var stopTime = Cesium.JulianDate.addSeconds(startTime, duration, new Cesium.JulianDate());

        _addClock(startTime, stopTime);

        var position = _getFlight(startTime, line, feature);
        var entity = _createEntity(startTime, stopTime, position);
        entity.position.setInterpolationOptions({
            interpolationDegree : 5,
            interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
        });

        viewer.trackedEntity = undefined;
        _setupCamera(entity);
    }

    function start() {
        running = true;
        viewer.clock.shouldAnimate = true;
    }

    function stop() {
        running = false;
        viewer.clock.shouldAnimate = false;
    }

    //start it
    _init();

    return {
        start: start,
        stop: stop,
        isRunning: function () {return running; },
        setPitchCorr: function (corr) {pitchCorr = corr; }
    };
};
/*global Cesium:false, turf:false */
var KR = this.KR || {};

/*
    Simple configuration for a Cesium map
*/

KR.CesiumMap = function (div, cesiumOptions, bounds) {
    'use strict';

    Cesium.BingMapsApi.defaultKey = '';
    var config = {
        cesiumViewerOpts: _.extend({
            timeline: false,
            baseLayerPicker: false,
            geocoder: false,
            infoBox: false,
            animation: false,
            orderIndependentTranslucency: false
        }, cesiumOptions || {})
    };

    var viewer;

    function _getTerrainProvider() {
        return new Cesium.CesiumTerrainProvider({
            url : '//assets.agi.com/stk-terrain/world',
            requestVertexNormals : true,
            requestWaterMask: false
        });
    }

    function _setupLimit(extent) {

        var camera = viewer.scene.camera;

        var lastPosition;

        //listen for move event
        camera.moveEnd.addEventListener(function () {

            //get current position as lat/lon
            var pos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
                camera.position
            );

            //check if is outside
            var isOutsideExtent = !Cesium.Rectangle.contains(extent, pos);
            if (isOutsideExtent && lastPosition) {
                //reposition
                camera.position = lastPosition;
            }

            //store last pos
            lastPosition = camera.position.clone();
        });
    }



    function init() {
        viewer = new Cesium.Viewer(div, config.cesiumViewerOpts);

        var scene = viewer.scene;
        scene.imageryLayers.removeAll();
        var globe = scene.globe;

        // Will use local time to estimate actual daylight 
        globe.enableLighting = true;

        // Depth test: If this isn't on, objects will be visible through the terrain.
        globe.depthTestAgainstTerrain = true;

        // Add the terrain provider (AGI)
        viewer.terrainProvider = _getTerrainProvider();

        var camera = scene.camera;

        var extent;
        if (bounds) {
            bounds = KR.Util.splitBbox(bounds);
            var ellipsoid = Cesium.Ellipsoid.WGS84;
            extent = new Cesium.Rectangle(
                Cesium.Math.toRadians(bounds[0]),
                Cesium.Math.toRadians(bounds[1]),
                Cesium.Math.toRadians(bounds[2]),
                Cesium.Math.toRadians(bounds[3])
            );
            camera.viewRectangle(extent, ellipsoid);
        }


        if (extent && config.cesiumViewerOpts.limitBounds) {
            _setupLimit(extent);
        }

        CesiumMiniMap(viewer);
    }



    function build3DLine(geojson, callback) {

        var coordinates = geojson.features[0].geometry.coordinates;

        var positions = _.map(coordinates, function (coordinatePair) {
            return new Cesium.Cartographic.fromDegrees(coordinatePair[0], coordinatePair[1]);
        });

        var promise = Cesium.sampleTerrain(viewer.terrainProvider, 14, positions);
        Cesium.when(promise, function (updatedPositions) {
            callback(Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions));
        });
    }

    function createQueryParams(params) {
        return _.map(params, function (value, key) {
            return key + '=' + value;
        }).join('&');
    }

    function getTiles(url) {
        return new Cesium.UrlTemplateImageryProvider({
            url : url
        });
    }

    function _createWmtsParams(url, layer, params) {
        var urlParams = {
            SERVICE: 'WMTS',
            REQUEST: 'GetTile',
            TILEROW: '{TileRow}',
            TILECOL: '{TileCol}',
            STYLE: '{Style}',
            LAYER: layer
        };

        return {
            url: url + '?' + createQueryParams(_.extend({}, urlParams, params || {})),
            layer: '',
            tileMatrixSetID : ''
        };
    }

    function getWmts(url, layer, params) {

        var defaultParams = {
            style : 'default',
            version : '1.0.0',
            format : 'image/png',
            maximumLevel: 19
        };

        return new Cesium.WebMapTileServiceImageryProvider(
            _.extend({}, defaultParams, _createWmtsParams(url, layer, params))
        );
    }

    function getWms(url, layer) {
        return new Cesium.WebMapServiceImageryProvider({
            url : url,
            layers: layer,
            parameters: {
                service: "WMS",
                version: "1.1.1",
                request: "GetMap",
                styles: "",
                format: "image/png",
                transparent: true
            }
        });
    }


    function addMarkers(markers) {
        return _.map(markers, function (marker) {
            var cmarker =  {
                position: Cesium.Cartesian3.fromDegrees(marker.pos.lng, marker.pos.lat, 80),
                billboard: {
                    image: marker.icon,
                    show: true, // default
                    heightReference: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scale: 1
                },
                label: {
                    text: marker.text,
                    font: '14pt monospace',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 32)
                }
            };
            viewer.entities.add(cmarker);
            return cmarker;
        });
    }

    function _getHeightsForGeoJsonPoints(geojson, callback, zoomLevel, extraHeight) {
        zoomLevel = zoomLevel || 14;
        var allCoordinates = [];
        if (!extraHeight) {
            extraHeight = 0;
        }
        _.each(geojson.features, function (feature) {
            var fgeom = feature.geometry.coordinates;
            allCoordinates.push(new Cesium.Cartographic.fromDegrees(fgeom[0], fgeom[1]));
        });

        var promise = Cesium.sampleTerrain(
            viewer.terrainProvider,
            zoomLevel,
            allCoordinates
        );
        Cesium.when(promise, function (updatedPositions) {
            var allCoordinatesHeight = updatedPositions;
            _.each(geojson.features, function (feature, count) {
                var newCoor = allCoordinatesHeight[count];
                feature.geometry.coordinates = [
                    Cesium.Math.toDegrees(newCoor.longitude),
                    Cesium.Math.toDegrees(newCoor.latitude),
                    newCoor.height + extraHeight
                ];
            });
            callback(geojson);
        });
    }


    function addClickhandler(callback) {
        var pickedEntities = new Cesium.EntityCollection();

        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (movement) {

            // get an array of all primitives at the mouse position
            var pickedObjects = viewer.scene.drillPick(movement.position);
            if (Cesium.defined(pickedObjects)) {

                //Update the collection of picked entities.
                pickedEntities.removeAll();
                var objects = _.map(pickedObjects, function (pickedObj) {
                    var entity = pickedObj.id;
                    pickedEntities.add(entity);
                    return entity.properties;
                });
                if (objects.length) {
                    callback(objects);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    function loadDataset(dataset, bbox, api, callback) {
        api.getBbox(dataset, bbox, function (res) {
            _getHeightsForGeoJsonPoints(res, function (data) {
                var dataSource = Cesium.GeoJsonDataSource.load(data);
                callback(dataSource);
            });
        });
    }

    function loadDataset2(dataset, bbox, api, extraProps, callback) {
        api.getBbox(dataset, bbox, function (res) {
            _.each(res.features, function (feature) {
                feature.properties = _.extend(feature.properties, extraProps);
            });
            _getHeightsForGeoJsonPoints(res, function (data) {
                var dataSource = Cesium.GeoJsonDataSource.load(data);
                callback(dataSource);
            });
        });
    }

    function stopLoading() {
        $('.spinner-wrapper').delay(2000).fadeOut({duration: 200});
    }

    init();

    return {
        viewer: viewer,
        addMarkers: addMarkers,
        build3DLine: build3DLine,
        addClickhandler: addClickhandler,
        loadDataset: loadDataset,
        loadDataset2: loadDataset2,
        stopLoading: stopLoading,
        getTiles: getTiles,
        getWmts: getWmts,
        getWms: getWms,
        addImageryProvider: function (provider) {
            viewer.imageryLayers.addImageryProvider(provider);
        }
    };
};


KR.CesiumUtils = {};
KR.CesiumUtils.getBounds = function (geojson) {
    'use strict';
    var enveloped = turf.envelope(geojson);
    var coords = enveloped.geometry.coordinates[0];
    return coords[0].concat(coords[2]).join(',');
};
/*global Cesium:false */
var KR = this.KR || {};

/*
    A sidebar for Cesium, similar to L.Knreise.Control.Sidebar for Leaflet
*/

KR.CesiumSidebar = function (element, err, closeCallback, options) {
    'use strict';

    options = options || {
        footerTemplate: _.template($('#footer_template').html()),
        listElementTemplate: _.template($('#list_item_template').html()),
        markerTemplate: _.template($('#marker_template').html()),
        thumbnailTemplate: _.template($('#thumbnail_template').html())
    };

    var _parentContainer = $('<div id="sidebar"></div>');
    element.append(_parentContainer);


    var _top = $('<div class="top-menu"></div>');
    _parentContainer.append(_top);

    var _close = $('<a class="close pull-right">×</a>');
    _top.append(_close);

    var _topContainer = $('<span></span>');
    _top.append(_topContainer);

    var _contentContainer = $('<div class="sidebar-content"></div>');
    _parentContainer.append(_contentContainer);

    var sidebarContent = new KR.SidebarContent(_parentContainer, _contentContainer, _topContainer, options);

    var closeCb = closeCallback;

    element.addClass('knreise-sidebar');

    function _setContent(content) {
        _contentContainer.html('');
    }

    function mapProperties(properties) {
        return {
            properties: properties,
            template: properties.template
        };
    }

    function showFeature(properties) {
        sidebarContent.showFeature(mapProperties(properties));
    }

    function _createListElement(feature) {
        var li = $('<a href="#" class="list-group-item">' + feature.title + '</a>');
        li.on('click', function (e) {
            e.preventDefault();
            showFeature(feature);
            return false;
        });
        return li;
    }

    function showList(propertiesArray) {
        var features = _.map(propertiesArray, mapProperties);
        sidebarContent.showFeatures(features);
    }

    function show(properties) {

        element.show('slide', {direction: 'left'}, 100);
        if (properties.length === 1) {
            showFeature(properties[0]);
        } else {
            showList(properties);
        }
    }

    function _closeFunc() {
        element.hide('slide', {direction: 'left'}, 100);
        _setContent('');
        if (closeCb) {
            closeCb();
        }
    }

    _close.click(_closeFunc);

    return {
        show: show,
        addCloseCb: function (cb) {
            closeCb = cb;
        }
    };
};

/*global audiojs:false*/

var KR = this.KR || {};

/*
    Handles display of content in a sidebar
*/

KR.SidebarContent = function (wrapper, element, top, options) {
    'use strict';

    var defaultTemplate = KR.Util.getDatasetTemplate('popup');

    element = $(element);
    wrapper = $(wrapper);
    top = $(top);

    function _setContent(content) {
        element.html(content);
    }

    function _setupSwipe(callbacks) {
        if (!callbacks) {
            return;
        }
        element
            .swipe({
                swipe: function () {},
                allowPageScroll: 'vertical'
            })
            .off('swipeLeft')
            .on('swipeLeft', function () {
                if (callbacks.next) {
                    callbacks.next();
                }
            })
            .off('swipeRight')
            .on('swipeRight', function () {
                if (callbacks.prev) {
                    callbacks.prev();
                }
            });
    }

    function _createListCallbacks(feature, index, template, getData, features, close) {
        var prev;
        if (index > 0) {
            prev = function (e) {
                if (e) {
                    e.preventDefault();
                }
                index = index - 1;
                feature = features[index];
                var callbacks = _createListCallbacks(feature, index, template, getData, features, close);
                showFeature(feature, template, getData, callbacks, index, features.length);
            };
        }
        var next;
        if (index < features.length - 1) {
            next = function (e) {
                if (e) {
                    e.preventDefault();
                }
                index = index + 1;
                feature = features[index];
                var callbacks = _createListCallbacks(feature, index, template, getData, features, close);
                showFeature(feature, template, getData, callbacks, index, features.length);
            };
        }

        if (!close) {
            close = function () {
                showFeatures(features, template, getData, options.noListThreshold, true);
            };
        }

        return {
            prev: prev,
            close: close,
            next: next
        };
    }

    function _createListElement(feature, index, template, getData, features) {
        var marker;
        if (feature.properties.thumbnail) {
            marker = options.thumbnailTemplate({
                thumbnail: feature.properties.thumbnail,
                color: KR.Style.colorForFeature(feature, true)
            });
        } else {
            marker = options.markerTemplate({
                icon: '',
                color: KR.Style.colorForFeature(feature)
            });
        }

        var li = $(options.listElementTemplate({
            title: feature.properties.title,
            marker: marker
        }));

        li.on('click', function (e) {
            e.preventDefault();
            var callbacks = _createListCallbacks(feature, index, template, getData, features);
            showFeature(feature, template, getData, callbacks, index, features.length);
            return false;
        });
        return li;
    }

    function showFeature(feature, template, getData, callbacks, index, numFeatures) {
        if (getData) {
            _setContent('');
            getData(feature, function (newFeature) {
                newFeature.properties = _.extend(feature.properties, newFeature.properties);
                showFeature(newFeature, template, null, callbacks, index, numFeatures);
            });
            return;
        }
        template = template || feature.template || KR.Util.templateForDataset(feature.properties.dataset) || defaultTemplate;

        var img = feature.properties.images;
        if (_.isArray(img)) {
            img = img[0];
        }

        if (feature.properties.allProps && feature.properties.allProps.europeana_rights) {
            feature.properties.license = feature.properties.allProps.europeana_rights[0];
        } else {
            feature.properties.license = null;
        }


        var color = KR.Style.colorForFeature(feature, true, true);
        var content = '<span class="providertext" style="color:' + color + ';">' + feature.properties.provider + '</span>' +
            template(_.extend({image: null}, feature.properties));


        if (options.footerTemplate && feature.properties.link) {
            content += options.footerTemplate(feature.properties);
        }

        _setContent(content);
        _setupSwipe(callbacks);

        wrapper.find('.prev-next-arrows').remove();

        top.html('');
        if (callbacks) {
            var list = $('<a class="pull-left list-btn"><i class="fa fa-bars"></i></a>');
            top.append(list);
            list.click(callbacks.close);
            var idx = index + 1;
            top.append($('<div class="top-text pull-left">' + idx + ' av ' + numFeatures + '</div>'));

            var prev = $('<a class="prev-next-arrows prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a>');
            wrapper.append(prev);
            if (callbacks.prev) {
                prev.click(callbacks.prev).addClass('active');
            }


            var next = $('<a class="prev-next-arrows next circle"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a>');
            wrapper.append(next);
            if (callbacks.next) {
                next.click(callbacks.next).addClass('active');
            }
        }

        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        element.scrollTop(0);
    }

    function showFeatures(features, template, getData, noListThreshold, forceList) {
        noListThreshold = (noListThreshold === undefined) ? options.noListThreshold : noListThreshold;
        var shouldSkipList = (features.length <= noListThreshold);
        if (shouldSkipList && forceList !== true) {
            var feature = features[0];
            element.html('');
            var callbacks = _createListCallbacks(feature, 0, template, getData, features);
            this.showFeature(feature, template, getData, callbacks, 0, features.length);
            return;
        }

        var count = $('<span class="circle">' + features.length + '</span>');
        top.html(count);

        var grouped = _.chain(features)
            .groupBy(function (feature) {
                return feature.properties.provider;
            })
            .map(function (featuresInGroup, key) {
                var wrap = $('<div></div>');
                var list = $('<div class="list-group"></ul>');
                var elements = _.map(featuresInGroup, function (feature) {
                    var index = _.findIndex(features, function (a) {
                        return a === feature;
                    });
                    return _createListElement(feature, index, template, getData, features);
                }, this);

                list.append(elements);
                wrap.append('<h5 class="providertext">' + key + '</h5>');
                wrap.append(list);
                return wrap;
            }).value();

        element.html(grouped);
        element.scrollTop(0);
    }

    return {
        showFeature: showFeature,
        showFeatures: showFeatures
    };
};

/*global L:false, turf:false */
var KR = this.KR || {};

/*
    Handles loading of datasets

    Init it with a KnreiseAPI, a Leaflet map, something that behaves as 
    L.Knreise.Control.Sidebar and an optional callback for errors.
*/
KR.DatasetLoader = function (api, map, sidebar, errorCallback) {
    'use strict';

    var reloads = [];

    var _defaults = {
        isStatic: true,
        bbox: true,
        cluster: true,
        visible: true
    };

    var _addClusterClick, _addFeatureClick;
    if (sidebar) {
        _addClusterClick = KR.Util.clusterClick(sidebar);
        _addFeatureClick = KR.Util.featureClick(sidebar);
    }

    function _mapper(dataset) {
        var id = KR.Util.stamp(dataset);
        return function (features) {
            if (!features || !features.features.length) {
                return features;
            }
            _.each(features.features, function (feature) {
                feature.properties.datasetID = id;
                if (_.has(dataset, 'circle')) {
                    feature.properties.circle = dataset.circle;
                }
                if (_.has(dataset, 'provider')) {
                    feature.properties.provider = dataset.provider;
                }
                if (_.has(dataset, 'extras')) {
                    feature.properties = _.extend(feature.properties, dataset.extras);
                }
                if (_.has(dataset, 'mappings')) {
                    _.each(dataset.mappings, function (value, key) {
                        feature.properties[key] = feature.properties[value];
                    });
                }
            });
            return features;
        };
    }

    function _copyProperties(dataset) {
        var params = _.reduce(_.without(_.keys(dataset), 'datasets'), function (acc, key) {
            acc[key] = dataset[key];
            return acc;
        }, {});
        dataset.datasets  = _.map(dataset.datasets, function (dataset) {
            return _.extend({}, params, dataset);
        });
        return dataset;
    }

    function _createGeoJSONLayer(geoJson, dataset) {
        var options = {
            dataset: dataset,
            onEachFeature: function (feature, layer) {
                if (_addFeatureClick) {
                    _addFeatureClick(feature, layer, dataset);
                }
            }
        };
        if (dataset.style) {
            options.style = dataset.style;
        }
        return L.Knreise.geoJson(geoJson, options);
    }

    function _resetDataGeoJson(layer, featurecollections) {
        layer.clearLayers();
        var features = _.reduce(featurecollections, function (acc, data) {
            return acc.concat(data.toGeoJSON().features);
        }, []);
        layer.addData(KR.Util.createFeatureCollection(features));
    }

    function _resetClusterData(clusterLayer, featurecollections) {
        clusterLayer.clearLayers();
        var layers = _.reduce(featurecollections, function (acc, geoJSONLayer) {
            geoJSONLayer.setMap(map);
            return acc.concat(geoJSONLayer.getLayers());
        }, []);
        clusterLayer.addLayers(layers);
    }

    function _setupToggle(layer, reloadFunc) {
        layer.on('hide', function () {
            reloadFunc(true);
        });

        layer.on('show', function () {
            reloadFunc(true);
        });
    }

    function _createVectorLayer(dataset, map) {
        var vectorLayer;
        if (dataset.cluster) {
            vectorLayer = new L.Knreise.MarkerClusterGroup({dataset: dataset}).addTo(map);
            if (_addClusterClick) {
                _addClusterClick(vectorLayer, dataset);
            }
        } else {
            vectorLayer = _createGeoJSONLayer(null, dataset).addTo(map);
        }
        var enabled = true;
        if (dataset.minFeatures) {
            enabled = false;
        }
        vectorLayer.enabled = enabled;
        return vectorLayer;
    }

    function _toggleEnabled(vectorLayer, enabled) {
        if (vectorLayer.enabled !== enabled) {
            vectorLayer.enabled = enabled;
            vectorLayer.fire('changeEnabled');
        }
    }

    function _getvisible(dataset) {
        if (dataset.datasets && !dataset.grouped) {
            var numVisible = _.filter(dataset.datasets, function (d) {
                return d.visible;
            }).length;
            return (numVisible > 0);
        }

        return dataset.visible;
    }

    function _checkShouldLoad(dataset) {
        if (!dataset.minZoom) {
            return _getvisible(dataset);
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return _getvisible(dataset);
    }

    function _checkEnabled(dataset) {
        if (!dataset.minZoom) {
            return true;
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return true;
    }

    function _isStatic(dataset) {
        if (dataset.datasets) {
            return _.filter(dataset.datasets, function (dataset) {
                return (dataset.isStatic === false);
            }).length === 0;
        }
        return dataset.isStatic;
    }

    function _checkLoadWhenLessThan(dataset) {
        var datasetList = [];
        if (dataset.datasets) {
            datasetList = dataset.datasets;
        } else {
            datasetList.push(dataset);
        }

        _.each(datasetList, function (dataset) {
            if (dataset.loadWhenLessThan) {

                var check = function () {
                    if (!dataset.geoJson) {
                        return;
                    }
                    var poly = turf.bboxPolygon(KR.Util.splitBbox(map.getBounds().toBBoxString()));
                    var inside = _.filter(dataset.geoJson.features, function (p) {
                        return turf.inside(p, poly);
                    });
                    if (inside.length <= dataset.loadWhenLessThan.count) {
                        dataset.loadWhenLessThan.callback(map, dataset, inside);
                    } else {
                        dataset.loadWhenLessThan.callback(map, dataset);
                    }
                };
                map.on('moveend', check);
                check();
            }
        });
    }


    function _initDataset(dataset) {
        if (dataset.init) {
            dataset.init(map, dataset);
        }
    }

    function _addDataset(dataset, filter, initBounds) {
        var vectorLayer = _createVectorLayer(dataset, map);

        if (dataset.datasets) {

            dataset.datasets = _.filter(dataset.datasets, function (dataset) {
                return !dataset.noLoad;
            });
            _.each(dataset.datasets, _initDataset);
        } else {
            _initDataset(dataset);
        }

        function checkData(geoJson, vectorLayer) {
            if (dataset.minFeatures) {
                if (geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                    _toggleEnabled(vectorLayer, false);
                    return KR.Util.createFeatureCollection([]);
                }
                _toggleEnabled(vectorLayer, true);
            }
            return geoJson;
        }

        var lastBounds;

        var _reloadData = function (e, bbox, forceVisible, callback) {
            var first = !e;

            vectorLayer.enabled = _checkEnabled(dataset);
            vectorLayer.fire('changeEnabled');
            var shouldLoad = forceVisible || _checkShouldLoad(dataset);
            if (!shouldLoad) {
                vectorLayer.clearLayers();
                return;
            }

            var newBounds = bbox || map.getBounds().toBBoxString();
            var toLoad;
            if (dataset.datasets) {
                toLoad = _.filter(dataset.datasets, function (d) {
                    return d.visible;
                });
            } else {
                toLoad = [dataset];
            }

            var featurecollections = [];
            var finished = _.after(toLoad.length, function () {
                vectorLayer.isLoading = false;
                vectorLayer.fire('dataloadend');
                if (dataset.cluster) {
                    _resetClusterData(vectorLayer, featurecollections);
                } else {
                    _resetDataGeoJson(vectorLayer, featurecollections);
                }
                if (callback) {
                    callback();
                }
            });

            vectorLayer.isLoading = true;
            vectorLayer.fire('dataloadstart');
            _.each(toLoad, function (dataset) {
                var mapper = _mapper(dataset);

                function dataLoaded(geoJson) {
                    dataset.geoJson = geoJson;
                    vectorLayer.error = null;
                    if (filter) {
                        geoJson = filter(geoJson);
                    }
                    var geoJSONLayer;
                    if (dataset.cluster) {
                        geoJSONLayer = _createGeoJSONLayer(
                            mapper(checkData(geoJson, vectorLayer)),
                            dataset
                        );
                        dataset.geoJSONLayer = geoJSONLayer;
                    } else {
                        geoJSONLayer = L.geoJson(mapper(checkData(geoJson, vectorLayer)));
                    }
                    featurecollections.push(geoJSONLayer);
                    finished();
                }

                function loadError(error) {
                    vectorLayer.error = error;
                    finished();
                    //do not display errors for abort
                    if (error.statusText === 'abort') {
                        return;
                    }
                    if (errorCallback) {
                        errorCallback({
                            dataset: dataset.name,
                            error: error,
                            layer: vectorLayer
                        });
                    } else {
                        vectorLayer.fire('error', error);
                    }
                }

                //if this is not the first load, and dataset is static: do not load
                if ((!first && dataset.isStatic) || lastBounds === newBounds) {
                    dataLoaded(dataset.geoJson);
                    return;
                }

                //load according to strategy
                if (dataset.bbox) {
                    api.getBbox(
                        dataset.dataset,
                        newBounds,
                        dataLoaded,
                        loadError
                    );
                } else {
                    api.getData(
                        dataset.dataset,
                        dataLoaded,
                        loadError
                    );
                }
            });
            lastBounds = newBounds;
        };

        _reloadData(null, initBounds, undefined, function () {
            _checkLoadWhenLessThan(dataset);
        });

        if (!_isStatic(dataset) || dataset.minZoom) {
            map.on('moveend', _reloadData);
        }

        _setupToggle(vectorLayer, _reloadData);

        return {layer: vectorLayer, reload: _reloadData};
    }

    function _setStyle(dataset) {
        var id = KR.Util.getDatasetId(dataset);
        dataset.extras = dataset.extras || {};
        dataset.extras.datasetId = id;
        if (dataset.style) {
            KR.Style.setDatasetStyle(id, dataset.style);
        }
    }

    /*
        Force a reload of all datasets, optionally set them visible after load
        calls callback when fihished
    */
    function reload(setVisible, callback) {
        var finished = _.after(reloads.length, function () {
            if (callback) {
                callback();
            }
        });
        _.each(reloads, function (reload) {
            reload(null, null, setVisible, finished);
        });
    }

    /*
        Loads a list of datasets, creates Leaflet layers of either 
        L.Knreise.GeoJSON or L.Knreise.MarkerClusterGroup according to
        config. 

        Can be supplied an initial bbox for filtering and a filter function
    */
    function loadDatasets(datasets, bounds, filter) {

        datasets = _.filter(datasets, function (dataset) {
            return !dataset.noLoad;
        });

        var res = _.map(datasets, function (dataset) {

            //extend with defaults
            dataset = _.extend({}, _defaults, dataset);

            //copy properties from parent
            if (dataset.datasets) {
                _copyProperties(dataset);
            }

            //set default style
            if (KR.Style.setDatasetStyle) {
                if (dataset.datasets) {
                    _.each(dataset.datasets, _setStyle);
                } else {
                    _setStyle(dataset);
                }
            }

            if (!dataset.visible) {
                dataset.notLoaded = true;
            }
            if (dataset.minZoom && dataset.bbox) {
                dataset.isStatic = false;
            }
            return _addDataset(dataset, filter, bounds);
        });
        reloads = _.pluck(res, 'reload');
        return _.pluck(res, 'layer');
    }

    return {
        loadDatasets: loadDatasets,
        reload: reload
    };
};

/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

/*
    List of predefined datasets
*/

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {

        var loadKulturminnePoly = function (map, dataset, features) {
            if (!features) {
                dataset.extraFeatures.clearLayers();
            }
            if (features) {
                var ids = _.map(features, function (feature) {
                    return feature.properties.id;
                });
                if (ids.length) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'lokalitetpoly',
                        lokalitet: ids
                    };
                    api.getData(q, function (geoJson) {
                        dataset.extraFeatures.clearLayers().addData(geoJson);
                    });
                }
            }
        };

        var initKulturminnePoly = function (map, dataset) {
            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    feature.properties.datasetId = dataset.id;
                    layer.setStyle(KR.Style.getPathStyle(feature, true));
                    layer.on('click', function () {
                        var parent = _.find(dataset.geoJSONLayer.getLayers(), function (parentLayer) {
                            return (parentLayer.feature.properties.id === feature.properties.lok);
                        });
                        if (parent) {
                            parent.fire('click');
                        }
                    });
                }
            }).addTo(map);
        };

        return {
            loadKulturminnePoly: loadKulturminnePoly,
            initKulturminnePoly: initKulturminnePoly
        };
    };

    ns.getDatasetList = function (api, komm) {

        var kulturminneFunctions = ns.getKulturminneFunctions(api);
        if (komm && komm.length === 3) {
            komm = '0' + komm;
        }

        var list = {
            'difo': {
                name: 'Digitalt fortalt',
                dataset: {dataset: 'difo', api: 'norvegiana'},
                cluster: true,
                template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
                noListThreshold: Infinity,
                description: 'Digitalt fortalt'
            },
            'verneomr': {
                id: 'verneomraader',
                dataset: {
                    api: 'cartodb',
                    table: 'naturvernomrader_utm33_2',
                    columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
                },
                provider: 'Naturbase',
                name: 'Verneområder',
                template: KR.Util.getDatasetTemplate('verneomraader'),
                getFeatureData: function (feature, callback) {
                    api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
                },
                toPoint: {
                    showAlways: true,
                    stopPolyClick: true,
                    minSize: 20
                },
                minZoom: 10,
                cluster: false,
                description: 'Verneområder fra Naturbase, polygoner og punkter'
            },
            'artobs': {
                name: 'Artsobservasjoner',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Artsdatabanken'
                },
                cluster: false,
                description: 'Artsobservasjoner fra Artsdatabanken',
                template: KR.Util.getDatasetTemplate('popup')
            },
            'folketelling': {
                name: 'Folketelling 1910',
                provider: 'Folketelling 1910',
                dataset: {
                    api: 'folketelling',
                    dataset: 'property',
                },
                isStatic: false,
                minZoom: 14,
                template: KR.Util.getDatasetTemplate('folketelling'),
                getFeatureData: function (feature, callback) {
                    api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: feature.properties.efid
                    }, function (feature) {
                        feature.properties.provider = 'Folketelling 1910';
                        callback(feature);
                    });
                },
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                },
                noListThreshold: 0,
                description: 'Eiendommer fra folketelling 1910'
            },
            'wikipedia': {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: KR.Util.getDatasetTemplate('wikipedia'),
                description: 'Geotaggede artikler fra bokmålswikipedia'
            },
            'ark_hist': {
                grouped: true,
                name: 'Arkeologi og historie',
                datasets: [
                    {
                        name: 'MUSIT',
                        provider: 'Universitetsmuseene',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'MUSIT'
                        },
                        template: KR.Util.getDatasetTemplate('musit')
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false
                    },
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            api: 'kulturminnedataSparql',
                            kommune: komm
                        },
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: true,
                        init: kulturminneFunctions.initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: kulturminneFunctions.loadKulturminnePoly
                        }
                    }
                ],
                description: 'Data fra Universitetsmuseene, Digitalt museum og Riksantikvaren'
            },
            'riksantikvaren': {
                id: 'riksantikvaren',
                name: 'Riksantikvaren',
                hideFromGenerator: true,
                provider: 'Riksantikvaren',
                dataset: {
                    api: 'kulturminnedataSparql',
                    kommune: komm
                },
                template: KR.Util.getDatasetTemplate('ra_sparql'),
                bbox: false,
                isStatic: true,
                init: kulturminneFunctions.initKulturminnePoly,
                loadWhenLessThan: {
                    count: 5,
                    callback: kulturminneFunctions.loadKulturminnePoly
                }
            }
        };
        if (!komm) {
            list.ark_hist.datasets[2].noLoad = true;
        }

        return list;
    };

    ns.getDatasets = function (ids, api, komm) {

        var datasetConfig = ns.getDatasetList(api, komm);
        return _.chain(ids)
            .map(function (dataset) {
                if (_.has(datasetConfig, dataset)) {
                    return datasetConfig[dataset];
                }
            })
            .compact()
            .value();
    };

}(KR.Config));

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
                width: options.width || 10.0,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: options.color || Cesium.Color.BLUE,
                    glowPower: options.glow || 0.1,
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
                _.extend(CESIUM_OPTS, {limitBounds: options.limitBounds}),
                bbox
            );
        }

        function _addDatasets(datasets, bbox, callback) {
            _.each(datasets, function (dataset) {
                var datasetId = KR.Util.getDatasetId(dataset);
                var props = {
                    template: dataset.template,
                    datasetId: datasetId,
                    'marker-color': KR.Style.colorForFeature({properties: {datasetId: datasetId}}, true)
                };
                map.loadDataset2(dataset.dataset, bbox, api, props, function (res) {
                    map.viewer.dataSources.add(res);
                });
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

                map.viewer.scene.imageryLayers.removeAll();

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