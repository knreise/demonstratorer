(function () {
    'use strict';
    
    var diFoTopics = ['kirke', 'kirker'];

    diFoTopics = _.map(diFoTopics, function(t) {return 'dc_subject_text:' + t;});    

    var sparqlQuery = ' select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) ?link ?linkid ?picturelabel ?picturedescription ?picturelicence {' +
		' ?id a ?type ;' +
		'   rdfs:label ?name ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ;' +
		' <https://data.kulturminne.no/askeladden/schema/AnsvarligOrganisasjon> ?org ;' +
		' <https://data.kulturminne.no/askeladden/schema/i-kommune> ?kommune  ;' +
		' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
		' optional { ?id <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description .}' +
		' optional { ?loccat rdfs:label ?loccatlabel .}' +
		' optional {  ?locart rdfs:label ?locartlabel .}' +
		' optional {   ?org rdfs:label ?orglabel .}' +
		' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
		' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?link)' +
		' optional {' +
		' {select sample(?picture) as ?picture ?id where {?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id}}' +
		' ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
		' ?picture <https://data.kulturminne.no/schema/source-link> ?imglink .' +
		' ?picture rdfs:label ?picturelabel .' +
		' ?picture dc:description ?picturedescription .' +
		' ?picture <https://data.kulturminne.no/bildearkivet/schema/license> ?picturelicence .' +
		' BIND(REPLACE(STR(?imglink), "http://kulturminnebilder.ra.no/fotoweb/default.fwx\\\\?search\\\\=", "") AS ?linkid)' +
		' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?img)' +
		' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?thumbnail)' +
		'   }' +
		' ?enk <https://data.kulturminne.no/askeladden/schema/i-lokalitet> ?id;' +
		'      <https://data.kulturminne.no/askeladden/schema/enkeltminneart> ?art ;' +
		'         <https://data.kulturminne.no/askeladden/schema/datering> ?datering;' +
		'         <https://data.kulturminne.no/askeladden/schema/vernetype> ?vernetype' +
		' filter(?datering in (<https://data.kulturminne.no/askeladden/datering/047>,<https://data.kulturminne.no/askeladden/datering/050>,<https://data.kulturminne.no/askeladden/datering/051>,<https://data.kulturminne.no/askeladden/datering/052>,<https://data.kulturminne.no/askeladden/datering/053>,<https://data.kulturminne.no/askeladden/datering/063>,<https://data.kulturminne.no/askeladden/datering/160>,<https://data.kulturminne.no/askeladden/datering/161>,<https://data.kulturminne.no/askeladden/datering/162>,<https://data.kulturminne.no/askeladden/datering/163>,<https://data.kulturminne.no/askeladden/datering/164>,<https://data.kulturminne.no/askeladden/datering/165>,<https://data.kulturminne.no/askeladden/datering/170>,<https://data.kulturminne.no/askeladden/datering/171>,<https://data.kulturminne.no/askeladden/datering/172>,<https://data.kulturminne.no/askeladden/datering/173>,<https://data.kulturminne.no/askeladden/datering/174>,<https://data.kulturminne.no/askeladden/datering/175>,<https://data.kulturminne.no/askeladden/datering/180>,<https://data.kulturminne.no/askeladden/datering/181>,<https://data.kulturminne.no/askeladden/datering/182>,<https://data.kulturminne.no/askeladden/datering/183>,<https://data.kulturminne.no/askeladden/datering/184>,<https://data.kulturminne.no/askeladden/datering/185>,<https://data.kulturminne.no/askeladden/datering/190>,<https://data.kulturminne.no/askeladden/datering/191>,<https://data.kulturminne.no/askeladden/datering/192>,<https://data.kulturminne.no/askeladden/datering/193>, <https://data.kulturminne.no/askeladden/datering/194>,<https://data.kulturminne.no/askeladden/datering/200>,<https://data.kulturminne.no/askeladden/datering/201>) and ?art in (<https://data.kulturminne.no/askeladden/enkeltminneart/10129>,<https://data.kulturminne.no/askeladden/enkeltminneart/10132>,<https://data.kulturminne.no/askeladden/enkeltminneart/10133>,<https://data.kulturminne.no/askeladden/enkeltminneart/10157>,<https://data.kulturminne.no/askeladden/enkeltminneart/20103>,<https://data.kulturminne.no/askeladden/enkeltminneart/2702>,<https://data.kulturminne.no/askeladden/enkeltminneart/2710>,<https://data.kulturminne.no/askeladden/enkeltminneart/2711>,<https://data.kulturminne.no/askeladden/enkeltminneart/2712>) and ?vernetype in (<https://data.kulturminne.no/askeladden/vernetype/AUT>,<https://data.kulturminne.no/askeladden/vernetype/VED>,<https://data.kulturminne.no/askeladden/vernetype/FOR>,<https://data.kulturminne.no/askeladden/vernetype/LIST>))' +
		' }';
		

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var kulturminneFunctions = KR.Config.getKulturminneFunctions(api);

    //The datasets in use
    var datasets = [
		{
            name: 'Kirker i Sverige',
            hideFromGenerator: true,
            provider: 'K-Samsok',
            dataset: {
                api: 'cartodb',
                table: 'k_samsok_kirker',
                columns: ['the_geom', 'content', 'license', 'source', 'title', 'thumbnail', 'images'],
            },
            bbox: false,
            isStatic: false,
            style: {
	            thumbnail: true,
	            fillcolor: '#fece0a'
	            },
            description: 'Kirker i Sverige'
        },    
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
            id: 'riksantikvaren',
            name: 'Riksantikvaren',
            hideFromGenerator: true,
            provider: 'Riksantikvaren',
            dataset: {
                api: 'kulturminnedataSparql',
                sparqlQuery: sparqlQuery
            },
            template: KR.Util.getDatasetTemplate('ra_sparql'),
            getFeatureData: kulturminneFunctions.getRaFeatureData,
            bbox: false,
            isStatic: false,
            unclusterCount: 10,
            init: kulturminneFunctions.initKulturminnePoly,
            style: {fillcolor: '#ddb522'},
            thumbnail: true,
            minZoom: 5,
        }

    ];
    
    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/atlefren.a9d766af/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXRsZWZyZW4iLCJhIjoiblVybXMyYyJ9.tFyswxpRSc5XPLeIzeR29A');


    KR.setupMap(api, datasets, {
        bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',
        title: title,
        image: 'http://knreise.no/img/T037_01_0001.jpg',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 5,
        layer: layer
    });
}());
