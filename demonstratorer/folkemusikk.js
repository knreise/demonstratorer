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
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity
        }
    ];

    var api = new KR.API();

    KR.setupMap(api, datasets, {
        komm: '822,821',
        title: title,
        description: $('#description_template').html(),
        image: 'http://lorempixel.com/816/612/',
        geomFilter: true,
        showGeom: true
    });
}());
