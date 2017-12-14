import L from 'leaflet';
import * as _ from 'underscore';

import getLine from './getLine';

export default function getInitBounds(api, options, callback) {

    //The three two cases requires an api call
    var boundsFunc = null;
    var boundsParam = null;
    if (options.komm) {
        boundsParam = _.isString(options.komm) ? options.komm.split(',') : options.komm;
        boundsFunc = function (komm, callback) {
            var dataset = {
                api: 'cartodb',
                municipality: komm
            };
            api.getData(
                dataset,
                function (geoJson) {
                    var layer = L.geoJson(geoJson);
                    var bounds = layer.getBounds();
                    callback(null, bounds, layer);
                },
                function (err) {
                    callback(err);
                }
            );
        };
    } else if (options.fylke) {
        boundsParam = _.isString(options.fylke) ? options.fylke.split(',') : options.fylke;
        boundsFunc = function (county, callback) {
            var dataset = {
                api: 'cartodb',
                county: county
            };
            api.getData(
                dataset,
                function (geoJson) {
                    var layer = L.geoJson(geoJson);
                    var bounds = layer.getBounds();
                    callback(null, bounds, layer);
                },
                function (err) {
                    callback(err);
                }
            );
        };
    } else if (options.line) {
        boundsParam = options.line;
        boundsFunc = function (line, callback) {
            getLine(api, options.line, function (err, line) {
                if (err) {
                    callback(err);
                    return;
                }
                var lineLayer = L.geoJson(line, {
                    color: !!options.linecolor ? options.linecolor : '#03f',
                    clickable: false
                });
                var bounds = lineLayer.getBounds();
                callback(null, bounds, lineLayer);
            });
        };
    }
    //do the actual api call
    if (boundsFunc && boundsParam) {
        boundsFunc(boundsParam, function (err, bbox, filterGeom) {
            if (err) {
                callback(err);
                return;
            }
            var bounds = _.isString(bbox) ? L.latLngBounds.fromBBoxString(bbox) : bbox;
            callback(err, bounds, filterGeom);
        });
        return;
    }
    //line is a bit special, since we need to add the line to the map as well
    if (options.bbox) { //or get bounds from options
        var bounds = L.latLngBounds.fromBBoxString(options.bbox);
        callback(null, bounds);
    } else {
        callback('Missing parameters!');
    }
}