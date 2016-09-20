(function () {
    'use strict';
	

    var api = new KR.API();



    //The datasets in use
    var datasets = [

		{
            name: 'Turistveginfo',
            hideFromGenerator: true,
            provider: 'Nasjonale turistveger',
            dataset: {
                api: 'cartodb',
                table: 'turistvegtekst_orig',
                columns: ['the_geom', 'content', 'license', 'source', 'title', 'thumbnail', 'image', 'turistveg as institution']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('turistveger'),
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Informasjon om punkter langs turistvegene'
        },
		{
            name: 'Turistvegbilder',
            hideFromGenerator: true,
            provider: 'Statens vegvesen',
            dataset: {
                api: 'cartodb',
                table: 'turistvegbilder_orig',
                columns: ['the_geom', 'content', 'license', 'source', 'title', 'thumbnail', 'image', 'institution']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('turistveger'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ff0000'
	            },
            description: 'Bilder fra området omkring turistvegene'
        }
    ];

	 
	 
	 

    KR.setupMap(api, datasets, {
        title: title,
        bbox: '4.0223174095,57.6773017445,30.9705657959,71.4034238089',
        image: 'http://www.nasjonaleturistveger.no/en/_image/1334546/label/large.jpeg?_encoded=2f66666666666678302f30382f3b2934323031286874646977656c616373&_ts=154581ca950',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
        layer: 'norges_grunnkart'
    });
}());
