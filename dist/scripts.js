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
/*global L: false, turf: false, alert: false */

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

KR.Config.ImageCaheUrl = 'http://egbtmre.cloudimg.io';

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
                if (dataset && dataset.toPoint && dataset.toPoint.stopPolyClick) {
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


    ns.getTemplateForFeature = function (feature, dataset) {
        if (!dataset) {
            return;
        }
        if (dataset.datasets) {
            var d = _.find(dataset.datasets, function (dataset) {
                return (dataset._knreise_id === feature.properties.datasetID);
            });
            return d.template;
        }
        return dataset.template;
    };


    /*
        Utility function to handle clicks on a feature cluster
    */
    ns.clusterClick = function (sidebar) {
        return function _addClusterClick(clusterLayer, dataset) {
            clusterLayer.on('clusterclick', function (e) {
                var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                    var feature = marker.feature;
                    if (dataset && !feature.template) {
                        feature.template = ns.getTemplateForFeature(feature, dataset);
                    }
                    return feature;
                });
                var props = _.extend({}, {template: null, getFeatureData: null, noListThreshold: null}, dataset);
                sidebar.showFeatures(
                    features,
                    props.template,
                    props.getFeatureData,
                    props.noListThreshold
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
            return dataset.dataset.dataset;
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

        L.latLngBounds.fromBBoxArray = function (bbox) {
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };

        L.latLngBounds.fromBBoxString = function (bbox) {
            return L.latLngBounds.fromBBoxArray(KR.Util.splitBbox(bbox));
        };

        L.rectangle.fromBounds = function (bounds) {
            return L.rectangle([bounds.getSouthWest(), bounds.getNorthEast()]);
        }
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
            var isSafari = navigator.userAgent.indexOf("Safari") > -1;
            var useCache = !isSafari;
            callback(L.tileLayer.kartverket(layerName, {useCache: useCache}));
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
            } else if (_stringEndsWith(line, 'gpx') || line.indexOf('http://ut.no/tur/') !== -1) {
                lineData = {
                    api: 'gpx',
                    url: line
                };
            } else if (_stringEndsWith(line, 'geojson')) {
                lineData = {
                    api: 'geojson',
                    url: line
                };
            }
        }
        if (lineData) {
            api.getData(lineData, function (line) {
                callback(line);
            });
        } else {
            alert('Kunne ikke laste linjegeometri');
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

    /*
        Query cartodb to find the municipality which "mostly" covers a given
        bbox. 
    */
    ns.mostlyCoveringMunicipality = function (api, bbox, callback) {
        var makeEnvelope = 'ST_MakeEnvelope(' + bbox + ', 4326)';
        var query = 'SELECT komm FROM kommuner WHERE ' +
            'ST_Intersects(the_geom, ' + makeEnvelope + ')' +
            'ORDER BY st_area(st_intersection(the_geom, ' + makeEnvelope + ')) DESC LIMIT 1';

        var dataset = {
            'api': 'cartodb',
            'query': query,
            'mapper': function (res) {
                return res.rows[0].komm;
            }
        };
        api.getData(dataset, callback);
    };

    function fixKommuneNr(kommune) {
        if (kommune < 1000) {
            return '0' + kommune;
        }
        return kommune;
    }


    ns.sparqlBbox = function (api, dataset, bounds, dataLoaded, loadError) {
        KR.Util.mostlyCoveringMunicipality(api, bounds, function (kommune) {
            dataset.kommune = fixKommuneNr(kommune);
            api.getData(dataset, dataLoaded, loadError);
        });
    };


    /*
        Mearure the distance from each feature in a featurecollection to a given
        point, add it as a property and sort the featurecollection on the distance
    */
    ns.distanceAndSort = function (featurecollection, point) {
        var measured = _.map(featurecollection.features, function (feature) {
            feature.properties.distance = turf.distance(point, feature);
            return feature;
        });
        return turf.featurecollection(measured.sort(function (a, b) {
            if (a.properties.distance < b.properties.distance) {
                return -1;
            }
            if (a.properties.distance > b.properties.distance) {
                return 1;
            }
            return 0;
        }));
    };


    /*
        Round a number to n decimals
    */
    ns.round = function (number, decimals) {
        if (_.isUndefined(decimals)) {
            decimals = 2;
        }
        var exp = Math.pow(10, decimals);
        return Math.round(number * exp) / exp;
    };

    /*
        Given lat, lng and zoom, return an url hash
    */
    var hashTemplate = _.template('#<%= zoom %>/<%= lat %>/<%= lon %>');
    ns.getPositionHash = function (lat, lng, zoom) {
        return hashTemplate({
            zoom: zoom,
            lat: ns.round(lat, 4),
            lon: ns.round(lng, 4)
        });
    };

    ns.WORLD = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[
                [-180, -90],
                [-180,  90],
                [ 180,  90],
                [ 180, -90],
                [-180, -90]
            ]]
        }
    };

    ns.createMap = function (div, options) {
        options = options || {};


        //create the map
        var map = L.map(div, {
            minZoom: options.minZoom || 3,
            maxZoom: options.maxZoom || 18,
            maxBounds: L.geoJson(ns.WORLD).getBounds()
        });


        var baseLayer = options.layer || 'norges_grunnkart_graatone';
        if (_.isString(baseLayer)) {
            KR.Util.getBaseLayer(baseLayer, function (layer) {
                layer.addTo(map);
            });
        } else {
            baseLayer.addTo(map);
        }
        return map;
    };

    /*
        Utility for setting up the sidebar
    */
    ns.setupSidebar = function (map, options) {
        options = options || {};
        var popupTemplate = KR.Util.getDatasetTemplate('popup');
        var listElementTemplate = _.template($('#list_item_template').html());
        var markerTemplate = _.template($('#marker_template').html());
        var thumbnailTemplate = _.template($('#thumbnail_template').html());
        var footerTemplate = _.template($('#footer_template').html());

        var sidebarOptions = _.extend({}, {
            position: 'left',
            template: popupTemplate,
            listElementTemplate: listElementTemplate,
            markerTemplate: markerTemplate,
            thumbnailTemplate: thumbnailTemplate,
            footerTemplate: footerTemplate
        }, options);

        //the sidebar, used for displaying information
        var sidebar = L.Knreise.Control.sidebar('sidebar', sidebarOptions);
        map.addControl(sidebar);
        return sidebar;
    };

    /*
    Get distance and bearing between two points
    */
    ns.distanceAndBearing = function (point1, point2) {
        return {
            distance: turf.distance(point1, point2, 'kilometers') * 1000,
            bearing: turf.bearing(point1, point2)
        };
    };


    var cacheTemplate = _.template('<%= service %>/s/crop/<%= width %>x<%= height %>/<%= image %>');
    ns.getImageCache = function (imageUrl, width, height) {
        if (KR.Config.ImageCaheUrl) {
            return cacheTemplate({
                service: KR.Config.ImageCaheUrl,
                width: width,
                height: height,
                image: imageUrl
            });
        }
        return imageUrl;
    };

    ns.isInIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
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

    ns.groups = {

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

    function getGroupConfig(groupId) {
        return ns.groups[groupId];
    }

    function getConfig(feature) {
        var config;

        if (feature.properties && feature.properties.groupId) {
            return getGroupConfig(feature.properties.groupId);
        }

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
            markerColor: color
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

        var thumbnail = KR.Util.getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(' + thumbnail + ');border-color:' + color + ';"></div>' +
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
        var rest;
        if (_.isArray(color)) {
            rest = _.rest(color);
            color = color[0];
        }

        var thumbnail = KR.Util.getImageCache(photos[0].feature.properties.thumbnail, 50, 50);

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + thumbnail + ');'
        };
        if (rest) {
            styleDict['box-shadow'] = _.map(rest, function (c, index) {
                var width = (index + 1) * 2;
                return '0 0 0 ' + width + 'px ' + c;
            }).join(',') + ';';
        }

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

        var groups = _.uniq(_.map(features, function (feature) {
            return feature.feature.properties.groupId;
        }));


        var config = getConfig(features[0].feature);
        var colors;
        if (_.compact(groups).length > 1) {
            var groupIds = _.compact(groups);
            if (groupIds.length > 1) {
                colors = _.map(groupIds, _.compose(getFillColor, getGroupConfig));
            }
        } else {
            colors = getFillColor(config, features[0].feature);
        }
        if (selected) {
            colors = SELECTED_COLOR;
        }

        if (config.thumbnail) {
            var thumbnail = getClusterThumbnailIcon(features, colors, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        return getClusterIcon(features, colors);
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

    ns.colorForDataset = function (dataset, hex, useBaseColor) {
        var config, datasetId;
        if (dataset.grouped) {
            config = ns.groups[KR.Util.stamp(dataset)];
            if (!config) {
                datasetId = dataset.datasets[0].extras.datasetId;
            }
        } else {
            if (!datasetId) {
                datasetId = dataset.extras.datasetId;
            }
            config = getConfig({
                properties: {datasetId: datasetId}
            });
        }
        if (config) {
            if (hex) {
                return getFillColor(config, null, useBaseColor);
            }
            return hexToName(getFillColor(config, null));
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

    ns.getPathStyleForGroup = function (groupId, clickable) {
        var feature = {properties: {groupId: groupId}};
        return ns.getPathStyle(feature, clickable);
    };

}(KR.Style));

/*global L:false, KR:false*/

'use strict';

/*
    Wrapper over L.GeoJSON to handle clustered KNreise datasets
*/

L.Knreise = L.Knreise || {};
L.Knreise.MarkerClusterGroup = L.MarkerClusterGroup.extend({

    options: {
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false,
        polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6}
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        if (!this.options.iconCreateFunction) {
            this.options.iconCreateFunction = this._iconCreator.bind(this);
        }

        this._featureGroup = L.featureGroup();
        this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._nonPointGroup = L.featureGroup();
        this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._inZoomAnimation = 0;
        this._needsClustering = [];
        this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
        //The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
        this._currentShownBounds = null;

        this._queue = [];
        this.on('clusterclick', this._clusterClicked, this);
    },

    onAdd: function (map) {
        L.MarkerClusterGroup.prototype.onAdd.apply(this, arguments);
        map.on('layerSelected', this._deselectAll, this);
    },

    _deselectAll: function () {
        _.each(this._gridClusters, function (g) {
            _.each(g._grid, function (h) {
                _.each(h, function (i) {
                    _.each(i, function (cluster) {
                        if (cluster.selected) {
                            cluster.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, cluster);
                            cluster._updateIcon();
                            cluster.selected = false;
                        }
                    });
                });
            });
        });

        this.eachLayer(function (layer) {
            if (layer.selected) {
                layer.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, layer);
                layer.setIcon(_.bind(L.Knreise.GeoJSON.prototype._createFeatureIcon, this)(layer.feature));
                layer.selected = false;
            }
        }, this);
    },

    _clusterClicked: function (e) {
        this._map.fire('layerSelected');
        var layer = e.layer;
        var iconCreate = _.bind(this._iconCreator, this);
        layer.createIcon = function () {
            return iconCreate(this, true).createIcon();
        };
        layer.selected = true;
        layer._updateIcon();
    },

    _iconCreator: function (cluster, selected) {
        return KR.Style.getClusterIcon(cluster, selected);
    }

});

L.Knreise.markerClusterGroup = function (options) {
    return new L.Knreise.MarkerClusterGroup(options);
};

/*global L: false, KR: false, turf: false */
'use strict';

/*
    Wrapper over L.GeoJSON to handle unclustered KNreise datasets
*/

L.Knreise = L.Knreise || {};
L.Knreise.GeoJSON = L.GeoJSON.extend({

    initialize: function (geojson, options) {
        L.setOptions(this, options);

        this._layers = {};
        this.options.pointToLayer = this._pointToLayer.bind(this);

        if (geojson) {
            this.addData(geojson);
        }
        this.on('click', this._featureClicked, this);
        this._selectedLayer = null;
    },

    removedPaths: [],

    isCollapsed: function (path, zoom) {
        var minSize = this.options.dataset.toPoint.minSize || 20;
        var bounds = path.getBounds();

        var ne_px = this._map.project(bounds.getNorthEast(), zoom);
        var sw_px = this._map.project(bounds.getSouthWest(), zoom);

        var width = ne_px.x - sw_px.x;
        var height = sw_px.y - ne_px.y;
        return (height < minSize || width < minSize);
    },

    _deselectAll: function () {
        if (this._selectedLayer) {
            var layer = this._selectedLayer;
            if (layer.setIcon) {
                layer.setIcon(this._createFeatureIcon(layer.feature, false));
                layer.setZIndexOffset(0);
            }
            if (layer.setStyle) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }

                layer.setStyle(this._createFeatureIcon(feature, false));

                if (layer.getParent) {
                    var p = layer.getParent();
                    p.setStyle(this._createFeatureIcon(feature, false));
                }
            }
            this._selectedLayer = null;
        }
    },

    deselectAllNew: function () {

        _.each(this.getLayers(), function (layer) {
            if (layer.setIcon) {
                layer.setIcon(this._createFeatureIcon(layer.feature, false));
                layer.setZIndexOffset(0);
            }
            if (layer.setStyle) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }

                layer.setStyle(this._createFeatureIcon(feature, false));

                if (layer.getParent) {
                    var p = layer.getParent();
                    p.setStyle(this._createFeatureIcon(feature, false));
                }
            }
        }, this);
    },

    setLayerSelected: function (layer) {
        if (layer.setIcon) {
            layer.setIcon(this._createFeatureIcon(layer.feature, true));
            layer.setZIndexOffset(1000);
        }
        if (layer.setStyle) {

            var feature = layer.feature;
            if (!feature) {
                var parent = this.getParentLayer(layer._leaflet_id);
                feature = parent.feature;
            }
            if (feature) {
                layer.setStyle(this._createFeatureIcon(feature, true));
                layer.bringToFront();
            }

            if (layer.getParent) {
                var p = layer.getParent();
                p.setStyle(this._createFeatureIcon(feature, true));
            }

        }
        this._selectedLayer = layer;
    },

    _featureClicked: function (e) {
        if (this.options.dataset && this.options.dataset.toPoint && this.options.dataset.toPoint.stopPolyClick) {
            if (e.layer.toGeoJSON().geometry.type !== 'Point') {
                return;
            }
        }
        if (e.layer._map) {
            e.layer._map.fire('layerSelected');
        }
        var layer = e.layer;
        this.setLayerSelected(layer);
    },

    getParentLayer: function (id) {
        var l = this._layers[id];
        if (l) {
            return l;
        }
        var key, layer, found;
        for (key in this._layers) {
            if (this._layers.hasOwnProperty(key)) {
                layer = this._layers[key];
                if (layer.getLayer) {
                    found = layer.getLayer(id);
                    if (found) {
                        return layer;
                    }
                }
            }
        }
    },

    getZoomThreshold: function (path) {
        var zoomThreshold = null;
        var zoom = this._map.getZoom();
        if (this.isCollapsed(path, this._map.getZoom())) {
            while (!zoomThreshold) {
                zoom += 1;
                if (!this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom - 1;
                }
            }
        } else {
            while (!zoomThreshold) {
                zoom -= 1;
                if (this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom;
                }
            }
        }
        return zoomThreshold;
    },

    _zoomend: function () {
        if (!this.options.dataset.toPoint || !this.shouldLoad) {
            return;
        }

        var removedTemp = [],
            feature,
            i;

        this.eachLayer(function (feature) {
            if (this._map.getZoom() <= feature.zoomThreshold) {
                this.removeLayer(feature);
                if (!this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
                removedTemp.push(feature);
            }
        }, this);

        for (i = 0; i < this.removedPaths.length; i++) {
            feature = this.removedPaths[i];
            if (this._map.getZoom() > feature.zoomThreshold) {
                if (!this.options.dataset.toPoint.showAlways) {
                    this.removeLayer(feature.marker);
                }
                this.addLayer(feature);
                this.removedPaths.splice(i, 1);
                i = i - 1;
            }
        }
        this.removedPaths = this.removedPaths.concat(removedTemp);
    },

    _getCenter: function (feature) {
        if (typeof turf !== 'undefined') {
            var p = turf.pointOnSurface(feature.toGeoJSON());
            return L.latLng(p.geometry.coordinates.reverse());
        }
        return feature.getBounds().getCenter();
    },

    _layeradd: function (event) {
        var feature = event.layer;
        if (feature.feature.geometry.type !== 'Point' && !feature.isMarker) {
            feature.setStyle(KR.Style.getPathStyle(feature.feature));
            feature.bringToBack();
        }

        if (this.options.dataset.toPoint) {

            if (feature.isMarker) {
                return;
            }
            if (feature.getBounds && !feature.zoomThreshold && !feature.marker) {
                var zoomThreshold = this.getZoomThreshold(feature);
                var marker = this._pointToLayer(
                    feature.feature,
                    this._getCenter(feature)
                );
                marker.feature = feature.feature;
                marker.on('click', function (e) {
                    feature.fire('click', {
                        containerPoint: e.containerPoint,
                        latlng: e.latlng,
                        layerPoint: e.layerPoint,
                        originalEvent: e.originalEvent,
                        target: e.target,
                        type: e.type,
                        parent: true
                    });
                });

                feature.zoomThreshold = zoomThreshold;
                this.removedPaths.push(feature);
                feature.marker = marker;
                feature.marker.isMarker = true;
                feature.marker.getParent = function () {
                    return feature;
                };
                if (this._map.getZoom() <= zoomThreshold) {
                    this.removeLayer(feature);
                    if (!this.options.dataset.toPoint.showAlways) {
                        this.addLayer(feature.marker);
                    }
                }
                if (this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
            }
        }
    },

    setMap: function (map) {
        map.on('layerSelected', this._deselectAll, this);
    },

    onAdd: function (map) {
        L.GeoJSON.prototype.onAdd.apply(this, arguments);
        if (this.options.dataset && this.options.dataset.toPoint) {
            this._zoomend();
            map.on('zoomend', this._zoomend, this);
            this.on('layeradd', this._layeradd, this);
        }
        this.setMap(map);
    },

    _createFeatureIcon: function (feature, selected) {
        return KR.Style.getIcon(feature, selected);
    },

    _pointToLayer: function (feature, latlng) {
        return KR.Style.getMarker(feature, latlng);
    }

});


L.Knreise.geoJson = function (geojson, options) {
    return new L.Knreise.GeoJSON(geojson, options);
};
/*global L:false, KR: false, audiojs:false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Control = L.Knreise.Control || {};

/*
    A Leaflet wrapper for displaying sidebar data.
*/
L.Knreise.Control.Sidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        options = options || {};
        options.autoPan = false;
        L.setOptions(this, options);

        // Find content container
        var content =  L.DomUtil.get(placeholder);
        L.DomEvent.on(content, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
        });
        // Remove the content container from its original parent
        content.parentNode.removeChild(content);


        var top = L.DomUtil.create('div', 'top-menu', content);
        this._contentContainer = L.DomUtil.create('div', 'sidebar-content', content);

        this.on('hide', this._removeContent, this);

        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container = L.DomUtil.create('div', l + 'sidebar knreise-sidebar ' + this.options.position);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = this._closeButton = L.DomUtil.create('a', 'close pull-right', top);
            close.innerHTML = '&times;';
        }
        this._top = L.DomUtil.create('span', '', top);

        // Style and attach content container
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        this.on('hide', function () {
            if (this._map) {
                this._map.fire('layerSelected');
                this._map.fire('layerDeselect');
            }

        }, this);
        this.sidebar = new KR.SidebarContent(this._container, this._contentContainer, this._top, this.options, this._map);
    },

    addTo: function (map) {
        this.sidebar.setMap(map);
        return L.Control.Sidebar.prototype.addTo.apply(this, arguments);
    },

    showFeature: function (feature, template, getData, callbacks, index, numFeatures) {

        this.show();
        this.sidebar.showFeature(feature, template, getData, callbacks, index, numFeatures);


        if (KR.UrlFunctions) {
            var div = $('<div></div>');
            var params = {
                id: feature.id,
                url: KR.UrlFunctions.getFeatureLink(feature),
                provider: feature.properties.provider
            };
            if (feature.properties.feedbackForm) {
                $(this._contentContainer).append(div);
                KR.ResponseForm(div, params);
            }

            if (feature.id && this.options.featureHash) {
                KR.UrlFunctions.setFeatureHash(feature.id);
            }
        }
    },

    showFeatures: function (features, template, getData, noListThreshold, forceList) {
        this.show();
        this.sidebar.showFeatures(features, template, getData, noListThreshold, forceList);
    },

    _removeContent: function () {
        $(this.getContainer()).html('');
        if (KR.UrlFunctions) {
            KR.UrlFunctions.setFeatureHash();
        }
    }

});

L.Knreise.Control.sidebar = function (placeholder, options) {
    return new L.Knreise.Control.Sidebar(placeholder, options);
};

/*global window:false */

var KR = this.KR || {};
KR.UrlFunctions = {};
(function (ns) {
    'use strict';

    ns.setupLocationUrl = function (map) {
        var moved = function () {
            var c = map.getCenter();

            var locationHash = KR.Util.getPositionHash(c.lat, c.lng, map.getZoom());

            var hash = window.location.hash.split(':');
            if (hash.length > 1) {
                var prevId = _.rest(hash).join(':');
                locationHash += ':' + prevId;
            }
            window.location.hash = locationHash;
        };

        map.on('moveend', moved);
        moved();
    };

    ns.getLocationUrl = function () {
        var hash = window.location.hash;
        if (hash && hash !== '' && hash.indexOf(':') !== 1) {
            var parts = hash.replace('#', '').split('/');
            var zoom = parseInt(parts[0], 10);
            var lat = parseFloat(parts[1]);
            var lon = parseFloat(parts[2]);
            return {lat: lat, lon: lon, zoom: zoom};
        }
    };

    ns.getHashFeature = function () {
        var hash = window.location.hash.split(':');
        if (hash.length > 1) {
            return _.rest(hash).join(':');
        }
    };

    ns.setFeatureHash = function (featureId) {
        var hash = window.location.hash.split(':')[0];
        if (featureId) {
            window.location.hash = hash + ':' + encodeURIComponent(featureId);
        } else {
            window.location.hash = hash;
        }
    };

    ns.getFeatureLink = function (feature) {
        var baseUrl = window.location.href.replace(window.location.hash, '');
        var coords = feature.geometry.coordinates;
        var hash = KR.Util.getPositionHash(coords[1], coords[0], 16);

        var url = baseUrl + hash;
        if (feature.id) {
            url = url + ':' + encodeURIComponent(feature.id);
        }
        return url;
    };

}(KR.UrlFunctions));

/*global audiojs: false*/

var KR = this.KR || {};

KR.MediaCarousel = {};

(function (ns) {
    'use strict';

    function Counter(num, current) {
        current = current || 0;

        var hasNext = function () {
            return (current < num - 1);
        };

        var hasPrev = function () {
            return (current > 0);
        };

        return {
            prev: function () {
                if (!hasPrev()) {
                    return current;
                }
                return --current;
            },
            next: function () {
                if (!hasNext()) {
                    return current;
                }
                return ++current;
            },
            hasNext: hasNext,
            hasPrev: hasPrev
        };
    }


    function _createImage(src) {
        return $('<img data-type="image" class="fullwidth img-thumbnail" src="' + src + '" />');
    }

    function _createVideo(src) {
        if (src.indexOf('mp4') !== -1) {
            //  <% if(images) { %>poster="<%= images[0] %>" <% } %> 
            return $('<video data-type="video" class="video-js vjs-default-skin fullwidth" controls preload="auto" height="315" data-setup="{}"><source src="' + src + '" type="video/mp4"></video>');
        }
        return $('<iframe data-type="video" class="fullwidth" height="315" src="' + src + '" frameborder="0" allowfullscreen></iframe>');
    }

    function _createSound(src) {
        return $('<audio data-type="sound" src="' + src + '" preload="auto"></audio>');
    }

    var generators = {
        'image': _createImage,
        'video': _createVideo,
        'sound': _createSound
    };

    function _getMarkup(mediaObject) {
        if (_.has(generators, mediaObject.type)) {
            var element = generators[mediaObject.type](mediaObject.url);
            element.attr('data-type', mediaObject.type);
            element.attr('data-created', true);
            return element;
        }
    }


    function _createInactiveMarkup(url, type) {
        return $('<div class="hidden"> </div>')
            .attr('data-src', url)
            .attr('data-type', type);
    }

    ns.SetupMediaCarousel = function (mediaContainer) {
        var media = mediaContainer.find('.media-list').children();
        var counter = new Counter(media.length);
        function showMedia(idx) {
            media = mediaContainer.find('.media-list').children();
            var mediaElement = $(media[idx]);
            media.addClass('hidden');
            if (mediaElement.attr('data-created') || mediaElement.hasClass('audiojs')) {
                mediaElement.removeClass('hidden');
            } else {
                var mediaObject = {
                    type: mediaElement.attr('data-type'),
                    url: mediaElement.attr('data-src')
                };
                var element = _getMarkup(mediaObject);
                mediaElement.replaceWith(element);
                if (element.is('audio')) {
                    audiojs.create(element);
                }
            }

            if (counter.hasPrev()) {
                mediaContainer.find('.prev').addClass('active');
            } else {
                mediaContainer.find('.prev').removeClass('active');
            }

            if (counter.hasNext()) {
                mediaContainer.find('.next').addClass('active');
            } else {
                mediaContainer.find('.next').removeClass('active');
            }

        }

        mediaContainer.find('.next').on('click', function () {
            if (counter.hasNext()) {
                showMedia(counter.next());
            }
        });

        mediaContainer.find('.prev').on('click', function () {
            if (counter.hasPrev()) {
                showMedia(counter.prev());
            }
        });
    };

    ns.CreateMediaListMarkup = function (media) {
        var outer = $('<div class="media-container"></div>');
        var list = $('<div class="media-list"></div>');
        list.append(_.map(media, function (mediaObject, index) {
            var active = index === 0;

            if (active) {
                return _getMarkup(mediaObject);
            }
            return _createInactiveMarkup(mediaObject.url, mediaObject.type);
        }));
        outer.append(list);
        if (media.length > 1) {
            outer.append($('<div class="media-navigation"><a class="prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a><a class="next circle active"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></div>'));
        }
        return outer[0].outerHTML;
    };
}(KR.MediaCarousel));

/*global audiojs:false, turf:false*/

var KR = this.KR || {};
(function () {
    'use strict';


    function PositionDisplayer() {
        var map, div, feature, content;

        var template = _.template($('#user_position_template').html());

        function _distanceAndBearing(feature) {
            if (map && map.userPosition) {
                var pos = turf.point([
                    map.userPosition.lng,
                    map.userPosition.lat
                ]);
                var distBear =  KR.Util.distanceAndBearing(pos, feature);
                var dist = distBear.distance;
                if (dist < 1000) {
                    dist = KR.Util.round(dist, 0) + ' Meter';
                } else {
                    dist = KR.Util.round(dist / 1000, 2) + ' Kilometer';
                }
                return {
                    dist: dist,
                    rot: distBear.bearing - 45 //-45 because of rotation of fa-location-arrow
                };
            }
        }


        function _showPosition() {
            if (div && map && map.userPosition && feature) {

                if (content) {
                    content.remove();
                }

                var header = div.find('h3').eq(0);
                var distBear = _distanceAndBearing(feature);
                content = $(template({distanceBearing: distBear}));
                if (header.length) {
                    header.after(content);
                } else {
                    div.prepend(content);
                }
            }
        }

        function selectFeature(_feature, _div) {
            div = _div;
            feature = _feature;
            _showPosition();
        }

        return {
            setMap: function (_map) {
                map = _map;
                map.on('locationChange', _showPosition);
            },
            selectFeature: selectFeature
        };
    }


    /*
        Handles display of content in a sidebar
    */
    KR.SidebarContent = function (wrapper, element, top, options) {

        var defaultTemplate = KR.Util.getDatasetTemplate('popup');

        var positionDisplayer = new PositionDisplayer();

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
                    thumbnail: KR.Util.getImageCache(feature.properties.thumbnail, 80, 60),
                    thumbnail2x: KR.Util.getImageCache(feature.properties.thumbnail, 60, 120),
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
                var content = '';
                if (feature.properties.title) {
                    content += '<h3>' + feature.properties.title + '</h3>';
                }
                content += '<i class="fa fa-spinner fa-pulse fa-3x"></i>';
                _setContent(content);
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

            if (!feature.properties.images) {
                feature.properties.images = null;
            }

            if (feature.properties.allProps && feature.properties.allProps.europeana_rights) {
                feature.properties.license = feature.properties.allProps.europeana_rights[0];
            } else {
                feature.properties.license = null;
            }

            var color = KR.Style.colorForFeature(feature, true, true);
            var content = '<span class="providertext" style="color:' + color + ';">' + feature.properties.provider + '</span>';

            content += template(_.extend({image: null}, feature.properties));

            if (options.footerTemplate && feature.properties.link) {
                content += options.footerTemplate(feature.properties);
            }

            content = $(['<div>', content, '</div>'].join(' '));
            if (KR.Util.isInIframe()) {
                content.find('a').attr('target', '_blank');
            }

            positionDisplayer.selectFeature(feature, content);

            _setContent(content);
            _setupSwipe(callbacks);

            wrapper.find('.prev-next-arrows').remove();

            top.html('');
            if (callbacks) {
                var list = $('<a class="pull-left list-btn"><i class="fa fa-bars"></i></a>');
                top.append(list);
                list.click(callbacks.close);
                var idx = index + 1;
                top.append($('<div class="top-text pull-left"><b>' + idx + '</b> av ' + numFeatures + '</div>'));

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

            var mediaContainer = element.find('.media-container');
            if (mediaContainer.length) {
                KR.MediaCarousel.SetupMediaCarousel(mediaContainer);
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
            showFeatures: showFeatures,
            setMap: function (_map) {
                positionDisplayer.setMap(_map);
            }
        };
    };

}());
/*global L:false, KR: false */

/*
    A Leaflet control that behaves in much the same way as L.Control.Layer, 
    but works with KNreise datasets. 

    Handles loading, toggleling and error feedback.
*/


(function () {
    'use strict';

    L.Knreise = L.Knreise || {};
    L.Knreise.Control = L.Knreise.Control || {};

    var Label = function (dataset, layer) {
        var enabled = layer.enabled;
        var _error = null;
        var label, _icon;

        function _getIcon(iconAppend) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa';
            if (dataset.visible) {
                icon.className += ' fa-check-square-o';
            } else {
                icon.className += ' fa-square-o';
            }
            if (iconAppend) {
                icon.className += ' ' + iconAppend;
            }

            if (layer.isLoading) {
                icon.className = 'layericon fa fa-spinner fa-pulse';
            }

            if (layer.enabled) {
                icon.style.color = KR.Style.colorForDataset(dataset, true, true);
            } else {
                icon.style.color = '#ddd';
            }
            return icon;
        }

        function _redrawIcon() {
            var newIcon = _getIcon();
            label.replaceChild(newIcon, _icon);
            _icon = newIcon;
        }

        function _toggle() {
            dataset.visible = !dataset.visible;
            _redrawIcon();
            if (dataset.visible) {
                layer.fire('show');
            } else {
                layer.fire('hide');
            }
        }

        function _showError(error) {
            if (!_error) {
                _error = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle');
                _error.setAttribute('title', KR.parseError(error));
                label.insertBefore(_error, label.childNodes[0]);
            } else {
                _error.setAttribute('title', _error.getAttribute('title') + ', ' + KR.parseError(error));
            }
        }

        function _createLabel() {
            label = document.createElement('label');
            if (_.isUndefined(dataset.visible)) {
                dataset.visible = true;
            }

            var name = document.createElement('span');
            name.innerHTML = ' ' + dataset.name;

            _icon = _getIcon();
            label.appendChild(_icon);
            label.appendChild(name);

            if (layer.error) {
                _showError(layer.error);
            }

            if (!layer.enabled) {
                label.className = 'disabled';
            }

            L.DomEvent.on(label, 'click', function () {
                var canToggle = layer.enabled && !layer.isLoading;
                if (canToggle) {
                    _toggle();
                }
            });
        }

        function _enabledChanged() {
            if (layer.enabled === enabled) {
                return;
            }

            enabled = layer.enabled;

            _redrawIcon();
            if (enabled) {
                label.className = label.className.replace('disabled', '');
            } else {
                label.className += 'disabled';
            }
        }

        _createLabel();
        layer.on('changeEnabled', _enabledChanged);
        layer.on('dataloadstart', function () {
            if (_error) {
                label.removeChild(_error);
                _error = null;
            }
            _redrawIcon();
        });
        layer.on('dataloadend', _redrawIcon);
        layer.on('error', _showError);
        function getLabel() {
            return label;
        }

        return {
            getLabel: getLabel,
            hasError: function () {
                return !!layer.error;
            }
        };
    };


    L.Control.Datasets = L.Control.extend({

        initialize: function (layers, options) {
            L.setOptions(this, options);
            this._labels = [];
            this._handlingClick = false;
            this.expanded = false;
            this.numLoading = 0;
            var i;
            for (i in layers) {
                if (layers.hasOwnProperty(i)) {
                    this._addLayer(layers[i]);
                }
            }
        },

        _addLayer: function (layer) {
            var i;
            var dataset = layer.options.dataset;

            if (dataset.datasets) {
                if (dataset.grouped) {
                    this._addDataset(dataset, layer);
                } else {
                    for (i = 0; i < dataset.datasets.length; i++) {
                        this._addDataset(dataset.datasets[i]);
                    }
                }
            } else {
                this._addDataset(dataset, layer);
            }
        },

        _addDataset: function (dataset, layer) {
            if (layer.isLoading) {
                this.numLoading += 1;
                this._checkSpinner();
            }
            var label = new Label(dataset, layer);

            this._labels.push(label);

            layer.on('dataloadstart', function () {this._loadStart(); }, this);
            layer.on('dataloadend', function () {this._loadEnd(); }, this);
        },

        _loadStart: function () {
            this.numLoading += 1;
            this._checkSpinner();
        },

        _loadEnd: function () {
            this.numLoading -= 1;
            this._checkSpinner();
        },

        _hasErrors: function () {
            return !!_.find(this._labels, function (label) {
                return label.hasError();
            });
        },

        _checkError: function () {
            if (this._hasErrors()) {
                this._errorIcon.className = this._errorIcon.className.replace(
                    ' hidden',
                    ''
                );
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
            }
        },

        _checkSpinner: function () {
            if (!this._btnIcon) {
                return;
            }
            if (this.numLoading === 0) {
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-spinner fa-pulse',
                    ' fa-bars'
                );
                this._checkError();
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-bars',
                    ' fa-spinner fa-pulse'
                );
            }
        },

        onAdd: function (map) {
            this._map = map;
            this._initLayout();
            this._update();
            return this._container;
        },

        _update: function () {
            if (!this._container) {
                return;
            }

            this._overlaysList.innerHTML = '';
            var i, label;
            //for (i in this._labels) {
            for (i = 0; i < this._labels.length; i++) {
                label = this._labels[i];
                this._overlaysList.appendChild(label.getLabel());
            }
            this._checkError();
        },

        _initLayout: function () {
            var className = 'leaflet-control-layers';
            this._container = L.DomUtil.create('div', '');

            //Makes this work on IE10 Touch devices by stopping it 
            //from firing a mouseout event when the touch is released
            this._container.setAttribute('aria-haspopup', true);

            if (!L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(this._container)
                    .disableScrollPropagation(this._container);
            } else {
                L.DomEvent.on(
                    this._container,
                    'click',
                    L.DomEvent.stopPropagation
                );
            }

            this._form = L.DomUtil.create('form', className + '-list');

            this._map.on('click', this._collapse, this);
            this._overlaysList = L.DomUtil.create(
                'div',
                className + '-overlays',
                this._form
            );

            this._closeDiv = L.DomUtil.create('div', 'clearfix');
            var closeBtn = L.DomUtil.create(
                'button',
                'btn btn-default pull-right',
                this._closeDiv
            );
            closeBtn.title = 'Kartlag';
            L.DomEvent.on(closeBtn, 'click', function () {
                this._toggle();
            }, this);

            this._errorIcon = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle hidden', closeBtn);
            closeBtn.appendChild(document.createTextNode(' '));
            if (this.numLoading > 0) {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-spinner fa-pulse', closeBtn);
            } else {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-bars', closeBtn);
            }

            this._container.appendChild(this._closeDiv);

            this._listContainer = L.DomUtil.create('div', className + ' hidden');
            this._listContainer.appendChild(this._form);
            this._container.appendChild(this._listContainer);
        },

        _toggle: function () {
            if (this.expanded) {
                this._collapse();
            } else {
                this._expand();
            }
        },

        _expand: function () {
            L.DomUtil.addClass(
                this._listContainer,
                'leaflet-control-layers-expanded'
            );
            this.expanded = true;
            this._listContainer.className = this._listContainer.className.replace(
                ' hidden',
                ''
            );
        },

        _collapse: function () {
            this._listContainer.className = this._listContainer.className.replace(
                ' leaflet-control-layers-expanded',
                ''
            );
            L.DomUtil.addClass(
                this._listContainer,
                'hidden'
            );
            this.expanded = false;
        }
    });

    L.control.datasets = function (layers, options) {
        return new L.Control.Datasets(layers, options);
    };
}());

/*global L:false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Icon = L.KNreiseMarkers.Icon.extend({
    options: {
        icon: null
    }
});

L.Knreise.icon = function (options) {
    return new L.Knreise.Icon(options);
};
/*global L:false, turf:false */
var KR = this.KR || {};

/*
    Handles loading of datasets

    Init it with a KnreiseAPI, a Leaflet map, something that behaves as 
    L.Knreise.Control.Sidebar and an optional callback for errors.
*/
KR.DatasetLoader = function (api, map, sidebar, errorCallback, useCommonCluster, maxClusterRadius) {
    'use strict';

    maxClusterRadius = maxClusterRadius || 80;

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
                feature.properties.feedbackForm = dataset.feedbackForm;
                if (_.has(dataset, 'mappings')) {
                    _.each(dataset.mappings, function (value, key) {
                        feature.properties[key] = feature.properties[value];
                    });
                }
                feature.template = KR.Util.getTemplateForFeature(feature, dataset);
            });
            return features;
        };
    }

    function _copyProperties(dataset) {
        var params = _.reduce(_.without(_.keys(dataset), 'datasets'), function (acc, key) {
            if (key !== 'style') {
                acc[key] = dataset[key];
            }
            return acc;
        }, {});

        if (dataset.style) {
            params.extras = params.extras || {};
            var groupId = KR.Util.stamp(dataset);
            params.extras.groupId = groupId;
            KR.Style.groups[groupId] = dataset.style;
        }
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
        layer.fire('dataAdded');
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
        if (useCommonCluster) {
            vectorLayer = _createGeoJSONLayer(null, dataset);
        } else {
            if (dataset.cluster) {
                vectorLayer = new L.Knreise.MarkerClusterGroup({
                    dataset: dataset,
                    maxClusterRadius: maxClusterRadius
                }).addTo(map);
                if (_addClusterClick) {
                    _addClusterClick(vectorLayer, dataset);
                }
            } else {
                vectorLayer = _createGeoJSONLayer(null, dataset).addTo(map);
            }
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


    function _initDataset(dataset, vectorLayer) {
        if (dataset.init) {
            dataset.init(map, dataset, vectorLayer);
        }
    }

    function _addDataset(dataset, filter, initBounds, loadedCallback, skipLoadOutside) {

        var vectorLayer = _createVectorLayer(dataset, map);
        if (dataset.datasets) {
            dataset.datasets = _.filter(dataset.datasets, function (dataset) {
                return !dataset.noLoad;
            });
            _.each(dataset.datasets, function (dataset) {
                _initDataset(dataset, vectorLayer);
            });
        } else {
            _initDataset(dataset, vectorLayer);
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

            var newBounds = bbox || map.getBounds().toBBoxString();
            var shouldLoad = forceVisible || _checkShouldLoad(dataset);
            if (skipLoadOutside && newBounds) {
                var current = L.latLngBounds.fromBBoxString(newBounds);
                var fence = L.latLngBounds.fromBBoxString(skipLoadOutside);

                if (!fence.intersects(current)) {
                    shouldLoad = false;
                }
            }

            vectorLayer.enabled = _checkEnabled(dataset);
            vectorLayer.fire('changeEnabled');
            vectorLayer.shouldLoad = shouldLoad;

            if (!shouldLoad) {
                vectorLayer.clearLayers();
                if (callback) {
                    callback([]);
                }
                return;
            }

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

                if (useCommonCluster) {
                    _resetDataGeoJson(vectorLayer, featurecollections);
                } else {
                    if (dataset.cluster) {
                        _resetClusterData(vectorLayer, featurecollections);
                    } else {
                        _resetDataGeoJson(vectorLayer, featurecollections);
                    }
                }
                if (callback) {
                    callback(featurecollections);
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

                    if (useCommonCluster) {
                        geoJSONLayer = L.geoJson(mapper(checkData(geoJson, vectorLayer)));
                    } else {
                        if (dataset.cluster) {
                            geoJSONLayer = _createGeoJSONLayer(
                                mapper(checkData(geoJson, vectorLayer)),
                                dataset
                            );
                            dataset.geoJSONLayer = geoJSONLayer;
                        } else {
                            geoJSONLayer = L.geoJson(mapper(checkData(geoJson, vectorLayer)));
                        }
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

                    var loadBounds = newBounds;
                    if (dataset.isStatic && dataset.fixedBbox) {
                        loadBounds = dataset.fixedBbox;
                    }

                    //hack for riksantikvaren
                    if (dataset.bboxFunc) {
                        dataset.bboxFunc(
                            api,
                            dataset.dataset,
                            loadBounds,
                            dataLoaded,
                            loadError
                        );
                    } else {
                        api.getBbox(
                            dataset.dataset,
                            loadBounds,
                            dataLoaded,
                            loadError
                        );
                    }
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

        _reloadData(null, initBounds, undefined, function (fc) {

            _checkLoadWhenLessThan(dataset);
            if (loadedCallback) {
                loadedCallback(fc);
            }
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

    function commonCluster(layers) {
        var addedLayers = {};

        var deselectAll = function () {
            _.each(layers, function (layer) {
                layer.deselectAllNew();
            });
        };

        map.on('layerDeselect', deselectAll);

        var mc = new L.Knreise.MarkerClusterGroup({maxClusterRadius: maxClusterRadius}).addTo(map);

        mc.on('clusterclick', deselectAll);

        _addClusterClick(mc);
        _.each(layers, function (layer) {
            layer.on('dataAdded', function () {
                var layerId = L.stamp(layer);
                if (addedLayers[layerId]) {
                    mc.removeLayers(addedLayers[layerId]);
                }
                var subLayers = layer.getLayers();
                addedLayers[layerId] = subLayers;
                mc.addLayers(subLayers);

                layer.on('hide', function () {
                    if (addedLayers[layerId]) {
                        mc.removeLayers(addedLayers[layerId]);
                    }
                });

                layer.on('click', function (e) {
                    deselectAll();
                    var selectedLayer = e.layer;
                    var parentLayer = _.find(layers, function (l) {
                        return !!_.find(l.getLayers(), function (sl) {
                            return (sl === selectedLayer);
                        });
                    });
                    parentLayer.setLayerSelected(selectedLayer);
                });
            });
        });
    }


    /*
        Loads a list of datasets, creates Leaflet layers of either 
        L.Knreise.GeoJSON or L.Knreise.MarkerClusterGroup according to
        config. 

        Can be supplied an initial bbox for filtering and a filter function
    */
    function loadDatasets(datasets, bounds, filter, loadedCallback, skipLoadOutside) {
        datasets = _.filter(datasets, function (dataset) {
            return !dataset.noLoad;
        });

        var loaded;
        if (loadedCallback) {
            var featurecollections  = [];

            var finished = _.after(datasets.length, function () {
                loadedCallback(featurecollections);
            });

            loaded = function (featureCollection) {
                featurecollections.push(featureCollection);
                finished();
            };
        }

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
            return _addDataset(dataset, filter, bounds, loaded, skipLoadOutside);
        });
        reloads = _.pluck(res, 'reload');

        var layers = _.pluck(res, 'layer');
        if (useCommonCluster) {
            commonCluster(layers);
        }
        return layers;
    }

    return {
        loadDatasets: loadDatasets,
        reload: reload
    };
};

/*global L:false, navigator:false, cilogi: false, KR:false*/
L.Knreise = L.Knreise || {};
(function (ns) {
    'use strict';

    L.Control.EasyButtons2 = L.Control.EasyButtons.extend({
        _addImage: function () {
            var extraClasses = this.options.icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';

            this._icon = L.DomUtil.create('i', this.options.icon + extraClasses, this.link);
            if (this.options.id) {
                this._icon.id = this.options.id;
            }
        },

        changeIcon: function (icon) {
            var extraClasses = this.options.icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';
            this._icon.className = icon + extraClasses;
        }
    });

    ns.LocateButton = function (callback, error, options) {
        options = options || {};
        options.zoom = options.zoom || 10;
        var isLocating = false;
        var marker;
        var _map;
        var _btn;
        var defaultIcon = options.icon || 'fa-user';
        var messageDisplayer = KR.Util.messageDisplayer($('#message_template').html());
        var watchId;


        function _createMarker(pos) {
            return new cilogi.L.Marker(pos, {
                fontIconSize: 3,
                fontIconName: "\uf05b",
                altIconName: "\uf05b",
                fontIconColor: "#FF0000",
                fontIconFont: 'awesome',
                opacity: 1
            });
        }

        function _showPosition(pos) {
            var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
            _btn.changeIcon(defaultIcon);
            if (options.bounds && !options.bounds.contains(p)) {
                messageDisplayer(
                    'warning',
                    'Du befinner deg utenfor området til denne demonstratoren. Viser ikke din posisjon'
                );
                _map.fire('locationError');
                stopLocation();
                return;
            }

            _map.userPosition = p;
            _map.fire('locationChange');
            if (callback) {
                callback(p);
            } else {
                _map.setView(p, 16);
                if (!marker) {
                    marker = _createMarker(p);
                    _map.addLayer(marker);
                } else {
                    marker.setLatLng(p);
                }
            }
        }

        function _positionError() {
            _map.fire('locationError');
            _btn.changeIcon(defaultIcon);
            _btn.getContainer().className = _btn.getContainer().className.replace(' active', '');
        }

        function stopLocation() {
            isLocating = false;
            if (!_.isUndefined(watchId)) {
                navigator.geolocation.clearWatch(watchId);
                _btn.getContainer().className = _btn.getContainer().className.replace(' active', '');
                _map.removeLayer(marker);
                marker = undefined;
                watchId = undefined;
            }
        }

        function getLocation() {
            isLocating = true;
            if (navigator.geolocation) {
                _btn.changeIcon('fa-spinner fa-pulse');
                _btn.getContainer().className += ' active';
                watchId = navigator.geolocation.watchPosition(_showPosition, _positionError);
            } else {
                if (error) {
                    error();
                }
            }
        }

        function toggleLocation() {
            if (isLocating) {
                stopLocation();
                return;
            }
            getLocation();
        }

        function addTo(map) {
            var title = options.title || 'Følg min posisjon';

            _map = map;
            _btn = new L.Control.EasyButtons2(toggleLocation, {icon: defaultIcon, title: title});
            _map.addControl(_btn);
            return _btn;
        }

        return {
            addTo: addTo,
            getLocation: getLocation
        };
    };

}(L.Knreise));

/*global L:false */
var KR = this.KR || {};

//see: https://github.com/mylen/leaflet.TileLayer.WMTS
L.TileLayer.WMTS = L.TileLayer.extend({defaultWmtsParams: {service: "WMTS",request:"GetTile",version:"1.0.0",layer:"",style:"",tilematrixSet:"",format:"image/jpeg"},initialize:function(a,b){this._url=a;var c=L.extend({},this.defaultWmtsParams),d=b.tileSize||this.options.tileSize;c.width=c.height=b.detectRetina&&L.Browser.retina?2*d:d;for(var e in b)this.options.hasOwnProperty(e)||"matrixIds"==e||(c[e]=b[e]);this.wmtsParams=c,this.matrixIds=b.matrixIds||this.getDefaultMatrix(),L.setOptions(this,b)},onAdd:function(a){L.TileLayer.prototype.onAdd.call(this,a)},getTileUrl:function(a,b){var c=this._map;return crs=c.options.crs,tileSize=this.options.tileSize,nwPoint=a.multiplyBy(tileSize),nwPoint.x+=1,nwPoint.y-=1,sePoint=nwPoint.add(new L.Point(tileSize,tileSize)),nw=crs.project(c.unproject(nwPoint,b)),se=crs.project(c.unproject(sePoint,b)),tilewidth=se.x-nw.x,b=c.getZoom(),ident=this.matrixIds[b].identifier,X0=this.matrixIds[b].topLeftCorner.lng,Y0=this.matrixIds[b].topLeftCorner.lat,tilecol=Math.floor((nw.x-X0)/tilewidth),tilerow=-Math.floor((nw.y-Y0)/tilewidth),url=L.Util.template(this._url,{s:this._getSubdomain(a)}),url+L.Util.getParamString(this.wmtsParams,url)+"&tilematrix="+ident+"&tilerow="+tilerow+"&tilecol="+tilecol},setParams:function(a,b){return L.extend(this.wmtsParams,a),b||this.redraw(),this},getDefaultMatrix:function(){for(var a=new Array(22),b=0;22>b;b++)a[b]={identifier:""+b,topLeftCorner:new L.LatLng(20037508.3428,-20037508.3428)};return a}}),L.tileLayer.wmts=function(a,b){return new L.TileLayer.WMTS(a,b)};

(function (ns) {
    'use strict';

    function getMatrix(tilematrixSet) {
        var matrixIds3857 = new Array(30);
        var i;
        for (i = 0; i < 22; i++) {
            matrixIds3857[i] = {
                identifier: tilematrixSet + ':' + i,
                topLeftCorner: new L.LatLng(2.0037508E7, -2.003750834E7)
            };
        }
        return matrixIds3857;
    }

    ns.SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';

    ns.getNibLayer = function (callback, wmsc) {
        ns.Util.sendRequest(KR.SKTokenUrl, null, function (token) {
            var layer;
            if (wmsc) {
                layer = L.tileLayer.wms('http://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.nibcache', {
                    layers: 'NiB',
                    format: 'image/jpeg',
                    transparent: false,
                    attribution: 'Kartverket'
                });
            } else {
                var url = 'http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts';
                var tilematrixSet = 'EPSG:900913';
                layer = new L.TileLayer.WMTS(url, {
                    layer: 'NiB',
                    style: 'normal',
                    tilematrixSet: tilematrixSet,
                    matrixIds: getMatrix(tilematrixSet),
                    format: 'image/jpeg',
                    attribution: 'Kartverket'
                });
            }
            layer.setParams({GKT: token});
            callback(layer);
        });
    };

}(KR));

/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

/*
    List of predefined datasets
*/

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {

        var loadedIds = [];

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
                    });
                }
            }
        };

        var initKulturminnePoly = function (map, dataset, vectorLayer) {
            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }

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
            });

            vectorLayer.on('show', function () {
                map.addLayer(dataset.extraFeatures);
            });
        };

        return {
            loadKulturminnePoly: loadKulturminnePoly,
            initKulturminnePoly: initKulturminnePoly
        };
    };

    ns.getDatasetList = function (api, komm, fylke) {

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
                description: 'Kulturrådets tjeneste for personlige fortellinger fra kulturinstitusjoner og privatpersoner.',
                allowTopic: true,
                feedbackForm: true,
                isStatic: false
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
                    api.getItem(
                        {api: 'norvegiana', id: 'kulturnett_Naturbase_' + feature.properties.iid},
                        callback
                    );
                },
                toPoint: {
                    showAlways: true,
                    stopPolyClick: true,
                    minSize: 20
                },
                minZoom: 10,
                cluster: false,
                description: 'Nasjonalparker og andre naturvernområder - ca. 2700 i hele landet.'
            },
            'artobs': {
                name: 'Artsobservasjoner',
                hideFromGenerator: true,
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
                getFeatureData: function (oldFeature, callback) {
                    api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: oldFeature.properties.efid
                    }, function (feature) {
                        oldFeature.properties = feature.properties;
                        oldFeature.properties.provider = 'Folketelling 1910';
                        callback(oldFeature);
                    });
                },
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                },
                noListThreshold: 0,
                description: 'Personer og eiendommer fra folketellingen 1910'
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
                            kommune: komm,
                            fylke: fylke
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
            'jernbane': {
                id: 'jernbane',
                dataset: {
                    api: 'jernbanemuseet'
                },
                provider: 'Jernbanemuseet',
                name: 'Jernbanemuseet',
                hideFromGenerator: true,
                template: KR.Util.getDatasetTemplate('jernbanemuseet'),
                getFeatureData: function (feature, callback) {
                    api.getItem(
                        {api: 'jernbanemuseet', id:  feature.properties.id},
                        callback
                    );
                },
                isStatic: true,
                bbox: false,
                description: 'Jernbanemuseet'
            },
            'arkeologi': {
                grouped: true,
                name: 'Arkeologi',
                style: {
                    fillcolor: '#436978',
                    circle: false,
                    thumbnail: true
                },
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
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER regex(?loccatlabel, "^Arkeologisk", "i") .',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
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
                description: 'Arkeologidata fra Universitetsmuseene og Riksantikvaren'
            },
            'historie': {
                grouped: true,
                name: 'Historie',
                style: {
                    fillcolor: '#D252B9',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER (!regex(?loccatlabel, "^Arkeologisk", "i"))',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: true,
                        init: kulturminneFunctions.initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: kulturminneFunctions.loadKulturminnePoly
                        }
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu',
                            query: '-dc_subject_facet:Kunst'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false,
                        bbox: true
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Industrimuseum'
                        },
                        isStatic: false,
                        bbox: true
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Foto-SF'
                        },
                        isStatic: false,
                        bbox: false,
                        template: KR.Util.getDatasetTemplate('foto_sf')
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Kystreise'
                        },
                        isStatic: true,
                        bbox: false
                    }
                ],
                description: 'Historie og kulturminner fra Riksantikvaren og Digitalt museum '
            },
            'kunst': {
                grouped: true,
                name: 'Kunst',
                style: {
                    fillcolor: '#72B026',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu',
                            query: 'dc_subject_facet:Kunst'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false
                    },
                ],
                description: 'Kunstdata fra Digitalt museum '
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
                description: 'Stedfestede artikler fra bokmålswikipedia'
            },
            'wikipediaNN': {
                name: 'Wikipedia Nynorsk',
                provider: 'Wikipedia Nynorsk',
                dataset: {
                    api: 'wikipediaNN'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: KR.Util.getDatasetTemplate('wikipedia'),
                description: 'Stedfestede artikler fra nynorskwikipedia'
            },

            'lokalwiki': {
                id: 'lokalwiki',
                name: 'Lokalhistoriewiki',
                hideFromGenerator: false,
                provider: 'Lokalhistoriewiki',
                dataset: {
                    api: 'lokalhistoriewiki'
                },
                style: {thumbnail: true},
                minZoom: 13,
                bbox: true,
                isStatic: false,
                description: 'Stedfestede artikler fra lokalhistoriewiki.no'
            },
            'riksantikvaren': {
                id: 'riksantikvaren',
                name: 'Kulturminnesøk',
                hideFromGenerator: false,
                provider: 'Riksantikvaren',
                dataset: {
                    api: 'kulturminnedataSparql',
                    kommune: komm,
                    fylke: fylke
                },
                template: KR.Util.getDatasetTemplate('ra_sparql'),
                bbox: false,
                isStatic: true,
                init: kulturminneFunctions.initKulturminnePoly,
                loadWhenLessThan: {
                    count: 10,
                    callback: kulturminneFunctions.loadKulturminnePoly
                },
                description: 'Data fra Riksantikvarens kulturminnesøk'
            },
            'brukerminner': {
                name: 'Kulturminnesøk - brukerregistreringer',
                hideFromGenerator: false,
                provider: 'riksantikvaren',
                dataset: {
                    api: 'kulturminnedata',
                    layer: 2,
                    getExtraData: true,
                    extraDataLayer: 6,
                    matchId: 'KulturminnesokID'
                },
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Brukerregistrerte data fra Riksantikvarens kulturminnesøk',
                template: KR.Util.getDatasetTemplate('brukerminne')
            },
            'groruddalen': {
                name: 'Byantikvaren Oslo - Groruddalen',
                hideFromGenerator: true,
                provider: 'Byantikvaren i Oslo',
                dataset: {
                    api: 'cartodb',
                    table: 'byantikvaren_oslo_groruddalen'
                },
                bbox: false,
                isStatic: false,
                style: {thumbnail: true},
                template: KR.Util.getDatasetTemplate('byantikvaren_oslo'),
                description: 'Byantikvarens Groruddalsatlas'
            },
            'norgerundt': {
                name: 'Norge Rundt',
                hideFromGenerator: true,
                provider: 'NRK',
                dataset: {
                    api: 'cartodb',
                    table: 'nrk_norge_rundt'
                },
                bbox: false,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Stedfestede innslag fra Norge Rundt'
            },
            'dimu': {
                name: 'Digitalt Museum',
                hideFromGenerator: false,
                provider: 'dimu',
                dataset: {dataset: 'DiMu', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Digitalt Museum',
                allowTopic: true,
                feedbackForm: true
            },
            'musit': {
                name: 'Universitetsmuseene',
                hideFromGenerator: false,
                provider: 'Universitetsmuseene',
                dataset: {dataset: 'MUSIT', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Universitetsmuseene',
                allowTopic: true,
                feedbackForm: true
            },
            'industrimuseum': {
                name: 'Industrimuseum',
                hideFromGenerator: false,
                provider: 'Industrimuseum',
                dataset: {dataset: 'Industrimuseum', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Industrimuseum',
                allowTopic: true,
                feedbackForm: true
            },
            'kystreise': {
                name: 'Kystreise',
                hideFromGenerator: false,
                provider: 'Kystreise',
                dataset: {dataset: 'Kystreise', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Kystreise',
                allowTopic: true,
                feedbackForm: true
            },
            'dimufoto': {
                hideFromGenerator: true,
                dataset: {
                    api: 'norvegiana',
                    dataset: 'DiMu',
                    query: 'europeana_type_facet:IMAGE'
                },
                template: KR.Util.getDatasetTemplate('digitalt_museum'),
                isStatic: false,
                style: {thumbnail: true},
                noListThreshold: Infinity
            },
            'kulturminnesok_flickr': {
                name: 'Kulturminnesøk',
                dataset_name_override: 'Kulturminnesøk',
                provider: 'Kulturminnesøk Flickr',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    group_id: '1426230@N24'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: true,
                style: {thumbnail: true},
                description: 'Bilder fra Kulturminnesøks Flickr-gruppe',
            },
            'riksarkivet': {
                name: 'Riksarkivet',
                dataset_name_override: 'Riksarkivet',
                provider: 'riksarkivet',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'national_archives_of_norway'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Riksarkivets Flickr-konto',
            },
            'nasjonalbiblioteket': {
                name: 'Nasjonalbiblioteket',
                dataset_name_override: 'Nasjonalbiblioteket',
                provider: 'nasjonalbiblioteket',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'national_library_of_norway'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Nasjonalbibliotekets Flickr-konto',
            },
            'oslobyarkiv': {
                name: 'Oslo Byarkiv',
                dataset_name_override: 'Oslo Byarkiv',
                provider: 'oslobyarkiv',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'byarkiv'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Oslo byarkiv sin Flickr-konto',
            },
            'nasjonalmuseet': {
                name: 'Nasjonalmuseet',
                dataset_name_override: 'Nasjonalmuseet',
                provider: 'nasjonalmuseet',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'nasjonalmuseet'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Nasjonalmuseet sin Flickr-konto',
            },
            'nve': {
                name: 'NVE',
                dataset_name_override: 'NVE',
                provider: 'nve',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'nve',
                    accuracy: '6'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra NVE Flickr-konto',
            },
            'vestfoldmuseene': {
                name: 'Vestfoldmuseene',
                dataset_name_override: 'Vestfoldmuseene',
                provider: 'Vestfoldmuseene',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'vestfoldmuseene',
                    accuracy: '1'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Vestfoldmuseene sin Flickr-konto',
            },
            'perspektivet': {
                name: 'Perspektivet Museum',
                dataset_name_override: 'Perspektivet Museum',
                provider: 'Perspektivet Museum',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'perspektivetmuseum',
                    accuracy: '1'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Perspektivet Museum sin Flickr-konto',
            }



        };

        if (!komm && !fylke) {
            var raParams = {
                bbox: true,
                minZoom: 12,
                isStatic: false,
                bboxFunc: KR.Util.sparqlBbox
            };
            _.extend(list.riksantikvaren, raParams);
            _.extend(list.ark_hist.datasets[2], raParams);
            _.extend(list.arkeologi.datasets[1], raParams);
            _.extend(list.historie.datasets[0], raParams);
        }

        return list;
    };

    ns.getDatasets = function (ids, api, komm, fylke) {
        var datasetList = ns.getDatasetList(api, komm, fylke);
        return _.chain(ids)
            .map(function (dataset) {
                var query;
                if (dataset.indexOf(':') > -1) {
                    var parts = dataset.split(':');
                    dataset = parts[0];
                    query = parts[1];
                }
                if (_.has(datasetList, dataset)) {
                    var datasetConfig = datasetList[dataset];
                    if (query && datasetConfig.dataset.api === 'norvegiana') {
                        datasetConfig.dataset.query = 'dc_subject_text:' + query;
                    }
                    return datasetConfig;
                }
            })
            .compact()
            .value();
    };

}(KR.Config));

/*global window:false, L:false*/

var KR = this.KR || {};

/*
    Simple splash screen for a leaflet map
*/

KR.SplashScreen = function (map, title, description, image, creator, showSpinner) {
    'use strict';

    function getUrl() {
        return window.location.href.replace(window.location.hash, '');
    }

    function getShouldStayClosed() {
        var url = getUrl();
        var name = 'remember_' + url + '=';
        var ca = document.cookie.split('; ');
        var l = _.find(ca, function (cookie) {
            return cookie.indexOf(name) === 0;
        });
        if (l) {
            return l.substring(name.length, l.length) === 'true';
        }
        return;
    }

    function setShouldStayClosed(value) {
        document.cookie = 'remember_' + getUrl() + '=' + value;
    }

    function hideSidebar() {
        if (this._gray) {
            this._container.removeChild(this._gray);
        }
        L.Control.Sidebar.prototype.hide.apply(this, arguments);
    }

    function showSidebar() {
        this._gray = L.DomUtil.create('div', 'gray', this._container);
        L.Control.Sidebar.prototype.show.apply(this, arguments);
    }

    function createSidebar() {
        var el = L.DomUtil.create('div', '', document.body);
        el.id = 'splashscreen';

        var sidebar = L.control.sidebar('splashscreen', {
            position: 'center',
            autoPan: false
        });

        sidebar.hide = _.bind(hideSidebar, sidebar);
        sidebar.show = _.bind(showSidebar, sidebar);

        map.addControl(sidebar);
        var template = _.template($('#splashscreen_template').html());


        var content = $('<div>' + template({
            title: title,
            image: image,
            description: description,
            creator: creator,
            spinner: !!showSpinner
        }) + '</div>');

        if (KR.Util.isInIframe()) {
            content.find('a').attr('target','_blank');
        }
        sidebar.setContent(content.html());

        return sidebar;
    }

    function setupRememberCheckbox(sidebar) {

        var checkbox = $(sidebar.getContainer()).find('#persist_splash_cb');

        checkbox.prop('checked', getShouldStayClosed());

        function toggle() {
            setShouldStayClosed(checkbox.prop('checked'));
        }
        checkbox.on('change', toggle);
        toggle();
    }

    function createButton(callback) {
        return L.easyButton(map, callback, {position: 'topright', icon: 'fa-info-circle', title: 'Om'});
    }

    var sidebar = createSidebar();
    createButton(function () {
        if (sidebar.isVisible()) {
            sidebar.hide();
        } else {
            sidebar.show();
        }
    });


    var shouldStayClosed = getShouldStayClosed();
    if (!shouldStayClosed) {
        if (_.isUndefined(shouldStayClosed)) {
            setShouldStayClosed(true);
        }
        sidebar.show();
    }
    setupRememberCheckbox(sidebar);

    return {
        finishedLoading: function () {
            var spinner = $(sidebar.getContainer()).find('#splash_spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

};

'use strict';
var KR = this.KR || {};
KR.ResponseForm = function (div, baseData) {

    var COL_NAMES = {
        message: 'entry.126368279',
        email: 'entry.748218122',
        id: 'entry.2043404140',
        url: 'entry.243673559',
        provider: 'entry.826324496'
    };
    var FORM_URL = 'https://docs.google.com/forms/d/1ah66lattC8it7OTIM6de20NSNkBeiQ0vabpsHSaPU7s/formResponse';

    function _postToForm(data, callback) {
        var gData = _.reduce(data, function (acc, value, key) {
            acc[COL_NAMES[key]] = value;
            return acc;
        }, {});


        $.ajax({
            url: FORM_URL,
            data: gData,
            type: 'POST',
            dataType: 'xml',
            success: callback,
            error: callback
        });
    }

    function _showSuccess(provider) {
        div.find('form').addClass('hidden');
        div.find('#form-success').removeClass('hidden').find('.media-body').text(
            'Din melding er sendt til ' + provider + '. De vil ta kontakt hvis' +
                ' de har behov for ytterligere informasjon'
        );
    }

    function _submitForm(e) {
        e.preventDefault();
        var email = div.find('#form_email').val();
        var message = div.find('#form_message').val();

        if (email === '' || message === '') {
            return false;
        }

        var data = _.extend({}, baseData, {
            email: email,
            message: message
        });
        _postToForm(data, function () {
            _showSuccess(data.provider);
        });
        return false;
    }

    function _resetForm() {
        div.find('#form_email').val('');
        div.find('#form_message').val('');
        div.find('#form-success').addClass('hidden');
        div.find('form').addClass('hidden');
        div.find('.show-more').removeClass('hidden');
    }

    var template = $('#response_form_template').html();
    div.append(template);
    div.find('form').on('submit', _submitForm);
    div.find('.show-more').click(function () {
        div.find('.show-more').addClass('hidden');
        div.find('form').removeClass('hidden');
    });
    div.find('.close ').click(_resetForm);
};

/*global L:false, alert:false, KR:false, turf:false */

/*
    Utility for setting up a Leaflet map based on config
*/

var KR = this.KR || {};
(function (ns) {
    'use strict';

    var DEFAULT_OPTIONS = {
        geomFilter: false,
        showGeom: false,
        loactionHash: true,
        featureHash: true
    };


    function _getFilter(buffer) {
        return function (featureCollection) {
            if (!featureCollection || !featureCollection.features.length) {
                return featureCollection;
            }
            if (featureCollection.features[0].geometry.type.indexOf('Polygon') === -1) {
                return turf.within(featureCollection, buffer);
            }
            var intersects =  _.filter(featureCollection.features, function (feature) {
                var bbox = turf.extent(feature);
                var bboxPolygon = turf.bboxPolygon(bbox);
                return !!turf.intersect(bboxPolygon, buffer.features[0]);
            });
            return KR.Util.createFeatureCollection(intersects);
        };
    }


    function _loadDatasets(api, datasets, fromUrl, komm, fylke) {
        if (fromUrl) {
            datasets = KR.Config.getDatasets(datasets, api, komm, fylke);
        }
        return datasets;
    }


    function _addInverted(map, geoJson) {
        var style = {
            stroke: false,
            fillColor: '#ddd',
            fillOpacity: 0.8
        };

        var data = _.reduce(geoJson.features, function (geom, feature) {
            return turf.erase(geom, feature);
        }, KR.Util.WORLD);
        L.geoJson(data, style).addTo(map);
    }


    function _getloader(options, api, datasets, boundsFunc, id, paramName, callback, initPos) {
        if (options.geomFilter) {
            var dataset = {
                api: 'cartodb'
            };
            dataset[paramName] = id;
            api.getData(dataset, function (geoJson) {
                if (options.showGeom) {
                    _addInverted(options.map, geoJson);
                }
                var layer = L.geoJson(geoJson);

                var filter = _getFilter(geoJson);
                callback(layer.getBounds(), datasets, filter, null, initPos);
            });
        } else {
            boundsFunc(id, function (bbox) {
                var bounds = L.latLngBounds.fromBBoxString(bbox);
                callback(bounds, datasets, null, null, initPos);
            });
        }
    }



    function _municipalityHandler(options, api, datasets, fromUrl, callback, initPos) {
        datasets = _loadDatasets(api, datasets, fromUrl, options.komm);

        if (_.isString(options.komm)) {
            options.komm = options.komm.split(',');
        }

        _getloader(
            options,
            api,
            datasets,
            api.getMunicipalityBounds,
            options.komm,
            'municipality',
            callback,
            initPos
        );
    }

    function _countyHandler(options, api, datasets, fromUrl, callback, initPos) {
        datasets = _loadDatasets(api, datasets, fromUrl, null, options.fylke);

        if (_.isString(options.fylke)) {
            options.fylke = options.fylke.split(',');
        }

        _getloader(
            options,
            api,
            datasets,
            api.getCountyBounds,
            options.fylke,
            'county',
            callback,
            initPos
        );
    }

    function _bboxHandler(options, api, datasets, fromUrl, callback, initPos) {
        datasets = _loadDatasets(api, datasets, fromUrl);
        var bounds = L.latLngBounds.fromBBoxString(options.bbox);
        callback(bounds, datasets, null, null, initPos);
    }

    function _flattenCollections(featureCollection) {

        var features = [];

        _.each(featureCollection.features, function (feature) {
            if (feature.geometry.type === 'GeometryCollection') {
                _.each(feature.geometry.geometries, function (geometry) {
                    features.push(KR.Util.createGeoJSONFeatureFromGeom(geometry, feature.properties));
                });
            } else {
                features.push(feature);
            }
        });
        return KR.Util.createFeatureCollection(features);
    }

    function _simplify(featureCollection) {
        var features = _.map(featureCollection.features, function (feature) {
            return turf.simplify(feature, 0.01, false);
        });
        return KR.Util.createFeatureCollection(features);
    }

    function _gotLine(line, api, options, datasets, fromUrl, callback, initPos) {
        var lineOptions = {};
        if (options.linecolor) {
            lineOptions.color = options.linecolor;
        }
        var lineLayer = L.geoJson(line, lineOptions);
        var bounds = lineLayer.getBounds();
        datasets = _loadDatasets(api, datasets, fromUrl);

        var filter;
        if (line && options.buffer) {
            line = _flattenCollections(line);
            if (line.features.length > 5) {
                line = _simplify(line);
            }
            var buffer = turf.buffer(line, options.buffer, 'kilometers');
            filter = _getFilter(buffer);
        }
        callback(bounds, datasets, filter, lineLayer, initPos);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback, initPos) {

        KR.Util.getLine(api, options.line, function (line) {
            _gotLine(line, api, options, datasets, fromUrl, callback, initPos);
        });
    }

    function _checkLoadItemFromUrl(featurecollections) {
        var featureId = KR.UrlFunctions.getHashFeature();

        if (featureId) {
            var findLayer = function (l) {
                return (decodeURIComponent(l.feature.id) === decodeURIComponent(featureId) || l.feature.id === decodeURIComponent(featureId));
            };

            var datasetLayer = _.find(_.flatten(featurecollections), function (layer) {
                return _.find(layer.getLayers(), findLayer);
            });

            if (datasetLayer) {
                var selectedLayer = _.find(datasetLayer.getLayers(), findLayer);
                selectedLayer.fire('click');
                datasetLayer.setLayerSelected(selectedLayer);
            }
        }
    }


    function _addBBox(datasets, bbox) {
        return _.map(datasets, function (dataset) {
            if (dataset.isStatic) {
                dataset.fixedBbox = bbox;
            }
            if (dataset.datasets) {
                dataset.datasets = _.map(dataset.datasets, function (dataset) {
                    if (dataset.isStatic) {
                        dataset.fixedBbox = bbox;
                    }
                    return dataset;
                });
            }
            return dataset;
        });
    }


    function _setAllStatic(datasets) {
        return _.map(datasets, function (dataset) {
            dataset.isStatic = true;
            if (dataset.datasets) {
                dataset.datasets = _.map(dataset.datasets, function (dataset) {
                    dataset.isStatic = true;
                    return dataset;
                });
            }
            return dataset;
        });
    }


    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};
        options = _.extend({}, DEFAULT_OPTIONS, options);

        var map = KR.Util.createMap('map', options);
        var sidebar = KR.Util.setupSidebar(map, {featureHash: options.featureHash});
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar, null, options.cluster, options.clusterRadius);

        var splashScreen;
        if (options.title) {
            splashScreen = KR.SplashScreen(map, options.title, options.description, options.image, null, false);
        }

        function showDatasets(bounds, datasets, filter, lineLayer, initPos) {
            if (options.allstatic) {
                datasets = _setAllStatic(datasets);
            }
            datasets = _addBBox(datasets, bounds.toBBoxString());

            var locateBtn = L.Knreise.LocateButton(null, null, {bounds: bounds});
            locateBtn.addTo(map);

            var initMapPos = function (initPos) {
                if (initPos) {
                    map.setView([initPos.lat, initPos.lon], initPos.zoom);
                    bounds = map.getBounds();
                } else {
                    map.fitBounds(bounds);
                }

                if (options.loactionHash) {
                    KR.UrlFunctions.setupLocationUrl(map);
                }

                var datasetsLoaded = function (featurecollections) {
                    _checkLoadItemFromUrl(featurecollections);

                    if (splashScreen) {
                        splashScreen.finishedLoading();
                    }
                };

                var skipLoadOutside;
                if (options.geomFilter && bounds) {
                    skipLoadOutside = bounds.toBBoxString();
                }

                var layers = datasetLoader.loadDatasets(
                    datasets,
                    bounds.toBBoxString(),
                    filter,
                    datasetsLoaded,
                    skipLoadOutside
                );

                if (lineLayer) {
                    lineLayer.addTo(map);
                }
                if (datasets.length > 1) {
                    L.control.datasets(layers).addTo(map);
                }
            };

            if (options.initUserPos) {
                map.addOneTimeEventListener('locationChange', function () {
                    var pos = {lat: map.userPosition.lat, lon: map.userPosition.lng, zoom: 16};
                    initMapPos(pos);
                });
                map.addOneTimeEventListener('locationError', function () {
                    initMapPos(initPos);
                });
                locateBtn.getLocation();
            } else {
                initMapPos(initPos);
            }
        }

        var locationFromUrl = KR.UrlFunctions.getLocationUrl(map);

        var initPos;
        if (!options.initUserPos) {
            initPos = locationFromUrl;
        }

        options.map = map;
        if (options.komm) {
            _municipalityHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.fylke) {
            _countyHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.line) {
            _lineHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else if (options.bbox) {
            _bboxHandler(options, api, datasetIds, fromUrl, showDatasets, initPos);
        } else {
            alert('Missing parameters!');
        }

        return map;
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, datasetIds, options, true);
    };

}(KR));

/*global L:false, turf:false */

var KR = this.KR || {};

KR.setupCollectionMap = function (api, collectionName, layer) {
    'use strict';

    var templates = {
        'Digitalt fortalt': KR.Util.getDatasetTemplate('digitalt_fortalt'),
        'DigitaltMuseum': KR.Util.getDatasetTemplate('digitalt_museum'),
        'Musit': KR.Util.getDatasetTemplate('musit'),
        'Artsdatabanken': KR.Util.getDatasetTemplate('popup')
    };

    function _showCollection(collection) {

        var map = KR.Util.createMap('map', {layer: layer});
        KR.SplashScreen(
            map,
            collection.title,
            collection.description,
            collection.image,
            collection.creator
        );
        $('title').append(collection.title);

        var bounds = L.latLngBounds.fromBBoxArray(turf.extent(collection.geo_json));

        _.each(collection.geo_json.features, function (feature) {
            feature.properties.datasetId = feature.properties.provider;
            if (_.has(templates, feature.properties.provider)) {
                feature.template = templates[feature.properties.provider];
            }
        });

        var sidebar = KR.Util.setupSidebar(map);

        var _addClusterClick = KR.Util.clusterClick(sidebar);
        var _addFeatureClick = KR.Util.featureClick(sidebar);

        L.Knreise.LocateButton(null, null, {bounds: bounds}).addTo(map);
        map.fitBounds(bounds);

        var featureLayer = L.Knreise.geoJson(collection.geo_json, {
            onEachFeature: function (feature, layer) {
                _addFeatureClick(feature, layer);
            }
        });

        var clusterLayer = new L.Knreise.MarkerClusterGroup().addTo(map);
        clusterLayer.addLayers(featureLayer.getLayers());
        _addClusterClick(clusterLayer);
    }

    api.getCollection(collectionName, _showCollection);
};
