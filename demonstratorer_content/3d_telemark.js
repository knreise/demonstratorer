(function () {
    'use strict';
	
    var fylke = '8';

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);


    //The datasets in use
    var datasets = [

		{
            name: 'Kulturminner - 3D',
            hideFromGenerator: true,
            provider: 'Sketchfab - Telemark Fylkeskommune',
            dataset: {
                api: 'cartodb',
                table: 'table_3d_telemark',
                columns: ['the_geom', 'content', 'license', 'link', 'modelid', 'name', 'title'],
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('3d_sketchfab'),
            style: {
	            thumbnail: false,
	            fillcolor: '#744700'
	            },
            description: '3D-modeller av kulturminner i Telemark'
        },
        {
            grouped: true,
            name: 'Kulturminner',
            style: {
                fillcolor: '#eebc0a',
                circle: false,
                thumbnail: true
            },
            datasets: [
		                {
		            thumbnails: true,
		            name: 'Kulturminnesøk',
		            provider: 'Riksantikvaren',
		            dataset: {
		                api: 'kulturminnedataSparql',
		                fylke: fylke
		            },
		            template: KR.Util.getDatasetTemplate('ra_sparql'),
		            getFeatureData: kulturminneFunctions.getRaFeatureData,
		            bbox: false,
		            isStatic: true,
		            unclusterCount: 20,
		            init: kulturminneFunctions.initKulturminnePoly,
		        },
				{
		            name: '3D Telemark',
		            hideFromGenerator: true,
		            provider: 'Sketchfab - Telemark Fylkeskommune',
		            dataset: {
		                api: 'cartodb',
		                table: 'table_3d_telemark',
		                columns: ['the_geom', 'content', 'license', 'link', 'modelid', 'name', 'title'],
		            },
		            bbox: false,
		            isStatic: false,
		            template: KR.Util.getDatasetTemplate('3d_sketchfab'),
		            style: {
			            thumbnail: false,
			            fillcolor: '#744700'
			            },
		            description: '3D-modeller av kulturminner i Telemark'
		        },
                    ],
            description: 'Kulturminner'
        }        
    ];


    KR.setupMap(api, datasets, {
        bbox: '2.4609375,56.9449741808516,16.69921875,65.73062649311031',
        title: title,
        image: 'http://knreise.no/demonstratorer/common/img/heddal_3D.png',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
    });
}());
