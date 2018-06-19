import L from 'leaflet';

//adapted from http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/

function GlobalMercator() {

    var originShift = 2 * Math.PI * 6378137 / 2.0;
    var tileSize = 512;
    var initialResolution = 2 * Math.PI * 6378137 / tileSize;

    function Resolution(zoom) {
        return initialResolution / Math.pow(2, zoom);
    }

    function PixelsToTile(px, py) {
        var tx = parseInt(Math.ceil( px / parseFloat(tileSize) ) - 1, 10);
        var ty = parseInt(Math.ceil( py / parseFloat(tileSize) ) - 1, 10);
        return {tx: tx, ty: ty};
    }


    function MetersToPixels(mx, my, zoom) {
        var res = Resolution(zoom);
        var px = (mx + originShift) / res;
        var py = (my + originShift) / res;
        return {px: px, py: py};
    }

    function PixelsToMeters(px, py, zoom) {
        var res = Resolution(zoom);
        var mx = px * res - originShift;
        var my = py * res - originShift;
        return {x: mx, y: my};
    }

    function TileBounds(tx, ty, zoom) {
        var min = PixelsToMeters(tx * tileSize, ty * tileSize, zoom );
        var max = PixelsToMeters((tx + 1) * tileSize, (ty + 1) * tileSize, zoom );
        return [min.x, min.y, max.x, max.y];
    }

    function LatLonToMeters(lat, lon) {

        var mx = lon * originShift / 180.0;
        var my = Math.log(Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0);

        my = my * originShift / 180.0;
        return {mx: mx, my: my};
    }

    function MetersToLatLon(mx, my) {
        var lon = (mx / originShift) * 180.0;
        var lat = (my / originShift) * 180.0;

        lat = 180 / Math.PI * (2 * Math.atan(Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2.0);
        return {lat: lat, lon: lon};
    }

    function MetersToTile(mx, my, zoom) {
        var p = MetersToPixels(mx, my, zoom);
        return PixelsToTile(p.px, p.py);
    }

    function TileLatLonBounds(tx, ty, zoom) {
        var bounds = TileBounds(tx, ty, zoom);
        var min = MetersToLatLon(bounds[0], bounds[1]);
        var max = MetersToLatLon(bounds[2], bounds[3]);
        return [min.lat, min.lon, max.lat, max.lon];
    }

    return {
        LatLonToMeters: LatLonToMeters,
        MetersToTile: MetersToTile,
        TileLatLonBounds: TileLatLonBounds
    };
}



function getTiles(zoomlevel, lat, lon, latmax, lonmax) {
    var tz = zoomlevel;
    var mercator = GlobalMercator();
    var minM = mercator.LatLonToMeters(lat, lon);
    var tmin = mercator.MetersToTile(minM.mx, minM.my, tz);

    var maxM = mercator.LatLonToMeters(latmax, lonmax);
    var tmax = mercator.MetersToTile(maxM.mx, maxM.my, tz);
    var res = [];
    for (var ty = tmin.ty; ty <= tmax.ty; ty++) {
        for (var tx = tmin.tx; tx <= tmax.tx; tx++) {
            res.push({tz: tz, ty: ty, tx: tx});
        }
    }
    return res;
}

export default function (bbox, startZoom) {
    var bounds = L.latLngBounds.fromBBoxString(bbox);
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();

    var tiles;
    for (var zoom = startZoom || 6; zoom <= 14; zoom++) {
        tiles = getTiles(zoom, sw.lat, sw.lng, ne.lat, ne.lng);
    }
    var mercator = GlobalMercator();
    var res = [];
    for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i];
        var tileBounds = mercator.TileLatLonBounds(t.tx, t.ty, t.tz);
        res.push([tileBounds[1], tileBounds[0], tileBounds[3], tileBounds[2]].join(','));
    }
    return res;
}
