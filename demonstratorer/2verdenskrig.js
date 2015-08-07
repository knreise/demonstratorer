(function () {
    'use strict';

    var topics = ['krig', 'andre-verdskrigen', 'krigsminne', 'andre-verdenskrig', 'ww2', 'krigsminneforteljingar', 'krigen', 'krigsminnelandskap-troms', 'krigsminner', 'ww2-nord', 'ww2-troms', 'krigshistorie', 'krigsminneprosjekt-sør-troms', 'verdenskrig', '2.-verdenskrig', '2.-verdenskrigen'];

    topics = _.map(topics, function(t) {return 'dc_subject_text:' + t;});

    //The datasets in use
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {
                dataset: 'difo',
                api: 'norvegiana',
                query: topics
            },
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity,
            isStatic: true,
            bbox: false
        }
    ];

    var api = new KR.API();

    KR.setupMap(api, datasets, {
        bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',
        title: title,
        image: image,
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true
    });
}());
