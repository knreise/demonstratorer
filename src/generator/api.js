import * as _ from 'underscore';
import KNreiseAPI from 'knreise-api';

const api = KNreiseAPI({proxyUrl: 'https://whispering-brook-15323.herokuapp.com/'});

function formatKomm(num) {
    return ('0000' + num).slice(-4);
}

function _localeSort(res, key) {
    function sortComparer(a, b) {
        return a[key].localeCompare(b[key], 'nb');
    }
    return res.sort(sortComparer);
}


export function getCountyList(callback) {
    var dataset = {
        api: 'cartodb',
        query: 'SELECT DISTINCT fylkesnr, navn FROM fylker ORDER BY navn',
        mapper: function (data) {
            return data.rows;
        }
    };
    api.getData(dataset, data => callback(null, _localeSort(data, 'navn')), err => callback(err));
}

export function getMunicipalityList(callback) {
    var dataset = {
        api: 'cartodb',
        query: 'SELECT DISTINCT komm, navn FROM kommuner ORDER BY navn',
        mapper: function (data) {

            return _.map(data.rows, function (row) {
                row.komm = formatKomm(row.komm);
                return row;
            });
        }
    };
    api.getData(dataset, data => callback(null, _localeSort(data, 'navn')), err => callback(err));
}