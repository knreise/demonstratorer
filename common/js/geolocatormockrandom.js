(function () {
    'use strict';

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    var bounds = window.GeolokBounds || '9.010277,61.886299,9.9282,62.343127';
    var bbox = KR.Util.splitBbox(bounds);
    navigator.geolocation.getCurrentPosition = function (callback) {
        var coords = {
                latitude: getRandomArbitrary(bbox[1], bbox[3]),
                longitude: getRandomArbitrary(bbox[0], bbox[2]),
                accuracy: 1
            };
        callback({
            coords: coords
        });
    };

}());