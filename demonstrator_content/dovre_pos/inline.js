//create the map
var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(map);

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});



var Panel = function (strip) {
    var leftBtn = strip.find('.js-left');
    var rightBtn = strip.find('.js-right');

    function _checkLeft() {
        if (strip.find('.panel.hidden').length > 0) {
            leftBtn.removeClass('hidden');
        } else {
            leftBtn.addClass('hidden');
        }
    }

    function _checkRight() {
        if (strip.find('.panel').not('.hidden').length < 2) {
            rightBtn.addClass('hidden');
        } else {
            rightBtn.removeClass('hidden');
        }
    }

    function _setupToggle() {
        _checkLeft();

        rightBtn.on('click', function () {
            strip.find('.panel').not('.hidden').first().addClass('hidden');
            _checkLeft();
            _checkRight();
        });
        leftBtn.on('click', function () {
            strip.find('.panel.hidden').last().removeClass('hidden');
            _checkLeft();
            _checkRight();
        });
    }

    _setupToggle();

    strip.find('.js-close').on('click', function () {
        strip.addClass('hidden');
    });
}


var PreviewStrip = function (element, map, api, datasets) {

    var position;

    var datasetLoader = new KR.DatasetLoader(api, map);

    var spinner = $('#spinner_template').html();

    var panelTemplate = _.template($('#panel_template').html());

    var layers = [];

    var panel = new Panel(element);


    function _hideDatasets() {
        _.each(datasets, function (dataset) {
            dataset.visible = false;
        });
    }

    function _formatDistance(meters) {
        var km = meters / 1000;
        return Math.round(km * 10) / 10;
    }

    map.on('movestart', _moveStart);

    map.on('moveend', _moveEnd);

    function _dataReloaded() {

        var features = _.flatten(_.map(layers, function (layer) {
            return _.map(layer.getLayers(), function (l) {
                l.dataset = layer.options.dataset;
                return l;
            });
        }));

        if (position) {
            features = _.map(features, function (feature) {
                feature.feature.properties.distance = feature.getLatLng().distanceTo(position);
                return feature;
            });
            features = features.sort(function (a, b) {
                if (a.feature.properties.distance < b.feature.properties.distance) {
                    return -1;
                }
                if (a.feature.properties.distance > b.feature.properties.distance) {
                    return 1;
                }
                return 0;
            });
        }

        var panels = _.map(features, function (feature) {
            
            if (feature.dataset.panelMap) {
                feature.feature.properties = feature.dataset.panelMap(feature.feature.properties);
            }

            feature.feature.properties.icon = KR.Util.iconForContentType(feature.feature);
            feature.feature.properties.distance = _formatDistance(feature.feature.properties.distance) || null;
            var el = $(panelTemplate(feature.feature.properties));
            el.on('click', function () {
                showFeature(feature);
            });
            return el;
        });

        element.find('.strip-container').html(panels);
        element.removeClass('hidden');
    }

    function _moveStart() {
        _.each(layers, function (layer) {
            layer.clearLayers();
        });
        element.find('.strip-container').html(spinner);
    }

    function _moveEnd() {
        datasetLoader.reload(true, _dataReloaded);
    }

    function setPosition(pos) {
        position = pos;
    }

    function init () {
        _hideDatasets();
        layers = datasetLoader.loadDatasets(datasets);
        datasetLoader.reload(true, _dataReloaded);
    }

    return {
        init: init,
        setPosition: setPosition
    }
}









//toggles


function setupLocate(map, callback) {
    var icon = L.icon({
        iconUrl: '../common/img/locate.gif',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
    var marker;

    function locateClick() {
        map.locate({setView: true, maxZoom: 15});
    }

    var locate = L.easyButton(
        map,
        locateClick,
        {icon: 'fa-user', title: 'Finn meg'}
    );
    map.on('locationfound', function (e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng, {icon: icon}).addTo(map);
        callback(e);
    });
}



var datasets = [
    /*{
        name: 'Digitalt fortalt',
        dataset: {
            layer: 1,
            api: 'kulturminnedata'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false,
        dataset_name_override: 'Kulturminnesok',
        panelMap: function (properties) {
            properties.title = properties.Navn;
            properties.contentType = 'TEXT';
            properties.thumbnail = null;
            properties.content = null;
            return properties;
        }
    },
    */
    {
        name: 'Digitalt fortalt',
        dataset: {
            dataset: 'difo',
            api: 'norvegiana'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    }/*,
    {
        name: 'MUSIT',
        dataset: {
            api: 'norvegiana',
            dataset: 'MUSIT'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    },
    {
        name: 'DiMu',
        dataset: {
            api: 'norvegiana',
            dataset: 'DiMu'
        },
        visible: false,
        thumbnails: false,
        smallMarker: true,
        cluster: false
    }*/
];



/*
KR.Config.templates = {
    'Digitalt fortalt': _.template($('#digitalt_fortalt_template').html()),
    'Kulturminnesok': _.template($('#kulturminne_template').html()),
    'Musit': _.template($('#musit_template').html()),
    'DigitaltMuseum': _.template($('#digitalt_museum_template').html()),
    'artsobservasjon': _.template($('#artsobservasjon_template').html()),
};
*/


var previewStrip = new PreviewStrip($('#strip'), map, api, datasets);





function showFeature(feature) {
    //map.panTo(feature.getLatLng());
    console.log(feature);
}


setupLocate(map, function (e) {
    previewStrip.setPosition(e.latlng);
});




//get the are we are interested in
var dovre = 511;
api.getMunicipalityBounds(dovre, function (bbox) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    map.fitBounds(bounds);
    previewStrip.init();
});
