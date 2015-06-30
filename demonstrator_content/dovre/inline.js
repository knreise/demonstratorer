//The datasets in use
var datasets = [
    {
        dataset: {
            api: 'cartodb',
            table: 'pilegrimsleden_dovre',
            mapper: KR.API.mappers.pilegrimsleden_dovre
        },
        name: 'Pilegrimsleden',
        style: function (feature) {
            return {color: '#7570b3', clickable: false, opacity: 1, weight: 3};
        },
        bbox: false
    },
    {
        name: 'Digitalt fortalt',
        dataset: {dataset: 'difo', api: 'norvegiana'},
        cluster: true,
        template: _.template($('#digitalt_fortalt_template').html()),
        noListThreshold: Infinity
    },
    {
        name: 'Fangstlokaliteter',
        dataset_name_override: 'fangstlokaliteter',
        dataset: {
            api: 'norvegiana',
            dataset: 'Kulturminnesok',
            query: 'delving_title:Fangstlokalitet'
        },
        template: _.template($('#kulturminne_template').html()),
        style: {
            fillcolor: '#436978',
            circle: true
        },
        cluster: false,
        visible: true
    },
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
                template: _.template($('#musit_template').html())
            },
            {
                name: 'DiMu',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'DiMu'
                },
                template: _.template($('#digitalt_museum_template').html())
            },
            {
                name: 'Kulturminner',
                id: 'Kulturminnesok',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Kulturminnesok',
                    query: '-delving_title:Fangstlokalitet'
                },
                template: _.template($('#kulturminne_template').html())
            }
        ],
        isStatic: false,
        minZoom: 12
    },
    {
        name: 'Artsobservasjoner',
        dataset: {
            api: 'norvegiana',
            dataset: 'Artsdatabanken'
        },
        circle: {
            radius: 7,
            weight: 1,
            opacity: 1,
            fillcolor: KR.Util.colorForProvider('Artsdatabanken', 'hex'),
            fillOpacity: 0.4
        },
        cluster: false,
        minZoom: 14
    }
];

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

KR.setupMap(api, datasets, {
    komm: 511,
    title: 'Dovre',
    description: $('#description_template').html(),
    image: 'http://lorempixel.com/816/612/'
});
