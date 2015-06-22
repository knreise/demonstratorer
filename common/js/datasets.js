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
            'verneomr': {
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
            'artobs': {
                name: 'Artsobservasjoner',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Artsdatabanken'
                },
                cluster: false
            },
            'folketelling': {
                name: 'Folketelling 1910',
                provider: 'Folketelling 1910',
                dataset: {
                    api: 'folketelling',
                    dataset: 'property',
                },
                isStatic: false,
                minZoom: 14,
                template: _.template($('#folketelling_template').html()),
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                }
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
            'ark_hist': {
                grouped: true,
                name: 'Arkeologi og historie',
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
                    },
                    {
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            api: 'kulturminnedataSparql',
                            kommune: komm
                        },
                        template: _.template($('#ra_sparql_template').html()),
                        bbox: false,
                        style: {fillcolor: '#728224'},
                        isStatic: true
                    }
                ],
                isStatic: false
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
