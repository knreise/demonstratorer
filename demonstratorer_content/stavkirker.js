(function () {
    'use strict';


    var sparqlQuery = ' select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) ?url ?link ?linkid ?picturelabel ?picturedescription ?picturelicence {' +
		' ?id a ?type ;' +
		'      rdfs:label ?name ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ;' +
		' <https://data.kulturminne.no/askeladden/schema/AnsvarligOrganisasjon> ?org ;' +
		' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
		' optional { ?id <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description .}' +
		' optional { ?loccat rdfs:label ?loccatlabel .}' +
		' optional { ?locart rdfs:label ?locartlabel .}' +
		' optional { ?org rdfs:label ?orglabel .}' +
		' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
		' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url)' +
		' optional {' +
		' {select sample(?picture) as ?picture ?id where {?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id}}' +
		' ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
		' ?picture <https://data.kulturminne.no/schema/source-link> ?link .' +
		' ?picture rdfs:label ?picturelabel .' +
		' ?picture dc:description ?picturedescription .' +
		' ?picture <https://data.kulturminne.no/bildearkivet/schema/license> ?picturelicence .' +
		' BIND(REPLACE(STR(?link), "http://kulturminnebilder.ra.no/fotoweb/default.fwx\\\\?search\\\\=", "") AS ?linkid)' +
		' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?img)' +
		' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?thumbnail)' +
		'   }' +
		' ?enk <https://data.kulturminne.no/askeladden/schema/i-lokalitet> ?id;' +
		'      <https://data.kulturminne.no/askeladden/schema/enkeltminneart> <https://data.kulturminne.no/askeladden/enkeltminneart/10157>;' +
		'      <https://data.kulturminne.no/askeladden/schema/vernetype> <https://data.kulturminne.no/askeladden/vernetype/AUT>' +
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
            minZoom: 7,
            thumbnails: true,
        },
        {
            name: 'Wikipedia',
            provider: 'Wikipedia',
            dataset: {
                api: 'wikipedia',
                category: 'Stavkirker'
            },
            template: KR.Util.getDatasetTemplate('wikipedia'),
            style: {template: true},
            style: {fillcolor: '#135992'},
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
            name: 'Digitalt Museum',
            dataset: {
                api: 'norvegiana',
                dataset: 'DiMu',
                query: 'dc_subject_facet:Stavkirker'
            },
            template: KR.Util.getDatasetTemplate('digitalt_museum'),
            isStatic: true,
            thumbnails: true,
            bbox: true,
            style: {fillcolor: '#882a28'}
        }
    ];


    KR.setupMap(api, datasets, {
        bbox: '2.4609375,56.9449741808516,16.69921875,65.73062649311031',
        title: title,
        image: 'http://knreise.no/demonstratorer/common/img/T284_01_0379.jpg',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6,
    });
}());
