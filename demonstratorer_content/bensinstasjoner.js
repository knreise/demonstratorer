(function () {
    'use strict';
	
    var api = new KR.API();


    //The datasets in use
    var datasets = [

        {
            name: 'Arkivverket',
            hideFromGenerator: true,
            provider: 'Riksarkivet',
            dataset: {
                api: 'cartodb',
                table: 'bensinstasjoner',
                columns: ['the_geom', 'content', 'images', 'images as image', 'title', 'thumbnail', 'owner', 'url'],
            },
            bbox: false,
            isStatic: false,
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Bensinstasjoner',
            template: KR.Util.getDatasetTemplate('bensinstasjoner')
        }
        
     ];	 
	 

    KR.setupMap(api, datasets, {
        bbox: '2.4609375,56.9449741808516,33.3984375,71.85622888185527',
        title: title,
        image: 'http://knreise.no/img/riksarkivet/SAS2009-10-1643.jpg',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 5,
    });
}());




