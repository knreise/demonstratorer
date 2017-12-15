(function () {
    'use strict';
    var qs = KR.Util.parseQueryString(window.location.search);
    if (!qs) {
        alert("Missing parameters!");
        return;
    }

    if (qs.title) {
        $('title').append(qs.title);
    }

    if (qs.norvegianaCollection) {
        //KR.setupCollectionMap(api, qs.norvegianaCollection, qs.layer);
    } else {
        KR.setupMapFromUrl(qs.datasets.split(','), qs);
    }

}());
