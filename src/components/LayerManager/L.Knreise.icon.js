import L from 'leaflet';
import 'leaflet-knreise-markers';
import 'leaflet-knreise-markers/dist/leaflet.knreise-markers.css';
import '../../css/markers.css';

L.Knreise = L.Knreise || {};
L.Knreise.Icon = L.KNreiseMarkers.Icon.extend({
    options: {
        icon: null
    }
});

L.Knreise.icon = function (options) {
    return new L.Knreise.Icon(options);
};