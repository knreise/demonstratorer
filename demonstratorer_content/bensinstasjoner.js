(function () {

    var api = new KR.API();

    //The datasets in use
    var datasets = [
        'arkivverket_bensinstasjoner'
    ];


    window.setupMap(api, datasets, {
        bbox: '2.4609375,56.9449741808516,33.3984375,71.85622888185527',
        title: title,
        image: 'http://knreise.no/img/riksarkivet/SAS2009-10-1643.jpg',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        minZoom: 5
    });
}());




