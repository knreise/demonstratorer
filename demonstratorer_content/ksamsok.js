(function () {
    'use strict';

    var api = new KR.API({
        ksamsok: {
            apikey: 'test' //TODO: get new api key
        }
    });

    var datasets = [
         {
            name: 'K-samsök',
            hideFromGenerator: true,
            provider: 'K-samsök',
            dataset: {
                api: 'ksamsok'
            },
            bbox: true,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('ksamsok'),
            style: {
                thumbnail: true,
                fillcolor: '#ff0000'
                },
            description: 'K-samsök - eksempel',
            getFeatureData: function (oldFeature, callback) {
                api.getItem({
                    api: 'ksamsok',
                    itemId: oldFeature.properties.itemId
                }, function (properties) {
                    oldFeature.properties = _.extend(oldFeature.properties, properties);
                    callback(oldFeature);
                });
            }
        }
    ];

    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 

    KR.setupMap(api, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        image: 'https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fqpl39c1v2bj3q67%2FNO_Munch_The_Scream_NG.M.00939.jpg%3Fraw%3D1&size=LARGE&type=IMAGE',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 4,
        layer: layer,
        showLayerList: true
    });
}());
