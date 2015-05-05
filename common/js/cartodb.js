/*global L:false */

var KR = this.KR || {};

KR.CartodbAPI = function (user, apikey) {
    'use strict';

    var CARTODB_BASE_URL = 'http://' + user + '.cartodb.com/api/v2/sql';

    function _parseItems(response) {

        var features = _.map(response.rows, function (row) {

            var geom = JSON.parse(row.geom);
            var properties = {
                thumbnail: row.delving_thumbnail,
                images: [row.delving_thumbnail],
                title: row.dc_title,
                content: row.dc_description,
                link: row.europeana_isShownAt,
                dataset: row.europeana_collectiontitle,
                provider: row.abm_contentProvider,
                contentType: row.europeana_type,
                video: row.delving_landingpage
            };
            return {
                'type': 'Feature',
                'geometry': geom,
                'properties': properties
            };
        });

        return KR.Util.CreateFeatureCollection(features);
    }

    function _createMapper(propertyMap) {

        return function (response) {
            var features = _.map(response.rows, function (row) {
                var geom = JSON.parse(row.geom);
                var properties = _.chain(row)
                    .map(function (value, key) {
                        if (_.has(propertyMap, key)) {
                            return [propertyMap[key], value];
                        }
                    })
                    .compact()
                    .object()
                    .value();
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
        pilegrimsleden_dovre: {iid: 'id', name: 'name', omradenavn: 'omradenavn'}
    };

    function mappers () {

        return _.reduce(columns, function (acc, columns, dataset) {
            acc[dataset] = _createMapper(columns)
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
        var columns = [
            'delving_thumbnail',
            'dc_title',
            'dc_description',
            'europeana_collectiontitle',
            'europeana_isshownat',
            'abm_contentprovider',
            'europeana_type',
            'delving_landingpage',
            'ST_AsGeoJSON(the_geom) as geom'
        ];

        var sql = 'SELECT ' + columns.join(', ') + ' FROM ' + dataset + ' WHERE ST_DWithin(the_geom::geography, \'POINT(' + latLng.lng + ' ' + latLng.lat + ')\'::geography, ' + distance + ');';

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
                select = _.keys(columns[dataset.table])
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
