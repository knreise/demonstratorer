(function () {
    'use strict';
    var qs = KR.Util.parseQueryString(window.location.search);
    if (!qs) {
        alert("Missing parameters!");
        return;
    }
    //set up an instance of the Norvegiana API
    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        },
        jernbanemuseet: {
            apikey: '336a8e06-78d9-4d2c-84c9-ac4fab6e8871'
        }
    });

    if (qs.title) {
        $('title').append(qs.title);
    }

    if (qs.norvegianaCollection) {
        KR.setupCollectionMap(api, qs.norvegianaCollection, qs.layer);
    } else {
        KR.setupMapFromUrl(api, qs.datasets.split(','), qs);
    }

}());
