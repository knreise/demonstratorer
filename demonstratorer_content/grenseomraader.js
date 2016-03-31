(function () {
    'use strict';
	
    var kommune = '0101';

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);


    //The datasets in use
    var datasets = [

		{
            name: 'Str&ouml;mstad',
            hideFromGenerator: true,
            provider: 'K-Samsok',
            dataset: {
                api: 'cartodb',
                table: 'k_samsok_stromstad',
                columns: ['the_geom', 'content', 'license', 'link', 'title', 'thumbnail'],
            },
            bbox: false,
            isStatic: false,
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Kulturminner i Strömstad kommune'
        },
        {
            id: 'riksantikvaren',
            name: 'Halden',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: kommune
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            bbox: false,
            isStatic: true,
            unclusterCount: 20,
            getFeatureData: kulturminneFunctions.getRaFeatureData,
            init: kulturminneFunctions.initKulturminnePoly,
            style: {
	            thumbnail: true,
	            fillcolor: '#012469'
	            }
        },
        {
            id: 'riksantikvaren',
            name: 'Hvaler',
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                kommune: '0111'
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            bbox: false,
            isStatic: true,
            unclusterCount: 20,
            getFeatureData: kulturminneFunctions.getRaFeatureData,
            init: kulturminneFunctions.initKulturminnePoly,
            style: {
	            thumbnail: true,
	            fillcolor: '#012469'
	            }
        }
    ];

	 var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');
	 
	 

    KR.setupMap(api, datasets, {
        bbox: '10.107421874999998,58.48220919993362,12.63427734375,59.64554025144323',
        title: title,
        image: 'http://dms09.dimu.org/image/032uL2dsjx7o?dimension=600x380',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
        layer: layer
    });
}());
