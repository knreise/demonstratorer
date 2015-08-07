(function () {
    'use strict';

    var fylke = '8';

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    //The datasets in use
    var datasets = [
        {
            thumbnails: true,
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            template: KR.Util.getDatasetTemplate('digitalt_fortalt')
        },
        {
            thumbnails: true,
            name: 'Kulturminnesøk',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
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
            thumbnails: true,
            name: 'Universitetsmuseene (Musit)',
            dataset: {
                api: 'norvegiana',
                dataset: 'MUSIT'
            },
            template: KR.Util.getDatasetTemplate('musit'),
            minZoom: 12,
            style: {thumbnail: true}
        },
        {
            thumbnails: true,
            name: 'Digitalt Museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            minZoom: 12,
            style: {thumbnail: true}
        },
        {
            thumbnails: true,
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
            name: 'Brukeropprettetminne',
            dataset: {
                api: 'kulturminnedata',
                layer: 2
            },
            template: KR.Util.getDatasetTemplate('brukerminne'),
        }


        /*,

        
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
        */

    ];


    KR.setupMap(api, datasets, {
        fylke: fylke,
        geomFilter: true,
        showGeom: true,
        title: title,
        image: image,
        description: $('#description_template').html()
    });
}());