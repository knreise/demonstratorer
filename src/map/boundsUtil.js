import L from 'leaflet';

function splitBbox(bbox) {
    return bbox.split(',').map(parseFloat);
};

L.latLngBounds.fromBBoxArray = function (bbox) {
    return new L.LatLngBounds(
        new L.LatLng(bbox[1], bbox[0]),
        new L.LatLng(bbox[3], bbox[2])
    );
};

L.latLngBounds.fromBBoxString = function (bbox) {
    return L.latLngBounds.fromBBoxArray(splitBbox(bbox));
};

L.rectangle.fromBounds = function (bounds) {
    return L.rectangle([bounds.getSouthWest(), bounds.getNorthEast()]);
}