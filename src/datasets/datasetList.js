import {getDatasetTemplate} from '../util';

//norvegiana Datasets
var difo = {
    name: 'Digitalt fortalt',
    dataset: {dataset: 'difo', api: 'norvegiana'},
    template: 'digitalt_fortalt',
    noListThreshold: Infinity,
    description: 'Kulturrådets tjeneste for personlige fortellinger fra kulturinstitusjoner og privatpersoner.',
    allowTopic: true,
    feedbackForm: true,
    style: {
        fillcolor: '#F69730',
        circle: false,
        thumbnail: true
    }
};

var difo_krig = {
    name: 'Digitalt fortalt',
    dataset: {
        dataset: 'difo',
        api: 'norvegiana',
        query: ['dc_subject_text:krig', 'dc_subject_text:andre-verdskrigen', 'dc_subject_text:krigsminne', 'dc_subject_text:andre-verdenskrig', 'dc_subject_text:ww2', 'dc_subject_text:krigsminneforteljingar', 'dc_subject_text:krigen', 'dc_subject_text:krigsminnelandskap-troms', 'dc_subject_text:krigsminner', 'dc_subject_text:ww2-nord', 'dc_subject_text:ww2-troms', 'dc_subject_text:krigshistorie', 'dc_subject_text:krigsminneprosjekt-sør-troms', 'dc_subject_text:verdenskrig', 'dc_subject_text:2.-verdenskrig', 'dc_subject_text:2.-verdenskrigen']
    },
    cluster: true,
    template: 'digitalt_fortalt',
    noListThreshold: Infinity,
    isStatic: true,
    bbox: false,
    feedbackForm: true
};

var dimu = {
    name: 'Digitalt Museum',
    hideFromGenerator: false,
    provider: 'Digitalt Museum',
    dataset: {dataset: 'DiMu', api: 'norvegiana'},
    template: 'digitalt_museum',
    description: 'Alle stedfestede data fra Digitalt Museum',
    allowTopic: true,
    feedbackForm: true,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: true
    }
};

var dimufoto = {
    hideFromGenerator: true,
    dataset: {
        api: 'norvegiana',
        dataset: 'DiMu',
        query: 'europeana_type_facet:IMAGE'
    },
    template: 'digitalt_museum',
    //TODO: add style
    noListThreshold: Infinity
};

var dimu_stillimage = {
    name: 'Digitalt museum',
    dataset: {
        dataset: 'DiMu',
        api: 'norvegiana',
        query: 'abm_type_text:StillImage'
    },
    cluster: true,
    template: 'digitalt_museum',
    noListThreshold: Infinity,
    isStatic: false
    //TODO: add style
};

var dimu_kunst = {
    name: 'DiMu',
    dataset: {
        api: 'norvegiana',
        dataset: 'DiMu',
        query: 'dc_subject_facet:Kunst'
    },
    template: 'digitalt_museum',
    isStatic: false,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: false
    }
};

var dimu_not_kunst = {
    name: 'DiMu',
    dataset: {
        api: 'norvegiana',
        dataset: 'DiMu',
        query: '-dc_subject_facet:Kunst'
    },
    template: 'digitalt_museum',
    isStatic: false,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: false
    }
};

var dimu_krig = {
    name: 'Digitalt Museum',
    dataset: {
        api: 'norvegiana',
        dataset: 'DiMu',
        query: 'dc_subject_facet:Krig'
    },
    template: 'digitalt_museum',
    isStatic: true,
    bbox: true
    //TODO: add style
};


var musit = {
    name: 'Universitetsmuseene (Musit)',
    hideFromGenerator: false,
    provider: 'Universitetsmuseene',
    dataset: {dataset: 'MUSIT', api: 'norvegiana'},
    template: 'musit',
    description: 'Alle stedfestede data fra Universitetsmuseene',
    allowTopic: true,
    feedbackForm: true,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: true
    }
};

var kystreise = {
    name: 'Kystreise',
    hideFromGenerator: false,
    provider: 'Kystreise',
    dataset: {dataset: 'Kystreise', api: 'norvegiana'},
    //TODO: add style
    description: 'Alle stedfestede data fra Kystreise',
    allowTopic: true,
    feedbackForm: true
};

var artobs = {
    name: 'Artsobservasjoner',
    hideFromGenerator: true,
    dataset: {
        api: 'norvegiana',
        dataset: 'Artsdatabanken'
    },
    cluster: false,
    description: 'Artsobservasjoner fra Artsdatabanken',
    style: {
        circle: true,
        fillcolor: '#5B396B',
        weight: 1
    },
    minZoom: 14
};

var industrimuseum = {
    name: 'Industrimuseum',
    hideFromGenerator: false,
    provider: 'Industrimuseum',
    dataset: {dataset: 'Industrimuseum', api: 'norvegiana'},
    //TODO: add style
    description: 'Alle stedfestede data fra Industrimuseum',
    allowTopic: true,
    feedbackForm: true
};

var foto_sf = {
    dataset: {
        api: 'norvegiana',
        dataset: 'Foto-SF'
    },
    isStatic: false,
    bbox: false,
    //TODO: add style
    template: 'foto_sf'
};

//wikimedia-based
var wikipedia = {
    name: 'Wikipedia',
    provider: 'Wikipedia',
    dataset: {
        api: 'wikipedia'
    },
    minZoom: 13,
    template: 'wikipedia',
    description: 'Stedfestede artikler fra bokmålswikipedia',
    style: {
        fillcolor: '#D14020',
        thumbnail: true
    }
};

var wikipediaNN = {
    name: 'Wikipedia Nynorsk',
    provider: 'Wikipedia Nynorsk',
    dataset: {
        api: 'wikipediaNN'
    },
    minZoom: 13,
    template: 'wikipedia',
    description: 'Stedfestede artikler fra nynorskwikipedia',
    style: {
        fillcolor: '#D14020',
        thumbnail: true
    }
};

var lokalwiki = {
    id: 'lokalwiki',
    name: 'Lokalhistoriewiki',
    hideFromGenerator: false,
    provider: 'Lokalhistoriewiki',
    dataset: {
        api: 'lokalhistoriewiki'
    },
    //TODO: add style
    minZoom: 13,
    description: 'Stedfestede artikler fra lokalhistoriewiki.no'
};

//cartodb-based
var groruddalen = {
    name: 'Byantikvaren Oslo - Groruddalen',
    hideFromGenerator: true,
    provider: 'Byantikvaren i Oslo',
    dataset: {
        api: 'cartodb',
        table: 'byantikvaren_oslo_groruddalen'
    },
    bbox: false,

    //TODO: add style
    template: 'byantikvaren_oslo',
    description: 'Byantikvarens Groruddalsatlas'
};
var norgerundt = {
    name: 'Norge Rundt',
    hideFromGenerator: true,
    provider: 'NRK',
    dataset: {
        api: 'cartodb',
        table: 'nrk_norge_rundt'
    },
    bbox: false,
    //TODO: add style
    description: 'Stedfestede innslag fra Norge Rundt'
};

var arkivverket_bensinstasjoner = {
    name: 'Arkivverket',
    hideFromGenerator: true,
    provider: 'Riksarkivet',
    dataset: {
        api: 'cartodb',
        table: 'bensinstasjoner',
        columns: ['the_geom', 'content', 'images', 'images as image', 'title', 'thumbnail', 'owner', 'url']
    },
    bbox: false,
    isStatic: false,
    style: {
        thumbnail: true,
        fillcolor: '#fece0a'
    },
    description: 'Bensinstasjoner',
    template: 'bensinstasjoner'
};


var pilegrimsleden = {
    dataset: {
        api: 'cartodb',
        table: 'pilegrimsleden_dovre'
        //mapper: KR.API.mappers.pilegrimsleden_dovre
    },
    name: 'Pilegrimsleden',
    style: {
        fillcolor: '#7570b3',
        clickable: false,
        fillOpacity: 1,
        weight: 3
    },
    isStatic: true,
    bbox: false
};

var nasjonalbiblioteket_bygdebok = {
    name: 'Nasjonalbiblioteket, Bygdebøker',
    hideFromGenerator: true,
    provider: 'Nasjonalbiblioteket',
    dataset: {
        api: 'cartodb',
        table: 'bygdebok_telemark'
    },
    bbox: false,
    isStatic: false,
    template: 'nasjonalbiblioteket',
    style: {
        thumbnail: false,
        fillcolor: '#744700',
        circle: true,
        opacity: 0.8,
        radius: 20},
    description: 'Bygdebøker og lokalhistorie fra Nasjonalbibliotket'
};


//flicker datasets
var kulturminnesok_flickr = {
    name: 'Kulturminnesøk',
    dataset_name_override: 'Kulturminnesøk',
    provider: 'Kulturminnesøk Flickr',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        group_id: '1426230@N24'
    },
    template: 'flickr',
    isStatic: true,
    //TODO: add style
    description: 'Bilder fra Kulturminnesøks Flickr-gruppe'
};

var riksarkivet_flickr = {
    name: 'Riksarkivet',
    dataset_name_override: 'Riksarkivet',
    provider: 'Riksarkivet',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'national_archives_of_norway'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Riksarkivets Flickr-konto'
};

var nasjonalbiblioteket_flickr = {
    name: 'Nasjonalbiblioteket',
    dataset_name_override: 'Nasjonalbiblioteket',
    provider: 'Nasjonalbiblioteket',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'national_library_of_norway'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Nasjonalbibliotekets Flickr-konto'
};

var oslobyarkiv_flickr = {
    name: 'Oslo Byarkiv',
    dataset_name_override: 'Oslo Byarkiv',
    provider: 'Oslo Byarkiv',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'byarkiv'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Oslo byarkiv sin Flickr-konto'
};

var trondheimbyarkiv_flickr = {
    name: 'Trondheim byarkiv',

    provider: 'Trondheim byarkiv',
    dataset:  {
        api: 'flickr',
        user_id: 'trondheim_byarkiv'
    },
    template: 'flickr',
    style: {
        fillcolor: '#D252B9'
    }
};


var nasjonalmuseet_flickr = {
    name: 'Nasjonalmuseet',
    dataset_name_override: 'Nasjonalmuseet',
    provider: 'Nasjonalmuseet',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'nasjonalmuseet'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Nasjonalmuseet sin Flickr-konto'
};

var nve_flickr = {
    name: 'NVE',
    dataset_name_override: 'NVE',
    provider: 'NVE',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'nve',
        accuracy: '6'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra NVE Flickr-konto'
};

var vestfoldmuseene_flickr = {
    name: 'Vestfoldmuseene',
    dataset_name_override: 'Vestfoldmuseene',
    provider: 'Vestfoldmuseene',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'vestfoldmuseene',
        accuracy: '1'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Vestfoldmuseene sin Flickr-konto'
};

var perspektivet_flickr = {
    name: 'Perspektivet Museum',
    dataset_name_override: 'Perspektivet Museum',
    provider: 'Perspektivet Museum',
    hideFromGenerator: true,
    dataset: {
        api: 'flickr',
        user_id: 'perspektivetmuseum',
        accuracy: '1'
    },
    template: 'flickr',
    //TODO: add style
    description: 'Bilder fra Perspektivet Museum sin Flickr-konto'
};

var arkiv_nordland = {
    name: 'Arkiv i Nordland',
    provider: 'Arkiv i Nordland',
    dataset: {
            api: 'flickr',
            user_id: 'arkivinordland',
            accuracy: '10'
        },
    template: 'flickr',
    //TODO: add style
    minZoom: 8
};


//other datasets

var ra_lokalitet = {
    name: 'Kulturminner',
    provider: 'Riksantikvaren',
    template: 'kulturminne2',
    dataset: {
        api: 'kulturminne',
        dataset: 'lokaliteter'
    },
    //loadExtraData: true,
    polygonsAsPoints: true,
    loadSubLayer: true,
    sublayerConfig: {
        name: 'Enkeltminner',
        provider: 'Riksantikvaren',
        //loadExtraData: true,
        cluster: false,
        useCentroid: true,
        template: 'enkeltminne',
        style: {
            fillcolor: '#728224'
        },
        dataset: {
            api: 'kulturminne',
            dataset: 'enkeltminner'
        }
    },
    polygonsAsPointsPixelThreshold: 50,
    polygonsAsPointsZoomThreshold: 18,
    style: {
        fillcolor: '#728224'
    }
};

var ra_kulturmiljo = {
    name: 'Kulturmiljø',
    provider: 'Riksantikvaren',
    template: 'kulturmiljo',
    dataset: {
        api: 'kulturminne',
        dataset: 'kulturmiljoer'
    },
    loadExtraData: true,
    polygonsAsPoints: true,
    polygonsAsPointsPixelThreshold: 50,
    polygonsAsPointsZoomThreshold: 18,
    style: {
        fillcolor: '#0000cc'
    }
};


var kulturminner_arkeologisk = {
    id: 'riksantikvaren',
    name: 'Riksantikvaren',
    provider: 'Riksantikvaren',
    dataset: {
        filter: 'FILTER (!regex(?loccatlabel, "^Arkeologisk", "i"))',
        api: 'kulturminnedataSparql'
        //kommune: komm,
        //fylke: fylke
    },
    //getFeatureData: kulturminneFunctions.getRaFeatureData,
    template: 'ra_sparql',
    bbox: false,
    isStatic: false,
    unclusterCount: 20,
    //init: kulturminneFunctions.initKulturminnePoly,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: true
    }
};

var kulturminner_krig = {
    id: 'riksantikvaren',
    name: 'Riksantikvaren',
    hideFromGenerator: true,
    provider: 'Riksantikvaren',
    dataset: {
        api: 'kulturminnedataSparql',
        sparqlQuery: ' select distinct ?id ?name ?description ?loccatlabel ?img (SAMPLE(?point) as ?point)  {' +
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
        ' }'
    },
    template: 'ra_sparql',
    //getFeatureData: kulturminneFunctions.getRaFeatureData,
    bbox: false,
    isStatic: true,
    unclusterCount: 20,
    //init: kulturminneFunctions.initKulturminnePoly,
};

var brukerminner = {
    name: 'Kulturminnesøk - brukerregistreringer',
    hideFromGenerator: false,
    provider: 'Riksantikvaren',
    dataset: {
        api: 'kulturminnedata',
        layer: 2,
        getExtraData: true,
        extraDataLayer: 6,
        matchId: 'KulturminnesokID'
    },
    description: 'Brukerregistrerte data fra Riksantikvarens kulturminnesøk',
    template: 'brukerminne',
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: false
    }
};

var folketelling = {
    name: 'Folketelling 1910',
    provider: 'Folketelling 1910',
    dataset: {
        api: 'folketelling',
        dataset: 'property'
    },
    minZoom: 14,
    template: 'folketelling',
    //TODO: add style
    getFeatureData: function (oldFeature, callback) {

        console.error("NO API in datasets.js")
        callback();

        /*api.getData({
            api: 'folketelling',
            type: 'propertyData',
            propertyId: oldFeature.properties.efid
        }, function (feature) {
            oldFeature.properties = feature.properties;
            oldFeature.properties.provider = 'Folketelling 1910';
            callback(oldFeature);
        });
        */
    },
    mappings: {
        'title': 'gaardsnavn_gateadr'
    },
    noListThreshold: 0,
    description: 'Personer og eiendommer fra folketellingen 1910'
};

var verneomr = {
    id: 'verneomraader',
    dataset: {
        api: 'cartodb',
        table: 'naturvernomrader_utm33_2',
        columns: ['iid', 'omradenavn', 'vernef_id', 'verneform']
    },
    provider: 'Naturbase',
    name: 'Verneområder',
    style: {
        fillcolor: {
            'lookup': 'vernef_id',
            'cases': [
                {
                    'values': ['LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV', 'NM', 'BVV', 'PO', 'DO', 'D'],
                    'value': '#d8cb7a'
                },
                {
                    'values': ['NP', 'NPS'],
                    'value': '#7f9aac'
                },
                {
                    'values': ['NR', 'NRS'],
                    'value': '#ef9874'
                }
            ],
            'default': '#009300'
        },
        'bordercolor': {
            'lookup': 'vernef_id',
            'cases': [
                {
                    'values': ['LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV', 'NM', 'BVV', 'PO', 'DO', 'D'],
                    'value': '#9c8f1b'
                },
                {
                    'values': ['NP', 'NPS'],
                    'value': '#b3a721'
                },
                {
                    'values': ['NR', 'NRS'],
                    'value': '#ef9873'
                }
            ],
            'default': '#009300'
        },
        opacity: 0.8,
        fillOpacity: 0.4
    },
    template: 'verneomraader',
    loadExtraData: true,
    getItem: 'norvegiana_verneomr',
    toPoint: {
        showAlways: true,
        stopPolyClick: true,
        minSize: 20
    },
    minZoom: 10,
    cluster: false,
    description: 'Nasjonalparker og andre naturvernområder - ca. 2700 i hele landet.'
};

var jernbane = {
    id: 'jernbane',
    dataset: {
        api: 'jernbanemuseet'
    },
    provider: 'Jernbanemuseet',
    name: 'Jernbanemuseet',
    hideFromGenerator: true,
    template: getDatasetTemplate('jernbanemuseet'),
    //TODO: add style
    loadExtraData: true,
    getItem: 'jernbanemuseet',
    isStatic: true,
    bbox: false,
    description: 'Jernbanemuseet'
};

var jernbane_krig = {
    id: 'jernbane',
    dataset: {
        api: 'jernbanemuseet',
        presentation: 732
    },
    provider: 'Jernbanemuseet',
    name: 'Jernbanemuseet',
    template: 'jernbanemuseet',
    loadExtraData: true,
    getItem: 'jernbanemuseet_krig',
    isStatic: true,
    bbox: false
};


var fangstgroper = {
    provider: 'kulturminnedata',
    name: 'Fangstgroper',
    dataset: {
        query: 'Navn=\'Fangstgrop\'',
        layer: 0,
        api: 'kulturminnedata'
    },
    template: 'fangstgrop',
    //smallMarker: true,
    cluster: false,
    style: {
        fillcolor: '#000',
        circle: true,
        radius: 1.5
    }
};

var brukerminner_ww2 = {
    provider: 'Riksantikvaren',
    name: 'Kulturminnesøk - brukerregistrering',
    dataset: {
        api: 'kulturminnedata',
        layer: 2,
        query: 'Beskrivelse LIKE \'%#andreverdenskrig%\''
    },
    template: 'brukerminne'
};


//geojsom
var nve_dammer = {
    name: 'Dammer',
    provider: 'NVE',
    dataset: {
      api: 'geojson',
      url: 'https://www.nve.no/vann-vassdrag-og-miljo/nves-utvalgte-kulturminner/dammer/GeoJsonAPI'
    },
    template: 'NVEtp',
    style: {thumbnail: true, color: '#ff0000', fillcolor: '#ff0000'},
    bbox: false,
    isStatic: true,
    cluster: true
};

var nve_kraftverk = {
    name: 'Kraftverk',
    provider: 'NVE',
    dataset: {
      api: 'geojson',
      url: 'https://www.nve.no/vann-vassdrag-og-miljo/nves-utvalgte-kulturminner/kraftverk/GeoJsonAPI'
    },
    template: 'NVEtp',
    style: {thumbnail: true, color: '#FF9933', fillcolor: '#FF9933'},
    bbox: false,
    isStatic: true,
    cluster: true
};

var nve_kraftledninger = {
    name: 'Kraftledninger',
    provider: 'NVE',
    dataset: {
      api: 'geojson',
      url: 'https://www.nve.no/vann-vassdrag-og-miljo/nves-utvalgte-kulturminner/kraftledninger/GeoJsonAPI'
    },
    template: 'NVEtp',
    style: {thumbnail: true, color: '#A0A0A0', fillcolor: '#A0A0A0'},
    bbox: false,
    isStatic: true,
    cluster: true
};

var nve_transformatorstasjoner = {
    name: 'Transformatorstasjoner',
    provider: 'NVE',
    dataset: {
      api: 'geojson',
      url: 'https://www.nve.no/vann-vassdrag-og-miljo/nves-utvalgte-kulturminner/transformatorstasjoner/GeoJsonAPI'
    },
    template: 'NVEtp',
    style: {thumbnail: true, color: '#00FF66', fillcolor: '#00FF66'},
    bbox: false,
    isStatic: true,
    cluster: true
};

var nve_anlegg = {
    name: 'Vassdragstekniske anlegg',
    provider: 'NVE',
    dataset: {
      api: 'geojson',
      url: 'https://www.nve.no/vann-vassdrag-og-miljo/nves-utvalgte-kulturminner/vassdragstekniske-anlegg/GeoJsonAPI'
    },
    template: 'NVEtp',
    style: {thumbnail: true, color: '#165075', fillcolor: '#165075'},
    bbox: false,
    isStatic: true,
    cluster: true
};


//groups
var ark_hist = {
    grouped: true,
    commonCluster: true,
    name: 'Arkeologi og historie',
    minZoom: 14,
    datasets: [
        musit,
        dimu,
        ra_lokalitet
    ],
    description: 'Data fra Universitetsmuseene, Digitalt museum og Riksantikvaren'
};

var arkeologi = {
    grouped: true,
    commonCluster: true,
    name: 'Arkeologi',
    minZoom: 14,
    style: {
        fillcolor: '#436978',
        circle: false,
        thumbnail: true
    },
    datasets: [
        musit,
        ra_lokalitet
    ],
    description: 'Arkeologidata fra Universitetsmuseene og Riksantikvaren'
};

var historie = {
    grouped: true,
    commonCluster: true,
    name: 'Historie',
    minZoom: 14,
    style: {
        fillcolor: '#D252B9',
        circle: false,
        thumbnail: true
    },
    datasets: [
        ra_lokalitet,
        dimu_not_kunst,
        industrimuseum,
        foto_sf,
        kystreise
    ],
    description: 'Historie og kulturminner fra Riksantikvaren og Digitalt museum '
};
var kunst = {
    grouped: true,
    commonCluster: true,
    name: 'Kunst',
    style: {
        fillcolor: '#72B026',
        circle: false,
        thumbnail: true
    },
    datasets: [
        dimu_kunst
    ],
    description: 'Kunstdata fra Digitalt museum '
};

var wikipedia_krig = {
    grouped: true,
    commonCluster: true,
    name: 'Wikipedia',
    datasets: [
    {
        name: 'Wikipedia',
        provider: 'Wikipedia',
        dataset: {
            api: 'wikipedia',
            category: 'Kulturminner_i_Norge_fra_andre_verdenskrig'
        },
        template: 'wikipedia',
        bbox: false,
        isStatic: true
        /*getFeatureData: function (feature, callback) {
            api.getItem(
                {api: 'wikipedia', id: feature.properties.id},
                callback
            );
        }*/
    },
    {
        name: 'Wikipedia',
        provider: 'Wikipedia',
        dataset: {
            api: 'wikipedia',
            category: 'Fort_i_Norge_fra_andre_verdenskrig'
        },
        template: 'wikipedia',
        bbox: false,
        isStatic: true
        /*getFeatureData: function (feature, callback) {
            api.getItem(
                {api: 'wikipedia', id: feature.properties.id},
                callback
            );
        }*/
    },
    {
        name: 'Wikipedia',
        provider: 'Wikipedia',
        dataset: {
            api: 'wikipedia',
            category: 'Norge_under_andre_verdenskrig'
        },
        template: 'wikipedia',
        style: {template: true},
        bbox: false,
        isStatic: true
        /*getFeatureData: function (feature, callback) {
            api.getItem(
                {api: 'wikipedia', id: feature.properties.id},
                callback
            );
        }*/
    }
    ]
};

export default function getDatasetList(api) {


    var list = {
        'difo': difo,
        'difo_krig': difo_krig,
        'verneomr': verneomr,
        'artobs': artobs,
        'folketelling': folketelling,
        'jernbane': jernbane,
        'jernbane_krig': jernbane_krig,
        'dimu': dimu,
        'musit': musit,
        'industrimuseum': industrimuseum,
        'kystreise': kystreise,
        'dimufoto': dimufoto,
        'dimu_stillimage': dimu_stillimage,
        'dimu_krig': dimu_krig,
        'wikipedia': wikipedia,
        'wikipediaNN': wikipediaNN,
        'lokalwiki': lokalwiki,
        'wikipedia_krig': wikipedia_krig,
        'ra_lokalitet': ra_lokalitet,
        'ra_kulturmiljo': ra_kulturmiljo,
        'brukerminner': brukerminner,
        'brukerminner_ww2': brukerminner_ww2,
        'groruddalen': groruddalen,
        'norgerundt': norgerundt,
        'arkivverket_bensinstasjoner': arkivverket_bensinstasjoner,
        'nasjonalbiblioteket_bygdebok': nasjonalbiblioteket_bygdebok,
        'pilegrimsleden': pilegrimsleden,
        'fangstgroper': fangstgroper,
        'foto_sf': foto_sf,
        'arkiv_nordland': arkiv_nordland,
        'kulturminnesok_flickr': kulturminnesok_flickr,
        'riksarkivet': riksarkivet_flickr,
        'nasjonalbiblioteket': nasjonalbiblioteket_flickr,
        'oslobyarkiv': oslobyarkiv_flickr,
        'trondheimbyarkiv': trondheimbyarkiv_flickr,
        'nasjonalmuseet': nasjonalmuseet_flickr,
        'nve': nve_flickr,
        'vestfoldmuseene': vestfoldmuseene_flickr,
        'perspektivet': perspektivet_flickr,
        'nve_dammer': nve_dammer,
        'nve_kraftverk': nve_kraftverk,
        'nve_kraftledninger': nve_kraftledninger,
        'nve_transformatorstasjoner': nve_transformatorstasjoner,
        'nve_anlegg': nve_anlegg,
        'ark_hist': ark_hist,
        'arkeologi': arkeologi,
        'historie': historie,
        'kunst': kunst
    };

    return list;
};