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
        }
    });

    KR.setupMapFromUrl(api, qs.datasets.split(','), qs);
}());
