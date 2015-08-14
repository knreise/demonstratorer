/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

/*
    List of predefined datasets
*/

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {

        var loadKulturminnePoly = function (map, dataset, features) {
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
        };

        var initKulturminnePoly = function (map, dataset) {
            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }
                    layer.on('click', function () {
                        var parent = _.find(dataset.geoJSONLayer.getLayers(), function (parentLayer) {
                            return (parentLayer.feature.properties.id === feature.properties.lok);
                        });
                        if (parent) {
                            parent.fire('click');
                        }
                    });
                }
            }).addTo(map);
        };

        return {
            loadKulturminnePoly: loadKulturminnePoly,
            initKulturminnePoly: initKulturminnePoly
        };
    };

    ns.getDatasetList = function (api, komm, fylke) {

        var kulturminneFunctions = ns.getKulturminneFunctions(api);
        if (komm && komm.length === 3) {
            komm = '0' + komm;
        }

        var list = {
            'difo': {
                name: 'Digitalt fortalt',
                dataset: {dataset: 'difo', api: 'norvegiana'},
                cluster: true,
                template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
                noListThreshold: Infinity,
                description: 'Digitalt fortalt',
                allowTopic: true,
                feedbackForm: true
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
                template: KR.Util.getDatasetTemplate('verneomraader'),
                getFeatureData: function (feature, callback) {
                    api.getItem(
                        {api: 'norvegiana', id: 'kulturnett_Naturbase_' + feature.properties.iid},
                        callback
                    );
                },
                toPoint: {
                    showAlways: true,
                    stopPolyClick: true,
                    minSize: 20
                },
                minZoom: 10,
                cluster: false,
                description: 'Verneområder fra Naturbase, polygoner og punkter'
            },
            'artobs': {
                name: 'Artsobservasjoner',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Artsdatabanken'
                },
                cluster: false,
                description: 'Artsobservasjoner fra Artsdatabanken',
                template: KR.Util.getDatasetTemplate('popup')
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
                template: KR.Util.getDatasetTemplate('folketelling'),
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
                noListThreshold: 0,
                description: 'Eiendommer fra folketelling 1910'
            },
            'wikipedia': {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: KR.Util.getDatasetTemplate('wikipedia'),
                description: 'Geotaggede artikler fra bokmålswikipedia'
            },
            'ark_hist': {
                grouped: true,
                name: 'Arkeologi og historie',
                datasets: [
                    {
                        name: 'MUSIT',
                        provider: 'Universitetsmuseene',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'MUSIT'
                        },
                        template: KR.Util.getDatasetTemplate('musit')
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false
                    },
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: true,
                        init: kulturminneFunctions.initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: kulturminneFunctions.loadKulturminnePoly
                        }
                    }
                ],
                description: 'Data fra Universitetsmuseene, Digitalt museum og Riksantikvaren'
            },
            'riksantikvaren': {
                id: 'riksantikvaren',
                name: 'Riksantikvaren',
                hideFromGenerator: true,
                provider: 'Riksantikvaren',
                dataset: {
                    api: 'kulturminnedataSparql',
                    kommune: komm,
                    fylke: fylke
                },
                template: KR.Util.getDatasetTemplate('ra_sparql'),
                bbox: false,
                isStatic: true,
                init: kulturminneFunctions.initKulturminnePoly,
                loadWhenLessThan: {
                    count: 5,
                    callback: kulturminneFunctions.loadKulturminnePoly
                }
            },
            'jernbane': {
                id: 'jernbane',
                dataset: {
                    api: 'jernbanemuseet'
                },
                provider: 'Jernbanemuseet',
                name: 'Jernbanemuseet',
                template: KR.Util.getDatasetTemplate('jernbanemuseet'),
                getFeatureData: function (feature, callback) {
                    api.getItem(
                        {api: 'jernbanemuseet', id:  feature.properties.id},
                        callback
                    );
                },
                isStatic: true,
                bbox: false,
                description: 'Jernbanemuseet'
            },
            'arkeologi': {
                grouped: true,
                name: 'Arkeologi',
                style: {
                    fillcolor: '#436978',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    {
                        name: 'MUSIT',
                        provider: 'Universitetsmuseene',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'MUSIT'
                        },
                        template: KR.Util.getDatasetTemplate('musit')
                    },
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER regex(?loccatlabel, "^Arkeologisk", "i") .',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: true,
                        init: kulturminneFunctions.initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: kulturminneFunctions.loadKulturminnePoly
                        }
                    }
                ],
                description: 'Arkeologidata fra Universitetsmuseene og Riksantikvaren'
            },
            'historie': {
                grouped: true,
                name: 'Historie',
                style: {
                    fillcolor: '#D252B9',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER (!regex(?loccatlabel, "^Arkeologisk", "i"))',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: true,
                        init: kulturminneFunctions.initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: kulturminneFunctions.loadKulturminnePoly
                        }
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu',
                            query: '-dc_subject_facet:Kunst'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false,
                        bbox: true
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Industrimuseum'
                        },
                        isStatic: false,
                        bbox: true
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Foto-SF'
                        },
                        isStatic: true,
                        bbox: false,
                        template: KR.Util.getDatasetTemplate('foto_sf')
                    },
                    {
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'Kystreise'
                        },
                        isStatic: true,
                        bbox: false
                    }
                ],
                description: 'Historiedata fra Riksantikvaren og Digitalt museum '
            },
            'kunst': {
                grouped: true,
                name: 'Kunst',
                style: {
                    fillcolor: '#72B026',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu',
                            query: 'dc_subject_facet:Kunst'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false
                    },
                ],
                description: 'Kunstdata fra Digitalt museum '
            },
        };

        if (!komm && !fylke) {
            var sparqlBbox = function (api, dataset, bounds, dataLoaded, loadError) {
                KR.Util.mostlyCoveringMunicipality(api, bounds, function (kommune) {
                    if (kommune < 1000) {
                        kommune = '0' + kommune;
                    }
                    dataset.kommune = kommune;
                    api.getData(dataset, dataLoaded, loadError);
                });
            };
            var raParams = {
                bbox: true,
                minZoom: 12,
                isStatic: false,
                bboxFunc: sparqlBbox
            };
            _.extend(list.riksantikvaren, raParams);
            _.extend(list.ark_hist.datasets[2], raParams);
            _.extend(list.arkeologi.datasets[1], raParams);
            _.extend(list.historie.datasets[0], raParams);
        }

        return list;
    };

    ns.getDatasets = function (ids, api, komm, fylke) {
        var datasetList = ns.getDatasetList(api, komm, fylke);
        return _.chain(ids)
            .map(function (dataset) {
                var query;
                if (dataset.indexOf(':') > -1) {
                    var parts = dataset.split(':');
                    dataset = parts[0];
                    query = parts[1];
                }
                if (_.has(datasetList, dataset)) {
                    var datasetConfig = datasetList[dataset];
                    if (query && datasetConfig.dataset.api === 'norvegiana') {
                        datasetConfig.dataset.query = 'dc_subject_text:' + query;
                    }
                    return datasetConfig;
                }
            })
            .compact()
            .value();
    };

}(KR.Config));
