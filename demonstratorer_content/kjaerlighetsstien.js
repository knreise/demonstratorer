(function () {
    'use strict';

    var api = new KR.API();

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {dataset: 'difo', api: 'norvegiana'},
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity
        },
        {
            name: 'Riksantikvaren',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: '0822'
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            bbox: false,
            isStatic: true,
            init: kulturminneFunctions.initKulturminnePoly,
            loadWhenLessThan: {
                count: 5,
                callback: kulturminneFunctions.loadKulturminnePoly
            }
        }
    ];


    var loveTrail = {
        api: 'cartodb',
        query: 'SELECT ST_AsGeoJSON(the_geom) as geom FROM kjaerlighetsstien_line'
    }

    function getLine (callback) {
        api.getData(loveTrail, function (geoJson)  {
            callback(geoJson);
        });
    }

    var options = {
        line: getLine,
        title: title,
        image: image,
        layer: 'topo2graatone',
        linecolor: '#292778',
        description: $('#description_template').html()
    };


    KR.setupMap(api, datasets, options, false);
}());
