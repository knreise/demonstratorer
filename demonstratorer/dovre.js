(function () {
    'use strict';

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
            name: 'Fangstlokaliteter',
            dataset_name_override: 'fangstlokaliteter',
            dataset: {
                api: 'norvegiana',
                dataset: 'Kulturminnesok',
                query: 'delving_title:Fangstlokalitet'
            },
            template: KR.Util.getDatasetTemplate('kulturminne'),
            style: {
                fillcolor: '#436978',
                circle: true
            },
            cluster: false,
            visible: true
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
                api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
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
            datasets: [
                {
                    name: 'MUSIT',
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
                    template: KR.Util.getDatasetTemplate('digitalt_museum')
                },
                {
                    name: 'Kulturminner',
                    id: 'Kulturminnesok',
                    dataset: {
                        api: 'norvegiana',
                        dataset: 'Kulturminnesok',
                        query: '-delving_title:Fangstlokalitet'
                    },
                    template: KR.Util.getDatasetTemplate('kulturminne')
                }
            ],
            isStatic: false,
            minZoom: 12
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

    var api = new KR.API();

    KR.setupMap(api, datasets, {
        komm: 511,
        title: 'Dovre',
        description: $('#description_template').html(),
        image: 'http://lorempixel.com/816/612/'
    });
}());
