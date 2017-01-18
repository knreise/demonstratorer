(function () {
    'use strict';


    var sparqlQuery = ' select distinct ?id ?name { ' +
' 	?id a ?type ;  ' +
	' rdfs:label ?name ; ' + 
	' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ; ' +
	' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ; ' +
	' <https://data.kulturminne.no/askeladden/schema/ansvarligorganisasjon> ?org ; ' + 
	' <https://data.kulturminne.no/askeladden/schema/kommune> ?kommune ; ' +
	' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point . ' + 
	' optional { ?id <https://data.kulturminne.no/askeladden/schema/ksok> ?description .} ' +
	' optional { ?loccat rdfs:label ?loccatlabel .} ' +
	' optional { ?locart rdfs:label ?locartlabel .} ' +
	' optional { ?org rdfs:label ?orglabel .} ' +
	' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid) ' +
	' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url) ' +
	' optional { ' +
	' 	{select sample(?picture) as ?picture ?id where {?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?id}} ' +
	' 	?picture <https://data.kulturminne.no/bildearkivet/schema/askeladdenid> ?id . ' +
	' 	?picture <http://schema.org/url> ?link . ' +
	' 	?picture rdfs:label ?picturelabel . ' +
	' 	optional {?picture dc:description ?picturedescription .}     ' +
	' 	?picture <http://purl.org/dc/terms/license> ?picturelicence . ' +
	' 	BIND(strafter(STR(?link), "URN") AS ?linkid) ' +
	' 	BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=5000&ar=5001&sr=URN", ?linkid) AS ?img) ' +
	' 	BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?sz=120&ar=5001&sr=URN", ?linkid) AS ?thumbnail) ' +
	' } ' +
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
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Drammen_torg_-_no-nb_digifoto_20160715_00087_NB_MIT_FNR_18530.jpg/640px-Drammen_torg_-_no-nb_digifoto_20160715_00087_NB_MIT_FNR_18530.jpg',
        /*image: 'http://www.knreise.no/img/riksantikvaren/T248_01_0286.jpg',*/
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 6
    });
}());
