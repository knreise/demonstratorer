function getDatasetList(api, komm) {
    'use strict';

    var datasets = {
        'difo': {
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            cluster: true,
            template: _.template($('#digitalt_fortalt_template').html()),
            noListThreshold: Infinity
        },
        'verneomraader': {
            id: 'verneomraader',
            dataset: {
                api: 'cartodb',
                table: 'naturvernomrader_utm33_2',
                columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
            },
            provider: 'Naturbase',
            name: 'Verneområder',
            template: _.template($('#verneomraader_template').html()),
            getFeatureData: function (feature, callback) {
                api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
            },
            toPoint: {
                showAlways: true,
                stopPolyClick: true,
                minSize: 20
            },
            cluster: false
        },
        'musit': {
            name: 'MUSIT',
            dataset: {
                api: 'norvegiana',
                dataset: 'MUSIT'
            },
            template: _.template($('#musit_template').html()),
            isStatic: false
        },
        'dimu': {
            name: 'Digitalt museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu'
            },
            template: _.template($('#digitalt_museum_template').html()),
            isStatic: false
        },
        'kulturminnesok': {
            name: 'Kulturminner',
            id: 'Kulturminnesok',
            dataset: {
                api: 'norvegiana',
                dataset: 'Kulturminnesok'
            },
            template: _.template($('#kulturminne_template').html()),
            isStatic: false,
            minZoom: 12
        },
        'artsdatabanken': {
            name: 'Artsobservasjoner',
            dataset: {
                api: 'norvegiana',
                dataset: 'Artsdatabanken'
            },
            cluster: false
        },
        'wikipedia': {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia'
            },
            style: {thumbnail: true},
            minZoom: 13
        },
        'kulturminnedata': {
            name: 'Riksantikvaren',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: komm
            },
            template: _.template($('#ra_sparql_template').html()),
            bbox: false,
            style: {fillcolor: '#728224'}
        },
        'trd_byarkiv': {
            name: 'Trondheim byarkiv',
            dataset_name_override: 'Trondheim byarkiv',
            provider: 'Trondheim byarkiv',
            dataset:  {
                api: 'flickr',
                user_id: 'trondheim_byarkiv'
            },
            template: _.template($('#flickr_template').html()),
            style: {fillcolor: '#D252B9'}
        }
    };

    return datasets;
}