(function () {
    'use strict';
    var qs = KR.Util.parseQueryString(window.location.search);
    if (!qs) {
        alert("Missing parameters!");
        return;
    }

    if (qs.title) {
        $('#page_title').text(qs.title);
    }
    var api = new KR.API();
    KR.setupMap3d(api, qs.datasets.split(','), qs);
}());
