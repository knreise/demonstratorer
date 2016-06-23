(function () {
    'use strict';
    
    var api = new KR.API();    

    //The datasets in use
    var datasets = [
		{
            name: 'Norway',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Norway',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_norway',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Sweden',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Sweden',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_sweden',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Europeana 280'
        }
    ];
    
    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');


    KR.setupMap(api, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        /*bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',*/
        image: 'http://knreise.no/img/T037_01_0001.jpg',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 5,
        layer: layer
    });
}());
