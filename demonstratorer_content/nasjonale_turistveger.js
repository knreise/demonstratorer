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
    
        var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 
    

    var options = {
        title: title,
        bbox: "4.0223174095,57.6773017445,30.9705657959,71.4034238089",
        image: 'http://www.nasjonaleturistveger.no/en/_image/1334546/label/large.jpeg?_encoded=2f66666666666678302f30382f3b2934323031286874646977656c616373&_ts=154581ca950',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
        layer : layer,
        line: 'http://kulturminnedata.no/nvdb_utenz.geojson',
        buffer: 1,
        linecolor: '#FF0000' 
    };

    KR.setupMap(api, datasets, options, false);
    /*KR.setupMap(api, datasets, {
        title: title,
        image: 'http://www.nasjonaleturistveger.no/en/_image/1334546/label/large.jpeg?_encoded=2f66666666666678302f30382f3b2934323031286874646977656c616373&_ts=154581ca950',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
        layer: 'norges_grunnkart',
        line: 'http://pilegrimsleden.no/assets/kml/gudbrands_062015_d.kml',
        buffer: 1,
        linecolor: '#FF0000'       
    });*/ 
}());
