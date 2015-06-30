var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getDatasetList = function (api, komm) {

        function loadKulturminnePoly(map, dataset, features) {
            if (!features) {
                dataset.extraFeatures.clearLayers();
            }
            if (features) {
                var ids = _.map(features, function (feature) {
                    return feature.properties.id;
                });
                if (ids.length) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'lokalitetpoly',
                        lokalitet: ids
                    };
                    api.getData(q, function (geoJson) {
                        dataset.extraFeatures.clearLayers().addData(geoJson);
                    });
                }
            }
        }

        if (komm && komm.length === 3) {
            komm = '0' + komm;
        }

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
                getFeatureData: function (feature, callback) {
                    api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: feature.properties.efid
                    }, function (feature) {
                        feature.properties.provider = 'Folketelling 1910';
                        callback(feature);
                    });
                },
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                },
                noListThreshold: 0
            },
            'wikipedia': {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: _.template($('#wikipedia_template').html())
            },
            'ark_hist': {
                grouped: true,
                name: 'Arkeologi og historie',
                datasets: [
                    /*{
                        name: 'MUSIT',
                        provider: 'Universitetsmuseene',
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
                        template: _.template($('#digitalt_museum_template').html()),
                        isStatic: false
                    },*/
                    {
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            api: 'kulturminnedataSparql',
                            kommune: komm
                        },
                        template: _.template($('#ra_sparql_template').html()),
                        bbox: false,
                        style: {fillcolor: '#436978'},
                        isStatic: true,
                        init: function (map, dataset) {
                            dataset.extraFeatures = L.geoJson().addTo(map);
                        },
                        loadWhenLessThan: {
                            count: 5,
                            callback: loadKulturminnePoly
                        }
                    }
                ]
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
