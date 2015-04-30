var Norvegiana = {};

(function (ns) {
    'use strict';


    var contentIcons = {
        'IMAGE': 'camera-retro',
        'VIDEO': 'file-video-o',
        'SOUND': 'music',
        'TEXT': 'file-text',
        'default': 'file-o'
    };


    ns.iconForFeature = function (feature) {
        var contentType = feature.properties.europeana_type;
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
        var provider = feature.properties.abm_contentProvider;

        if (_.has(providerColors, provider)) {
            return providerColors[provider][type];
        }
        return providerColors['default'][type];
    };


    ns.API = function () {

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

        function _createQueryParameterString(params) {
            return _.map(params, function (value, key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }).join('&');
        }

        function _formatLatLng(latLng) {
            return latLng.lat + ',' + latLng.lng;
        }

        function _arrOrvalue(value) {
            if (value.length > 1) {
                return value;
            }
            return value[0];
        }

        function _geoJSONFeature(latLng, properties) {
            return {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [latLng.lng, latLng.lat]
                },
                'properties': properties
            };
        }

        function _parseNorvegianaItem(item) {
            var params = _.chain(item.item.fields)
                .pairs()
                .where(function (field) {
                    return field[0] !== 'abm_latLong';
                })
                .reduce(function (acc, field) {
                    acc[field[0]] = _arrOrvalue(field[1]);
                    return acc;
                }, {}).value();
            var pos = _.find(item.item.fields, function (value, key) {
                return key === 'abm_latLong';
            });

            var parsedPos = _.map(pos[0].split(','), parseFloat);
            var feature = _geoJSONFeature({lat: parsedPos[0], lng: parsedPos[1]}, params);
            return feature;
        }

        function _parseNorvegianaItems(response) {
            var features = _.map(response.result.items, _parseNorvegianaItem);
            return {
                'type': 'FeatureCollection',
                'features': features
            };
        }

        function _sendRequest(url, callback) {
            $.ajax({
                type: 'get',
                url: url,
                success: function (response) {
                    callback(_parseNorvegianaItems(response));
                }
            });
        }

        function getWithin(query, latLng, distance, callback) {
            distance = distance || 5000;
            distance = distance / 1000; // convert to km
            var params = {
                query: query,
                pt: _formatLatLng(latLng),
                d: distance,
                format: 'json',
                rows: 100
            };
            var url = baseUrl + '?'  + _createQueryParameterString(params);
            //var url = 'test.json';
            _sendRequest(url, callback);
        }

        function getBbox(query, bbox, callback) {
            //TODO: this does not work!
            var params = {
                query: query,
                bbox: bbox,
                geoType: 'bbox',
                format: 'json'
            };
            var url = baseUrl + '?'  + _createQueryParameterString(params);
            _sendRequest(url, callback);
        }

        return {
            getWithin: getWithin,
            getBbox: getBbox,
            datasets: function () {return _.extend({}, datasets); }
        };
    };

}(Norvegiana));
