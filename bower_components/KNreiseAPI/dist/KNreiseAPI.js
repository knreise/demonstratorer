/*global L:false, _:false */

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
    ns.sendRequest = function (url, parser, callback, errorCallback, headers, method, ajaxOpts) {
        ajaxOpts = ajaxOpts || {}
        headers = headers || {};

        var ajaxRequest = {
            method: method || 'get',
            beforeSend: function (request) {
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
        };

        return $.ajax(_.extend(ajaxRequest, ajaxOpts));
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


    /*
        Add crossorigin proxy to an url
    */
    ns.addCrossorigin = function (url) {
        if (url.indexOf('http://www.knreise.no/miniProxy/miniProxy.php/') !== 0) {
            return 'http://www.knreise.no/miniProxy/miniProxy.php/' + url;
        }
        return url;
    };

}(KR.Util));

/*global L:false, esri2geo: false*/

var KR = this.KR || {};

KR.ArcgisAPI = function (apiName, options) {
    'use strict';
    var BASE_URL = options.url;

    function _parseBbox(bbox) {
        bbox = KR.Util.splitBbox(bbox);
        return JSON.stringify({
            'xmin': bbox[0],
            'ymin': bbox[1],
            'xmax': bbox[2],
            'ymax': bbox[3]
        });
    }


    function _mapExtraData(features, extraDataResponse, dataset) {
        extraDataResponse = JSON.parse(extraDataResponse);
        var extra = extraDataResponse.features;
        var newFeatures = _.map(features.features, function (feature) {
            var extraProperties = _.find(extra, function (item) {
                return item.attributes[dataset.matchId] === feature.properties[dataset.matchId];
            });

            if (extraProperties) {
                extraProperties = extraProperties.attributes;
                feature.properties.thumbnail = extraProperties.UrlTilBilde;
            }

            var properties = _.extend(
                feature.properties,
                {extra: extraProperties}
            );
            return KR.Util.createGeoJSONFeatureFromGeom(
                feature.geometry,
                properties,
                feature.id
            );
        });
        return KR.Util.createFeatureCollection(newFeatures);
    }


    function _getExtraData(features, dataset, callback, errorCallback) {
        var ids = _.map(features.features, function (feature) {
            return feature.properties[dataset.matchId];
        });

        var params = {
            where: dataset.matchId + ' IN (' + ids.join(',') + ')',
            outFields: '*',
            returnGeometry: false,
            returnIdsOnly: false,
            returnCountOnly: false,
            returnZ: false,
            returnM: false,
            returnDistinctValues: false,
            f: 'pjson',
        };

        var url = BASE_URL + dataset.extraDataLayer + '/query';

        $.ajax({
            type: 'POST',
            url: url,
            data: KR.Util.createQueryParameterString(params),
            success: function (response) {
                callback(_mapExtraData(features, response, dataset));
            },
            error: function (response) {
                callback(features);
            }
        });
    }

    function _parseArcGisResponse(response, callback, errorCallback, dataset) {
        try {
            response = JSON.parse(response);
        } catch (ignore) {}
        if (_.has(response, 'error')) {
            KR.Util.handleError(errorCallback, response.error.message);
            return;
        }

        esri2geo.toGeoJSON(response, function (err, data) {
            if (!err) {
                _.each(data.features, function (feature) {
                    if (_.has(feature.properties, 'Navn')) {
                        feature.properties.title = feature.properties.Navn;
                    }
                    feature.id = apiName + '_' + feature.properties.OBJECTID;
                });
                if (dataset.getExtraData) {
                    _getExtraData(data, dataset, callback, errorCallback);
                } else {
                    callback(data);
                }
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
            _parseArcGisResponse(response, callback, errorCallback, dataset);
        }, errorCallback);
    }

    return {
        getBbox: getBbox
    };
};

/*global L:false */

var KR = this.KR || {};

KR.CartodbAPI = function (apiName, options) {
    'use strict';

    var USER = options.user;

    function _getURL(user) {
        return 'http://' + user + '.cartodb.com/api/v2/sql';
    }

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

    function _executeSQL(sql, mapper, callback, errorCallback, user) {
        var params = {
            q: sql
        };
        var cdbuser = user || USER;
        var url = _getURL(cdbuser) + '?' + KR.Util.createQueryParameterString(params);
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

        _executeSQL(sql, _parseExtent, callback, errorCallback, 'knreise');
    }

    function getCountyBounds(counties, callback, errorCallback) {
        var sql = _createSelect(
            'ST_Extent(the_geom)',
            'fylker',
            'fylkesnr in (' + _toArray(counties).join(', ') + ')'
        );

        _executeSQL(sql, _parseExtent, callback, errorCallback, 'knreise');
    }

    function getData(dataset, callback, errorCallback) {
        var mapper = _getMapper(dataset);
        var sql;
        if (dataset.query) {
            sql = dataset.query;
        } else if (dataset.table) {
            var columns = dataset.columns;
            if (!columns) {
                columns = ['*'];
            }
            if (_.has(columnList, dataset.table)) {
                columns = _.keys(columnList[dataset.table]);
            }
            columns.push('ST_AsGeoJSON(the_geom) as geom');
            sql = 'SELECT ' + columns.join(', ') + ' FROM ' + dataset.table;
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
    var BASE_COLLECTION_URL = 'http://acc.norvegiana.delving.org/en/api/knreise-collection/';

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

    function _joinArrays(props, keys) {
        return _.chain(keys)
            .reduce(function (acc, key) {

                if (_.has(props, key)) {
                    acc = acc.concat(props[key]);
                }
                return acc;
            }, [])
            .uniq()
            .value();
    }


    function _createMediaList(media) {
        return _.chain(media)
            .map(function (list, type) {
                return _.map(list, function (url) {
                    return {
                        type: type,
                        url: url
                    };
                });
            })
            .flatten()
            .value();
    }


    function _createProperties(allProperties) {

        var thumbUrl = _firstOrNull(allProperties.delving_thumbnail);

        var images = _joinArrays(allProperties, ['delving_thumbnail', 'abm_imageUri']);

        var media  = {
            video: _.map(allProperties.abm_videoUri, _parseVideo),
            sound: allProperties.abm_soundUri,
            image: images
        };

        return {
            thumbnail: _fixThumbnail(thumbUrl),
            images: images,
            title: _firstOrNull(allProperties.dc_title),
            content: _.map(allProperties.dc_description, function (d) { return '<p>' + d + '</p>'; }).join('\n'),
            link: _firstOrNull(allProperties.europeana_isShownAt),
            dataset: _firstOrNull(allProperties.europeana_collectionTitle),
            provider: _firstOrNull(allProperties.abm_contentProvider),
            contentType: _firstOrNull(allProperties.europeana_type),
            video: _firstOrNull(allProperties.abm_videoUri),
            videoEmbed: _parseVideo(_firstOrNull(allProperties.abm_videoUri)),
            sound: _firstOrNull(allProperties.abm_soundUri),
            allProps: allProperties,
            media: _createMediaList(media)
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
        options = _.extend({checkCancel: true}, options || {});
        var dataset = _fixDataset(parameters.dataset);

        params = _.extend({
            query: dataset,
            format: 'json',
            rows: 1000
        }, params);
        params.query += ' delving_hasGeoHash:true';

        var requestId = dataset;
        if (parameters.query) {
            params.qf = parameters.query;
            requestId += parameters.query;
        }
        if (options.checkCancel) {
            _checkCancel(requestId);
        }
        

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

    function getItem(dataset, callback, errorCallback) {
        var params = {
            id: dataset.id,
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

    function _collectionParser(data) {

        var features = _.map(data.geo_json.features, function (feature) {
            var properties = _createProperties(feature.properties);
            var id;
            if (_.has(properties.allProps, 'delving_hubId')) {
                id = apiName + '_' + properties.allProps.delving_hubId;
            }
            feature.properties = properties;
            feature.id = id;
            return feature;
        });

        data.geo_json = KR.Util.createFeatureCollection(features);
        return data;
    }

    function getCollection(collectionName, callback, errorCallback) {
        var url = BASE_COLLECTION_URL + collectionName;
        KR.Util.sendRequest(url, _collectionParser, callback, errorCallback);
    }

    return {
        getWithin: getWithin,
        getItem: getItem,
        getBbox: getBbox,
        getData: getData,
        getCollection: getCollection
    };
};

var KR = this.KR || {};

KR.EuropeanaAPI = function (apiName, options) {
    'use strict';

    options = options || {};
    var requests = [];

    var BASE_URL = 'http://www.europeana.eu/api/v2/search.json';
    var apikey = options.apikey;

    var queryTemplate = _.template('pl_wgs84_pos_lat:[<%= minLat %> TO <%= maxLat %>] AND pl_wgs84_pos_long:[<%= minLng %> TO <%= maxLng %>]');

    function _bboxQuery(bbox) {
        bbox = KR.Util.splitBbox(bbox);
        return queryTemplate({
            minLat: bbox[1],
            maxLat: bbox[3],
            minLng: bbox[0],
            maxLng: bbox[2]
        });
    }

    function _firstOrNull(arr) {
        if (arr && arr.length) {
            return arr[0];
        }
        return null;
    }

    function _createProperties(allProperties) {

        var thumbnail = _firstOrNull(allProperties.edmPreview);

        var title = _.has(allProperties.dcTitleLangAware, 'en') ? 
            allProperties.dcTitleLangAware['en'] :
            _.values(allProperties.dcTitleLangAware)[0];

        if (title) {
            title = title.join(' ');
        }
        var contentType = allProperties.type;

        return {
            thumbnail: thumbnail,
            images: [thumbnail],
            title: title,
            content: '',
            link: null,
            dataset: null,
            country: _firstOrNull(allProperties.country),
            contentType: allProperties.type,
            video: null,
            videoEmbed: null,
            sound: null,
            year: _firstOrNull(allProperties.year),
            license: _firstOrNull(allProperties.rights),
            source: allProperties.guid,
            provider: _firstOrNull(allProperties.dataProvider),
            creator: _firstOrNull(allProperties.dcCreator),
            dataProvider: _firstOrNull(allProperties.dataProvider),
            allProps: allProperties
        };
    }


    function _parseEuropeanaItem(item) {

        var lat = parseFloat(item.edmPlaceLatitude);
        var lng = parseFloat(item.edmPlaceLongitude);
        var id;
        if (_.has(item, 'id')) {
            id = apiName + '_' + item.id;
        }

        return KR.Util.createGeoJSONFeature(
            {
                lat: lat,
                lng: lng
            },
            _createProperties(item),
            id
        );
    }

    function _cursorQuery(params, callback, errorCallback) {

        var items = [];

        function gotResult(response) {
            items = items.concat(response.items);
            if (response.nextCursor) {
                _sendCursorQuery(params, response.nextCursor, gotResult, errorCallback);
            } else {
                callback(_parseItems({items: items}));
            }
        }

        _sendCursorQuery(params, '*', gotResult, errorCallback);

    }

    function _sendCursorQuery(params, cursor, callback, errorCallback) {
        params.cursor = cursor;
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, null, callback, errorCallback);
    }


    function _parseItems(response) {
        var features = _.map(response.items, _parseEuropeanaItem);
        return KR.Util.createFeatureCollection(features);
    }

    function getBbox(parameters, bbox, callback, errorCallback, options) {
        var params = {
            wskey: apikey,
            query: _bboxQuery(bbox),
            rows: 100
        };
        if (parameters.collection) {
            params.qf = 'europeana_collectionName:' + parameters.collection;
        } else if (parameters.query) {
            params.qf = parameters.query;
        }

        _cursorQuery(params, callback, errorCallback);
    }

    function getWithin(parameters, latLng, distance, callback, errorCallback, options) {
        /*
        var params = {
            pt: _formatLatLng(latLng),
            d: distance / 1000 // convert to km
        };
        _get(params, parameters, callback, errorCallback, options);
        */
    }

    function getData(parameters, callback, errorCallback, options) {
        /*
        if (parameters.query && _.isArray(parameters.query)) {
            var query = 'delving_spec:' + parameters.dataset +
                ' AND (' + parameters.query.join(' OR ') + ')' +
                ' AND delving_hasGeoHash:true';
            var params = {
                query: query,
                format: 'json',
                rows: 1000
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
        */
    }

    function getItem() {

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

KR.WikipediaAPI = function (apiName, options) {
    'use strict';

    var MAX_RADIUS = options.maxRadius || 10000;
    var BASE_URL = options.url;
    var linkBase = options.linkBase;

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
            apiName + '_' + item.pageid
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

    function getItem(dataset, callback, errorCallback) {
        var params = {
            'action': 'query',
            'pageids': dataset.id,
            'prop': 'coordinates|pageimages|extracts',
            'format': 'json'
        };
        var url = BASE_URL + '?'  + KR.Util.createQueryParameterString(params);
        KR.Util.sendRequest(url, function (res) {
            return _parseWikimediaItem(res.query.pages[dataset.id]);
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
                lat: parseFloat(item.latitude),
                lng: parseFloat(item.longitude)
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

/*global proj4:false, wellknown:false, _:false, window:false */
var KR = this.KR || {};

KR.SparqlAPI = function (apiName, options) {
    'use strict';

    var license = options.licenseText || 'http://data.norge.no/nlod/no';

    var BASE_URL = options.url;

    if (!_.isUndefined(window.proj4)) {
        proj4.defs([
            [
                'EPSG:32633',
                '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'
            ]
        ]);
    }

    function _transform(coordinates) {
        if (_.isUndefined(window.proj4)) {
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
        if (geom.type === 'MultiPolygon') {
            geom.coordinates = _.map(geom.coordinates, function (g) {
                return _.map(g.coordinates, function (ring) {
                    return _.map(ring, _transform);
                });
            });
        }


        return geom;
    }

    function _parseResponse(response, errorCallback) {

        var features = _.chain(response.results.bindings)
            .map(function (item) {
                var keys = _.without(_.keys(item), 'point', 'omraade');
                var attrs = _.reduce(keys, function (acc, key) {
                    acc[key] = item[key].value;
                    return acc;
                }, {});

                if (!attrs.img) {
                    attrs.img = false;
                }
                attrs.title = attrs.name;

                if (!attrs.license) {
                    attrs.license = license;
                }

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
            })
            .filter(function (feature) {
                return !!feature;
            })
            .value();
        

        return KR.Util.createFeatureCollection(features);
    }


    function _sendQuery(query, parse, callback, errorCallback) {
        var params = {
            'default-graph-uri': '',
            query: query,
            format: 'application/sparql-results+json',
            timeout: 0,
            debug: 'off'
        };

        var url = BASE_URL;

        var fd = new FormData();
        _.each(params, function (value, key) {
            fd.append(key, value);
        });

        var ajaxOpts = {
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            method: 'POST'
        };
        KR.Util.sendRequest(url, parse, callback, errorCallback, {}, 'POST', ajaxOpts);
    }

    function _createKommuneQuery(dataset) {

        if (!dataset.kommune) {
            return;
        }

        var query = 'select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) ?url as ?link ?picture ?picturelabel ?picturedescription ?picturelicence { ' +
                ' ?id a ?type ; ' +
                ' rdfs:label ?name ; ' +
                
                ' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/ansvarligorganisasjon> ?org ; ' +
                ' ?p <https://data.kulturminne.no/askeladden/kommune/' + dataset.kommune + '> ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point . ' +
                ' optional { ?loccat rdfs:label ?loccatlabel .} ' +
                ' optional { ?locart rdfs:label ?locartlabel .} ' +
                ' optional { ?org rdfs:label ?orglabel .} ' +
                ' optional { ?id <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description .} ' +
                ' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid) ' +
                ' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url) ' +
                ' optional { ' +
                ' {select sample(?picture) as ?picture ?id where {?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id}} ' +
                '  ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id . ' +
                '  ?picture <https://data.kulturminne.no/schema/source-link> ?link . ' +
                '  ?picture rdfs:label ?picturelabel . ' +
                '  ?picture dc:description ?picturedescription . ' +
                '  ?picture <https://data.kulturminne.no/bildearkivet/schema/license> ?picturelicence . ' +
                '  BIND(REPLACE(STR(?link), "http://kulturminnebilder.ra.no/fotoweb/default.fwx\\\\?search\\\\=", "") AS ?linkid) ' +
                '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?img) ' +
                '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=75&rs=0&pg=0&sr=", ?linkid) AS ?thumbnail) ' +
                '} ';

        if (dataset.filter) {
            query += ' ' + dataset.filter;
        }
        query += '}';
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

        var query = ' select distinct ?id ?name ?description ?loccatlabel ?locartlabel ?orglabel ?img ?thumbnail (SAMPLE(?point) as ?point) ?url as ?link ?picture ?picturelabel ?picturedescription ?picturelicence { ' +
                ' ?id a ?type ; ' +
                ' rdfs:label ?name ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/lokalitetskategori> ?loccat ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/lokalitetsart> ?locart ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/ansvarligorganisasjon> ?org ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/kommune> ?kommune ; ' +
                ' <https://data.kulturminne.no/askeladden/schema/geo/point/etrs89> ?point . ' +
                ' optional { ?loccat rdfs:label ?loccatlabel .} ' +
                ' optional { ?locart rdfs:label ?locartlabel .} ' +
                ' optional { ?org rdfs:label ?orglabel .} ' +
                ' optional { ?id <https://data.kulturminne.no/askeladden/schema/beskrivelse> ?description .} ' +
                ' BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid) ' +
                ' BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url) ' +
                ' optional { ' +
                ' {select sample(?picture) as ?picture ?id where {?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id}} ' +
                '  ?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id . ' +
                '  ?picture <https://data.kulturminne.no/schema/source-link> ?link . ' +
                '  ?picture rdfs:label ?picturelabel . ' +
                '  ?picture dc:description ?picturedescription . ' +
                '  ?picture <https://data.kulturminne.no/bildearkivet/schema/license> ?picturelicence . ' +
                '  BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid) ' +
                '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?lokid) AS ?img) ' +
                '  BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=75&rs=0&pg=0&sr=", ?lokid) AS ?thumbnail) ' +
                ' } ' +
                ' FILTER regex(?kommune, "^.*' + fylke + '[1-9]{2}") . ';

        if (dataset.filter) {
            query += ' ' + dataset.filter;
        }
        query += ' } order by ?img';

        if (dataset.limit) {
            query += 'LIMIT ' + dataset.limit;
        }
        return query;
    }

    function _enkeltminneForLokalitetQuery(lokalitet) {
        return 'SELECT ?enk as ?id ?name ?desc as ?content ?area as ?omraade ?enkcatlabel ' +
                'where { ' +
                '?enk a <https://data.kulturminne.no/askeladden/schema/Enkeltminne> . ' +
                '?enk rdfs:label ?name . ' +
                '?enk <https://data.kulturminne.no/askeladden/schema/lokalitet> <' + lokalitet.trim() + '> . ' +
                '?enk <https://data.kulturminne.no/askeladden/schema/ksok> ?desc . ' +
                '?enk <https://data.kulturminne.no/askeladden/schema/geo/area/etrs89> ?area . ' +
                '?enk <https://data.kulturminne.no/askeladden/schema/enkeltminnekategori> ?enkcat . ' +
                '?enkcat rdfs:label ?enkcatlabel . ' +
                '} ';
    }

    function stringStartsWith(string, prefix) {
        return string.slice(0, prefix.length) === prefix;
    }

    function stringEndsWith(string, suffix) {
        return suffix === '' || string.slice(-suffix.length) === suffix;
    }

    function _addBrackets(url) {
        if (!stringStartsWith(url, '<')) {
            url = '<' + url;
        }
        if (!stringEndsWith(url, '>')) {
            url = url + '>';
        }
        return url;
    }


    function _createMultiPolygon(items, lok) {
        var features = _.map(items, function (binding) {
            binding.poly.type = 'Polygon';
            return KR.Util.createGeoJSONFeatureFromGeom(_parseGeom(binding.poly), {});
        });

        var polygons = _.map(features, function (feature) {
            return feature.geometry;
        });

        var collection = {
            type: 'GeometryCollection',
            geometries: polygons
        };

        return KR.Util.createGeoJSONFeatureFromGeom(collection, {lok: lok});
    }

    function _parsePolyForSeveralLokalitet(response) {
        var grouped = _.reduce(response.results.bindings, function (acc, item) {
            var id = item.lok.value;
            if (!_.has(acc, id)) {
                acc[id] = [];
            }
            acc[id].push(item);
            return acc;
        }, {});
        return _.map(grouped, _createMultiPolygon);
    }

    function _polyForLokalitet(dataset, callback, errorCallback) {

        var lokalitet = [];
        if (_.isArray(dataset.lokalitet)) {
            lokalitet = dataset.lokalitet;
        } else {
            lokalitet.push(dataset.lokalitet);
        }

        var query = 'select ?lok ?poly where { ' +
                ' ?lok <https://data.kulturminne.no/askeladden/schema/geo/area/etrs89> ?poly ' +
                ' filter (?lok in (' + _.map(lokalitet, _addBrackets).join(', ') + '))}';

        _sendQuery(query, _parsePolyForSeveralLokalitet, function (features) {
            callback(KR.Util.createFeatureCollection(features));
        }, errorCallback);
    }

    function _enkeltminnerForLokalitet(dataset, callback, errorCallback) {

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
            _sendQuery(_enkeltminneForLokalitetQuery(lok), _parseResponse, function (geoJson) {
                var featuresForLok = _.map(geoJson.features, function (f) {
                    f.properties.lokalitet = lok;
                    return f;
                });
                features = features.concat(featuresForLok);
                finished();
            }, errorCallback);
        });
    }


    function _parseImagesResponse(response) {
        return _.map(response.results.bindings, function (binding) {
            return _.reduce(binding, function (acc, value, key) {
                acc[key] = value.value;
                return acc;
            });
            return binding;
        });
    }

    function _imagesForLokalitet(dataset, callback, errorCallback) {

        var lokalitet = lokalitet = dataset.lokalitet;

        var query = 'select distinct ?id ?img ?img_fullsize ?url ?link ?linkid ?picturelabel ?picturedescription ?picturelicence {' +
        '?id a ?type . ' +
        'BIND(REPLACE(STR(?id), "https://data.kulturminne.no/askeladden/lokalitet/", "") AS ?lokid) ' +
        'BIND(bif:concat("http://www.kulturminnesok.no/kulturminnesok/kulturminne/?LOK_ID=", ?lokid) AS ?url) ' +
        '?picture <https://data.kulturminne.no/bildearkivet/schema/lokalitet> ?id . ' +
        '?picture <https://data.kulturminne.no/schema/source-link> ?link . ' +
        '?picture rdfs:label ?picturelabel . ' +
        'optional {?picture dc:description ?picturedescription .}' +
        '?picture <https://data.kulturminne.no/bildearkivet/schema/license> ?picturelicence . ' +
        'BIND(REPLACE(STR(?link), "http://kulturminnebilder.ra.no/fotoweb/default.fwx\\\\?search\\\\=", "") AS ?linkid) . ' +
        'BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=600&rs=0&pg=0&sr=", ?linkid) AS ?img) . ' +
        'BIND(bif:concat("http://kulturminnebilder.ra.no/fotoweb/cmdrequest/rest/PreviewAgent.fwx?ar=5001&sz=1000&rs=0&pg=0&sr=", ?linkid) AS ?img_fullsize) . ' +
        'filter(?id=' + _addBrackets(lokalitet) + ') ' +
        '} ';
        _sendQuery(query, _parseImagesResponse, callback, errorCallback);
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
        } else if (dataset.lokalitet && dataset.type === 'enkeltminner') {
            _enkeltminnerForLokalitet(dataset, callback, errorCallback);
        } else if (dataset.lokalitet && dataset.type === 'images') {
            _imagesForLokalitet(dataset, callback, errorCallback);
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

KR.FlickrAPI = function (apiName, options) {
    'use strict';

    var BASE_URL = 'https://api.flickr.com/services/rest/';
    var apikey = options.apikey;

    var imageTemplate = _.template('https://farm<%= farm %>.staticflickr.com/<%= server %>/<%= id %>_<%= secret %>_<%= size %>.jpg');

    function getImageUrl(photo, size) {
        return imageTemplate(_.extend({size: size}, photo));
    }

    function _parser(response, errorCallback) {
        if (response.stat && response.stat === 'fail') {
            KR.Util.handleError(errorCallback, response.message, response);
            return;
        }
        var features = _.chain(response.photos.photo)
            .filter(function (item) {
                var lat = parseFloat(item.latitude);
                var lng = parseFloat(item.longitude);
                return (lat != 0 || lng != 0);
            })
            .map(function (item) {
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
            })
            .value();
        return KR.Util.createFeatureCollection(features);
    }


    function _queryForAllPages(params, callback, errorCallback) {

        var result = [];

        function _gotResponse(response) {
            var fc = _parser(response, errorCallback);
            if (fc && fc.features) {
                result = result.concat(fc.features);
            }

            if (response.photos && response.photos.page < response.photos.pages) {
                params.page = response.photos.page + 1;
                _sendRequest(params)
            } else {
                var fc = KR.Util.createFeatureCollection(result);
                callback(fc);
            }
        }

        function _sendRequest(params) {
            var url = BASE_URL + '?' + KR.Util.createQueryParameterString(params);
            KR.Util.sendRequest(url, _gotResponse);
        }
        _sendRequest(params);
    }


    function _queryFlickr(dataset, params, callback, errorCallback, options) {
        if (!_.has(dataset, 'user_id') && !_.has(dataset, 'group_id')) {
            KR.Util.handleError(errorCallback, 'must specify user_id or group_id');
            return;
        }

        if (_.has(dataset, 'user_id')) {
            params = _.extend(params, {
                method: 'flickr.photos.search',
                user_id: dataset.user_id
            });
        }

        if (_.has(dataset, 'group_id')) {
            params = _.extend(params, {
                method: 'flickr.groups.pools.getPhotos',
                group_id: dataset.group_id
            });
        }

        params = _.extend(params, {
            api_key: apikey,
            has_geo: true,
            per_page: 500,
            extras: 'geo,tags',
            format: 'json',
            nojsoncallback: 1,
            accuracy: dataset.accuracy || 11
        })

        if (_.has(dataset, 'tags')) {
            params.tags = dataset.tags.join(',');
            params.tag_mode = dataset.tag_mode || 'all';
        }
        _queryForAllPages(params, callback, errorCallback);
    }


    function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
        var params = {
            lat: latLng.lat,
            lon: latLng.lng,
            radius: distance / 1000, // convert to km
        };
        _queryFlickr(dataset, params, callback, errorCallback, options);
    }

    function getBbox(dataset, bbox, callback, errorCallback) {
        var params = {
            bbox: bbox
        };
        _queryFlickr(dataset, params, callback, errorCallback, options);
    }

    function getData(dataset, callback, errorCallback) {
        _queryFlickr(dataset, {}, callback, errorCallback, options);
    }

    return {
        getData: getData,
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
        var url = KR.Util.addCrossorigin(dataset.url);
        KR.Util.sendRequest(url, toGeoJSON.kml, callback, errorCallback);
    }

    return {
        getData: getData
    };
};
/*global toGeoJSON: false */
var KR = this.KR || {};

KR.GpxAPI = function (apiName) {
    'use strict';

    function getData(dataset, callback, errorCallback) {

        if (typeof toGeoJSON === 'undefined') {
            throw new Error('toGeoJSON not found!');
        }
        var url = KR.Util.addCrossorigin(dataset.url);
        KR.Util.sendRequest(url, toGeoJSON.gpx, callback, errorCallback);
    }

    return {
        getData: getData
    };
};


var KR = this.KR || {};

KR.GeoJsonAPI = function (apiName) {
    'use strict';

    function getData(dataset, callback, errorCallback) {
        var url = KR.Util.addCrossorigin(dataset.url);
        KR.Util.sendRequest(url, JSON.parse, callback, errorCallback);
    }

    return {
        getData: getData
    };
};

/*global toGeoJSON: false */
var KR = this.KR || {};

KR.JernbanemuseetAPI = function (apiName, options) {
    'use strict';

    var DEFAULT_GROUP = 192;

    function _getGroup (dataset) {
        if (_.has(dataset, 'group')) {
            return dataset.group;
        }
        return DEFAULT_GROUP;
    }

    var lang = options.lang || 'no';

    var BASE_URL = 'https://api.kulturpunkt.org/v2/owners/54';
    var API_KEY = options.apikey;
    function _getHeaders() {
        return {
            'api-key': API_KEY
        };
    }

    function _parser(response) {
        var features = _.map(response.data.records, function (item) {
            var properties = _.extend(item.contents[lang], {id: item.record_id});

            var geom;

            if (_.has(item, 'latitude') && _.has(item, 'longitude')) {
                geom = {
                    lat: item.latitude,
                    lng: item.longitude
                };
            } else if (_.has(item, 'location')) {
                geom = {
                    lat: item.location.latitude,
                    lng: item.location.longitude
                };
            } else {
                console.error('no geometry');
            }
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
            if (block.type === 'image_video' || block.type === 'audio') {
                var media = _.map(block.data, function (data) {
                    var url;
                    if (data.type === 'image') {
                        url = data.url;
                    }
                    if (data.type === 'video') {
                        url = data.url.mp4;
                    }
                    if (data.type === 'audio') {
                        url = data.url.ogg;
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
            if (block.type === 'links') {
                return {
                    links: block.data,
                    type: 'links'
                }
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
        if (response.data.images.length) {
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

    function getItem(dataset, callback, errorCallback) {
        var url = BASE_URL + '/groups/' + _getGroup(dataset) + '/records/' + dataset.id + '?strip_html=true';
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

        var url = BASE_URL + '/groups/' + _getGroup(dataset) + '/nearby?' + KR.Util.createQueryParameterString(params);
        if (options.getDetails) {
            KR.Util.sendRequest(url, null, function (response) {
                _parseItems(response, callback, errorCallback);
            }, null, _getHeaders());
        } else {
            KR.Util.sendRequest(url, _parser, callback, errorCallback, _getHeaders());
        }
    }

    function getData(dataset, callback, errorCallback, options) {
        var url = BASE_URL + '/groups/' + _getGroup(dataset) + '/geography';
        if (options.getDetails) {
            KR.Util.sendRequest(url, null, function (response) {
                _parseItems(response, callback, errorCallback);
            }, null, _getHeaders());
        } else {
            if (dataset.presentation) {
                url = 'https://api.kulturpunkt.org/v2/owners/54/presentations/' + dataset.presentation;
            }
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
    options = options || {};

    var apiConfig = {
        norvegiana: {
            api: KR.NorvegianaAPI,
            params: {}
        },
        wikipedia: {
            api: KR.WikipediaAPI,
            params: {url: 'http://www.knreise.no/miniProxy/miniProxy.php/https://no.wikipedia.org/w/api.php', linkBase: 'http://no.wikipedia.org/?curid='}
        },
        wikipediaNN: {
            api: KR.WikipediaAPI,
            params: {url: 'http://www.knreise.no/miniProxy/miniProxy.php/https://nn.wikipedia.org/w/api.php', linkBase: 'http://nn.wikipedia.org/?curid='}
        },
        cartodb: {
            api: KR.CartodbAPI,
            extend: true,
            params: {user: 'knreise'}
        },
        kulturminnedata: {
            api: KR.ArcgisAPI,
            params: {url: 'http://askeladden.ra.no/arcgis/rest/services/Husmann/Husmann/MapServer/'}
        },
        kulturminnedataSparql: {
            api: KR.SparqlAPI,
            params: {url: 'https://sparql.kulturminne.no/'}
        },
        utno: {
            api: KR.UtnoAPI,
            params: {}
        },
        folketelling: {
            api: KR.FolketellingAPI,
            params: {}
        },
        flickr: {
            api: KR.FlickrAPI,
            extend: true,
            params: {}
        },
        kml: {
            api: KR.KmlAPI,
            params: {}
        },
        gpx: {
            api: KR.GpxAPI,
            params: {}
        },
        geojson: {
            api: KR.GeoJsonAPI,
            params: {}
        },
        lokalhistoriewiki: {
            api: KR.WikipediaAPI,
            params: {
                url: 'http://www.knreise.no/miniProxy/miniProxy.php/http://test.lokalhistoriewiki.no:8080/api.php',
                linkBase: 'http://lokalhistoriewiki.no/?curid=',
                maxRadius: 100000
            }
        },
        jernbanemuseet: {
            api: KR.JernbanemuseetAPI,
            extend: true,
            params: {lang: 'no'}
        },
        europeana: {
            api: KR.EuropeanaAPI,
            extend: true,
            params: {}
        }
    };

    function _createApis() {
        return _.reduce(apiConfig, function (acc, params, key) {
            var apiOptions = params.params;
            if (params.extend) {
                apiOptions = _.extend(apiOptions, options[key]);
            }
            acc[key] = new params.api(key, apiOptions);
            return acc;
        }, {});
    }


    var apis = _createApis();


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
        var cartodbAPI = _getAPI('cartodb');
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
        var cartodbAPI = _getAPI('cartodb');
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
            api.getItem(dataset, callback, errorCallback);
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
        getItem: getItem,
        getCollection: function (collectionName, callback, errorCallback) {
            var norvegianaAPI = _getAPI('norvegiana');
            norvegianaAPI.getCollection(collectionName, callback, errorCallback);
        },
        addApi: function (name, api, params) {
            if (_.has(apiConfig, name)) {
                throw new Error('API with name ' + name + ' already exists');
            }
            params = params || {};
            apiConfig[name] = {
                api: api,
                params: params
            };
            apis = _createApis();
        }
    };

};

KR.API.mappers = {};
