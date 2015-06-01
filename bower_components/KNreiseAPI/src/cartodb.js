/*global L:false */

var KR = this.KR || {};

KR.CartodbAPI = function (user, apikey) {
    'use strict';

    var BASE_URL = 'http://' + user + '.cartodb.com/api/v2/sql';


    function _createMapper(propertyMap) {

        return function (response) {
            var features = _.map(response.rows, function (row) {
                var geom = JSON.parse(row.geom);
                var properties = _.reduce(row, function (acc, value, key) {
                        if (_.has(propertyMap, key)) {
                            var k = propertyMap[key];
                            if (_.isArray(k)) {
                                _.each(k, function (k) {
                                    acc[k] = value;
                                });
                            } else {
                                acc[k] = value;
                            }
                        }
                        return acc;
                    }, {});
                return {
                    'type': 'Feature',
                    'geometry': geom,
                    'properties': properties
                };
            });
            return KR.Util.createFeatureCollection(features);
        };
    }

    var columnList = {
        'default': {
            delving_thumbnail: ['images', 'thumbnail'],
            dc_title: 'title',
            dc_description: 'content',
            europeana_isshownat: 'link',
            europeana_collectiontitle: 'dataset',
            abm_contentProvider: 'provider',
            europeana_type: 'contentType',
            delving_landingpage: 'video'
        },
        pilegrimsleden_dovre: {
            iid: 'id',
            name: 'name',
            omradenavn: 'omradenavn'
        }
    };

    var _parseItems = _createMapper(columnList['default']);

    function mappers() {

        return _.reduce(columnList, function (acc, columns, dataset) {
            acc[dataset] = _createMapper(columns);
            return acc;
        }, {
            cartodb_general: function (response) {
                var features = _.map(response.rows, function (row) {
                    var geom = JSON.parse(row.geom);
                    return {
                        'type': 'Feature',
                        'geometry': geom,
                        'properties': _.omit(row, 'geom')
                    };
                });
                return KR.Util.createFeatureCollection(features);
            }
        });
    }

    function _executeSQL(sql, mapper, callback, errorCallback) {
        var params = {
            q: sql,
            api_key: apikey
        };
        var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, mapper, callback, errorCallback);
    }

    function _parseMunicipalities(response) {
        var extent = response.rows[0].st_extent;
        return extent.replace('BOX(', '').replace(')', '').replace(/ /g, ',');
    }


    function _createSelect(select, from, where) {
        var sql = [
            'SELECT ' + select,
            'FROM ' + from
        ];
        if (where) {
            sql.push('WHERE ' + where);
        }
        return sql.join(' ');
    }

    function _dwithin(latLng, distance) {
        return 'ST_DWithin(' +
               'the_geom::geography,' +
               '\'POINT(' + latLng.lng + ' ' + latLng.lat + ')\'::geography, ' +
               distance + ');';
    }


    function getMunicipalityBounds(municipalities, callback, errorCallback) {
        if (!_.isArray(municipalities)) {
            municipalities = [municipalities];
        }

        var sql = _createSelect(
            'ST_Extent(the_geom)',
            'kommuner',
            'komm in (' + municipalities.join(', ') + ')'
        );

        _executeSQL(sql, _parseMunicipalities, callback, errorCallback);
    }

    function getData(dataset, callback, errorCallback) {
        if (dataset.query) {
            _executeSQL(dataset.query, dataset.mapper, callback, errorCallback);
        } else if (dataset.table) {
            var select = ['*'];
            if (_.has(columnList, dataset.table)) {
                select = _.keys(columnList[dataset.table]);
            }
            select.push('ST_AsGeoJSON(the_geom) as geom');
            var sql = 'SELECT ' + select.join(', ') + ' FROM ' + dataset.table;
            _executeSQL(sql, dataset.mapper, callback, errorCallback);
        }
    }

    function getBbox(dataset, bbox, callback, errorCallback) {
        var columns = dataset.columns;
        if (!columns) {
            columns = ['*'];
        }
        columns.push('ST_AsGeoJSON(the_geom) as geom');

        var sql = _createSelect(
            columns.join(', '),
            dataset.table,
            'ST_Intersects(the_geom, ST_MakeEnvelope(' + bbox + ', 4326))'
        );

        var mapper = dataset.mapper;
        if (!mapper) {
            mapper = mappers().cartodb_general;
        }
        _executeSQL(sql, mapper, callback, errorCallback);
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback) {
        var select = _.keys(columnList['default']).concat(
            ['ST_AsGeoJSON(the_geom) as geom']
        ).join(', ');

        var sql = _createSelect(
            select,
            dataset.table,
            _dwithin(latLng, distance)
        );
        _executeSQL(sql, _parseItems, callback, errorCallback);
    }

    return {
        getBbox: getBbox,
        getData: getData,
        getWithin: getWithin,
        getMunicipalityBounds: getMunicipalityBounds,
        mappers: mappers
    };
};
