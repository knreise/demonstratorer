var KR = this.KR || {};

KR.API = function () {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI();
    var wikipediaAPI = new KR.WikipediaAPI();

    var datasets = {
        //'delving_spec:*': 'Alle',
        'delving_spec:Artsdatabanken': 'Artsdatabanken',
        'delving_spec:difo': 'Digitalt fortalt',
        'delving_spec:DiMu': 'DigitaltMuseum',
        'delving_spec:Industrimuseum': 'Industrimuseum',
        'delving_spec:Kulturminnesøk': 'Kulturminnesøk',
        'delving_spec:Universitetsmuseene': 'MUSIT',
        'delving_spec:Naturbase': 'Naturbase',
        'delving_spec:Stedsnavn': 'Stedsnavn',
        'wikipedia': 'Wikipedia'
    };

    function getWithin(query, latLng, distance, callback) {
        distance = distance || 5000;
        if (query === 'wikipedia') {
            wikipediaAPI.getWithin(latLng, distance, callback);
            return;
        }
        norvegianaAPI.getWithin(query, latLng, distance, callback);
    }

    return {
        getWithin: getWithin,
        datasets: function () {return _.extend({}, datasets); }
    };

};
