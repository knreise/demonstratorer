/*global toGeoJSON: false */
var KR = this.KR || {};

KR.UtnoAPI = function () {
    'use strict';

    function getData(dataset, callback, errorCallback) {
        if (dataset.type === 'gpx') {
            var url = 'http://ut.no/tur/' + dataset.id + '/gpx/';
            KR.Util.sendRequest(url, toGeoJSON.gpx, callback, errorCallback);
        } else {
            errorCallback('unknown type');
        }
    }

    return {
        getData: getData
    };
};