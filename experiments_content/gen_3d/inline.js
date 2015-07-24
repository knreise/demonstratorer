var qs = KR.Util.parseQueryString(window.location.search);

if (!qs) {
    alert("Missing parameters!");
    return;
}

//set up an instance of the Norvegiana API
var api = new KR.API();


KR.setupMap3d(api, qs.datasets.split(','), qs);
