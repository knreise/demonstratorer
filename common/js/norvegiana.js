/*global CryptoJS:false */

var Norvegiana = {};

(function (ns) {
    'use strict';


    var contentIcons = {
        'IMAGE': 'camera-retro',
        'VIDEO': 'file-video-o',
        'SOUND': 'music',
        'TEXT': 'file-text',
        'default': 'file-o'
    };


    ns.iconForFeature = function (feature) {
        var contentType = feature.properties.europeana_type;
        if (_.has(contentIcons, contentType)) {
            return contentIcons[contentType];
        }
        return contentIcons['default'];
    };


    var providerColors = {
        'Artsdatabanken': {name: 'darkpuple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'default': {name: 'blue', hex: '#38A9DC'}
    };


    ns.colorForFeature = function (feature, type) {
        type = type || 'name';
        var provider = feature.properties.abm_contentProvider;

        if (_.has(providerColors, provider)) {
            return providerColors[provider][type];
        }
        return providerColors['default'][type];
    };

    ns.API = function () {

        var datasets = {
            'delving_spec:*': 'Alle',
            'delving_spec:Artsdatabanken': 'Artsdatabanken',
            'delving_spec:difo': 'Digitalt fortalt',
            'delving_spec:DiMu': 'DigitaltMuseum',
            'delving_spec:Industrimuseum': 'Industrimuseum',
            'delving_spec:Kulturminnesøk': 'Kulturminnesøk',
            'delving_spec:Universitetsmuseene': 'MUSIT',
            'delving_spec:Naturbase': 'Naturbase',
            'delving_spec:Stedsnavn': 'Stedsnavn',
            'wikipedia': 'Wikipedia'
        };

        var NORVEGIANA_BASE_URL = 'http://kulturnett2.delving.org/api/search';

        var WIKIMEDIA_BASE_URL = 'http://crossorigin.me/https://no.wikipedia.org/w/api.php';

        function _createQueryParameterString(params) {
            return _.map(params, function (value, key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }).join('&');
        }

        function _formatLatLng(latLng) {
            return latLng.lat + ',' + latLng.lng;
        }

        function _arrOrvalue(value) {
            if (value.length > 1) {
                return value;
            }
            return value[0];
        }

        function _geoJSONFeature(latLng, properties) {
            return {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [latLng.lng, latLng.lat]
                },
                'properties': properties
            };
        }

        function _sendRequest(url, callback, parser) {
            $.ajax({
                type: 'get',
                url: url,
                success: function (response) {
                    if (parser) {
                        callback(parser(response));
                    } else {
                        callback(response);
                    }
                }
            });
        }

        function _parseNorvegianaItem(item) {
            var params = _.chain(item.item.fields)
                .pairs()
                .where(function (field) {
                    return field[0] !== 'abm_latLong';
                })
                .reduce(function (acc, field) {
                    acc[field[0]] = _arrOrvalue(field[1]);
                    return acc;
                }, {}).value();
            var pos = _.find(item.item.fields, function (value, key) {
                return key === 'abm_latLong';
            });

            var parsedPos = _.map(pos[0].split(','), parseFloat);
            var feature = _geoJSONFeature({lat: parsedPos[0], lng: parsedPos[1]}, params);
            return feature;
        }

        function _parseNorvegianaItems(response) {
            var features = _.map(response.result.items, _parseNorvegianaItem);
            return {
                'type': 'FeatureCollection',
                'features': features
            };
        }

        function wikiquery(params, callback) {
            var url = WIKIMEDIA_BASE_URL + '?'  + _createQueryParameterString(params);
            _sendRequest(url, function (response) {
                response = JSON.parse(response);
                callback(response);
            });
        }

        function wikiGeneratorQuery(params, finished) {
            var pages = {};


            function gotResponse(response) {

                _.each(response.query.pages, function (page, key) {
                    if (_.has(pages, key)) {
                        pages[key] = _.extend(pages[key], page);
                    } else {
                        pages[key] = page;
                    }
                });


                if (_.has(response, 'continue')) {
                    var cont = {};
                    if (_.has(response['continue'], 'picontinue')) {
                        cont.picontinue = response['continue'].picontinue;
                    }
                    if (_.has(response['continue'], 'excontinue')) {
                        cont.excontinue = response['continue'].excontinue;
                    }

                    var newparams = _.extend(cont, params);

                    wikiquery(newparams, gotResponse);
                } else {
                    console.log("finished!");
                    finished(pages);
                }

            }
            wikiquery(params, gotResponse);
        }

        function _getWikimediaImageUrl(filename) {
            var base = 'http://upload.wikimedia.org/wikipedia/commons/';
            var hash = CryptoJS.MD5(filename).toString();
            return base + hash.substr(0, 1) + '/' + hash.substr(0, 2) + '/' + filename;
        }

        function _getWikimediaDetails(pageIds, callback) {
            var params = {
                action: 'query',
                prop: 'extracts|pageimages',
                exlimit: 20,
                exintro: '',
                pilimit: 20,
                pageids: pageIds,
                format: 'json',
                'continue': ''
            };
            wikiGeneratorQuery(params, callback);
        }

        function _parseWikimediaItem(item, pages) {

            var page = pages[item.pageid];

            var params = {
                dc_description: page.extract,
                delving_thumbnail: _getWikimediaImageUrl(page.pageimage),
                europeana_type: 'TEXT',
                abm_contentProvider: 'Wikipedia',
                europeana_collectionTitle: 'Wikipedia',
                europeana_isShownAt: 'http://no.wikipedia.org/?curid=' + item.pageid,
                dc_title: item.title
            };
            return _geoJSONFeature({lat: item.lat, lng: item.lon}, params);
        }

        function _parseWikimediaItems(response, callback) {
            response = JSON.parse(response);

            var pageIds = _.pluck(response.query.geosearch, 'pageid').join('|');

            _getWikimediaDetails(pageIds, function (pages) {
                console.log(pages);
                var features = _.map(response.query.geosearch, function (item) {
                    return _parseWikimediaItem(item, pages);
                });
                callback({
                    'type': 'FeatureCollection',
                    'features': features
                });
            });
        }

        function _getWithinWikipedia(latLng, distance, callback) {
            var params = {
                action: 'query',
                list: 'geosearch',
                gsradius: distance,
                gscoord: latLng.lat + '|' + latLng.lng,
                format: 'json',
                gslimit: 50
            };
            var url = WIKIMEDIA_BASE_URL + '?'  + _createQueryParameterString(params);
            //var url = 'test.json';
            _sendRequest(url, function (response) {

                _parseWikimediaItems(response, callback);
            });
        }

        function getWithin(query, latLng, distance, callback) {
            distance = distance || 5000;
            if (query === 'wikipedia') {
                _getWithinWikipedia(latLng, distance, callback);
                return;
            }

            distance = distance / 1000; // convert to km
            var params = {
                query: query,
                pt: _formatLatLng(latLng),
                d: distance,
                format: 'json',
                rows: 100
            };
            var url = NORVEGIANA_BASE_URL + '?'  + _createQueryParameterString(params);
            //var url = 'test.json';
            _sendRequest(url, callback, _parseNorvegianaItems);
        }

        function getBbox(query, bbox, callback) {
            //TODO: this does not work!
            var params = {
                query: query,
                bbox: bbox,
                geoType: 'bbox',
                format: 'json'
            };
            var url = NORVEGIANA_BASE_URL + '?'  + _createQueryParameterString(params);
            _sendRequest(url, callback);
        }

        return {
            getWithin: getWithin,
            getBbox: getBbox,
            datasets: function () {return _.extend({}, datasets); }
        };
    };

}(Norvegiana));
