import L from 'leaflet';
import 'leaflet-easybutton';
import 'leaflet-fa-markers';
import 'leaflet-fa-markers/L.Icon.FontAwesome.css';
import '../css/locate-btn.css';

//TODO: show error!
//import {messageDisplayer} from '../util';

L.Knreise = L.Knreise || {};

function PositionTracker() {
    var callback, watchId;
    if (!navigator.geolocation) {
        return null;
    }
    function _gotPosition(position) {
        if (callback) {
            var posFeature = {
                lon: position.coords.longitude,
                lat: position.coords.latitude
            };
            callback(null, posFeature);
        }
    }
    function _positionError(err) {
        if (callback) {
            callback(err);
        }
    }

    return {
        stop: function () {
            navigator.geolocation.clearWatch(watchId);
            watchId = undefined;
            callback = undefined;
        },
        start: function (_callback) {
            callback = _callback;
            watchId = navigator.geolocation.watchPosition(_gotPosition, _positionError);
        }
    };
}

L.Knreise.LocateButton2 = function (map) {

    var tracker = PositionTracker();
    var marker;
    var bounds;
    if (!tracker) {
        return null;
    }

    function _gotLocation(err, location) {
        if (err) {
            btn.state('position-error');
            _removeMarker();
            return;
        }
        var position = L.latLng(location.lat, location.lon);
        if (bounds && !bounds.contains(position)) {
            console.warn('Du er utenfor!');
            _stopLoacating();
            return;
        }

        btn.state('position-active');
        _showMarker(position);
        map.setView(position, 16);
        map.userPosition = position;
        map.fire('locationChange');
    }

    function _getLocation() {
        btn.state('position-loading');
        tracker.start(_gotLocation);
    }


    function _showMarker(position) {
        if (!marker) {
             marker = L.marker(position, {
                clickable: false,
                icon: L.icon.fontAwesome({
                    iconClasses: 'fa fa-user',
                    markerColor: '#FF0000',
                    iconColor: '#FFF'
                })
            }).addTo(map);
        } else {
            marker.setLatLng(position);
        }
    }

    function _removeMarker() {
        if (marker) {
            map.removeLayer(marker);
            marker = undefined;
        }
    }

    function _stopLoacating() {
        tracker.stop();
        btn.state('position-inactive');
        _removeMarker();
        map.userPosition = null;
        map.fire('locationChange');
    }

    var btn = L.easyButton({
        position: 'topleft',
        states: [
            {
                stateName: 'position-inactive',
                icon: 'fa-user',
                title: 'Følg min posisjon',
                onClick: _getLocation
            },
            {
                stateName: 'position-loading',
                icon: 'fa-spinner fa-pulse',
                title: 'Henter posisjon'
            },
            {
                stateName: 'position-active',
                icon: 'fa-user',
                title: 'Følger posisjon',
                onClick: _stopLoacating
            },
            {
                stateName: 'position-error',
                icon: 'fa-warning ',
                title: 'Feil',
                onClick: _getLocation
            }
        ]
    });

    return {
        setBounds: function (_bounds) {
            bounds = _bounds;
        },
        btn: btn
    };
};


export function addLocateButton(map) {
    var locateBtn = L.Knreise.LocateButton2(map);
    if (locateBtn) {
        locateBtn.btn.addTo(map);
    }
    return locateBtn;
}