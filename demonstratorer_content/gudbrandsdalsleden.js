(function () {
    'use strict';

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    var datasets = [
        {
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
            minZoom: 8
        },
        {
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity
        },
        {
            name: 'Trondheim byarkiv',
            dataset_name_override: 'Trondheim byarkiv',
            provider: 'Trondheim byarkiv',
            dataset:  {
                api: 'flickr',
                user_id: 'trondheim_byarkiv'
            },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {fillcolor: '#D252B9'}
        },
        {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia'
            },
            style: {thumbnail: true},
            minZoom: 13,
            template: KR.Util.getDatasetTemplate('wikipedia')
        }
    ];

    var options = {
        line: 'http://pilegrimsleden.no/assets/kml/gudbrands_062015_d.kml',
        title: title,
        image: 'http://pilegrimsleden.no/uploads/made/uploads/images/Bilder_Gudbrandsdalsleden/RogerJensen_1000_575_90_s_c1.jpg',
        description: $('#description_template').html(),
        buffer: 2,
        linecolor: '#000000'
    };


    KR.setupMap(api, datasets, options, false);
}());
