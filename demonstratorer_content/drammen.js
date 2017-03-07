(function () {
    'use strict';

    var api = new KR.API();

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    var kommune = '0602';

    //The datasets in use
    var datasets = [
        /*{
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia',
                category: 'Kulturminner_i_Drammen'
            },
            template: KR.Util.getDatasetTemplate('wikipedia'),
            style: {thumbnail: true},
            bbox: false,
            isStatic: true,
            getFeatureData: function (feature, callback) {
                api.getItem(
                    {api: 'wikipedia', id: feature.properties.id},
                    callback
                );
            }
        },*/
                {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia',
                 category: 'Kulturminner_i_Drammen'
            },
            style: {thumbnail: true},

            template: KR.Util.getDatasetTemplate('wikipedia')
        },
                {
            name: 'Lokalhistoriewiki',
            provider: 'Lokalhistoriewiki',
            dataset: {
                api: 'lokalhistoriewiki'
            },
            style: {thumbnail: true}
        }

    ];
    

    KR.setupMap(api, datasets, {
        komm: kommune,
        title: title,
        image: image,
        geomFilter: true,
        layer: 'norges_grunnkart',
        description: $('#description_template').html()
    });
}());