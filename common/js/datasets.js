/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

/*
    List of predefined datasets
*/

(function (ns) {
    'use strict';

    ns.getKulturminneFunctions = function (api) {

        var loadedIds = [];

        var loadKulturminnePoly = function (map, dataset, features) {
            if (features) {
                var ids = _.map(features, function (feature) {
                    return feature.properties.id;
                });

                var idsToLoad = _.filter(ids, function (id) {
                    return loadedIds.indexOf(id) === -1;
                });

                loadedIds = loadedIds.concat(idsToLoad);

                if (idsToLoad.length) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'lokalitetpoly',
                        lokalitet: idsToLoad
                    };
                    api.getData(q, function (geoJson) {
                        dataset.extraFeatures.addData(geoJson);
                    });
                }
            }
        };

        var initKulturminnePoly = function (map, dataset, vectorLayer) {

            var showEnkeltminner = true;
            if (_.has(dataset, 'showEnkeltminner')) {
                showEnkeltminner = dataset.showEnkeltminner;
            }
            var enkeltMinneLayer;
            var loadEnkeltminner;
            if (showEnkeltminner) {

                if (!_.has(dataset, 'enkeltminner')) {
                    dataset.enkeltminner = {};
                }

                var enkeltminneStyle = dataset.enkeltminner.style || {
                    color: '#fff',
                    weight: 1,
                    fillColor: '#B942D0'
                }

                enkeltMinneLayer = L.geoJson(null, {
                    onEachFeature: function (feature, layer) {
                        feature.properties.provider = dataset.enkeltminner.provider || 'Enkeltminne';
                        feature.properties.color = dataset.enkeltminner.sidebarColor || '#B942D0';
                        layer.on('click', function () {
                            if (map.sidebar) {
                                map.sidebar.showFeature(
                                    feature,
                                    dataset.enkeltminner.template || KR.Util.getDatasetTemplate('ra_enkeltminne')
                                );
                            }
                        });
                    },
                    style: function (feature) {
                        return enkeltminneStyle;
                    }
                }).addTo(map);
                loadEnkeltminner = function (feature) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'enkeltminner',
                        lokalitet: feature.properties.lok
                    };
                    api.getData(q, function (geoJson) {
                        enkeltMinneLayer.clearLayers();
                        enkeltMinneLayer.addData(geoJson);
                    });
                }
            }

            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    if (dataset.extras && dataset.extras.groupId) {
                        layer.setStyle(KR.Style.getPathStyleForGroup(dataset.extras.groupId));
                    } else {
                        feature.properties.datasetId = dataset.id;
                        layer.setStyle(KR.Style.getPathStyle(feature, true));
                    }

                    layer.on('click', function () {

                        if (loadEnkeltminner) {
                            loadEnkeltminner(feature);
                        }

                        var parent = _.find(dataset.geoJSONLayer.getLayers(), function (parentLayer) {
                            return (parentLayer.feature.properties.id === feature.properties.lok);
                        });
                        if (parent) {
                            parent.fire('click');
                        }
                    });
                }
            }).addTo(map);


            map.on('zoomend', function () {
                var shouldShow = !(map.getZoom() < 13);
                if (shouldShow) {
                    if (!map.hasLayer(dataset.extraFeatures)) {
                        map.addLayer(dataset.extraFeatures);
                    }
                } else {
                    if (map.hasLayer(dataset.extraFeatures)) {
                        map.removeLayer(dataset.extraFeatures);
                    }
                }
            });

            vectorLayer.on('hide', function () {
                map.removeLayer(dataset.extraFeatures);
                if (enkeltMinneLayer) {
                    map.removeLayer(enkeltMinneLayer)
                }
            });

            vectorLayer.on('show', function () {
                map.addLayer(dataset.extraFeatures);
                if (enkeltMinneLayer) {
                    map.addLayer(enkeltMinneLayer)
                }
            });
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
                description: 'Kulturrådets tjeneste for personlige fortellinger fra kulturinstitusjoner og privatpersoner.',
                allowTopic: true,
                feedbackForm: true,
                isStatic: false
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
                description: 'Nasjonalparker og andre naturvernområder - ca. 2700 i hele landet.'
            },
            'artobs': {
                name: 'Artsobservasjoner',
                hideFromGenerator: true,
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
                getFeatureData: function (oldFeature, callback) {
                    api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: oldFeature.properties.efid
                    }, function (feature) {
                        oldFeature.properties = feature.properties;
                        oldFeature.properties.provider = 'Folketelling 1910';
                        callback(oldFeature);
                    });
                },
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                },
                noListThreshold: 0,
                description: 'Personer og eiendommer fra folketellingen 1910'
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
            'jernbane': {
                id: 'jernbane',
                dataset: {
                    api: 'jernbanemuseet'
                },
                provider: 'Jernbanemuseet',
                name: 'Jernbanemuseet',
                hideFromGenerator: true,
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
                        isStatic: false,
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
                description: 'Historie og kulturminner fra Riksantikvaren og Digitalt museum '
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
            'wikipedia': {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: KR.Util.getDatasetTemplate('wikipedia'),
                description: 'Stedfestede artikler fra bokmålswikipedia'
            },
            'wikipediaNN': {
                name: 'Wikipedia Nynorsk',
                provider: 'Wikipedia Nynorsk',
                dataset: {
                    api: 'wikipediaNN'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: KR.Util.getDatasetTemplate('wikipedia'),
                description: 'Stedfestede artikler fra nynorskwikipedia'
            },

            'lokalwiki': {
                id: 'lokalwiki',
                name: 'Lokalhistoriewiki',
                hideFromGenerator: false,
                provider: 'Lokalhistoriewiki',
                dataset: {
                    api: 'lokalhistoriewiki'
                },
                style: {thumbnail: true},
                minZoom: 13,
                bbox: true,
                isStatic: false,
                description: 'Stedfestede artikler fra lokalhistoriewiki.no'
            },
            'riksantikvaren': {
                id: 'riksantikvaren',
                name: 'Kulturminnesøk',
                hideFromGenerator: false,
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
                    count: 10,
                    callback: kulturminneFunctions.loadKulturminnePoly
                },
                description: 'Data fra Riksantikvarens kulturminnesøk'
            },
            'brukerminner': {
                name: 'Kulturminnesøk - brukerregistreringer',
                hideFromGenerator: false,
                provider: 'riksantikvaren',
                dataset: {
                    api: 'kulturminnedata',
                    layer: 2,
                    getExtraData: true,
                    extraDataLayer: 6,
                    matchId: 'KulturminnesokID'
                },
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Brukerregistrerte data fra Riksantikvarens kulturminnesøk',
                template: KR.Util.getDatasetTemplate('brukerminne')
            },
            'groruddalen': {
                name: 'Byantikvaren Oslo - Groruddalen',
                hideFromGenerator: true,
                provider: 'Byantikvaren i Oslo',
                dataset: {
                    api: 'cartodb',
                    table: 'byantikvaren_oslo_groruddalen'
                },
                bbox: false,
                isStatic: false,
                style: {thumbnail: true},
                template: KR.Util.getDatasetTemplate('byantikvaren_oslo'),
                description: 'Byantikvarens Groruddalsatlas'
            },
            'norgerundt': {
                name: 'Norge Rundt',
                hideFromGenerator: true,
                provider: 'NRK',
                dataset: {
                    api: 'cartodb',
                    table: 'nrk_norge_rundt'
                },
                bbox: false,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Stedfestede innslag fra Norge Rundt'
            },
            'dimu': {
                name: 'Digitalt Museum',
                hideFromGenerator: false,
                provider: 'dimu',
                dataset: {dataset: 'DiMu', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Digitalt Museum',
                allowTopic: true,
                feedbackForm: true
            },
            'musit': {
                name: 'Universitetsmuseene',
                hideFromGenerator: false,
                provider: 'Universitetsmuseene',
                dataset: {dataset: 'MUSIT', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Universitetsmuseene',
                allowTopic: true,
                feedbackForm: true
            },
            'industrimuseum': {
                name: 'Industrimuseum',
                hideFromGenerator: false,
                provider: 'Industrimuseum',
                dataset: {dataset: 'Industrimuseum', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Industrimuseum',
                allowTopic: true,
                feedbackForm: true
            },
            'kystreise': {
                name: 'Kystreise',
                hideFromGenerator: false,
                provider: 'Kystreise',
                dataset: {dataset: 'Kystreise', api: 'norvegiana'},
                cluster: true,
                isStatic: false,
                style: {thumbnail: true},
                description: 'Alle stedfestede data fra Kystreise',
                allowTopic: true,
                feedbackForm: true
            },
            'dimufoto': {
                hideFromGenerator: true,
                dataset: {
                    api: 'norvegiana',
                    dataset: 'DiMu',
                    query: 'europeana_type_facet:IMAGE'
                },
                template: KR.Util.getDatasetTemplate('digitalt_museum'),
                isStatic: false,
                style: {thumbnail: true},
                noListThreshold: Infinity
            },
            'kulturminnesok_flickr': {
                name: 'Kulturminnesøk',
                dataset_name_override: 'Kulturminnesøk',
                provider: 'Kulturminnesøk Flickr',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    group_id: '1426230@N24'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: true,
                style: {thumbnail: true},
                description: 'Bilder fra Kulturminnesøks Flickr-gruppe',
            },
            'riksarkivet': {
                name: 'Riksarkivet',
                dataset_name_override: 'Riksarkivet',
                provider: 'riksarkivet',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'national_archives_of_norway'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Riksarkivets Flickr-konto',
            },
            'nasjonalbiblioteket': {
                name: 'Nasjonalbiblioteket',
                dataset_name_override: 'Nasjonalbiblioteket',
                provider: 'nasjonalbiblioteket',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'national_library_of_norway'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Nasjonalbibliotekets Flickr-konto',
            },
            'oslobyarkiv': {
                name: 'Oslo Byarkiv',
                dataset_name_override: 'Oslo Byarkiv',
                provider: 'oslobyarkiv',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'byarkiv'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Oslo byarkiv sin Flickr-konto',
            },
            'nasjonalmuseet': {
                name: 'Nasjonalmuseet',
                dataset_name_override: 'Nasjonalmuseet',
                provider: 'nasjonalmuseet',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'nasjonalmuseet'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Nasjonalmuseet sin Flickr-konto',
            },
            'nve': {
                name: 'NVE',
                dataset_name_override: 'NVE',
                provider: 'nve',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'nve',
                    accuracy: '6'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra NVE Flickr-konto',
            },
            'vestfoldmuseene': {
                name: 'Vestfoldmuseene',
                dataset_name_override: 'Vestfoldmuseene',
                provider: 'Vestfoldmuseene',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'vestfoldmuseene',
                    accuracy: '1'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Vestfoldmuseene sin Flickr-konto',
            },
            'perspektivet': {
                name: 'Perspektivet Museum',
                dataset_name_override: 'Perspektivet Museum',
                provider: 'Perspektivet Museum',
                hideFromGenerator: true,
                dataset: {
                    api: 'flickr',
                    user_id: 'perspektivetmuseum',
                    accuracy: '1'
                },
                template: KR.Util.getDatasetTemplate('flickr'),
                isStatic: false,
                style: {thumbnail: true},
                description: 'Bilder fra Perspektivet Museum sin Flickr-konto',
            }



        };

        if (!komm && !fylke) {
            var raParams = {
                bbox: true,
                minZoom: 12,
                isStatic: false,
                bboxFunc: KR.Util.sparqlBbox
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
