var KR = this.KR || {};

KR.NorvegianaAPI = function () {
    'use strict';

    var requests = [];

    var NORVEGIANA_BASE_URL = 'http://kulturnett2.delving.org/api/search';

    function _formatLatLng(latLng) {
        return latLng.lat + ',' + latLng.lng;
    }

    function _firstOrNull(arr) {
        if (arr && arr.length) {
            return arr[0];
        }
        return null;
    }

    function _parseVideo(link) {
        if (!link) {
            return link;
        }
        if (link.indexOf('www.youtube.com/watch') !== -1) {
            return 'https://www.youtube.com/embed/' + link.substr(link.indexOf('watch?v=') + 8);
        }
        return link;
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
            contentType: _firstOrNull(allProperties.europeana_type),
            video: _firstOrNull(allProperties.abm_videoUri),
            videoEmbed: _parseVideo(_firstOrNull(allProperties.abm_videoUri)),
            sound: _firstOrNull(allProperties.abm_soundUri),
            allProps: allProperties
        };

        var parsedPos = _.map(pos[0].split(','), parseFloat);
        var feature = KR.Util.createGeoJSONFeature({lat: parsedPos[0], lng: parsedPos[1]}, properties);
        return feature;
    }

    function _parseNorvegianaItems(response) {
        var nextPage = null;
        if (response.result.pagination.hasNext) {
            nextPage = response.result.pagination.nextPage;
        }

        var features = _.map(response.result.items, _parseNorvegianaItem);
        var geoJSON = KR.Util.CreateFeatureCollection(features);
        geoJSON.numFound = response.result.pagination.numFound;
        return {geoJSON: geoJSON, nextPage: nextPage};
    }

    function _acc(url, originalCallback) {
        var data = [];

        return function callback(responseData) {
            data.push(responseData.geoJSON);
            if (responseData.nextPage) {
                KR.Util.sendRequest(url + '&start=' + responseData.nextPage, callback, _parseNorvegianaItems);
            } else {
                var features = _.reduce(data, function (acc, featureCollection) {
                    return acc.concat(featureCollection.features);
                }, []);
                originalCallback(KR.Util.CreateFeatureCollection(features));
            }
        }
    }

    function getWithin(params, latLng, distance, callback) {
        var dataset, qf;
        if (_.isArray(params) || _.isString(params)) {
            dataset = params;
        } else {
            dataset = params.dataset;
            qf = params.query;
        }

        if (!_.isArray(dataset))  {
            dataset = [dataset];
        }
        dataset = _.map(dataset, function (d) {return 'delving_spec:' + d; }).join(' OR ');

        distance = distance / 1000; // convert to km
        var id = dataset;
        var params = {
            query: dataset,
            pt: _formatLatLng(latLng),
            d: distance,
            format: 'json',
            rows: 1000
        };
        if (qf) {
            params.qf = qf;
            id += qf;
        }

        if (requests[id]) {
            requests[id].abort();
            requests[id] = null;
        }

        var url = NORVEGIANA_BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        if (params.allPages) {
            requests[id] = KR.Util.sendRequest(url, _acc(url, callback), _parseNorvegianaItems);
        } else {
            requests[id] = KR.Util.sendRequest(url, function (res) { callback(res.geoJSON); }, _parseNorvegianaItems);
        }
        
    }

    function getItem(id, callback) {
        var params = {
            id: id,
            format: 'json'
        };
        var url = NORVEGIANA_BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, callback, function (response) {
            return _parseNorvegianaItem(response.result);
        });
    }

    /*
    function getData(dataset, callback) {
        console.log(dataset);
        var query;
        if (dataset.dataset) {
            query = 'delving_spec:' + dataset.dataset;
        }

        var params = {
            query: query,
            format: 'json',
            rows: 100
        };
        var url = NORVEGIANA_BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        //var url = 'test.json';
        KR.Util.sendRequest(url, callback, _parseNorvegianaItems);
    }
    */

    return {
        getWithin: getWithin,
        getItem: getItem
        //getData: getData
    };
};
