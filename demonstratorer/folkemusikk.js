(function () {
    'use strict';

    //The datasets in use
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {
                dataset: 'difo',
                api: 'norvegiana',
                query: 'dc_subject_facet:Musikk(6)'
            },
            cluster: true,
            template: _.template($('#digitalt_fortalt_template').html()),
            noListThreshold: Infinity
        }
    ];

    var api = new KR.API({
        cartodb: {
            apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
            user: 'knreise'
        }
    });

    KR.setupMap(api, datasets, {
        komm: '822,821',
        title: title,
        description: $('#description_template').html(),
        image: 'http://lorempixel.com/816/612/',
        geomFilter: true,
        showGeom: true
    });
}());
