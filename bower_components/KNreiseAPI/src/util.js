/*global L: false */

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
        'Artsdatabanken': {name: 'darkpuple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'MUSIT': {name: 'darkred', hex: '#A23336'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'default': {name: 'blue', hex: '#38A9DC'}
    },

    templates: {}
};

KR.Util = {};

(function (ns) {
    'use strict';

    ns.createQueryParameterString = function (params) {
        return _.map(params, function (value, key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
    };

    ns.sendRequest = function (url, parser, callback, errorCallback) {
        return $.ajax({
            type: 'get',
            url: url,
            success: function (response) {
                if (parser) {
                    callback(parser(response));
                } else {
                    callback(response);
                }
            },
            error: errorCallback
        });
    };

    ns.createGeoJSONFeature = function (latLng, properties) {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [latLng.lng, latLng.lat]
            },
            'properties': properties
        };
    };

    ns.CreateFeatureCollection = function (features) {
        return {
            'type': 'FeatureCollection',
            'features': features
        };
    };

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

    ns.iconForFeature = function (feature) {
        var datasetIcon = ns.iconForDataset(feature.properties.dataset);
        if (datasetIcon) {
            return datasetIcon;
        }

        var contentType = feature.properties.contentType;
        if (_.has(KR.Config.contentIcons, contentType)) {
            return KR.Config.contentIcons[contentType];
        }
        return KR.Config.contentIcons['default'];
    };


    ns.colorForFeature = function (feature, type) {
        type = type || 'name';
        var provider = feature.properties.provider;

        if (_.has(KR.Config.providerColors, provider)) {
            return KR.Config.providerColors[provider][type];
        }
        return KR.Config.providerColors['default'][type];
    };


    ns.markerForFeature = function (feature) {
        var faIcon = ns.iconForFeature(feature);
        var color = ns.colorForFeature(feature);
        return L.AwesomeMarkers.icon({
            icon: faIcon,
            markerColor: color,
            prefix: 'fa'
        });
    };

    ns.stamp = (function () {
        var lastId = 0,
            key = '_knreise_id';
        return function (obj) {
            obj[key] = obj[key] || ++lastId;
            return obj[key];
        };
    }());

    function _toRad(value) {
        return value * Math.PI / 180;
    }

    ns.haversine = function (lat1, lon1, lat2, lon2) {
        var R = 6371000; // metres
        var phi1 = _toRad(lat1);
        var phi2 = _toRad(lat2);
        var bDeltaPhi = _toRad(lat2 - lat1);
        var bDeltaDelta = _toRad(lon2 - lon1);

        var a = Math.sin(bDeltaPhi / 2) * Math.sin(bDeltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(bDeltaDelta / 2) * Math.sin(bDeltaDelta / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    ns.splitBbox = function (bbox) {
        return bbox.split(',').map(parseFloat);
    };

    ns.featureClick = function (sidebar) {
        return function _addFeatureClick(feature, layer, dataset) {
            layer.on('click', function () {
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
                sidebar.showFeatures(features);
            });
        };
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

}(KR.Util));
