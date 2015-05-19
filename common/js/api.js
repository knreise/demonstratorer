var KR = this.KR || {};

KR.API = function (options) {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI();
    var wikipediaAPI;
    if (KR.WikipediaAPI) {
        wikipediaAPI = new KR.WikipediaAPI();
    }

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
        'Artsdatabanken': {name: 'Artsdatabanken', dataset: {api: 'norvegiana', dataset: 'Artsdatabanken'}},
        'difo': {name: 'Digitalt fortalt', dataset: {api: 'norvegiana', dataset: 'difo'}},
        'DiMu': {name: 'DigitaltMuseum', dataset: {api: 'norvegiana', dataset: 'DiMu'}},
        'Industrimuseum': {name: 'Industrimuseum', dataset: {api: 'norvegiana', dataset: 'Industrimuseum'}},
        'Kulturminnesøk': {name: 'Kulturminnesøk', dataset: {api: 'norvegiana', dataset: 'Kulturminnesøk'}},
        'MUSIT': {name: 'Universitetsmuseene', dataset: {api: 'norvegiana', dataset: 'MUSIT'}},
        'Naturbase': {name: 'Naturbase', dataset: {api: 'norvegiana', dataset: 'Naturbase'}},
        'Stedsnavn': {name: 'Stedsnavn', dataset: {api: 'norvegiana', dataset: 'Stedsnavn'}},
        'wikipedia': {name: 'Wikipedia', dataset: {api: 'wikipedia'}},
        'search_1': {name: 'Byantikvaren i Oslo', dataset: {api: 'cartodb', table: 'search_1'}}
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


    function _distanceFromBbox(api, dataset, bbox, callback, errorCallback, options) {
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
        api.getWithin(dataset, latLng, radius, callback, errorCallback, options);
    }

    function _getAPI(apiName) {
        var api = apis[apiName];
        if (api) {
            return api;
        }
        throw new Error('Unknown API');
    }

    function getData(dataset, callback, errorCallback, options) {
        options = options || {};
        var api = _getAPI(dataset.api);
        api.getData(dataset, callback, errorCallback, options);
    }

    function getBbox(dataset, bbox, callback, errorCallback, options) {
        options = options || {};
        var api = _getAPI(dataset.api);
        if (_.has(api, 'getBbox')) {
            api.getBbox(dataset, bbox, callback, errorCallback, options);
        } else {
            _distanceFromBbox(api, dataset, bbox, callback, errorCallback, options);
        }
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
        options = options || {};
        distance = distance || 5000;
        var api = _getAPI(dataset.api);
        api.getWithin(dataset, latLng, distance, callback, errorCallback, options);
    }

    function getMunicipalityBounds(municipalities, callback, errorCallback) {
        if (cartodbAPI) {
            cartodbAPI.getMunicipalityBounds(municipalities, callback, errorCallback);
            return;
        }
        throw new Error('CartoDB api not configured!');
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