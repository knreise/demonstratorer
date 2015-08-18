(function () {
    'use strict';

    //The datasets in use
    var datasets = [
        {
            thumbnails: true,
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            template: KR.Util.getDatasetTemplate('digitalt_fortalt')
        },
        {
            name: 'Kulturminner',
            dataset_name_override: 'Kulturminnesok',
            dataset: {
                api: 'norvegiana',
                dataset: 'Kulturminnesok',
                query: '-delving_title:Fangstlokalitet'
            },
            template: KR.Util.getDatasetTemplate('kulturminne'),
            smallMarker: true
        },
        {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia'
            },
            template: KR.Util.getDatasetTemplate('wikipedia'),
            style: {template: true},
            minZoom: 13
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
            name: 'Riksantikvaren',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: '1601'
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            bbox: false,
            style: {fillcolor: '#728224'}
        },
        {
            name: 'MUSIT',
            dataset: {
                api: 'norvegiana',
                dataset: 'MUSIT'
            },
            template: KR.Util.getDatasetTemplate('musit'),
            minZoom: 12,
            style: {thumbnail: true}
        },
        {
            name: 'DiMu',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            minZoom: 12,
            style: {thumbnail: true}
        }
    ];

    //set up an instance of the Norvegiana API
    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });


    var bbox = '10.338650,63.408816,10.555458,63.462016';
    KR.setupMap(api, datasets, {
        bbox: bbox,
        title: title,
        image: image,
        description: $('#description_template').html()
    });
}());