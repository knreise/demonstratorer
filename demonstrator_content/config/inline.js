var qs = KR.Util.parseQueryString(window.location.search);

//set up an instance of the Norvegiana API
var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    },
    flickr: {
        apikey: 'ab1f664476dabf83a289735f97a6d56c'
    }
});

var datasets = KR.Config.getDatasets(qs.datasets.split(','), api, qs.komm);



KR.setupMap(api, datasets, qs);
