(function () {
    'use strict';

    //set up an instance of the Norvegiana API
    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    //The datasets in use
    var datasets = [
        'difo',
        /*{
            name: 'Kulturminner',
            dataset_name_override: 'Kulturminnesok',
            dataset: {
                api: 'norvegiana',
                dataset: 'Kulturminnesok',
                query: '-delving_title:Fangstlokalitet'
            },
            template: KR.Util.getDatasetTemplate('kulturminne'),
            smallMarker: true
        },*/
        'wikipedia',
        'trondheimbyarkiv',
        'riksantikvaren',
        'musit',
        'dimu'
    ];



    window.setupMap(api, datasets, {
        bbox: '10.338650,63.408816,10.555458,63.462016',
        title: title,
        image: image,
        showScaleBar: true,
        description: $('#description_template').html()
    });
}());