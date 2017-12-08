import L from 'leaflet';
import '../../css/markers.css';
import '../../../bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.js';
import '../../../bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css';

L.Knreise = L.Knreise || {};
L.Knreise.Icon = L.KNreiseMarkers.Icon.extend({
    options: {
        icon: null
    }
});

L.Knreise.icon = function (options) {
    return new L.Knreise.Icon(options);
};