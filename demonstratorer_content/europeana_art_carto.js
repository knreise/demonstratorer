(function () {
    'use strict';
    
    //The datasets in use
    var datasets = [
      
    	{
            name: 'Austria',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Austria',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_austria',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FF0099'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'Belgium',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Belgium',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_belgium',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#CCFF66'
	            },
            description: 'Europeana 280'
        }, 
		{
            name: 'Bulgaria',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Bulgaria',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_bulgaria',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor:  '#9933FF'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'Croatia',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Croatia',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_croatia',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#66CCFF'
	            },
            description: 'Europeana 280'
        },         
		{
            name: 'Cyprus',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Cyprus',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_cyprus',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#669999'
	            },
            description: 'Europeana 280'
        }, 
		{
            name: 'Czech Republic',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Czech Republic',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_czechrepublic',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ff9966'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Denmark',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Denmark',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_denmark',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FF99FF'
	            },
            description: 'Europeana 280'
        },  
        {
            name: 'Estonia',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Estonia',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_estonia',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#996600'
	            },
            description: 'Europeana 280'
        },           
        {
            name: 'Finland',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Finland',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_finland',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#0033FF'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'France',
            hideFromGenerator: true,
            provider: 'Europeana 280 - France',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_france',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#996699'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Germany',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Germany',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_germany',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#000000'
	            },
            description: 'Europeana 280'
        }, 
        {
            name: 'Greece',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Greece',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_greece',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#66CCFF'
	            },
            description: 'Europeana 280'
        },        
        {
            name: 'Hungary',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Hungary',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_hungary',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#99cc66'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'Ireland',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Ireland',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_ireland',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#CC6600'
	            },
            description: 'Europeana 280'
        }, 
        {
            name: 'Italy',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Italy',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_italy',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FF9966'
	            },
            description: 'Europeana 280'
        }, 
        {
            name: 'Latvia',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Latvia',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_latvia',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#CC3333'
	            },
            description: 'Europeana 280'
        },        
        {
            name: 'Lithuania',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Lithuania',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_lithuania',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#33CC33'
	            },
            description: 'Europeana 280'
        }, 
        {
            name: 'Luxembourg',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Luxembourg',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_luxembourg',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#66ff99'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Malta',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Malta',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_malta',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#99ff99'
	            },
            description: 'Europeana 280'
        },       
        {
            name: 'Netherlands',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Netherlands',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_netherlands',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#6699ff'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'Norway',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Norway',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_norway',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FF0000'
	            },
            description: 'Europeana 280'
        },
		{
            name: 'Poland',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Poland',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_poland',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FF9900'
	            },
            description: 'Europeana 280'
        },        
		{
            name: 'Portugal',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Portugal',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_portugal',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#006600'
	            },
            description: 'Europeana 280'
        },      
        {
            name: 'Romania',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Romania',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_romania',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ff3366'
	            },
            description: 'Europeana 280'
        },     
        {
            name: 'Slovakia',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Slovakia',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_slovakia',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ffff66'
	            },
            description: 'Europeana 280'
        },        
        {
            name: 'Slovenia',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Slovenia',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_slovenia',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#99ff99'
	            },
            description: 'Europeana 280'
        },        
        {
            name: 'Spain',
            hideFromGenerator: true,
            provider: 'Europeana 280 - Spain',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_spain',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ccff33'
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
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#FFFF00'
	            },
            description: 'Europeana 280'
        },
        {
            grouped: true,
            name: 'United Kingdom',
            datasets: [
        {
            name: 'England',
            hideFromGenerator: true,
            provider: 'Europeana 280 - UK (England)',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_england',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#ff3333'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Scotland',
            hideFromGenerator: true,
            provider: 'Europeana 280 - UK (Scotland)',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_scotland',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#6633ff'
	            },
            description: 'Europeana 280'
        },
        {
            name: 'Wales',
            hideFromGenerator: true,
            provider: 'Europeana 280 - UK (Wales)',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_wales',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#66cc66'
	            },
            description: 'Europeana 280'
        }                    
            ]
        }

        /* 
		{
            name: 'United Kingdom',
            hideFromGenerator: true,
            provider: 'Europeana 280 - United Kingdom',
            dataset: {
                api: 'cartodb',
                table: 'europeana280_uk',
                columns: ['the_geom', 'artist', 'country', 'engtitle', 'origtitle', 'origtitle as title', 'flagicon_l', 'flagicon_s', 'thumbnail', 'infopage as source', 'institution', 'image', 'type', 'type as content', 'license', 'year']
            },
            bbox: false,
            isStatic: false,
            template: KR.Util.getDatasetTemplate('europeana280'),
            style: {
	            thumbnail: true,
	            fillcolor: '#31698a'
	            },
            description: 'Europeana 280'
        } */        
    ];
    
    /*var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');*/
	var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 
	


    KR.setupMap(null, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        /*bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',*/
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
