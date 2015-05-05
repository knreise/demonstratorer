/*global L:false */

var KR = this.KR || {};

KR.CartodbAPI = function (user, apikey) {
    'use strict';

    var CARTODB_BASE_URL = 'http://' + user + '.cartodb.com/api/v2/sql';


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
            return KR.Util.CreateFeatureCollection(features);
        };
    }



    var columns = {
        'default': {
            delving_thumbnail: ['images', 'thumbnail'],
            dc_title: 'title',
            dc_description: 'content',
            europeana_isShownAt: 'link',
            europeana_collectiontitle: 'dataset',
            abm_contentProvider: 'provider',
            europeana_type: 'contentType',
            delving_landingpage: 'video'
        },
        pilegrimsleden_dovre: {iid: 'id', name: 'name', omradenavn: 'omradenavn'}
    };

    var _parseItems = _createMapper(columns['default']);

    function mappers() {

        return _.reduce(columns, function (acc, columns, dataset) {
            acc[dataset] = _createMapper(columns);
            return acc;
        }, {});
    }


    function _executeSQL(sql, mapper, callback) {
        var params = {
            q: sql,
            api_key: apikey
        };
        var url = CARTODB_BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, callback, mapper);
    }

    function getWithin(dataset, latLng, distance, callback) {
        var select = _.keys(columns['default']).concat(['ST_AsGeoJSON(the_geom) as geom']).join(', ');
        var sql = 'SELECT ' + select + ' FROM ' + dataset + ' WHERE ST_DWithin(the_geom::geography, \'POINT(' + latLng.lng + ' ' + latLng.lat + ')\'::geography, ' + distance + ');';
        _executeSQL(sql, _parseItems, callback);
    }

    if (typeof L !== "undefined") {
        L.latLngBounds.fromBBoxString = function (bbox) {
            bbox = bbox.split(',').map(parseFloat);
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };
    }

    function _parseMunicipalities(response) {
        var extent = response.rows[0].st_extent;
        return extent.replace('BOX(', '').replace(')', '').replace(/ /g, ',');
    }

    function getMunicipalityBounds(municipalities, callback) {
        if (!_.isArray(municipalities)) {
            municipalities = [municipalities];
        }

        var sql = 'SELECT ST_Extent(the_geom) FROM kommuner where komm in (' + municipalities.join(', ') + ')';
        _executeSQL(sql, _parseMunicipalities, callback);
    }

    function getData(dataset, callback) {
        if (dataset.query) {
            _executeSQL(dataset.query, dataset.mapper, callback);
        } else if (dataset.table) {
            var select = ['*'];
            if (_.has(columns, dataset.table)) {
                select = _.keys(columns[dataset.table]);
            }
            select.push('ST_AsGeoJSON(the_geom)');
            var sql = 'SELECT ' + select.join(', ') + ' as geom FROM ' + dataset.table;
            _executeSQL(sql, dataset.mapper, callback);
        }
    }

    return {
        getData: getData,
        getWithin: getWithin,
        getMunicipalityBounds: getMunicipalityBounds,
        mappers: mappers
    };
};
