var map = L.map('map', {
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomControl: false
});

L.tileLayer.kartverket('topo2graatone').addTo(map);


var api = new KR.API({
    flickr: {
        apikey: 'ab1f664476dabf83a289735f97a6d56c'
    }
});

var datasets = [
    {
        dataset: {
            api: 'norvegiana',
            dataset: 'difo'
        }
    },
    {
        dataset: {
            api: 'norvegiana',
            dataset: 'Artsdatabanken'
        }
    },
    {
        dataset: {
            api: 'wikipedia'
        },
    },
    {
        dataset:  {
            api: 'flickr',
            user_id: 'trondheim_byarkiv'
        },
        provider: 'Trondheim byarkiv',
        contentType: 'IMAGE',
        template: KR.Util.getDatasetTemplate('flickr'),
    }
];


KR.Config.templates = {
    'Digitalt fortalt': KR.Util.getDatasetTemplate('digitalt_fortalt'),
    'Musit': KR.Util.getDatasetTemplate('musit')
};

var footerTemplate = _.template($('#footer_template').html());
var sidebar = new L.Knreise.Control.sidebar('sidebar', {
    autoPan: false,
    footerTemplate: footerTemplate
});
map.addControl(sidebar);


var pilegrimsledenDovre = {
    api: 'cartodb',
    name: 'Pilegrimsleden',
    table: 'pilegrimsleden_dovre',
    mapper: KR.API.mappers.pilegrimsleden_dovre
};

var circleStyle = {
    stroke: false,
    fillColor: '#f00',
    radius: 10,
    fillOpacity: 0.8
};

var followMap = new KR.FollowLineMap(map, api, sidebar, datasets, {circleStyle: circleStyle});

var pilegrimsleden = 'http://pilegrimsleden.no/assets/kml/gudbrands_062015_r.kml';

var getLineFunc = function (callback) {
    KR.Util.getLine(api, pilegrimsleden, callback);
};

var linemap = new KR.LineMap(api, map, getLineFunc);
linemap.init(followMap.positionChanged);

KR.SplashScreen(map, 'Gudbrandsdalsleden - guidet tur', $('#description_template').html());