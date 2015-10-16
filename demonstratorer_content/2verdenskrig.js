(function () {
    'use strict';
    

    var diFoTopics = ['krig', 'andre-verdskrigen', 'krigsminne', 'andre-verdenskrig', 'ww2', 'krigsminneforteljingar', 'krigen', 'krigsminnelandskap-troms', 'krigsminner', 'ww2-nord', 'ww2-troms', 'krigshistorie', 'krigsminneprosjekt-sør-troms', 'verdenskrig', '2.-verdenskrig', '2.-verdenskrigen'];

    diFoTopics = _.map(diFoTopics, function(t) {return 'dc_subject_text:' + t;});

    var sparqlQuery = ' select distinct ?id ?name ?description ?loccatlabel ?img (SAMPLE(?point) as ?point)  {' +
        ' ?id a ?type ;' +
        '    rdfs:label ?name ;' +
        ' <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description ;' +
        ' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
        ' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
        ' ?loccat rdfs:label ?loccatlabel .' +
        ' FILTER regex(?description, "#andreverdenskrig", "i" )' +
        ' optional {' +
        ' ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
        ' ?picture <https://data.kulturminne.no/schema/source-link> ?link' +
        ' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
        ' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?lokid) AS ?img)' +
        '    }' +
        ' }';


    var api = new KR.API({
        jernbanemuseet: {
            apikey: '336a8e06-78d9-4d2c-84c9-ac4fab6e8871'
        },
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    //The datasets in use
    var datasets = [
        {
            name: 'Digitalt fortalt',
            dataset: {
                dataset: 'difo',
                api: 'norvegiana',
                query: diFoTopics
            },
            cluster: true,
            template: KR.Util.getDatasetTemplate('digitalt_fortalt'),
            noListThreshold: Infinity,
            isStatic: true,
            bbox: false,
            feedbackForm: true
        },
        {
            id: 'jernbane',
            dataset: {
                api: 'jernbanemuseet',
                presentation: 732
            },
            provider: 'Jernbanemuseet',
            name: 'Jernbanemuseet',
            template: KR.Util.getDatasetTemplate('jernbanemuseet'),
            getFeatureData: function (feature, callback) {
                api.getItem(
                    {api: 'jernbanemuseet', id:  feature.properties.id, group: 264},
                    callback
                );
            },
            isStatic: true,
            bbox: false
        },
        {
            id: 'riksantikvaren',
            name: 'Riksantikvaren',
            hideFromGenerator: true,
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                sparqlQuery: sparqlQuery
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            bbox: false,
            isStatic: true,
            init: kulturminneFunctions.initKulturminnePoly,
            loadWhenLessThan: {
                count: 5,
                callback: kulturminneFunctions.loadKulturminnePoly
            }
        },
        {
            provider: 'Riksantikvaren',
            name: 'Kulturminnesøk - brukerregistrering',
            dataset: {
                api: 'kulturminnedata',
                layer: 2,
                query: "Beskrivelse LIKE '%#andreverdenskrig%'"
            },
            template: KR.Util.getDatasetTemplate('brukerminne'),
        },
        {
            grouped: true,
            name: 'Wikipedia',
            datasets: [
	        {
	            name: 'Wikipedia',
	            provider: 'Wikipedia',
	            dataset: {
	                api: 'wikipedia',
	                category: 'Kulturminner_i_Norge_fra_andre_verdenskrig'
	            },
	            template: KR.Util.getDatasetTemplate('wikipedia'),
	            style: {template: true},
	            bbox: false,
	            isStatic: true,
	            getFeatureData: function (feature, callback) {
	                api.getItem(
	                    {api: 'wikipedia', id: feature.properties.id},
	                    callback
	                );
	            }
	        },
	        {
	            name: 'Wikipedia',
	            provider: 'Wikipedia',
	            dataset: {
	                api: 'wikipedia',
	                category: 'Fort_i_Norge_fra_andre_verdenskrig'
	            },
	            template: KR.Util.getDatasetTemplate('wikipedia'),
	            style: {template: true},
	            bbox: false,
	            isStatic: true,
	            getFeatureData: function (feature, callback) {
	                api.getItem(
	                    {api: 'wikipedia', id: feature.properties.id},
	                    callback
	                );
	            }
	        },
	        {
	            name: 'Wikipedia',
	            provider: 'Wikipedia',
	            dataset: {
	                api: 'wikipedia',
	                category: 'Norge_under_andre_verdenskrig'
	            },
	            template: KR.Util.getDatasetTemplate('wikipedia'),
	            style: {template: true},
	            bbox: false,
	            isStatic: true,
	            getFeatureData: function (feature, callback) {
	                api.getItem(
	                    {api: 'wikipedia', id: feature.properties.id},
	                    callback
	                );
	            }
	        }
	        ]
	    },
        {
            name: 'Digitalt Museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu',
                query: 'dc_subject_facet:Krig'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            isStatic: true,
            thumbnails: true,
            bbox: true
        },
           {
            name: 'Arkiv i Nordland',
            provider: 'Arkiv i Nordland',
            dataset: {
                    api: 'flickr',
                    user_id: 'arkivinordland',
                    accuracy: '10'
                },
            template: KR.Util.getDatasetTemplate('flickr'),
            style: {thumbnail: true},
            minZoom: 8,
        }
            ];

    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');

    KR.setupMap(api, datasets, {
        bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',
        title: title,
        image: image,
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        layer: layer
    });
}());
