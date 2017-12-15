(function () {
    'use strict';
    


    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    //The datasets in use
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {
                dataset: 'difo',
                api: 'norvegiana',
                query: 'dc_subject_text:jul'
            },
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity,
            isStatic: false,
            bbox: false,
            feedbackForm: true,
            style: {fillcolor: '#0a6f00'}
        },
        {
            name: 'Digitalt Museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu',
                query: 'dc_subject_facet:Jul'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            isStatic: false,
            bbox: true,
            style: {thumbnail: true, fillcolor: '#aa1000'}
        },
        {
            name: 'Riksarkivet',
            provider: 'Riksarkivet',
            dataset: {
                    api: 'flickr',
                    user_id: 'national_archives_of_norway',
                    tags: ['jul'],
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true, fillcolor: '#460073'},
            minZoom: 8,
        }
            ];

    var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png');

    var snowLayer = L.snowLayer('rgba(255, 255, 255, 1.0)');

    KR.setupMap(null, datasets, {
        bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',
        title: title,
        image: 'http://dms10.dimu.org/image/032uKXXfZSh3?dimension=600x380',
        description: $('#description_template').html(),
        geomFilter: false,
        showGeom: true,
        layer: layer,
        extraLayers: [snowLayer]
    });
}());
