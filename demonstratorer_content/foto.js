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
            name: 'Digitalt museum',
            dataset: {dataset: 'DiMu', api: 'norvegiana', query: 'abm_type_text:StillImage'},
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            noListThreshold: Infinity,
            isStatic: false,
            style: {thumbnail: true}
        },
        {
            name: 'Riksarkivet',
            provider: 'Riksarkivet',
            dataset: {
                    api: 'flickr',
                    user_id: 'national_archives_of_norway',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        },
        {
            name: 'Nasjonalbiblioteket',
            provider: 'Nasjonalbiblioteket',
            dataset: {
                    api: 'flickr',
                    user_id: 'national_library_of_norway',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        },
        {
            name: 'Trondheim byarkiv',
            dataset_name_override: 'Trondheim byarkiv',
            provider: 'Trondheim byarkiv',
            dataset:  {
                api: 'flickr',
                user_id: 'trondheim_byarkiv',
                accuracy: 10 //street level
            },
            template: KR.Util.getDatasetTemplate('flickr'),
        },
        {
            name: 'Oslo Byarkiv',
            provider: 'Oslo Byarkiv',
            dataset: {
                    api: 'flickr',
                    user_id: 'byarkiv',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        },
        {
            name: 'Vestfoldmuseene',
            provider: 'Vestfoldmuseene',
            dataset: {
                    api: 'flickr',
                    user_id: 'vestfoldmuseene',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
            isStatic: false
        },
        {
            name: 'Fylkesarkivet i Sogn og Fjordane',
            provider: 'Fylkesarkivet i Sogn og Fjordane',
            dataset: {
                api: 'norvegiana',
                dataset: 'Foto-SF'
            },
            isStatic: false,
            bbox: false,
            template: KR.Util.getDatasetTemplate('foto_sf')
        },
        {
            name: 'Arkiv i Nordland',
            provider: 'Arkiv i Nordland',
            dataset: {
                    api: 'flickr',
                    user_id: 'arkivinordland',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        },
        {
            name: 'NVE',
            provider: 'NVE',
            dataset: {
                    api: 'flickr',
                    user_id: 'nve',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        }
    ];

    KR.setupMap(api, datasets, {
        title: title,
        image: 'http://dms09.dimu.org/image/022s7YYpfm9v?dimension=600x380',
        description: $('#description_template').html(),
        bbox: '4.0223174095,57.6773017445,30.9705657959,71.4034238089',
        layer: 'norges_grunnkart',
        maxZoom: 18,
        minZoom: 5
    });

    
}());