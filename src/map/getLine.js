import * as _ from 'underscore';

function _stringEndsWith(a, str) {
    var lastIndex = a.lastIndexOf(str);
    return (lastIndex !== -1) && (lastIndex + str.length === a.length);
}

export default function getLine(api, line, callback) {
    if (_.isFunction(line)) {
        line(function (res) {
            callback(res);
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
                url: line
            };
        } else if (_stringEndsWith(line, 'gpx') || line.indexOf('http://ut.no/tur/') !== -1) {
            lineData = {
                api: 'gpx',
                url: line
            };
        } else if (_stringEndsWith(line, 'geojson')) {
            lineData = {
                api: 'geojson',
                url: line
            };
        }
    }
    if (lineData) {
        api.getData(lineData, function (line) {
            callback(line);
        });
    } else {
        alert('Kunne ikke laste linjegeometri');
    }
};