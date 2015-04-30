/*global KR: false */

var KR = this.KR || {};

KR.NorvegianaAPI = function () {
    'use strict';

    var NORVEGIANA_BASE_URL = 'http://kulturnett2.delving.org/api/search';

    function _formatLatLng(latLng) {
        return latLng.lat + ',' + latLng.lng;
    }

    function _arrOrvalue(value) {
        if (value.length > 1) {
            return value;
        }
        return value[0];
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
        var feature = KR.Util.createGeoJSONFeature({lat: parsedPos[0], lng: parsedPos[1]}, params);
        return feature;
    }

    function _parseNorvegianaItems(response) {
        var features = _.map(response.result.items, _parseNorvegianaItem);
        return KR.Util.CreateFeatureCollection(features);
    }

    function getWithin(query, latLng, distance, callback) {
        distance = distance / 1000; // convert to km
        var params = {
            query: query,
            pt: _formatLatLng(latLng),
            d: distance,
            format: 'json',
            rows: 100
        };
        var url = NORVEGIANA_BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        //var url = 'test.json';
        KR.Util.sendRequest(url, callback, _parseNorvegianaItems);
    }

    return {
        getWithin: getWithin
    };
};
