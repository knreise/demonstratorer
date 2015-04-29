var Norvegiana = {};

Norvegiana.contentIcons = {
    'IMAGE': 'camera-retro',
    'VIDEO': 'file-video-o',
    'SOUND': 'music',
    'TEXT': 'file-text',
    'default': 'file-o'
};

Norvegiana.iconForFeature = function (feature) {
    'use strict';

    var contentType = feature.properties.europeana_type;
    if (_.has(Norvegiana.contentIcons, contentType)) {
        return Norvegiana.contentIcons[contentType];
    }
    return Norvegiana.contentIcons['default'];
};

Norvegiana.API = function () {
    'use strict';

    var datasets = {
        '*': 'Alle',
        'Artsdatabanken': 'Artsdatabanken',
        'difo': 'Digitalt fortalt',
        'DiMu': 'DigitaltMuseum',
        'Industrimuseum': 'Industrimuseum',
        'Kulturminnesøk': 'Kulturminnesøk',
        'Universitetsmuseene': 'MUSIT',
        'Naturbase': 'Naturbase',
        'Stedsnavn': 'Stedsnavn'
    };

    var baseUrl = 'http://kulturnett2.delving.org/api/search';


    function createQueryParameterString(params) {
        return _.map(params, function (value, key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
    }


    function formatLatLng(latLng) {
        return latLng.lat + ',' + latLng.lng;
    }


    function arrOrvalue(value) {
        if (value.length > 1) {
            return value;
        }
        return value[0];
    }


    function geoJSONFeature(latLng, properties) {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [latLng.lng, latLng.lat]
            },
            'properties': properties
        };
    }


    function parseNorvegianaItem(item) {
        var params = _.chain(item.item.fields)
            .pairs()
            .where(function (field) {
                return field[0] !== 'abm_latLong';
            })
            .reduce(function (acc, field) {
                acc[field[0]] = arrOrvalue(field[1]);
                return acc;
            }, {}).value();
        var pos = _.find(item.item.fields, function (value, key) {
            return key === 'abm_latLong';
        });

        var pos = _.map(pos[0].split(','), parseFloat);
        var feature = geoJSONFeature({lat: pos[0], lng: pos[1]}, params);
        return feature;
    }


    function parseNorvegianaItems(response) {
        var features = _.map(response.result.items, parseNorvegianaItem);
        return {
            'type': 'FeatureCollection',
            'features': features
        };
    }


    function sendRequest(url, callback) {
        $.ajax({
            type: 'get',
            url: url,
            success: function (response) {
                callback(parseNorvegianaItems(response));
            }
        });
    }

    function getWithin(query, latLng, distance, callback) {
        distance = distance || 5000;
        distance = distance / 1000; // convert to km
        var params = {
            query: query,
            pt: formatLatLng(latLng),
            d: distance,
            format: 'json',
            rows: 100
        };
        var url = baseUrl + '?'  + createQueryParameterString(params);
        //var url = 'test.json';
        sendRequest(url, callback);
    }

    function getBbox(query, bbox, callback) {
        //TODO: this does not work!
        var params = {
            query: query,
            bbox: bbox,
            geoType: 'bbox',
            format: 'json'
        };
        var url = baseUrl + '?'  + createQueryParameterString(params);
        sendRequest(url, callback);
    }

    var providerColors = {
        'Artsdatabanken': 'darkpuple',
        'Digitalt fortalt': 'orange',
        'DigitaltMuseum': 'cadetblue',
        'Industrimuseum': 'darkred',
        'Kulturminnesøk': 'green',
        'Naturbase': 'purple',
        'Sentralt stedsnavnregister': 'darkgreen'
    };

    function pointToLayer(feature, latlng) {

        var provider = feature.properties.abm_contentProvider;
        var color = 'blue';
        if (_.has(providerColors, provider)) {
            color = providerColors[provider];
        }

        var faIcon = Norvegiana.iconForFeature(feature);

        var icon = L.AwesomeMarkers.icon({
            icon: faIcon,
            markerColor: color,
            prefix: 'fa'
        });

        return L.marker(latlng, {
            icon: icon
        });
    }

    return {
        getWithin: getWithin,
        getBbox: getBbox,
        datasets: function () {return _.extend({}, datasets); },
        pointToLayer: pointToLayer
    };
};