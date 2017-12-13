(function () {
    'use strict';

    var api = new KR.API({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        }
    });

    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/havardgj.9013e600/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGF2YXJkZ2oiLCJhIjoiQTlGM3A3NCJ9.fDQKmxi1WcYfBUWm0cQrGg');

    var datasets = ['historie', 'difo', 'wikipedia', 'lokalwiki', 'oslobyarkiv'];

    window.setupMap(api, datasets, {
        title: title,
        image: 'http://dms08.dimu.org/image/03VVkE6ET9?dimension=600x380',
        description: $('#description_template').html(),
        bbox: '10.749607086181639,59.91590263019011,10.759949684143066,59.922355662817154',
        layer: layer,
        maxZoom: 18,
        minZoom: 12
    });

}());
