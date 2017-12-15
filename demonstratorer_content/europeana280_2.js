(function () {
    'use strict';


    var colors = ['#ff7373', '#B00B1E', '#c6e2ff', '#4bae56', '#4bae56', '#660066', '#ff7f50', '#4bae56', '#000000', '#c39797', '#c6e2ff', '#a93d3d', '#990000', '#ffd700', '#FFFFFF', '#31698a', '#ffff00', '#cbbeb5', '#00ff7f'];
    var countries = ['Austria', 'Belgium', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Netherlands', 'Norway', 'Poland ', 'Portugal',  'Spain', 'Sweden', 'United Kingdom']

    var datasets = _.map(countries, function (country, i) {
        return {
            name: 'Europeana 280 ' + country,
            hideFromGenerator: true,
            provider: 'Europeana 280',
            dataset: {
                api: 'europeana',
                qf: '(PROVIDER:"Europeana 280") AND COUNTRY:"' + country.toLowerCase() + '"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: colors[i]
                },
            description: 'Europeana 280'
        };
    });

    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 

    KR.setupMap(null, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        image: 'https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fqpl39c1v2bj3q67%2FNO_Munch_The_Scream_NG.M.00939.jpg%3Fraw%3D1&size=LARGE&type=IMAGE',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 4,
        layer: layer
    });
}());
