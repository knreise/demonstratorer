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
		            name: 'Riksantikvaren',
		            provider: 'Riksantikvaren',
		            dataset: {
		                api: 'kulturminnedataSparql',
		                kommune: '1601'
		            },
		            template: KR.Util.getDatasetTemplate('ra_sparql'),
                    getFeatureData: kulturminneFunctions.getRaFeatureData,
                    unclusterCount: 20,
                    init: kulturminneFunctions.initKulturminnePoly,
		            bbox: false,
		            style: {fillcolor: '#728224'}
		        },	
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
        },
        {
            name: 'Lokalhistoriewiki',
            provider: 'Lokalhistoriewiki',
            dataset: {
                api: 'lokalhistoriewiki'
            },
            style: {thumbnail: true},
            minZoom: 13,
        }
    ];

	var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/havardgj.9013e600/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGF2YXJkZ2oiLCJhIjoiQTlGM3A3NCJ9.fDQKmxi1WcYfBUWm0cQrGg');

    KR.setupMap(api, datasets, {
        title: title,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/TrondheimNidelva-improved.jpg/640px-TrondheimNidelva-improved.jpg',
        description: $('#description_template').html(),
        line: 'http://crossorigin.me/http://knreise.no/demonstratorer/demonstratorer/nidelva.kml',
        buffer: 0.5,
        layer: layer,
        maxZoom: 18,
        minZoom: 12
    });

    
}());
