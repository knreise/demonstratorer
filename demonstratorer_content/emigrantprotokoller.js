(function () {
    'use strict';
    


    //The datasets in use
    var datasets = [
    		{
            name: 'Emigrantprotokollene',
            hideFromGenerator: true,
            provider: 'Arkivverket',
            dataset: {
                api: 'cartodb',
                table: 'kartfestede_emigranter_utdrag',
                columns: ['the_geom', 'avreisehavn', 'da_id', 'foedt', 'navn as title', 'utreisedato']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('emigrantprotokoller'),
            style: {
	            thumbnail: false,
	            fillcolor: '#FF0000'
	            },
            description: 'Emigrantprotokoller'
        }
    ];
    
    /*var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');*/
	var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 
	


    KR.setupMap(null, datasets, {
        title: title,
        bbox: true,
        /*bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',*/
        /*bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',*/
        image: 'http://dms06.dimu.org/image/012uPX38NR6w?dimension=1200x1200',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ff0000',
        maxZoom: 2,
        minZoom: 6,
        showScaleBar: true,
        layer: layer
    });
}());
