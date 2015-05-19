var map = L.map('map');

//add a background layer from kartverket
L.tileLayer.kartverket('topo2graatone').addTo(map);


//initialize the map in oslo
map.setView(new L.LatLng(59.910586, 10.734329), 7);

var api = new KR.API();

var datasetLoader = new KR.DatasetLoader(api, map);

var datasets = [
    {
        api: 'norvegiana',
        name: 'Museumsdata',
        dataset: ['MUSIT', 'DiMu'],
        isStatic: false,
        bbox: true,
        thumbnails: false,
        smallMarker: true,
        minFeatures: 1000,
        cluster: false
    }
];

var layers = datasetLoader.loadDatasets(datasets);
L.control.datasets(layers).addTo(map);