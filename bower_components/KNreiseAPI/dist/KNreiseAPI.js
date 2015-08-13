/*global L: false */

var KR = this.KR || {};
KR.Util = {};

(function (ns) {
    'use strict';


    /*
        Takes a dictionary and a keys, returns a dict without the keys
    */
    ns.dictWithout = function (dict) {
        var keys = _.without(_.keys(dict), Array.prototype.slice.call(arguments, 1));
        return _.reduce(keys, function (acc, key) {
            acc[key] = dict[key];
            return acc;
        }, {});
    };


    /*
        Creates a urlescaped query parameter string based on a dict
    */
    ns.createQueryParameterString = function (params) {
        return _.map(params, function (value, key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }).join('&');
    };


    /*
        Handles an error, either by calling a callback or throwing an Error
    */
    ns.handleError = function (errorCallback, error, data) {
        if (errorCallback) {
            errorCallback({'error': error, 'data': data});
            return;
        }
        throw new Error(error);
    };


    /*
        Sends a GET-request, optionally runs the result through a parser and 
        calls a callback
    */
    ns.sendRequest = function (url, parser, callback, errorCallback, headers) {
        headers = headers || {};
        return $.ajax({
            type: 'get',
            beforeSend: function (request){
                _.each(headers, function (value, key) {
                    request.setRequestHeader(key, value);
                });
            },
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


    /*
        Creates a GeoJSON feature from a L.LatLng and optionally a properties dict
    */
    ns.createGeoJSONFeature = function (latLng, properties, id) {
        properties = properties || {};
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [latLng.lng, latLng.lat]
            },
            'properties': properties,
            'id': id
        };
    };

    /*
        Creates a GeoJSON feature from a GeoJSON Geometry and optionally a properties dict
    */
    ns.createGeoJSONFeatureFromGeom = function (geom, properties, id) {
        properties = properties || {};
        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': properties,
            'id': id
        };
    };


    /*
        GeoJSON FeatureCollection from an array of GeoJSON features
    */
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


    /*
        Calculates the Haversine distance between two points
    */
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


    /*
        Split a bbox-string to an array
    */
    ns.splitBbox = function (bbox) {
        return bbox.split(',').map(parseFloat);
    };

}(KR.Util));

/*global L:false, esri2geo: false*/

var KR = this.KR || {};

KR.ArcgisAPI = function (BASE_URL, apiName) {
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

KR.CartodbAPI = function (user, apiName) {
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
            q: sql
        };
        var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, mapper, callback, errorCallback);
    }

    function _parseExtent(response) {
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

    function _toArray(value) {
        if (!_.isArray(value)) {
            return [value];
        }
        return value;
    }

    function getMunicipalityBounds(municipalities, callback, errorCallback) {
        var sql = _createSelect(
            'ST_Extent(the_geom)',
            'kommuner',
            'komm in (' + _toArray(municipalities).join(', ') + ')'
        );

        _executeSQL(sql, _parseExtent, callback, errorCallback);
    }

    function getCountyBounds(counties, callback, errorCallback) {
        var sql = _createSelect(
            'ST_Extent(the_geom)',
            'fylker',
            'fylkesnr in (' + _toArray(counties).join(', ') + ')'
        );

        _executeSQL(sql, _parseExtent, callback, errorCallback);
    }

    function getData(dataset, callback, errorCallback) {
        var mapper = _getMapper(dataset);
        var sql;
        if (dataset.query) {
            sql = dataset.query;
        } else if (dataset.table) {
            var select = ['*'];
            if (_.has(columnList, dataset.table)) {
                select = _.keys(columnList[dataset.table]);
            }
            select.push('ST_AsGeoJSON(the_geom) as geom');
            sql = 'SELECT ' + select.join(', ') + ' FROM ' + dataset.table;
        } else if (dataset.county) {
            sql = _createSelect(
                'ST_AsGeoJSON(the_geom) as geom',
                'fylker',
                'fylkesnr in (' + _toArray(dataset.county).join(', ') + ')'
            );
        } else if (dataset.municipality) {

            sql = _createSelect(
                'ST_AsGeoJSON(the_geom) as geom',
                'kommuner',
                'komm in (' + _toArray(dataset.municipality).join(', ') + ')'
            );
        }
        if (sql) {
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
        getCountyBounds: getCountyBounds,
        mappers: mappers
    };
};

var KR = this.KR || {};

KR.NorvegianaAPI = function (apiName) {
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

    function _fixThumbnail(imageLink) {
        var thumbSize = 75; //px

        if (!imageLink) {
            return imageLink;
        }

        if (imageLink.indexOf('width=') > -1 && imageLink.indexOf('height=') > -1) {
            return imageLink
                .replace(/(width=)(\d+)/g, '$1' + thumbSize)
                .replace(/(height=)(\d+)/g, '$1' + thumbSize);
        }
        return imageLink;
    }

    function _createProperties(allProperties) {

        var thumbUrl = _firstOrNull(allProperties.delving_thumbnail);

        return {
            thumbnail: _fixThumbnail(thumbUrl),
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

        var id;
        if (_.has(allProperties, 'delving_hubId')) {
            id = apiName + '_' + allProperties.delving_hubId[0];
        }

        var feature = KR.Util.createGeoJSONFeature(
            {
                lat: position[0],
                lng: position[1]
            },
            properties,
            id
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
        params.query += ' delving_hasGeoHash:true';

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

    function getData(parameters, callback, errorCallback, options) {
        if (parameters.query && _.isArray(parameters.query)) {
            var query = 'delving_spec:' + parameters.dataset +
                ' AND (' + parameters.query.join(' OR ') + ')' +
                ' AND delving_hasGeoHash:true';
            var params = {
                query: query,
                format: 'json',
                rows: 1000,
            };

            var requestId = query;
            _checkCancel(requestId);

            var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
            if (options.allPages) {
                requests[requestId] = _getAllPages(url, callback, errorCallback);
            } else {
                requests[requestId] = _getFirstPage(url, callback, errorCallback);
            }
            return;
        }
        _get({}, parameters, callback, errorCallback, options);
    }

    function getItem(id, callback, errorCallback) {
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
            callback,
            errorCallback
        );
    }

    return {
        getWithin: getWithin,
        getItem: getItem,
        getBbox: getBbox,
        getData: getData
    };
};

/*global CryptoJS:false */

var KR = this.KR || {};

KR.WikipediaAPI = function (BASE_URL, MAX_RADIUS, linkBase, apiName) {
    'use strict';
    MAX_RADIUS = MAX_RADIUS || 10000;

    function _wikiquery(params, callback) {
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, null, function (response) {
            try {
                response = JSON.parse(response);
            } catch (ignore) {}
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
        extdaDataDict = extdaDataDict || {};
        var extraData = extdaDataDict[item.pageid];
        if (extraData) {
            item = _.extend(item, extraData);
        }

        var thumbnail;
        if (_.has(item, 'thumbnail')) {
            thumbnail = item.thumbnail.source;
        }

        var images = null;
        if (item.pageimage) {
            images = [_getWikimediaImageUrl(item.pageimage)];
        }
        var link = linkBase + item.pageid;
        var params = {
            thumbnail: thumbnail,
            images: images,
            title: item.title,
            content: item.extract,
            link: link,
            dataset: 'Wikipedia',
            provider: 'Wikipedia',
            contentType: 'TEXT',
            id: item.pageid
        };
        return KR.Util.createGeoJSONFeature(
            {lat: item.lat, lng: item.lon},
            params,
            apiName + '_' + link
        );
    }

    function _parseWikimediaItems(response, callback, errorCallback) {
        try {
            response = JSON.parse(response);
        } catch (ignore) {}


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

    function _parseCategoryResult(results) {

        var features = _.chain(results)
            .reduce(function (acc, dict) {
                _.each(dict, function (parameters, key) {
                    if (_.has(acc, key)) {
                        acc[key] = _.extend(acc[key], parameters);
                    } else {
                        acc[key] = parameters;
                    }
                });

                return acc;
            }, {})
            .filter(function (item) {
                return _.has(item, 'coordinates');
            }).map(function (item) {
                item.lat = item.coordinates[0].lat;
                item.lon = item.coordinates[0].lon;
                return item;
            })
            .map(_parseWikimediaItem)
            .value();
        return KR.Util.createFeatureCollection(features);
    }


    function getData(parameters, callback, errorCallback, options) {
        var params = {
            'action': 'query',
            'generator': 'categorymembers',
            'gcmtitle': 'Kategori:' + parameters.category,
            'prop': 'coordinates',
            'format': 'json'
        };

        var result = [];
        function sendRequest(cont) {
            var mergedParams = _.extend({}, params, cont);
            var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(mergedParams);
            KR.Util.sendRequest(url, null, function (response) {
                result.push(response.query.pages);
                if (_.has(response, 'continue')) {
                    sendRequest(response['continue']);
                } else {

                    callback(_parseCategoryResult(result));
                }
            }, errorCallback);
        }
        sendRequest({'continue': ''});
    }

    function getItem(id, callback, errorCallback) {
        var params = {
            'action': 'query',
            'pageids': id,
            'prop': 'coordinates|pageimages|extracts',
            'format': 'json'
        };
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, function (res) {
            return _parseWikimediaItem(res.query.pages[id]);
        }, callback, errorCallback);
    }

    return {
        getWithin: getWithin,
        getData: getData,
        getItem: getItem
    };
};

/*global toGeoJSON: false */
var KR = this.KR || {};

KR.UtnoAPI = function (apiName) {
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

KR.FolketellingAPI = function (apiName) {
    'use strict';

    var BASE_URL = 'http://api.digitalarkivet.arkivverket.no/v1/census/1910/';

    var MAX_DISTANCE = 5000;

    function _parser(response) {
        var features = _.map(response.results, function (item) {
            var properties = KR.Util.dictWithout(item, 'latitude', 'longitude');
            var geom = {
                lat: item.latitude,
                lng: item.longitude
            };
            return KR.Util.createGeoJSONFeature(geom, properties, apiName + '_' + item.autoid);
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

KR.SparqlAPI = function (BASE_URL, apiName) {
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
            attrs.title = attrs.name;

            if (_.has(item, 'point')) {
                return KR.Util.createGeoJSONFeatureFromGeom(
                    _parseGeom(item.point),
                    attrs,
                    apiName + '_' + attrs.id
                );
            }
            if (_.has(item, 'omraade')) {
                return KR.Util.createGeoJSONFeatureFromGeom(
                    _parseGeom(item.omraade),
                    attrs,
                    apiName + '_' + attrs.id
                );
            }
            return null;
        });

        return KR.Util.createFeatureCollection(features);
    }

    function _parselokalitetPoly(response, errorCallback) {
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

        var query = 'select distinct ?id ?name ?description ?loccatlabel ?img ?thumbnail (SAMPLE(?point) as ?point) ?url as ?link {' +
            ' ?id a ?type ;' +
            ' rdfs:label ?name ;' +
            ' <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description ;' +
            ' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ;' +
            ' ?p <https://data.kulturminne.no/difi/geo/kommune/' + dataset.kommune + '> ;' +
            ' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
            ' ?loccat rdfs:label ?loccatlabel .' +
            ' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
            ' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url)' +
            ' optional {' +
            '  ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
            '  ?picture <https://data.kulturminne.no/schema/source-link> ?link' +
            '  BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
            '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?lokid) AS ?img)' +
            '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=75&rs=0&pg=0&sr=", ?lokid) AS ?thumbnail)' +
            ' }' +
            '}';
        if (dataset.limit) {
            query += 'LIMIT ' + dataset.limit;
        }
        return query;
    }

    function _createFylkeQuery(dataset) {

        if (!dataset.fylke) {
            return;
        }

        var fylke = parseInt(dataset.fylke, 10);
        if (fylke < 10) {
            fylke = '0' + fylke;
        }

        var query = 'select  ?id ?name ?description ?loccatlabel (SAMPLE(?point) as ?point) ?img ?thumbnail ?url  as ?link {' +
            ' ?id a ?type .' +
            ' ?id rdfs:label ?name .' +
            ' ?id <https://data.kulturminne.no/askeladden/schema/i-kommune> ?kommune .' +
            ' ?id <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description .' +
            ' ?id <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?lokalitetskategori .' +
            ' ?lokalitetskategori rdfs:label ?loccatlabel .' +
            ' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
            ' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url)' +
            ' ?id <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point .' +
            ' optional {' +
            '  ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id .' +
            '  ?picture <https://data.kulturminne.no/schema/source-link> ?link' +
            '  BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid)' +
            '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=400&rs=0&pg=0&sr=", ?lokid) AS ?img)' +
            '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=75&rs=0&pg=0&sr=", ?lokid) AS ?thumbnail)' +
            '  }' +
            ' FILTER regex(?kommune, "^.*' + fylke + '[0-9]{2}") .' +
            ' } order by ?img';

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
            lokalitet.push(dataset.lokalitet);
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
        } else if (dataset.fylke) {
            var query = _createFylkeQuery(dataset, errorCallback);
            _sendQuery(query, _parseResponse, callback, errorCallback);
        } else if (dataset.lokalitet && dataset.type === 'lokalitetpoly') {
            _polyForLokalitet(dataset, callback, errorCallback);
        } else if (dataset.sparqlQuery) {
            _sendQuery(dataset.sparqlQuery, _parseResponse, callback, errorCallback);
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

KR.FlickrAPI = function (apikey, apiName) {
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
                properties,
                apiName + '_' + item.id
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

KR.KmlAPI = function (apiName) {
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
/*global toGeoJSON: false */
var KR = this.KR || {};

KR.JernbanemuseetAPI = function (API_KEY, lang, apiName) {
    'use strict';

    lang = lang || 'no';

    var BASE_URL = 'https://api.kulturpunkt.org/v2/owners/54/groups/192';

    function _getHeaders() {
        return {
            'api-key': API_KEY
        };
    }

    function _parser(response) {
        var features = _.map(response.data.records, function (item) {
            var properties = _.extend(item.contents[lang], {id: item.record_id});
            var geom = {
                lat: item.latitude,
                lng: item.longitude
            };
            return KR.Util.createGeoJSONFeature(geom, properties, apiName + '_' + item.record_id);
        });

        return KR.Util.createFeatureCollection(features);
    }

    function _getBlocks(page) {
        return _.map(page.blocks, function (block) {

            if (block.type === 'text') {
                return {
                    text: block.data,
                    type: block.type
                };
            }
            if (block.type === 'image_video') {
                var media = _.map(block.data, function (data) {
                    var url;
                    if (data.type === 'image') {
                        url = data.url;
                    }
                    if (data.type === 'video') {
                        url = data.url.mp4;
                    }
                    var description = '';
                    var title = '';
                    if (_.has(data.contents, lang)) {
                        description = data.contents[lang].description;
                        title = data.contents[lang].title;
                    }
                    return {
                        title: title,
                        description: description,
                        type: data.type,
                        url: url
                    };
                });

                return {
                    media: media,
                    type: block.type
                };
            }
        });
    }

    function _parseItem(response) {
        var content = response.data.contents[lang];
        var geom = {
            lat: response.data.location.latitude,
            lng: response.data.location.longitude
        };
        var id = response.data.id;
        var pages = _.map(content.pages, function (page) {
            return {
                title: page.title,
                blocks: _getBlocks(page)
            };
        });

        var images, thumbnail;
        if (response.data.images) {
            images = _.pluck(response.data.images, 'url');
            thumbnail = response.data.images[0].thumbnail;
        }

        var properties = {
            license: response.data.license.description,
            id: id,
            thumbnail: thumbnail,
            images: images,
            title: content.title,
            description: content.description,
            pages: pages
        };

        return KR.Util.createGeoJSONFeature(geom, properties, apiName + '_' + id);
    }

    function getItem(id, callback, errorCallback) {
        var url = BASE_URL + '/records/' + id;
        KR.Util.sendRequest(url, _parseItem, callback, errorCallback, _getHeaders());
    }

    function _parseItems(response, callback, errorCallback) {
        var features = _parser(response);

        var completeFeatures = [];
        var finished = _.after(features.features.length, function () {
            callback(KR.Util.createFeatureCollection(completeFeatures));
        });

        _.each(features.features, function (feature) {
            getItem(feature.properties.id, function (newFeature) {
                completeFeatures.push(newFeature);
                finished();
            }, function () {
                finished();
            });
        });
    }

    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {

        var params = {
            'lat': latLng.lat,
            'long': latLng.lng,
            'radius': distance
        };

        var url = BASE_URL + '/nearby?' + KR.Util.createQueryParameterString(params);
        if (options.getDetails) {
            KR.Util.sendRequest(url, null, function (response) {
                _parseItems(response, callback, errorCallback);
            }, null, _getHeaders());
        } else {
            KR.Util.sendRequest(url, _parser, callback, errorCallback, _getHeaders());
        }
    }

    function getData(dataset, callback, errorCallback, options) {
        var url = BASE_URL + '/geography';
        if (options.getDetails) {
            KR.Util.sendRequest(url, null, function (response) {
                _parseItems(response, callback, errorCallback);
            }, null, _getHeaders());
        } else {
            KR.Util.sendRequest(url, _parser, callback, errorCallback, _getHeaders());
        }
    }

    return {
        getData: getData,
        getWithin: getWithin,
        getItem: getItem
    };
};
var KR = this.KR || {};

KR.API = function (options) {
    'use strict';

    var norvegianaAPI = new KR.NorvegianaAPI('norvegiana');
    var wikipediaAPI;
    if (KR.WikipediaAPI) {
        wikipediaAPI = new KR.WikipediaAPI(
            'http://crossorigin.me/https://no.wikipedia.org/w/api.php',
            null,
            'http://no.wikipedia.org/?curid=',
            'wikipedia'
        );
    }

    var kulturminnedataAPI;
    if (KR.ArcgisAPI) {
        kulturminnedataAPI = new KR.ArcgisAPI(
            'http://crossorigin.me/http://husmann.ra.no/arcgis/rest/services/Husmann/Husmann/MapServer/',
            'husmann'
        );
    }

    var kulturminnedataSparqlAPI;
    if (KR.SparqlAPI) {
        kulturminnedataSparqlAPI = new KR.SparqlAPI(
            'https://sparql.kulturminne.no/',
            'kulturminne-sparql'
        );
    }

    var cartodbAPI;
    if (KR.CartodbAPI) {
        var cartouser = 'knreise';
        if (_.has(options, 'cartodb')) {
            cartouser = options.cartodb.user;
        }
        cartodbAPI = new KR.CartodbAPI(cartouser, 'cartodb-' + cartouser);
        _.extend(KR.API.mappers, cartodbAPI.mappers());
    }

    var utnoAPI;
    if (KR.UtnoAPI) {
        utnoAPI = new KR.UtnoAPI('utno');
    }

    var folketellingAPI;
    if (KR.FolketellingAPI) {
        folketellingAPI = new KR.FolketellingAPI('folketelling1910');
    }

    var flickrAPI;
    if (KR.FlickrAPI && _.has(options, 'flickr')) {
        flickrAPI = new KR.FlickrAPI(options.flickr.apikey, 'flickr');
    }

    var kmlAPI;
    if (KR.KmlAPI) {
        kmlAPI = new KR.KmlAPI();
    }

    var lokalwikiAPI;
    if (KR.WikipediaAPI) {
        lokalwikiAPI = new KR.WikipediaAPI(
            'http://crossorigin.me/http://test.lokalhistoriewiki.no:8080/api.php',
            null,
            'http://lokalhistoriewiki.no/?curid=',
            'lokalhistoriewiki'
        );
    }

    var jernbanemuseetAPI;
    if (KR.JernbanemuseetAPI && _.has(options, 'jernbanemuseet')) {
        jernbanemuseetAPI = new KR.JernbanemuseetAPI(
            options.jernbanemuseet.apikey,
            'no',
            'jernbanemuseet'
        );
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
        lokalhistoriewiki: lokalwikiAPI,
        jernbanemuseet: jernbanemuseetAPI
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

    /*
        Get all features from a dataset
    */
    function getData(dataset, callback, errorCallback, options) {
        options = options || {};
        var api = _getAPI(dataset.api);
        api.getData(dataset, callback, errorCallback, options);
    }


    /*
        Get features from a dataset within a bbox
    */
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

    /*
        Get features from a dataset within a radius of a given point
    */
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

    /*
        Get bbox-string for one or more norwegian municipalies
    */
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

    /*
        Get bbox-string for one or more norwegian counties
    */
    function getCountyBounds(counties, callback, errorCallback) {
        if (!cartodbAPI) {
            throw new Error('CartoDB api not configured!');
        }
        cartodbAPI.getCountyBounds(
            counties,
            callback,
            errorCallback
        );
    }

    function getItem(dataset, callback, errorCallback) {
        var api = _getAPI(dataset.api);
        if (_.has(api, 'getItem')) {
            api.getItem(dataset.id, callback, errorCallback);
        } else if (errorCallback) {
            errorCallback('No getItem function for api ' + dataset.api);
        } else {
            throw new Error('No getItem function for api ' + dataset.api);
        }
    }

    return {
        getData: getData,
        getWithin: getWithin,
        getBbox: getBbox,
        getMunicipalityBounds: getMunicipalityBounds,
        getCountyBounds: getCountyBounds,
        datasets: function () {
            return _.extend({}, datasets);
        },
        getItem: getItem
    };

};

KR.API.mappers = {};
