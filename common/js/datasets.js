var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getDatasetList = function (api, komm) {
        return {
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
            'kulturminnesok_norvegiana': {
                name: 'Kulturminner',
                id: 'Kulturminnesok',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Kulturminnesok'
                },
                template: _.template($('#kulturminne_template').html()),
                isStatic: false
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
            'kulturminnesok_sparql': {
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
            'husmann': {
                name: 'Kulturminner (Lokaliteter)',
                provider: 'Riksantikvaren',
                dataset: {
                    api: 'kulturminnedata',
                    layer: 1
                },
                template: _.template($('#husmann_template').html()),
                bbox: true,
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
            },
            'historie': {
                grouped: true,
                name: 'Historie',
                datasets: [
                    {
                        name: 'MUSIT',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'MUSIT'
                        },
                        template: _.template($('#musit_template').html())
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu'
                        },
                        template: _.template($('#digitalt_museum_template').html())
                    }
                ],
                isStatic: false
            },
            'fangstlokaliteter': {
                name: 'Fangstlokaliteter',
                dataset_name_override: 'fangstlokaliteter',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Kulturminnesok',
                    query: 'delving_title:Fangstlokalitet'
                },
                template: _.template($('#kulturminne_template').html()),
                style: {
                    fillcolor: '#436978',
                    circle: true
                },
                cluster: false,
                visible: true
            }
        };
    };

    ns.getDatasets = function (ids, api, komm) {

        var datasetConfig = ns.getDatasetList(api, komm);
        return _.chain(ids)
            .map(function (dataset) {
                if (_.has(datasetConfig, dataset)) {
                    return datasetConfig[dataset];
                }
            })
            .compact()
            .value();
    };

}(KR.Config));
