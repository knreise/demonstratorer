/*global CryptoJS:false */

var KR = this.KR || {};

KR.WikipediaAPI = function () {
    'use strict';

    var BASE_URL = 'http://crossorigin.me/https://no.wikipedia.org/w/api.php';

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
        var params = {
            thumbnail: thumbnail,
            images: [_getWikimediaImageUrl(extraData.pageimage)],
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
            var pageIds = _.pluck(response.query.geosearch, 'pageid').join('|');
            _getWikimediaDetails(pageIds, function (pages) {
                var features = _.map(response.query.geosearch, function (item) {
                    return _parseWikimediaItem(item, pages);
                });
                callback(KR.Util.CreateFeatureCollection(features));
            });
        } catch (error) {
            errorCallback(response);
        }
    }

    /*
        Get georeferenced Wikipedia articles within a radius of given point.
        Maps data to format similar to norvegiana api.
    */
    function getWithin(query, latLng, distance, callback, errorCallback) {
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
