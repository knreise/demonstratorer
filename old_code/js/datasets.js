/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

/*
    List of predefined datasets
*/

(function (ns) {
    'use strict';

    ns.getDatasetList = function (api) {

        var komm = null;
        var fylke = null;
        var kulturminneFunctions = ns.getKulturminneFunctions(api);

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
                isStatic: false,
                style: {
                    fillcolor: '#F69730',
                    circle: false,
                    thumbnail: true
                }
            },
            'verneomr': {
                id: 'verneomraader',
                dataset: {
                    api: 'cartodb',
                    table: 'naturvernomrader_utm33_2',
                    columns: ['iid', 'omradenavn', 'vernef_id', 'verneform']
                },
                provider: 'Naturbase',
                name: 'Verneområder',
                template: KR.Util.getDatasetTemplate('verneomraader'),
                getFeatureData: function (feature, callback) {
                    /*api.getItem(
                        {api: 'norvegiana', id: 'kulturnett_Naturbase_' + feature.properties.iid},
                        callback
                    );*/
                    console.log("NO API in datasets.js")
                    callback();

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
                    dataset: 'property'
                },
                isStatic: false,
                minZoom: 14,
                template: KR.Util.getDatasetTemplate('folketelling'),
                getFeatureData: function (oldFeature, callback) {

                    console.log("NO API in datasets.js")
                    callback();

                    /*api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: oldFeature.properties.efid
                    }, function (feature) {
                        oldFeature.properties = feature.properties;
                        oldFeature.properties.provider = 'Folketelling 1910';
                        callback(oldFeature);
                    });
                    */
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
                minZoom: 14,
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
                        getFeatureData: kulturminneFunctions.getRaFeatureData,
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: false,
                        unclusterCount: 20,
                        init: kulturminneFunctions.initKulturminnePoly
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
                    /*api.getItem(
                        {api: 'jernbanemuseet', id:  feature.properties.id},
                        callback
                    );*/
                    console.log("NO API in datasets.js")
                    callback();
                },
                isStatic: true,
                bbox: false,
                description: 'Jernbanemuseet'
            },
            'arkeologi': {
                grouped: true,
                name: 'Arkeologi',
                minZoom: 14,
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
                   /* {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER regex(?loccatlabel, "^Arkeologisk", "i") .',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        getFeatureData: kulturminneFunctions.getRaFeatureData,
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: false,
                        unclusterCount: 20,
                        init: kulturminneFunctions.initKulturminnePoly
                    }*/
                ],
                description: 'Arkeologidata fra Universitetsmuseene og Riksantikvaren'
            },
            'historie': {
                grouped: true,
                name: 'Historie',
                minZoom: 14,
                style: {
                    fillcolor: '#D252B9',
                    circle: false,
                    thumbnail: true
                },
                datasets: [
                    /*{
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            filter: 'FILTER (!regex(?loccatlabel, "^Arkeologisk", "i"))',
                            api: 'kulturminnedataSparql',
                            kommune: komm,
                            fylke: fylke
                        },
                        getFeatureData: kulturminneFunctions.getRaFeatureData,
                        template: KR.Util.getDatasetTemplate('ra_sparql'),
                        bbox: false,
                        isStatic: false,
                        unclusterCount: 20,
                        init: kulturminneFunctions.initKulturminnePoly,
                        style: {
                            fillcolor: '#436978',
                            circle: false,
                            thumbnail: true
                        }
                    },*/
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu',
                            query: '-dc_subject_facet:Kunst'
                        },
                        template: KR.Util.getDatasetTemplate('digitalt_museum'),
                        isStatic: false,
                        bbox: true,
                        style: {
                            fillcolor: '#436978',
                            circle: false,
                            thumbnail: false
                        }
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
                        isStatic: false,
                        style: {
                            fillcolor: '#436978',
                            circle: false,
                            thumbnail: false
                        }
                    }
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
                description: 'Stedfestede artikler fra bokmålswikipedia',
                style: {
                    fillcolor: '#D14020',
                    thumbnail: true,
                }
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
                description: 'Stedfestede artikler fra nynorskwikipedia',
                style: {
                    fillcolor: '#D14020',
                    thumbnail: true,
                }
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
                getFeatureData: kulturminneFunctions.getRaFeatureData,
                template: KR.Util.getDatasetTemplate('ra_sparql'),
                bbox: false,
                isStatic: false,
                description: 'Data fra Riksantikvarens kulturminnesøk',
                unclusterCount: 20,
                init: kulturminneFunctions.initKulturminnePoly,
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
                template: KR.Util.getDatasetTemplate('brukerminne'),
                style: {
                    fillcolor: '#436978',
                    circle: false,
                    thumbnail: false
                }
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

        return list;
    };

    ns.getDatasets = function (ids) {
        var datasetList = ns.getDatasetList();
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
