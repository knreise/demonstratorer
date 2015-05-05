var KR = this.KR || {};

KR.API = function (options) {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI();
    var wikipediaAPI = new KR.WikipediaAPI();

    var cartodbAPI;
    if (_.has(options, 'cartodb')) {
        cartodbAPI = new KR.CartodbAPI(options.cartodb.user, options.cartodb.apikey);
        _.extend(KR.API.mappers, cartodbAPI.mappers());
    }

    var apis = {
        norvegiana: norvegianaAPI,
        wikipedia: wikipediaAPI,
        cartodb: cartodbAPI
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

    return {
        getWithin: getWithin,
        datasets: function () {return _.extend({}, datasets); },
        getMunicipalityBounds: getMunicipalityBounds,
        getData: getData
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