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

    datasetIcons: {
        'Artsdatabanken': 'paw',
        'Kulturminnesok': 'archive',
        'Naturbase': 'tree',
        'MUSIT_DiMu': 'flag',
        'Musit': 'flag',
        'DigitaltMuseum': 'flag',
        'fangstlokaliteter': 'circle'
    },

    providerColors: {
        'Artsdatabanken': {name: 'darkpurple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'MUSIT': {name: 'cadetblue', hex: '#436978'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'default': {name: 'blue', hex: '#38A9DC'},
        'fangstlokaliteter': {name: 'cadetblue', hex: '#436978'},
        'Trondheim byarkiv': {name: 'darkred', hex: '#A23336'}
    },

    templates: {}
};

KR.Util = KR.Util || {};

(function (ns) {
    'use strict';

    ns.templateForDataset = function (dataset) {
        if (_.has(KR.Config.templates, dataset)) {
            return KR.Config.templates[dataset];
        }
    };

    ns.iconForDataset = function (dataset) {
        if (_.isArray(dataset)) {
            dataset = dataset.join('_');
        }
        if (_.has(KR.Config.datasetIcons, dataset)) {
            return KR.Config.datasetIcons[dataset];
        }
    };

    ns.createStyleString = function (styleDict) {
        return _.map(styleDict, function (value, key) {
            return key + ': ' + value;
        }).join(';');
    };


    ns.iconForContentType = function (feature) {
        var contentType = feature.properties.contentType;
        if (_.has(KR.Config.contentIcons, contentType)) {
            return KR.Config.contentIcons[contentType];
        }
        return KR.Config.contentIcons['default'];
    };

    ns.iconForFeature = function (feature) {
        var datasetIcon = ns.iconForDataset(feature.properties.dataset);
        if (datasetIcon) {
            return datasetIcon;
        }
        return ns.iconForContentType(feature);
    };


    ns.colorForProvider = function (provider, type) {
        type = type || 'name';
        if (_.has(KR.Config.providerColors, provider)) {
            return KR.Config.providerColors[provider][type];
        }
        return KR.Config.providerColors['default'][type];
    };


    ns.colorForFeature = function (feature, type) {
        return ns.colorForProvider(feature.properties.provider, type);
    };


    ns.markerForFeature = function (feature, selected) {
        //var faIcon = ns.iconForFeature(feature);
        var color = selected
                    ? 'blue'
                    : ns.colorForFeature(feature);

        return L.Knreise.icon({
            markerColor: color,
            prefix: 'fa'
        });
    };

    var verneomrTypes = {
        landskapsvern: {
            ids: ['LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV'],
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

    function getVerneOmrcolors(feature) {
        var id = feature.properties.vernef_id;
        return _.find(verneomrTypes, function (type) {
            return (type.ids.indexOf(id) !== -1);
        });
    }

    ns.getVerneomrStyle = function (opacity) {

        var defaultStyle = {
            fillOpacity: opacity,
            opacity: 0.8,
            weight: 1,
            clickable: false
        };

        return function find(feature) {
            if (!feature) {
                return;
            }
            var res = getVerneOmrcolors(feature);
            if (res) {
                return _.extend({}, defaultStyle, res.style);
            }
            return {stroke: false, fill: false};
        };
    };

    ns.getVerneomrCircleStyle = function (color) {
        var defaultStyle = {
            fillOpacity: 1,
            opacity: 0.8,
            weight: 1,
            radius: 10
        };

        return function find(feature) {
            if (!feature) {
                return;
            }
            var res = getVerneOmrcolors(feature);
            var extra = {};
            if (color) {
                extra.color = color;
            }
            if (res) {
                return _.extend({}, defaultStyle, res.style, extra);
            }
            return {stroke: false, fill: false};
        };
    };


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

    ns.filterByBbox = function (features, bbox) {
        var boundPoly = turf.featurecollection([turf.bboxPolygon(KR.Util.splitBbox(bbox))]);
        return turf.within(features, boundPoly);
    };

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

    if (typeof L !== 'undefined') {
        L.latLngBounds.fromBBoxString = function (bbox) {
            bbox = KR.Util.splitBbox(bbox);
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };
    }

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

}(KR.Util));
