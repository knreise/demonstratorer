var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());

var map = L.map('map');
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

var sidebar = L.Knreise.Control.sidebar('sidebar', {
    position: 'left',
    template: popupTemplate,
    listElementTemplate: listElementTemplate
});
map.addControl(sidebar);

var pilegrimsleden_dovre = {
    api: 'cartodb',
    name: 'Pilegrimsleden',
    table: 'pilegrimsleden_dovre',
    mapper: KR.API.mappers.pilegrimsleden_dovre
};

var datasets = [
    {dataset: 'difo', api: 'norvegiana'},
    {dataset: 'Kulturminnesok', api: 'norvegiana'},
    {dataset: ['MUSIT', 'DiMu'], api: 'norvegiana'},
    {dataset: 'Artsdatabanken', api: 'norvegiana'}
];


var followMap = new KR.FollowLineMap(map, api, sidebar, datasets);

function showPosition(pos) {
    var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
    followMap.positionChanged(p);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        error();
    }
}

var locate = L.easyButton(map, getLocation, {icon: 'fa-user', title: 'Finn meg'});


function initGeoLoc(interval, callback, error) {
    getLocation(callback, error);
    return setInterval(function () {
        getLocation(callback, error);
    }, interval * 1000);
}

function _getPoller(showPoint) {
    var poller;
    function on() {
        poller = initGeoLoc(30, showPoint);
    }

    function off() {
        window.clearInterval(poller);
    }

    return {
        on: on,
        off: off
    };
}

var poller = _getPoller(showPosition);

var locateFollow = L.easyButton(
    map,
    poller.on,
    {
        icon: 'fa-user-times',
        title: 'Følg meg',
        toggle: true,
        offCallback: poller.off
    }
);

var alongLine = new KR.AlongLine(api);
alongLine.getLine(pilegrimsleden_dovre, function (data) {
    data.line.addTo(map);
    map.fitBounds(data.bounds);
    getLocation();
});
