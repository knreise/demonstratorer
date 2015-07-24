var popupTemplate = _.template($('#popup_template').html());
var listElementTemplate = _.template($('#list_item_template').html());

var map = L.map('map');
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

//set up an instance of the Norvegiana API
var api = new KR.API();

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
    {dataset: {dataset: 'difo', api: 'norvegiana'}},
    {dataset: {dataset: 'Kulturminnesok', api: 'norvegiana'}},
    {dataset: {dataset: 'Artsdatabanken', api: 'norvegiana'}},
];

var icon = L.icon({
    iconUrl: '../common/img/locate.gif',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});


var followMap = new KR.FollowLineMap(map, api, sidebar, datasets, {icon: icon});

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


function _getPoller(showPoint) {
    var id;
    var prev;
    function on() {
        id = navigator.geolocation.watchPosition(function (pos) {
            var identical = (prev && prev.latitude === pos.coords.latitude && prev.longitude === pos.coords.longitude);
            if (!identical) {
                showPoint(pos);
            }
            prev = pos.coords;
        });
    }

    function off() {
        navigator.geolocation.clearWatch(id);
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
