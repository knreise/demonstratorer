module.exports = {
  commonScripts: [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/underscore/underscore-min.js',
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/esri2geo/esri2geo.js',
    'bower_components/KNreiseAPI/dist/KNreiseAPI.min.js',
    'common/js/ErrorHandler.js',
    'common/js/util.js',
    'common/js/style.js'
  ],
  commonCss: [
    'bower_components/components-font-awesome/css/font-awesome.min.css',
    'bower_components/leaflet/dist/leaflet.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
  ],
  demonstrators: [
      {
        key: 'dovre',
        name: 'Dovre',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/turf/turf.min.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/DatasetLoader.js',
          'bower_components/L.EasyButton/easy-button.js',
          'common/js/L.Knreise.LocateButton.js',
          'common/js/SplashScreen.js',
          'common/js/setupMap.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
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
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error'
        ]
    },
    {
        key: 'trondheim',
        name: 'Trondheim, eksempel',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/DatasetLoader.js',
          'bower_components/L.EasyButton/easy-button.js',
          'common/js/L.Knreise.LocateButton.js',
          'common/js/SplashScreen.js',
          'common/js/setupMap.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
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
          'flickr',
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'ra_sparql'
        ]
    },
    {
        key: 'dovre_kulturminne',
        name: 'Dovre Kulturminner',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/DatasetLoader.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.Icon.js',
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
          'common/css/audiojs.css'
        ],
        templates: [
          'popup',
          'list_item',
          'kulturminne2'
        ]
    },
    {
        key: 'fangstlokaliteter_dovre',
        name: 'Fangstlokaliteter, Dovre',
        scripts: [
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css'
        ],
        templates: [
          'popup',
          'list_item',
          'fangstgrop'
        ]
    },
    {
        key: 'line_dovre',
        name: 'Pilegrimsleden, Dovre med posisjonering',
        scripts: [
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/L.EasyButton/easy-button.js',
          'bower_components/turf/turf.min.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/PreviewStrip.js',
          'common/js/geolocatormock.js',
          'common/js/FollowLineMap.js',
          'common/js/AlongLine.js',
          'common/js/FollowLineMap.js',
          'common/js/L.Knreise.Icon.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/strip.css'
        ],
        templates: [
          'popup',
          'digitalt_fortalt',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop',
          'artsobservasjon',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'spinner',
          'panel'
        ]
    },
    {
        key: 'linemap',
        name: 'Linjekart',
        scripts: [
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/PreviewStrip.js',
          'bower_components/turf/turf.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'common/js/FollowLineMap.js',
          'common/js/AlongLine.js',
          'common/js/LineMap.js',
          'common/js/L.Knreise.Icon.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/strip.css'
        ],
        templates: [
          'popup',
          'digitalt_fortalt',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop',
          'artsobservasjon',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'spinner',
          'panel'
        ]
    },
    {
        key: 'general',
        name: 'Generell demo',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.NorvegianaGeoJSON.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/L.Control.DatasetChooser.js',
          'common/js/L.Control.MapClick.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
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
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer'
        ]
    },
    {
        key: 'limit_api',
        name: 'Alt eller ingenting',
        scripts: [
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/DatasetLoader.js'
          
        ],
        css: [
          'common/css/fullscreenmap.css',
          'common/css/L.Knreise.Control.Datasets.css',
          'common/css/markers.css'
        ],
        templates: [
          'popup',
          'list_item'
        ]
    },
    {
        key: 'api_example',
        name: 'API-eksempel',
        scripts: [],
        css: [],
        templates: []
    },
    {
        key: 'cesium_base',
        name: 'Cesium base example',
        scripts: [
          'bower_components/cesium1.9/Build/CesiumUnminified/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'common/js/CesiumMap.js'
        ],
        css: [
            'common/css/cesium_base.css'
        ],
        templates: [
        ]
    },
    {
        key: 'cesium_folgefonna',
        name: 'Folgefonna 3D',
        scripts: [
          'bower_components/cesium1.9/Build/CesiumUnminified/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'bower_components/turf/turf.min.js',
          'common/js/CesiumMap.js',
          'common/js/CesiumSidebar.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
            'common/css/cesium_base.css',
            'common/css/cesium_sidebar.css'
        ],
        templates: [
          'cesium_sparql_kulturminne',
          'cesium_wikipedia',
          'cesium_arc_kulturminne'
        ]
    },
    {
        key: 'cesium_terrain',
        name: 'Terrain',
        scripts: [
          'bower_components/cesium1.9/Build/CesiumUnminified/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
            'common/css/cesium_base.css',
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'common/css/cesium_sidebar.css'
        ],
        templates: [
          'cesium_sparql_kulturminne',
          'cesium_wikipedia',
          'cesium_arc_kulturminne'
        ]
    },
    {
        key: 'errors',
        name: 'Error handling',
        scripts: [
          'bower_components/proj4/dist/proj4.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
          'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'common/css/fullscreenmap.css',
          'common/css/markers.css',
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
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
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error'
        ]
    },
    {
        key: 'config',
        name: 'Konfigurering, eksempel',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
          'bower_components/turf/turf.min.js',
          'bower_components/togeojson/togeojson.js',
          'common/js/L.Knreise.MarkerClusterGroup.js',
          'common/js/L.Knreise.GeoJSON.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/DatasetLoader.js',
          'bower_components/L.EasyButton/easy-button.js',
          'common/js/L.Knreise.LocateButton.js',
          'common/js/norgeibilder.js',
          'common/js/datasets.js',
          'common/js/SplashScreen.js',
          'common/js/setupMap.js'
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
          'common/css/L.Knreise.Control.Sidebar.css',
          'common/css/L.Knreise.Control.Datasets.css',
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
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'ra_sparql',
          'flickr',
          'husmann',
          'folketelling',
          'brukerminne'
        ]
    },
    {
        key: 'generator',
        name: 'Generering',
        scripts: [
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'common/js/datasets.js',
          'bower_components/html.sortable/dist/html.sortable.min.js'
        ],
        css: [
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'common/css/generator.css'
        ],
        templates: [
          'popup',
          'verneomraader',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'ra_sparql',
          'flickr',
          'husmann',
          'folketelling',
          'brukerminne'
        ]
    },
    {
        key: 'style',
        name: 'Stiler',
        scripts: [
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/style.js'
        ],
        css: [
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
          'common/css/markers.css'
        ],
        templates: [
          'popup',
          'verneomraader',
          'kulturminne',
          'musit',
          'digitalt_museum',
          'digitalt_fortalt',
          'list_item',
          'fangstgrop',
          'marker',
          'thumbnail',
          'footer',
          'error'
        ]
    }
  ]
};