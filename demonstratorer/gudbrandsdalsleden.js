(function () {
    'use strict';

    var api = new KR.API({
        cartodb: {
            apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
            user: 'knreise'
        },
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
                api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
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
            name: 'Artsobservasjoner',
            dataset: {
                api: 'norvegiana',
                dataset: 'Artsdatabanken'
            },
            cluster: false
        },
        {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia'
            },
            style: {thumbnail: true},
            minZoom: 13,
            template: _.template($('#wikipedia_template').html())
        },
        {
            id: 'riksantikvaren',
            name: 'Riksantikvaren',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: '0511'
            },
            template: _.template($('#ra_sparql_template').html()),
            bbox: false,
            isStatic: true,
            init: kulturminneFunctions.initKulturminnePoly,
            loadWhenLessThan: {
                count: 5,
                callback: kulturminneFunctions.loadKulturminnePoly
            }
        },
        {
            name: 'Trondheim byarkiv',
            dataset_name_override: 'Trondheim byarkiv',
            provider: 'Trondheim byarkiv',
            dataset:  {
                api: 'flickr',
                user_id: 'trondheim_byarkiv'
            },
            template: _.template($('#flickr_template').html()),
            style: {fillcolor: '#D252B9'}
        }
    ];

    var options = {
        line: 'http://pilegrimsleden.no/assets/kml/gudbrands_062015_r.kml',
        title: title,
        description: $('#description_template').html(),
        buffer: 2,
        linecolor: '#000000'
    };


    KR.setupMap(api, datasets, options, false);
}());