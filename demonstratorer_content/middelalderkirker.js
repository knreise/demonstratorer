(function () {
    'use strict';

    var sparqlQuery = 'select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) (SAMPLE(?area) as ?area) ?link ?linkid ?picturelabel ?picturedescription ?picturelicence {' +
		' ?id a ?type ;' +
		' rdfs:label ?name ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ;' +
		' <https://data.kulturminne.no/askeladden/schema/ansvarligorganisasjon> ?org ;' +
		' <https://data.kulturminne.no/askeladden/schema/kommune> ?kommune  ;' +
		' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
		' optional {?id <https://data.kulturminne.no/askeladden/schema/geo/area/wgs84> ?area .}' +
		' optional { ?id <https://data.kulturminne.no/askeladden/schema/ksok> ?description .}' +
		' optional { ?loccat rdfs:label ?loccatlabel .}' +
		' optional {  ?locart rdfs:label ?locartlabel .}' +
		' optional {   ?org rdfs:label ?orglabel .}' +
		' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
		' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?link)' +
		' optional {' +
		' {select sample(?picture) as ?picture ?id where {' +
        '     {?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?id}' +
        '      union' +
        '      {?ide <https://data.kulturminne.no/askeladden/schema/lokalitet> ?id .' +
        '     ?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?ide}' +
        '      }}' +
        ' optional {?picture <http://schema.org/url> ?imglink .}' +
        ' optional {?picture rdfs:label ?picturelabel .}' +
        ' optional {?picture dc:description ?picturedescription .}' +    
        ' optional {?picture <http://purl.org/dc/terms/license> ?picturelicence .}' +
        ' BIND(strafter(STR(?imglink), "URN") AS ?linkid)' +
        ' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=5000&ar=5001&sr=URN", ?linkid) AS ?img)' +
        ' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=120&ar=5001&sr=URN", ?linkid) AS ?thumbnail)' +
        
		'   }' +
		' ?enk <https://data.kulturminne.no/askeladden/schema/lokalitet> ?id;' +
		'      <https://data.kulturminne.no/askeladden/schema/enkeltminneart> <https://data.kulturminne.no/askeladden/enkeltminneart/10132> ;' +
		'         <https://data.kulturminne.no/askeladden/schema/datering> ?datering;' +
		'         <https://data.kulturminne.no/askeladden/schema/vernetype> <https://data.kulturminne.no/askeladden/vernetype/AUT>' +
		' filter(?datering in (<https://data.kulturminne.no/askeladden/datering/050>,<https://data.kulturminne.no/askeladden/datering/051>,<https://data.kulturminne.no/askeladden/datering/052>,<https://data.kulturminne.no/askeladden/datering/053>))' +
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
            minZoom: 5,
        }            
    ];

var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw')

    KR.setupMap(api, datasets, {
        bbox: '-3.33984375,53.64463782485651,37.6171875,75.0956327285438',
        title: title,
        image: 'http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=:NBN:no-RAKV_arkiv_D9D86C086BAD4071%208FF619C9AC9332F0',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 5,
        layer: layer
    });
}());
