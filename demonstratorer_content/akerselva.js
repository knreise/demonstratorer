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
                    template: KR.Util.getDatasetTemplate('digitalt_museum'),
                    style: {fillcolor: '#333333'}
                },
                {
		            name: 'Riksantikvaren',
		            provider: 'Riksantikvaren',
		            dataset: {
		                api: 'kulturminnedataSparql',
		                kommune: '1601'
		            },
                    getFeatureData: kulturminneFunctions.getRaFeatureData,
		            template: KR.Util.getDatasetTemplate('ra_sparql'),
		            bbox: false,
		            style: {fillcolor: '#728224'}
		        },	
        	],
            isStatic: false,
            style: {thumbnail: true},
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
        },
        {
            name: 'Oslo Byarkiv',
            provider: 'Oslo Byarkiv',
            dataset: {
                    api: 'flickr',
                    user_id: 'byarkiv'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 13,
        }
    ];

	var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/havardgj.9013e600/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGF2YXJkZ2oiLCJhIjoiQTlGM3A3NCJ9.fDQKmxi1WcYfBUWm0cQrGg');

    KR.setupMap(api, datasets, {
        title: title,
        image: 'http://dms08.dimu.org/image/03VVkE6ET9?dimension=600x380',
        description: $('#description_template').html(),
        bbox: '10.749607086181639,59.91590263019011,10.759949684143066,59.922355662817154',
        layer: layer,
        maxZoom: 18,
        minZoom: 12
    });

    
}());
