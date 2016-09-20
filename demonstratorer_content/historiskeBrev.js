(function () {
    'use strict';
    
    var api = new KR.API();    

    //The datasets in use
    var datasets = [
    		{
            name: 'Henrik Ibsens skrifter',
            hideFromGenerator: true,
            provider: 'Henrik Ibsens skrifter',
            dataset: {
                api: 'cartodb',
                table: 'ibsencartodb',
                columns: ['the_geom', 'title', 'thumbnail', 'image', 'institution', 'license', 'source', 'avsender', 'mottaker', 'date', 'kortinfo', 'sted', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('historiskeBrev'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FFFFFF'
	            },
            description: 'Historiske brev'
        }
    ];
    
    /*var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');*/
	var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 
	


    KR.setupMap(api, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        /*bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',*/
        image: 'http://www.dokpro.uio.no/litteratur/ibsen/ms/brev/eiere/nbo/300dpi/b7204201.jpg?vei=gjennomtolower',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 4,
        layer: layer
    });
}());
