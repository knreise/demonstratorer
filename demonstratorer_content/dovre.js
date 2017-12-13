(function () {
    'use strict';

    var api = new KR.API();

    var datasets = [
        'verneomr',
        'pilegrimsleden',
        'difo',
        'fangstgroper',
        'historie',
        'arkeologi',
        'artobs'
    ];

    window.setupMap(api, datasets, {
        komm: '0511',
        title: title,
        image: image,
        geomFilter: true,
        showGeom: true,
        layer: 'norges_grunnkart',
        description: $('#description_template').html()
    });
}());