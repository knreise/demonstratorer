module.exports = {
  demonstrators : [
    {
        key: 'dovre',
        name: 'Dovre',
        scripts: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/leaflet/dist/leaflet.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/esri2geo/esri2geo.js',
          'common/js/L.TileLayer.Kartverket.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Control.NorvegianaSidebar.js',
          'common/js/L.Control.Datasets.js',
          'common/js/util.js',
          'common/js/arcgis.js',
          'common/js/wikipedia.js',
          'common/js/norvegiana.js',
          'common/js/cartodb.js',
          'common/js/api.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
          'bower_components/leaflet/dist/leaflet.css',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Control.NorvegianaSidebar.css',
          'common/css/L.Control.Datasets.css',
          'common/css/audiojs.css'
        ],
        templates: [
          'popup',
          'verneomraader',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop'
        ]
    },
    {
        key: 'fangstlokaliteter_dovre',
        name: 'Fangstlokaliteter, Dovre',
        scripts: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/leaflet/dist/leaflet.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/esri2geo/esri2geo.js',
          'common/js/L.TileLayer.Kartverket.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Control.NorvegianaSidebar.js',
          'common/js/L.Control.Datasets.js',
          'common/js/util.js',
          'common/js/arcgis.js',
          'common/js/wikipedia.js',
          'common/js/norvegiana.js',
          'common/js/cartodb.js',
          'common/js/api.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
          'bower_components/leaflet/dist/leaflet.css',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Control.NorvegianaSidebar.css',
          'common/css/L.Control.Datasets.css'
        ],
        templates: [
          'popup',
          'list_item',
          'fangstgrop'
        ]
    },
    {
        key: 'line_dovre',
        name: 'Pilegrimsleden, Dovre',
        scripts: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/leaflet/dist/leaflet.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/L.EasyButton/easy-button.js',
          'bower_components/turf/turf.min.js',
          'common/js/L.TileLayer.Kartverket.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Control.NorvegianaSidebar.js',
          'common/js/L.Control.Datasets.js',
          'common/js/util.js',
          'common/js/wikipedia.js',
          'common/js/norvegiana.js',
          'common/js/cartodb.js',
          'common/js/api.js',
          'common/js/geolocatormock.js',
          'common/js/AlongLine.js'
        ],
        css: [
          'bower_components/leaflet/dist/leaflet.css',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Control.NorvegianaSidebar.css',
          'common/css/along-line.css'
        ],
        templates: [
          'popup',
          'verneomraader',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop'
        ]
    },
    {
        key: 'general',
        name: 'Generell demo',
        scripts: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/leaflet/dist/leaflet.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/esri2geo/esri2geo.js',
          'common/js/L.TileLayer.Kartverket.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Control.NorvegianaSidebar.js',
          'common/js/L.Control.Datasets.js',
          'common/js/util.js',
          'common/js/arcgis.js',
          'common/js/wikipedia.js',
          'common/js/norvegiana.js',
          'common/js/cartodb.js',
          'common/js/api.js',
          'common/js/L.Control.DatasetChooser.js',
          'common/js/L.Control.MapClick.js'
        ],
        css: [
          'bower_components/leaflet/dist/leaflet.css',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Control.NorvegianaSidebar.css',
          'common/css/L.Control.Datasets.css',
          'common/css/audiojs.css',
          'common/css/L.Control.DatasetChooser.css'
        ],
        templates: [
          'popup',
          'verneomraader',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop'
        ]
    },
    {
        key: 'limit_api',
        name: 'Alt eller ingenting',
        scripts: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/leaflet/dist/leaflet.js',
          'common/js/L.TileLayer.Kartverket.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Control.Datasets.js',
          'common/js/util.js',
          'common/js/norvegiana.js',
          'common/js/api.js',
          'common/js/DatasetLoader.js'
          
        ],
        css: [
          'bower_components/leaflet/dist/leaflet.css',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'common/css/fullscreenmap.css',
          'common/css/L.Control.Datasets.css',
          'common/css/markers.css'
        ],
        templates: [
          'popup',
          'list_item'
        ]
    }
  ]
};