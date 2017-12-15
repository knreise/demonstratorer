(function () {
    'use strict';
    
 \
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
	            fillcolor: '#FFFFFF'
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
	            fillcolor: '#ffd700'
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
	            fillcolor: '#990000'
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
	            fillcolor: '#a93d3d'
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
	            fillcolor: '#c6e2ff'
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
	            fillcolor: '#c39797'
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
	            fillcolor: '#4bae56'
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
	            fillcolor: '#ff7f50'
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
	            fillcolor: '#660066'
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
	            fillcolor: '#4bae56'
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
	            fillcolor: '#4bae56'
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
	            fillcolor: '#c6e2ff'
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
	            fillcolor: '#B00B1E'
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
	            fillcolor: '#ff7373'
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
	            fillcolor: '#00ff7f'
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
	            fillcolor: '#cbbeb5'
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
	            fillcolor: '#ffff00'
	            },
            description: 'Europeana 280'
        },
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
        }        
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
