var KR = this.KR || {};

KR.Util = {};

(function (ns) {
    'use strict';

    ns.createQueryParameterString = function (params) {
        return _.map(params, function (value, key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
    };

    ns.sendRequest = function (url, callback, parser) {
        $.ajax({
            type: 'get',
            url: url,
            success: function (response) {
                if (parser) {
                    callback(parser(response));
                } else {
                    callback(response);
                }
            }
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

    var contentIcons = {
        'IMAGE': 'camera-retro',
        'VIDEO': 'file-video-o',
        'SOUND': 'music',
        'TEXT': 'file-text',
        'default': 'file-o'
    };

    var datasetIcons = {
        'Artsdatabanken': 'paw',
        'Kulturminnesok': 'archive',
        'Naturbase': 'tree'
    };

    ns.iconForDataset = function (dataset) {
        if (_.has(datasetIcons, dataset)) {
            return datasetIcons[dataset];
        }
    }

    ns.iconForFeature = function (feature) {

        var datasetIcon = ns.iconForDataset(feature.properties.dataset);
        if (datasetIcon) {
            return datasetIcon;
        }

        var contentType = feature.properties.contentType;
        if (_.has(contentIcons, contentType)) {
            return contentIcons[contentType];
        }
        return contentIcons['default'];
    };


    var providerColors = {
        'Artsdatabanken': {name: 'darkpuple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'default': {name: 'blue', hex: '#38A9DC'}
    };

    ns.colorForFeature = function (feature, type) {
        type = type || 'name';
        var provider = feature.properties.provider;

        if (_.has(providerColors, provider)) {
            return providerColors[provider][type];
        }
        return providerColors['default'][type];
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

}(KR.Util));
