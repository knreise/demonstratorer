import L from 'leaflet';
import * as _ from 'underscore';
import WORLD from '../config/world';
import difference from '@turf/difference';

export default function getInverted(layer) {
    var style = {
        stroke: false,
        fillColor: '#ddd',
        fillOpacity: 0.8
    };

    var data = _.reduce(layer.getLayers(), function (geom, layer) {
        return difference(geom, layer.toGeoJSON());
    }, WORLD);
    return L.geoJson(data, style);
}