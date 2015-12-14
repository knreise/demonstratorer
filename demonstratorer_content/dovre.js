(function () {
    'use strict';

    var api = new KR.API();

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    var kommune = '0511';

    //The datasets in use
    var datasets = [
        {
            dataset: {
                api: 'cartodb',
                table: 'pilegrimsleden_dovre',
                mapper: KR.API.mappers.pilegrimsleden_dovre
            },
            name: 'Pilegrimsleden',
            style: function (feature) {
                return {color: '#7570b3', clickable: false, opacity: 1, weight: 3};
            },
            bbox: false
        },
        {
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity
        },
        {
            provider: 'kulturminnedata',
            name: 'Fangstgroper',
            dataset_name_override: 'fangstlokaliteter',
            dataset: {
                query: "Navn='Fangstgrop'",
                layer: 0,
                api: 'kulturminnedata'
            },
            template: KR.Util.getDatasetTemplate('fangstgrop'),
            smallMarker: true,
            cluster: false,
            style: {
                fillcolor: '#000',
                circle: true,
                radius: 1.5
            }
        },
        {
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
            cluster: false
        },
        {
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
                        kommune: kommune
                    },
                    template: KR.Util.getDatasetTemplate('ra_sparql'),
                    bbox: false,
                    isStatic: true,
                    unclusterCount: 20,
                    init: kulturminneFunctions.initKulturminnePoly
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
        {
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
                        kommune: kommune
                    },
                    template: KR.Util.getDatasetTemplate('ra_sparql'),
                    bbox: false,
                    isStatic: true,
                    unclusterCount: 20,
                    init: kulturminneFunctions.initKulturminnePoly
                }
            ],
            description: 'Arkeologidata fra Universitetsmuseene og Riksantikvaren'
        },
        {
            name: 'Artsobservasjoner',
            dataset: {
                api: 'norvegiana',
                dataset: 'Artsdatabanken'
            },
            circle: {
                radius: 7,
                weight: 1,
                opacity: 1,
                fillcolor: KR.Util.colorForProvider('Artsdatabanken', 'hex'),
                fillOpacity: 0.4
            },
            cluster: false,
            minZoom: 14,
            template: KR.Util.getDatasetTemplate('popup')
        }
    ];

    KR.setupMap(api, datasets, {
        komm: kommune,
        title: title,
        image: image,
        geomFilter: true,
        layer: 'norges_grunnkart',
        description: $('#description_template').html()
    });
}());