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

var api = new KR.API();

var datasets = [
    {
        dataset: {
            api: 'norvegiana',
            dataset: 'difo'
        }
    },
    {
        dataset:{
            api: 'norvegiana',
            dataset: 'MUSIT'
        }
    }
];



KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Musit': _.template($('#musit_template').html())
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

var linemap = new KR.LineMap(api, map, pilegrimsledenDovre);
linemap.init(followMap.positionChanged);
