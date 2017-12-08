import {UrlFunctions} from '../util';

export default function getUserPos(map, options, callback) {
    var locationFromUrl = UrlFunctions.getLocationUrl(map);

    if (!options.initUserPos) {
        callback(locationFromUrl);
        return;
    }
    if (!navigator.geolocation) {
        callback(null);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function (position) {
            var pos = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                zoom: 16
            };
            callback(pos);
        },
        function () {
            callback(null);
        }
    );
}