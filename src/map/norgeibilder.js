import L from 'leaflet';
import './L.TileLayer.WMTS.js';


function getMatrix(tilematrixSet) {
    var matrixIds3857 = new Array(30);
    var i;
    for (i = 0; i < 22; i++) {
        matrixIds3857[i] = {
            identifier: tilematrixSet + ':' + i,
            topLeftCorner: new L.LatLng(2.0037508E7, -2.003750834E7)
        };
    }
    return matrixIds3857;
}

var SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';

var getNibLayer = function (callback, wmsc) {
    ns.Util.sendRequest(SKTokenUrl, null, function (token) {
        var layer;
        if (wmsc) {
            layer = L.tileLayer.wms('http://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.nibcache', {
                layers: 'NiB',
                format: 'image/jpeg',
                transparent: false,
                attribution: 'Kartverket'
            });
        } else {
            var url = 'http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts';
            var tilematrixSet = 'EPSG:900913';
            layer = new L.TileLayer.WMTS(url, {
                layer: 'NiB',
                style: 'normal',
                tilematrixSet: tilematrixSet,
                matrixIds: getMatrix(tilematrixSet),
                format: 'image/jpeg',
                attribution: 'Kartverket'
            });
        }
        layer.setParams({GKT: token});
        callback(layer);
    });
};


export default getNibLayer;

