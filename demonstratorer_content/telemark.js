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
            unclusterCount: 20,
            init: kulturminneFunctions.initKulturminnePoly,
        },
        {
            provider: 'Riksantikvaren',
            name: 'Kulturminnesøk - brukerregistrering',
            dataset: {
                api: 'kulturminnedata',
                layer: 2
            },
            template: KR.Util.getDatasetTemplate('brukerminne'),
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
            name: 'Lokalhistoriewiki',
            provider: 'Lokalhistoriewiki',
            dataset: {
                api: 'lokalhistoriewiki'
            },
            style: {thumbnail: true},
            minZoom: 13,
        },
        {
            name: 'Nasjonalbiblioteket',
            hideFromGenerator: true,
            provider: 'Nasjonalbiblioteket',
            dataset: {
                api: 'cartodb',
                table: 'bygdebok_telemark'
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('nasjonalbiblioteket'),
            style: {
	            thumbnail: false,
	            fillcolor: '#744700',
				circle: true,
				opacity: 0.8,
				radius: 20},
            description: 'Bygdebøker og lokalhistorie fra Nasjonalbibliotket'
        }


    ];


    KR.setupMap(api, datasets, {
        fylke: fylke,
        geomFilter: true,
        showGeom: true,
        title: title,
        image: image,
        description: $('#description_template').html(),
        maxZoom: 18,
        minZoom: 9
    });
}());