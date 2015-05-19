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

var sidebar = L.control.norvegianaSidebar('sidebar', {
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

var locate = L.easyButton(map, null, {icon: 'fa-user', title: 'Finn meg'});
var locateFollow = L.easyButton(map, null, {icon: 'fa-user-times', title: 'Følg meg', toggle: true});


KR.Config.templates = {
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html())
};


function getLocation (callback, error) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
    } else {
        error();
    }
}

function initGeoLoc(interval, callback, error) {
    getLocation(callback, error);
    return setInterval(function () {
        getLocation(callback, error);
    }, interval * 1000);
}

var datasets = [
    {
        api: 'norvegiana',
        name: 'Digitalt fortalt',
        dataset: {dataset: 'difo', allPages: true}
    },
    {
        api: 'norvegiana',
        name: 'Kulturminner',
        dataset: {dataset: 'Kulturminnesok', allPages: true}
    },
    {
        api: 'norvegiana',
        name: 'Museumsdata',
        dataset: {dataset: ['MUSIT', 'DiMu'], allPages: true}
    },
    {
        api: 'norvegiana',
        name: 'Artsobservasjoner',
        dataset: {dataset: 'Artsdatabanken', allPages: true}
        
    }
];

function getShowPointFunc(map, data, clickCallback) {
    var point;
    return function showPoint(pos) {
        var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
        var snapped = alongLine.snapPoint(p);
        if (point) {
            map.removeLayer(point);
        }
        point = L.geoJson(snapped).getLayers()[0].setZIndexOffset(1000).addTo(map);
        map.setView(point.getLatLng(), 14, {animate: true});
        var sorted = alongLine.orderByDistance(data, snapped);

        var lis =_.chain(sorted.features)
            .first(10)
            .map(function (feature) {
                var icon = KR.Util.iconForFeature(feature);
                var el = $(listElementTemplate({
                    title: feature.properties.title,
                    icon: icon
                }));
                el.on('click', function () {
                    clickCallback(feature)
                });
                return el;
            })
            .value();
        $('#list').html(lis);
        $('#list-container').removeClass('hidden');
    };
}

var alongLine = new AlongLine(api);

alongLine.getLine(pilegrimsleden_dovre, function (data) {
    data.line.addTo(map);
    map.fitBounds(data.bounds);
    alongLine.fetchDatasets(datasets, function (data) {
        L.norvegianaGeoJSON(data, sidebar, {
            thumbnails: true,
            cluster: false,
            smallMarker: true
        }).addTo(map);
        var showPoint = getShowPointFunc(map, data, _.bind(sidebar.showFeature, sidebar));

        locate.callback = function () {
            getLocation(showPoint);
        }

        var poller;
        locateFollow.callback = function () {
            poller = initGeoLoc(5, showPoint);
        }

        locateFollow.offCallback = function () {
            window.clearInterval(poller);
        }

    });

});