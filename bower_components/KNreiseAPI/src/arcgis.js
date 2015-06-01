/*global L:false, esri2geo: false*/

var KR = this.KR || {};

KR.ArcgisAPI = function (BASE_URL) {
    'use strict';

    function _parseBbox(bbox) {
        bbox = KR.Util.splitBbox(bbox);
        return JSON.stringify({
            'xmin': bbox[0],
            'ymin': bbox[1],
            'xmax': bbox[2],
            'ymax': bbox[3]
        });
    }

    function _parseArcGisResponse(response, callback) {
        response = JSON.parse(response);
        if (_.has(response, 'error')) {
            callback(KR.Util.createFeatureCollection([]));
        }
        esri2geo.toGeoJSON(response, function (err, data) {
            if (!err) {
                callback(data);
            } else {
                callback(KR.Util.createFeatureCollection([]));
            }
        });
    }

    function getBbox(dataset, bbox, callback, errorCallback) {
        var params = {
            'geometry': _parseBbox(bbox),
            'geometryType': 'esriGeometryEnvelope',
            'inSR': 4326,
            'spatialRel': 'esriSpatialRelIntersects',
            'outFields': '*',
            'returnGeometry': true,
            'outSR': 4326,
            'returnIdsOnly': false,
            'returnCountOnly': false,
            'outStatistics': '',
            'returnZ': false,
            'returnM': false,
            'returnDistinctValues': false,
            'f': 'json'
        };
        if (dataset.query) {
            params.where = dataset.query;
        }
        var layer = dataset.layer;
        var url = BASE_URL + layer + '/query' +  '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, null, function (response) {
            _parseArcGisResponse(response, callback);
        }, errorCallback);
    }

    return {
        getBbox: getBbox
    };
};
