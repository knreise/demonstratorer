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


var musit = {
    name: 'Universitetsmuseene',
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


//other datasets

var kulturminner = {
    name: 'Kulturminner',
    provider: 'Riksantikvaren',
    template: 'kulturminne2',
    dataset: {
        api: 'kulturminne',
        dataset: 'lokaliteter'
    },
    loadExtraData: true,
    style: {
        fillcolor: '#728224'
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

        console.log("NO API in datasets.js")
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
    getFeatureData: function (feature, callback) {
        /*api.getItem(
            {api: 'jernbanemuseet', id:  feature.properties.id},
            callback
        );*/
        console.log("NO API in datasets.js");
        callback();
    },
    isStatic: true,
    bbox: false,
    description: 'Jernbanemuseet'
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

//groups
var ark_hist = {
    grouped: true,
    commonCluster: true,
    name: 'Arkeologi og historie',
    minZoom: 14,
    datasets: [
        musit,
        dimu,
        kulturminner
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
        kulturminner
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
        kulturminner,
        dimu_not_kunst,
        industrimuseum,
        foto_sf,
        kystreise
    ],
    description: 'Historie og kulturminner fra Riksantikvaren og Digitalt museum '
};
var kunst = {
    grouped: true,
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

export default function getDatasetList(api) {


    var list = {
        'difo': difo,
        'verneomr': verneomr,
        'artobs': artobs,
        'folketelling': folketelling,
        'jernbane': jernbane,
        'dimu': dimu,
        'musit': musit,
        'industrimuseum': industrimuseum,
        'kystreise': kystreise,
        'dimufoto': dimufoto,
        'wikipedia': wikipedia,
        'wikipediaNN': wikipediaNN,
        'lokalwiki': lokalwiki,
        'riksantikvaren': kulturminner,
        'brukerminner': brukerminner,
        'groruddalen': groruddalen,
        'norgerundt': norgerundt,
        'arkivverket_bensinstasjoner': arkivverket_bensinstasjoner,
        'pilegrimsleden': pilegrimsleden,
        'fangstgroper': fangstgroper,
        'kulturminnesok_flickr': kulturminnesok_flickr,
        'riksarkivet': riksarkivet_flickr,
        'nasjonalbiblioteket': nasjonalbiblioteket_flickr,
        'oslobyarkiv': oslobyarkiv_flickr,
        'nasjonalmuseet': nasjonalmuseet_flickr,
        'nve': nve_flickr,
        'vestfoldmuseene': vestfoldmuseene_flickr,
        'perspektivet': perspektivet_flickr,
        'ark_hist': ark_hist,
        'arkeologi': arkeologi,
        'historie': historie,
        'kunst': kunst
    };

    return list;
};