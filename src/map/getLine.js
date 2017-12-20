import * as _ from 'underscore';

function _stringEndsWith(a, str) {
    var lastIndex = a.lastIndexOf(str);
    return (lastIndex !== -1) && (lastIndex + str.length === a.length);
}

export default function getLine(api, line, callback) {
    if (_.isFunction(line)) {
        line(function (res) {
            callback(null, res);
        });
        return;
    }
    var lineData;
    if (line.indexOf('utno/') === 0) {
        var id = line.replace('utno/', '');
        lineData = {
            api: 'utno',
            id: id,
            type: 'gpx'
        };
    } else if (line.indexOf('http') === 0) {
        if (_stringEndsWith(line, 'kml')) {
            lineData = {
                api: 'kml',
                corsProxy: false,
                url: line
            };
        } else if (_stringEndsWith(line, 'gpx') || line.indexOf('http://ut.no/tur/') !== -1) {
            lineData = {
                api: 'gpx',
                corsProxy: false,
                url: line
            };
        } else if (_stringEndsWith(line, 'geojson')) {
            lineData = {
                api: 'geojson',
                corsProxy: false,
                url: line
            };
        }
    }
    if (lineData) {
        api.getData(
            lineData,
            function (line) {
                callback(null, line);
            },
            function (err) {
                callback(err);
            }
        );
    } else {
        alert('Kunne ikke laste linjegeometri');
    }
};