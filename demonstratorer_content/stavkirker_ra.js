(function () {
    'use strict';


    var sparqlQuery = ' select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) (SAMPLE(?area) as ?area) ?link ?picturelabel ?picturedescription ?picturelicence {' +
		' ?id a ?type ;' +
		'      rdfs:label ?name ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
		' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ;' +
		' <https://data.kulturminne.no/askeladden/schema/ansvarligorganisasjon> ?org ;' +
		' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
		' optional {?id <https://data.kulturminne.no/askeladden/schema/geo/area/wgs84> ?area .}' +
		' optional { ?id <https://data.kulturminne.no/askeladden/schema/ksok> ?description .}' +
		' optional { ?loccat rdfs:label ?loccatlabel .}' +
		' optional { ?locart rdfs:label ?locartlabel .}' +
		' optional { ?org rdfs:label ?orglabel .}' +
		' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
		' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?link)' +
		' optional {' +
		' {select SAMPLE(?picture) as ?picture ?id where {' +
        '     {?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?id}' +
        '      union' +
        '      {?ide <https://data.kulturminne.no/askeladden/schema/lokalitet> ?id .' +
        '     ?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?ide}' +
        '      }}' +

        ' ?picture <http://schema.org/url> ?imglink .' +
        ' ?picture rdfs:label ?picturelabel .' +
        ' optional {?picture dc:description ?picturedescription .}' +    
        ' ?picture <http://purl.org/dc/terms/license> ?picturelicence .' +
        ' BIND(strafter(STR(?imglink), "URN") AS ?linkid)' +
        ' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=5000&ar=5001&sr=URN", ?linkid) AS ?img)' +
        ' BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=120&ar=5001&sr=URN", ?linkid) AS ?thumbnail)' +
		'   }' +
		' ?enk <https://data.kulturminne.no/askeladden/schema/lokalitet> ?id;' +
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
            thumbnail: true
        }            
    ];


    KR.setupMap(api, datasets, {
        bbox: '2.4609375,56.9449741808516,16.69921875,65.73062649311031',
        title: title,
        layer: "norges_grunnkart_graatone",
        image: 'http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=5000&ar=5001&sr=URN:NBN:no-RAKV_arkiv_6835417DEC7A4ADB',
        /*image: 'http://www.knreise.no/img/riksantikvaren/T248_01_0286.jpg',*/
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6
    });
}());
