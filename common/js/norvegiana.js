var KR = this.KR || {};

KR.NorvegianaAPI = function () {
    'use strict';

    var NORVEGIANA_BASE_URL = 'http://kulturnett2.delving.org/api/search';

    function _formatLatLng(latLng) {
        return latLng.lat + ',' + latLng.lng;
    }

    function _firstOrNull(arr) {
        if (arr.length) {
            return arr[0];
        }
        return null;
    }

    function _parseNorvegianaItem(item) {
        var allProperties = _.chain(item.item.fields)
            .pairs()
            .where(function (field) {
                return field[0] !== 'abm_latLong';
            })
            .reduce(function (acc, field) {
                acc[field[0]] = field[1];
                return acc;
            }, {}).value();
        var pos = _.find(item.item.fields, function (value, key) {
            return key === 'abm_latLong';
        });

        var properties = {
            thumbnail: _firstOrNull(allProperties.delving_thumbnail),
            images: allProperties.delving_thumbnail,
            title: _firstOrNull(allProperties.dc_title),
            content: _firstOrNull(allProperties.dc_description),
            link: _firstOrNull(allProperties.europeana_isShownAt),
            dataset: _firstOrNull(allProperties.europeana_collectionTitle),
            provider: _firstOrNull(allProperties.abm_contentProvider),
            contentType: _firstOrNull(allProperties.europeana_type)
        };

        var parsedPos = _.map(pos[0].split(','), parseFloat);
        var feature = KR.Util.createGeoJSONFeature({lat: parsedPos[0], lng: parsedPos[1]}, properties);
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
