(function () {
    'use strict';

    //The datasets in use
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {
                dataset: 'difo',
                api: 'norvegiana',
                query: 'dc_subject_facet:folkemusikk'
            },
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity
        },
        {
            name: 'Digitalt Museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu',
                query: 'dc_subject_text:folkemusikk'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            isStatic: true,
            thumbnails: true,
            bbox: true
        },
        {
            provider: 'Riksantikvaren',
            name: 'Kulturminnesøk - brukerregistrering',
            dataset: {
                api: 'kulturminnedata',
                layer: 2,
                query: "Beskrivelse LIKE '%#folkemusikk%'"
            },
            template: KR.Util.getDatasetTemplate('brukerminne'),
        }

    ];

    KR.setupMap(null, datasets, {
        komm: '822,821',
        title: title,
        image: image,
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true
    });
}());
