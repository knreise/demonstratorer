var KR = this.KR || {};

KR.API = function (options) {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI();
    var wikipediaAPI = new KR.WikipediaAPI();
    var kulturminnedataAPI;
    if (KR.ArcgisAPI) {
        kulturminnedataAPI = new KR.ArcgisAPI('http://husmann.ra.no/arcgis/rest/services/Husmann/Husmann/MapServer/');
    }

    var cartodbAPI;
    if (_.has(options, 'cartodb')) {
        cartodbAPI = new KR.CartodbAPI(options.cartodb.user, options.cartodb.apikey);
        _.extend(KR.API.mappers, cartodbAPI.mappers());
    }

    var apis = {
        norvegiana: norvegianaAPI,
        wikipedia: wikipediaAPI,
        cartodb: cartodbAPI,
        kulturminnedata: kulturminnedataAPI
    };

    var datasets = {
        //'delving_spec:*': 'Alle',
        'Artsdatabanken': {name: 'Artsdatabanken', api: 'norvegiana'},
        'difo': {name: 'Digitalt fortalt', api: 'norvegiana'},
        'DiMu': {name: 'DigitaltMuseum', api: 'norvegiana'},
        'Industrimuseum': {name: 'Industrimuseum', api: 'norvegiana'},
        'Kulturminnesøk': {name: 'Kulturminnesøk', api: 'norvegiana'},
        'MUSIT': {name: 'Universitetsmuseene', api: 'norvegiana'},
        'Naturbase': {name: 'Naturbase', api: 'norvegiana'},
        'Stedsnavn': {name: 'Stedsnavn', api: 'norvegiana'},
        'wikipedia': {name: 'Wikipedia', api: 'wikipedia'},
        'search_1': {name: 'Byantikvaren i Oslo', api: 'cartodb'}
    };

    function getDatasetObj(query) {
        if (_.has(datasets, query)) {
            return datasets[query];
        }
        throw new Error('Unknown dataset');
    }

    function _toRad(value) {
        return value * Math.PI / 180;
    }

    function _haversine(lat1, lon1, lat2, lon2) {
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
    }


    function _distanceFromBbox(api, dataset, bbox, callback) {
        bbox = bbox.split(',').map(parseFloat);

        var lng1 = bbox[0]; //southwest_lng
        var lat1 = bbox[1]; //southwest_lat

        var lng2 = bbox[2]; //northeast_lng
        var lat2 = bbox[3]; //northeast_lat

        var centerLng = (lng1 + lng2) / 2;
        var centerLat = (lat1 + lat2) / 2;

        var radius = _.max([
            _haversine(lat1, lng1, centerLat, centerLng),
            _haversine(lat2, lng2, centerLat, centerLng)
        ]);

        var latLng = {lat: centerLat, lng: centerLng};
        api.getWithin(dataset.dataset, latLng, radius, callback, true);
    }

    function getWithin(query, latLng, distance, callback) {
        distance = distance || 5000;
        var dataset = getDatasetObj(query);
        var api = apis[dataset.api];
        if (api) {
            api.getWithin(query, latLng, distance, callback, true);
        } else {
            throw new Error('Unknown API');
        }
    }

    function getMunicipalityBounds(municipalities, callback) {
        if (cartodbAPI) {
            cartodbAPI.getMunicipalityBounds(municipalities, callback);
            return;
        }
        throw new Error('CartoDB api not configured!');
    }

    function getData(dataset, callback) {
        var api = apis[dataset.api];
        if (api) {
            api.getData(dataset, callback);
        } else {
            throw new Error('Unknown API');
        }
    }

    function getBbox(dataset, bbox, callback) {
        var api = apis[dataset.api];
        if (api) {
            if (_.has(api, 'getBbox')) {
                api.getBbox(dataset, bbox, callback);
            } else {
                _distanceFromBbox(api, dataset, bbox, callback);
            }
        } else {
            throw new Error('Unknown API');
        }
    }

    return {
        getWithin: getWithin,
        datasets: function () {return _.extend({}, datasets); },
        getMunicipalityBounds: getMunicipalityBounds,
        getData: getData,
        getBbox: getBbox,
        getNorvegianaItem: function (item, callback) {
            apis.norvegiana.getItem(item, callback);
        }
    };

};

KR.API.mappers = {};

/*
    properties:
        thumbnail: string (full link to thumbnail-image),
        images: string[] (full link to fullsize image),
        title: string (title)
        content: string (possibly HTML formatted content)
        link: string (url to origin)
        dataset: string (name of the dataset)
        provider: string (name of dataset provider)
        contentType: string (type of content)
*/