

var NorvegianaAPI = function () {
    'use strict';


    var baseUrl = 'http://kulturnett2.delving.org/api/search'


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
            }, {}).value()
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


    function getWithin(query, latLng, distance, callback) {
        distance = distance || 5000;
        distance = distance / 1000; // convert to km
        var params = {
            query: query,
            pt: formatLatLng(latLng),
            d: distance,
            format: 'json'
        };
        var url = baseUrl + '?'  + createQueryParameterString(params);
        $.ajax({
            type: 'get',
            url: url,
            success: function (response){
                callback(parseNorvegianaItems(response))
            }
        });
    }


    return {
        getWithin: getWithin
    };
};