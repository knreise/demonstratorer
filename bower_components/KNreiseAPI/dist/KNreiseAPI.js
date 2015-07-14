/*global L: false */

var KR = this.KR || {};
KR.Util = {};

(function (ns) {
    'use strict';

    ns.dictWithout = function (dict) {
        var keys = _.without(_.keys(dict), Array.prototype.slice.call(arguments, 1));
        return _.reduce(keys, function (acc, key) {
            acc[key] = dict[key];
            return acc;
        }, {});
    };

    ns.createQueryParameterString = function (params) {
        return _.map(params, function (value, key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
    };

    ns.handleError = function (errorCallback, error, data) {
        if (errorCallback) {
            errorCallback({'error': error, 'data': data});
            return;
        }
        throw new Error(error);
    };

    ns.sendRequest = function (url, parser, callback, errorCallback) {
        return $.ajax({
            type: 'get',
            url: url,
            success: function (response) {
                if (parser) {
                    var parsed;
                    try {
                        parsed = parser(response, errorCallback);
                    } catch (e) {
                        ns.handleError(errorCallback, e.message, response);
                        return;
                    }
                    if (!_.isUndefined(parsed)) {
                        callback(parsed);
                    }
                } else {
                    callback(response);
                }
            },
            error: errorCallback
        });
    };

    ns.createGeoJSONFeature = function (latLng, properties) {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [latLng.lng, latLng.lat]
            },
            'properties': properties
        };
    };

    ns.createGeoJSONFeatureFromGeom = function (geom, properties) {
        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': properties
        };
    };

    ns.createFeatureCollection = function (features) {
        return {
            'type': 'FeatureCollection',
            'features': features
        };
    };

    ns.stamp = (function () {
        var lastId = 0,
            key = '_knreise_id';
        return function (obj) {
            obj[key] = obj[key] || ++lastId;
            return obj[key];
        };
    }());

    function _toRad(value) {
        return value * Math.PI / 180;
    }

    ns.haversine = function (lat1, lon1, lat2, lon2) {
        var R = 6371000; // metres
        var phi1 = _toRad(lat1);
        var phi2 = _toRad(lat2);
        var bDeltaPhi = _toRad(lat2 - lat1);
        var bDeltaDelta = _toRad(lon2 - lon1);

        var a = Math.sin(bDeltaPhi / 2) * Math.sin(bDeltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(bDeltaDelta / 2) * Math.sin(bDeltaDelta / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    ns.splitBbox = function (bbox) {
        return bbox.split(',').map(parseFloat);
    };

}(KR.Util));

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

    function _parseArcGisResponse(response, callback, errorCallback) {
        response = JSON.parse(response);
        if (_.has(response, 'error')) {
            KR.Util.handleError(errorCallback, response.error.message);
            return;
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
             _parseArcGisResponse(response, callback, errorCallback);
         }, errorCallback);
    }

    return {
        getBbox: getBbox
    };
};

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

    function _getMapper(dataset) {
        var mapper = dataset.mapper;
        if (!mapper) {
            mapper = mappers().cartodb_general;
        }
        return mapper;
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
        var mapper = _getMapper(dataset);
        if (dataset.query) {
            _executeSQL(dataset.query, mapper, callback, errorCallback);
        } else if (dataset.table) {
            var select = ['*'];
            if (_.has(columnList, dataset.table)) {
                select = _.keys(columnList[dataset.table]);
            }
            select.push('ST_AsGeoJSON(the_geom) as geom');
            var sql = 'SELECT ' + select.join(', ') + ' FROM ' + dataset.table;
            _executeSQL(sql, mapper, callback, errorCallback);
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

        var mapper = _getMapper(dataset);
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

var KR = this.KR || {};

KR.NorvegianaAPI = function () {
    'use strict';

    var requests = [];

    var BASE_URL = 'http://kulturnett2.delving.org/api/search';

    function _formatLatLng(latLng) {
        return latLng.lat + ',' + latLng.lng;
    }

    function _firstOrNull(arr) {
        if (arr && arr.length) {
            return arr[0];
        }
        return null;
    }

    function _parseVideo(link) {
        if (!link) {
            return link;
        }
        if (link.indexOf('www.youtube.com/watch') !== -1) {
            return 'https://www.youtube.com/embed/' + link.substr(link.indexOf('watch?v=') + 8);
        }
        return link;
    }

    function _getProperties(item) {
        return _.chain(item.item.fields)
            .pairs()
            .where(function (field) {
                return field[0] !== 'abm_latLong';
            })
            .reduce(function (acc, field) {
                acc[field[0]] = field[1];
                return acc;
            }, {})
            .value();
    }

    function _createProperties(allProperties) {
        return {
            thumbnail: _firstOrNull(allProperties.delving_thumbnail),
            images: allProperties.delving_thumbnail,
            title: _firstOrNull(allProperties.dc_title),
            content: _firstOrNull(allProperties.dc_description),
            link: _firstOrNull(allProperties.europeana_isShownAt),
            dataset: _firstOrNull(allProperties.europeana_collectionTitle),
            provider: _firstOrNull(allProperties.abm_contentProvider),
            contentType: _firstOrNull(allProperties.europeana_type),
            video: _firstOrNull(allProperties.abm_videoUri),
            videoEmbed: _parseVideo(_firstOrNull(allProperties.abm_videoUri)),
            sound: _firstOrNull(allProperties.abm_soundUri),
            allProps: allProperties
        };
    }

    function _parseNorvegianaItem(item) {
        var allProperties = _getProperties(item);

        var properties = _createProperties(allProperties);
        var position = _.map(
            item.item.fields.abm_latLong[0].split(','),
            parseFloat
        );
        var feature = KR.Util.createGeoJSONFeature(
            {
                lat: position[0],
                lng: position[1]
            },
            properties
        );
        return feature;
    }

    function _parseNorvegianaItems(response) {
        var nextPage;
        if (response.result.pagination.hasNext) {
            nextPage = response.result.pagination.nextPage;
        }

        var features = _.map(response.result.items, _parseNorvegianaItem);
        var geoJSON = KR.Util.createFeatureCollection(features);
        geoJSON.numFound = response.result.pagination.numFound;
        return {geoJSON: geoJSON, nextPage: nextPage};
    }

    function _acc(url, originalCallback, errorCallback) {
        var data = [];
        return function callback(responseData) {
            data.push(responseData.geoJSON);
            if (responseData.nextPage) {
                KR.Util.sendRequest(
                    url + '&start=' + responseData.nextPage,
                    _parseNorvegianaItems,
                    callback,
                    errorCallback
                );
                return;
            }
            var features = _.reduce(data, function (acc, featureCollection) {
                return acc.concat(featureCollection.features);
            }, []);
            originalCallback(KR.Util.createFeatureCollection(features));
        };
    }

    function _fixDataset(dataset) {
        dataset = _.isArray(dataset)
            ? dataset
            : [dataset];

        return _.map(dataset, function (d) {
            return 'delving_spec:' + d;
        }).join(' OR ');
    }

    function _checkCancel(requestId) {
        if (requests[requestId]) {
            requests[requestId].abort();
            requests[requestId] = null;
        }
    }

    function _getFirstPage(url, callback, errorCallback) {
        return KR.Util.sendRequest(
            url,
            _parseNorvegianaItems,
            function (res) {
                callback(res.geoJSON);
            },
            errorCallback
        );
    }

    function _getAllPages(url, callback, errorCallback) {
        return KR.Util.sendRequest(
            url,
            _parseNorvegianaItems,
            _acc(url, callback, errorCallback),
            errorCallback
        );
    }

    function _get(params, parameters, callback, errorCallback, options) {
        var dataset = _fixDataset(parameters.dataset);

        params = _.extend({
            query: dataset,
            format: 'json',
            rows: 1000,
        }, params);

        var requestId = dataset;
        if (parameters.query) {
            params.qf = parameters.query;
            requestId += parameters.query;
        }
        _checkCancel(requestId);

        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        if (options.allPages) {
            requests[requestId] = _getAllPages(url, callback, errorCallback);
        } else {
            requests[requestId] = _getFirstPage(url, callback, errorCallback);
        }
    }

    function getBbox(parameters, bbox, callback, errorCallback, options) {
        bbox = KR.Util.splitBbox(bbox);

        var lng1 = bbox[0],
            lat1 = bbox[1],
            lng2 = bbox[2],
            lat2 = bbox[3];
        var centerLng = (lng1 + lng2) / 2;
        var centerLat = (lat1 + lat2) / 2;

        var radius = _.max([
            KR.Util.haversine(lat2, centerLng, centerLat, centerLng),
            KR.Util.haversine(centerLat, lng1, centerLat, centerLng)
        ]);

        var params = {
            pt: _formatLatLng({lat: centerLat, lng: centerLng}),
            d: radius / 1000, // convert to km
            geoType: 'bbox'
        };
        _get(params, parameters, callback, errorCallback, options);
    }

    function getWithin(parameters, latLng, distance, callback, errorCallback, options) {

        var params = {
            pt: _formatLatLng(latLng),
            d: distance / 1000 // convert to km
        };
        _get(params, parameters, callback, errorCallback, options);
    }

    function getItem(id, callback) {
        var params = {
            id: id,
            format: 'json'
        };
        var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(
            url,
            function (response) {
                return _parseNorvegianaItem(response.result);
            },
            callback
        );
    }

    return {
        getWithin: getWithin,
        getItem: getItem,
        getBbox: getBbox
    };
};

/*global CryptoJS:false */

var KR = this.KR || {};

KR.WikipediaAPI = function () {
    'use strict';

    var BASE_URL = 'http://crossorigin.me/https://no.wikipedia.org/w/api.php';

    var MAX_RADIUS = 10000;

    function _wikiquery(params, callback) {
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, null, function (response) {
            response = JSON.parse(response);
            callback(response);
        });
    }

    function _wikiGeneratorQuery(params, finishedCallback) {

        //the final storage of alle extraData
        var pages = {};

        function gotResponse(response) {

            //store data: the API returns all pageIds for each request,
            //but only sets the requested generator attributes on some
            _.each(response.query.pages, function (page, key) {
                if (_.has(pages, key)) {
                    pages[key] = _.extend(pages[key], page);
                } else {
                    pages[key] = page;
                }
            });

            //handle the continue flags
            if (_.has(response, 'continue')) {
                var cont = {};
                if (_.has(response['continue'], 'picontinue')) {
                    cont.picontinue = response['continue'].picontinue;
                }
                if (_.has(response['continue'], 'excontinue')) {
                    cont.excontinue = response['continue'].excontinue;
                }

                //if api had "continue", we do so using recursion
                var newparams = _.extend(cont, params);
                _wikiquery(newparams, gotResponse);
            } else {
                finishedCallback(pages);
            }

        }
        _wikiquery(params, gotResponse);
    }

    function _getWikimediaImageUrl(filename) {
        var base = 'http://upload.wikimedia.org/wikipedia/commons/';
        var hash = CryptoJS.MD5(filename).toString();
        return base + hash.substr(0, 1) + '/' + hash.substr(0, 2) + '/' + filename;
    }

    function _getWikimediaDetails(pageIds, callback) {

        //this is a bit strange, we use a genrator for extraxts and pageImages,
        //but since the API limits response length we'll have to repeat it
        //see wikiGeneratorQuery
        var params = {
            action: 'query',
            prop: 'extracts|pageimages',
            exlimit: 'max',
            exintro: '',
            pilimit: 'max',
            pageids: pageIds,
            format: 'json',
            'continue': ''
        };
        _wikiGeneratorQuery(params, callback);
    }

    function _parseWikimediaItem(item, extdaDataDict) {

        var extraData = extdaDataDict[item.pageid];
        var thumbnail;
        if (_.has(extraData, 'thumbnail')) {
            thumbnail = extraData.thumbnail.source;
        }

        var images = null;
        if (extraData.pageimage) {
            images = [_getWikimediaImageUrl(extraData.pageimage)]
        }

        var params = {
            thumbnail: thumbnail,
            images: images,
            title: item.title,
            content: extraData.extract,
            link: 'http://no.wikipedia.org/?curid=' + item.pageid,
            dataset: 'Wikipedia',
            provider: 'Wikipedia',
            contentType: 'TEXT'
        };
        return KR.Util.createGeoJSONFeature({lat: item.lat, lng: item.lon}, params);
    }

    function _parseWikimediaItems(response, callback, errorCallback) {
        response = JSON.parse(response);

        try {
            //since the wikipedia API does not include details, we have to ask for 
            //them seperately (based on page id), and then join them
            var pageIds = _.pluck(response.query.geosearch, 'pageid');

            if (!pageIds.length) {
                callback(KR.Util.createFeatureCollection([]));
            } else {
                _getWikimediaDetails(pageIds.join('|'), function (pages) {
                    var features = _.map(response.query.geosearch, function (item) {
                        return _parseWikimediaItem(item, pages);
                    });
                    callback(KR.Util.createFeatureCollection(features));
                });
            }
        } catch (error) {
            KR.Util.handleError(errorCallback, response.error.info);
        }
    }

    /*
        Get georeferenced Wikipedia articles within a radius of given point.
        Maps data to format similar to norvegiana api.
    */
    function getWithin(query, latLng, distance, callback, errorCallback) {

        if (distance > MAX_RADIUS) {
            KR.Util.handleError(errorCallback, 'to wide search radius (max is ' + MAX_RADIUS + ')');
            return;
        }

        var params = {
            action: 'query',
            list: 'geosearch',
            gsradius: distance,
            gscoord: latLng.lat + '|' + latLng.lng,
            format: 'json',
            gslimit: 50
        };
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, null, function (response) {
            _parseWikimediaItems(response, callback, errorCallback);
        }, errorCallback);
    }

    return {
        getWithin: getWithin
    };
};

/*global toGeoJSON: false */
var KR = this.KR || {};

KR.UtnoAPI = function () {
    'use strict';

    function getData(dataset, callback, errorCallback) {

        if (typeof toGeoJSON === 'undefined') {
            throw new Error('toGeoJSON not found!');
        }

        if (dataset.type === 'gpx') {
            var url = 'http://ut.no/tur/' + dataset.id + '/gpx/';
            KR.Util.sendRequest(url, toGeoJSON.gpx, callback, errorCallback);
        } else {
            KR.Util.handleError(errorCallback, 'Unknown type ' + dataset.type);
        }
    }

    return {
        getData: getData
    };
};
/*global L:false, esri2geo: false*/

var KR = this.KR || {};

KR.FolketellingAPI = function () {
    'use strict';

    var BASE_URL = 'http://api.digitalarkivet.arkivverket.no/v1/census/1910/';

    var MAX_DISTANCE = 5000;

    function _parser(response) {
        var features = _.map(response.results, function (item) {
            var properties = KR.Util.dictWithout(item, 'latitude', 'longitude');
            return KR.Util.createGeoJSONFeature({lat: item.latitude, lng: item.longitude}, properties);
        });
        return KR.Util.createFeatureCollection(features);
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
        var limit = dataset.limit || 1000;

        if (dataset.dataset !== 'property') {
            KR.Util.handleError(errorCallback, 'unknown dataset ' + dataset.dataset);
            return;
        }

        if (distance > MAX_DISTANCE) {
            KR.Util.handleError(errorCallback, 'to wide search radius');
            return;
        }
        var params = {
            latitude: latLng.lat,
            longitude: latLng.lng,
            precision: distance,
            limit: limit
        };

        var url = BASE_URL +  'search_property_geo?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, _parser, callback, errorCallback);
    }

    function _propertyParserWithPersons(res, callback, errorCallback) {
        if (res.property.id.indexOf('gf') === 0) {
            if (!res.apartments) {
                res.apartments = null;
                callback({properties: res});
                return;
            }
            var apartments = [];

            var finished = _.after(res.apartments.length, function () {
                res.apartments = apartments;
                callback({properties: res});
            });

            _.each(res.apartments, function (apartment) {
                getData(
                    {
                        type: 'apartmentData',
                        apartmentId: apartment.id
                    },
                    function (apartmentData) {
                        apartments.push(apartmentData);
                        finished();
                    }
                );
            });
            return;
        }

        callback({properties: res});
        return;
    }

    function _propertyParser(res) {
        if (!res.apartments) {
            res.apartments = null;
        }
        return {properties: res};
    }

    function getData(dataset, callback, errorCallback, options) {
        var url;
        if (dataset.type === 'propertyData' && dataset.propertyId) {
            url = BASE_URL + 'property/' + dataset.propertyId;
            if (dataset.withPersons) {
                KR.Util.sendRequest(url, null, function (response) {
                    _propertyParserWithPersons(response, callback, errorCallback);
                }, errorCallback);
            } else {
                KR.Util.sendRequest(url, _propertyParser, callback, errorCallback);
            }
        } else if (dataset.type === 'apartmentData' && dataset.apartmentId) {
            url = BASE_URL + 'property/' + dataset.apartmentId;
            KR.Util.sendRequest(url, null, callback, errorCallback);
        } else {
            KR.Util.handleError(errorCallback, 'Not enough parameters');
        }
    }

    return {
        getData: getData,
        getWithin: getWithin
    };
};

/*global proj4:false, wellknown:false */
var KR = this.KR || {};

KR.SparqlAPI = function (BASE_URL) {
    'use strict';

    if (typeof proj4 !== 'undefined') {
        proj4.defs([
            [
                'EPSG:32633',
                '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'
            ]
        ]);
    }

    function _transform(coordinates) {
        if (typeof proj4 === 'undefined') {
            throw new Error('Proj4js not found!');
        }
        return proj4('EPSG:32633', 'EPSG:4326', coordinates);
    }

    function _parseGeom(geom) {
        geom = wellknown.parse(geom.value);
        if (geom.type === 'Point') {
            geom.coordinates = _transform(geom.coordinates);
        }
        if (geom.type === 'Polygon') {

            geom.coordinates = _.map(geom.coordinates, function (ring) {
                return _.map(ring, _transform);
            });
        }

        return geom;
    }

    function _parseResponse(response, errorCallback) {

        var features = _.map(response.results.bindings, function (item) {
            var keys = _.without(_.keys(item), 'point', 'omraade');
            var attrs = _.reduce(keys, function (acc, key) {
                acc[key] = item[key].value;
                return acc;
            }, {});

            if (!attrs.img) {
                attrs.img = false;
            }
            attrs.thumbnail = attrs.img;
            attrs.title = attrs.name;

            if (_.has(item, 'point')) {
                return KR.Util.createGeoJSONFeatureFromGeom(
                    _parseGeom(item.point),
                    attrs
                );
            }
            if (_.has(item, 'omraade')) {
                return KR.Util.createGeoJSONFeatureFromGeom(
                    _parseGeom(item.omraade),
                    attrs
                );
            }
            return null;
        });

        return KR.Util.createFeatureCollection(features);
    }

    function _parselokalitetPoly(response, errorCallback) {
        try {
            response = JSON.parse(response);
        } catch (e) {
            KR.Util.handleError(errorCallback, response);
            return;
        }
        var bindings = response.results.bindings;
        if (!bindings || bindings.length === 0) {
            KR.Util.handleError(errorCallback);
            return;
        }
        bindings[0].lok.type = 'Polygon';
        return KR.Util.createGeoJSONFeatureFromGeom(_parseGeom(bindings[0].lok), {});
    }

    function _sendQuery(query, parse, callback, errorCallback) {
        var params = {
            'default-graph-uri': '',
            'query': query,
            'format': 'application/sparql-results+json',
            'timeout': 0,
            'debug': 'off'
        };

        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, parse, callback, errorCallback);
    }

    function _createKommuneQuery(dataset) {

        if (!dataset.kommune) {
            return;
        }

        var query = 'select distinct ?id ?name ?description ?loccatlabel ?img (SAMPLE(?point) as ?point)  {' +
            ' ?id a ?type ;' +
            ' rdfs:label ?name ;' +
            ' <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description ;' +
            ' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
            ' ?p <http://psi.datanav.info/difi/geo/kommune/' + dataset.kommune + '> ;' +
            ' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
            ' ?loccat rdfs:label ?loccatlabel .' +
            ' optional {' +
            '  ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
            '  ?picture <https://data.kulturminne.no/schema/source-link> ?link' +
            '  BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
            '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?lokid) AS ?img)' +
            ' }' +
            '}';
        if (dataset.limit) {
            query += 'LIMIT ' + dataset.limit;
        }
        return query;
    }

    function _polyForLokalitetQuery(lokalitet) {
        return 'SELECT ?lok where ' +
            '{ ' +
            '  <' + lokalitet + '> <https://data.kulturminne.no/askeladden/schema/geo/area/etrs89> ?lok . ' +
            '}';
    }

    function _polyForLokalitet(dataset, callback, errorCallback) {

        var lokalitet = [];
        if (_.isArray(dataset.lokalitet)) {
            lokalitet = dataset.lokalitet;
        } else {
            lokalitet.push(dataset.lokalitet)
        }


        var features = [];
        var finished = _.after(lokalitet.length, function () {
            callback(KR.Util.createFeatureCollection(features));
        });

        _.each(lokalitet, function (lok) {
            _sendQuery(_polyForLokalitetQuery(lok), _parselokalitetPoly, function (geoJson) {
                geoJson.properties.lok = lok;
                features.push(geoJson);
                finished();
            }, errorCallback);
        });
    }


    function getData(dataset, callback, errorCallback, options) {
        dataset = _.extend({}, {geomType: 'point'}, dataset);
        if (dataset.kommune) {
            var query = _createKommuneQuery(dataset, errorCallback);
            _sendQuery(query, _parseResponse, callback, errorCallback);
        } else if (dataset.lokalitet && dataset.type === 'lokalitetpoly') {
            _polyForLokalitet(dataset, callback, errorCallback);
        } else {
            KR.Util.handleError(errorCallback, 'not enough parameters');
        }
    }

    return {
        getData: getData
    };
};
/*global */

var KR = this.KR || {};

KR.FlickrAPI = function (apikey) {
    'use strict';

    var BASE_URL = 'https://api.flickr.com/services/rest/';

    var imageTemplate = _.template('https://farm<%= farm %>.staticflickr.com/<%= server %>/<%= id %>_<%= secret %>_<%= size %>.jpg');

    function getImageUrl(photo, size) {
        return imageTemplate(_.extend({size: size}, photo));
    }

    function _parser(response) {
        var features = _.map(response.photos.photo, function (item) {
            var properties = KR.Util.dictWithout(item, 'latitude', 'longitude');

            //see https://www.flickr.com/services/api/misc.urls.html for sizes
            properties.thumbnail = getImageUrl(item, 's');
            properties.image = getImageUrl(item, 'z');
            return KR.Util.createGeoJSONFeature(
                {
                    lat: parseFloat(item.latitude),
                    lng: parseFloat(item.longitude)
                },
                properties
            );
        });
        return KR.Util.createFeatureCollection(features);
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
        if (!_.has(dataset, 'user_id')) {
            KR.Util.handleError(errorCallback, 'must specify user_id');
            return;
        }

        var params = {
            method: 'flickr.photos.search',
            user_id: dataset.user_id,
            api_key: apikey,
            lat: latLng.lat,
            lon: latLng.lng,
            radius: distance / 1000, // convert to km
            has_geo: true,
            extras: 'geo,tags',
            format: 'json',
            nojsoncallback: 1
        };

        if (_.has(dataset, 'tags')) {
            params.tags = dataset.tags.join(',');
            params.tag_mode = dataset.tag_mode || 'all';
        }

        var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, _parser, callback, errorCallback);
    }

    function getBbox(dataset, bbox, callback, errorCallback) {

        if (!_.has(dataset, 'user_id')) {
            KR.Util.handleError(errorCallback, 'must specify user_id');
            return;
        }

        var params = {
            method: 'flickr.photos.search',
            user_id: dataset.user_id,
            api_key: apikey,
            bbox: bbox,
            has_geo: true,
            extras: 'geo,tags',
            format: 'json',
            nojsoncallback: 1
        };

        if (_.has(dataset, 'tags')) {
            params.tags = dataset.tags.join(',');
            params.tag_mode = dataset.tag_mode || 'all';
        }

        var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, _parser, callback, errorCallback);
    }

    return {
        getWithin: getWithin,
        getBbox: getBbox
    };
};
/*global toGeoJSON: false */
var KR = this.KR || {};

KR.KmlAPI = function () {
    'use strict';

    function getData(dataset, callback, errorCallback) {

        if (typeof toGeoJSON === 'undefined') {
            throw new Error('toGeoJSON not found!');
        }
        var url = dataset.url;
        KR.Util.sendRequest(url, toGeoJSON.kml, callback, errorCallback);
    }

    return {
        getData: getData
    };
};
var KR = this.KR || {};

KR.API = function (options) {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI();
    var wikipediaAPI;
    if (KR.WikipediaAPI) {
        wikipediaAPI = new KR.WikipediaAPI();
    }

    var kulturminnedataAPI;
    if (KR.ArcgisAPI) {
        kulturminnedataAPI = new KR.ArcgisAPI(
            'http://husmann.ra.no/arcgis/rest/services/Husmann/Husmann/MapServer/'
        );
    }

    var kulturminnedataSparqlAPI;
    if (KR.SparqlAPI) {
        kulturminnedataSparqlAPI = new KR.SparqlAPI(
            'https://sparql.kulturminne.no/'
        );
    }

    var cartodbAPI;
    if (_.has(options, 'cartodb')) {
        cartodbAPI = new KR.CartodbAPI(options.cartodb.user, options.cartodb.apikey);
        _.extend(KR.API.mappers, cartodbAPI.mappers());
    }

    var utnoAPI;
    if (KR.UtnoAPI) {
        utnoAPI = new KR.UtnoAPI();
    }

    var folketellingAPI;
    if (KR.FolketellingAPI) {
        folketellingAPI = new KR.FolketellingAPI();
    }

    var flickrAPI;
    if (KR.FlickrAPI && _.has(options, 'flickr')) {
        flickrAPI = new KR.FlickrAPI(options.flickr.apikey);
    }

    var kmlAPI;
    if (KR.KmlAPI) {
        kmlAPI = new KR.KmlAPI();
    }

    var apis = {
        norvegiana: norvegianaAPI,
        wikipedia: wikipediaAPI,
        cartodb: cartodbAPI,
        kulturminnedata: kulturminnedataAPI,
        kulturminnedataSparql: kulturminnedataSparqlAPI,
        utno: utnoAPI,
        folketelling: folketellingAPI,
        flickr: flickrAPI,
        kml: kmlAPI,
    };

    var datasets = {
        'Artsdatabanken': {name: 'Artsdatabanken', dataset: {api: 'norvegiana', dataset: 'Artsdatabanken'}},
        'difo': {name: 'Digitalt fortalt', dataset: {api: 'norvegiana', dataset: 'difo'}},
        'DiMu': {name: 'DigitaltMuseum', dataset: {api: 'norvegiana', dataset: 'DiMu'}},
        'Industrimuseum': {name: 'Industrimuseum', dataset: {api: 'norvegiana', dataset: 'Industrimuseum'}},
        'Kulturminnesøk': {name: 'Kulturminnesøk', dataset: {api: 'norvegiana', dataset: 'Kulturminnesøk'}},
        'MUSIT': {name: 'Universitetsmuseene', dataset: {api: 'norvegiana', dataset: 'MUSIT'}},
        'Naturbase': {name: 'Naturbase', dataset: {api: 'norvegiana', dataset: 'Naturbase'}},
        'Stedsnavn': {name: 'Stedsnavn', dataset: {api: 'norvegiana', dataset: 'Stedsnavn'}},
        'wikipedia': {name: 'Wikipedia', dataset: {api: 'wikipedia'}},
        'search_1': {name: 'Byantikvaren i Oslo', dataset: {api: 'cartodb', table: 'search_1'}}
    };

    function _distanceFromBbox(api, dataset, bbox, callback, errorCallback, options) {
        bbox = KR.Util.splitBbox(bbox);

        var lng1 = bbox[0],
            lat1 = bbox[1],
            lng2 = bbox[2],
            lat2 = bbox[3];

        var centerLng = (lng1 + lng2) / 2;
        var centerLat = (lat1 + lat2) / 2;

        var radius = _.max([
            KR.Util.haversine(lat1, lng1, centerLat, centerLng),
            KR.Util.haversine(lat2, lng2, centerLat, centerLng)
        ]);

        var latLng = {lat: centerLat, lng: centerLng};
        api.getWithin(dataset, latLng, radius, callback, errorCallback, options);
    }

    function _getAPI(apiName) {
        var api = apis[apiName];
        if (api) {
            return api;
        }
        throw new Error('Unknown API');
    }

    function getData(dataset, callback, errorCallback, options) {
        options = options || {};
        var api = _getAPI(dataset.api);
        api.getData(dataset, callback, errorCallback, options);
    }

    function getBbox(dataset, bbox, callback, errorCallback, options) {
        options = options || {};
        var api = _getAPI(dataset.api);
        if (_.has(api, 'getBbox')) {
            api.getBbox(dataset, bbox, callback, errorCallback, options);
        } else {
            _distanceFromBbox(
                api,
                dataset,
                bbox,
                callback,
                errorCallback,
                options
            );
        }
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
        options = options || {};
        distance = distance || 5000;
        var api = _getAPI(dataset.api);
        api.getWithin(
            dataset,
            latLng,
            distance,
            callback,
            errorCallback,
            options
        );
    }

    function getMunicipalityBounds(municipalities, callback, errorCallback) {
        if (!cartodbAPI) {
            throw new Error('CartoDB api not configured!');
        }
        cartodbAPI.getMunicipalityBounds(
            municipalities,
            callback,
            errorCallback
        );
    }

    return {
        getWithin: getWithin,
        datasets: function () {return _.extend({}, datasets); },
        getMunicipalityBounds: getMunicipalityBounds,
        getData: getData,
        getBbox: getBbox,
        getNorvegianaItem: function (item, callback) {
            apis.norvegiana.getItem(item, callback);
        }
    };

};

KR.API.mappers = {};

/*
    properties:
        thumbnail: string (full link to thumbnail-image),
        images: string[] (full link to fullsize image),
        title: string (title)
        content: string (possibly HTML formatted content)
        link: string (url to origin)
        dataset: string (name of the dataset)
        provider: string (name of dataset provider)
        contentType: string (type of content)
*/