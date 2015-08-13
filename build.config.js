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
    'bower_components/bootstrap/dist/css/bootstrap.min.css'
  ],
  demoScriptsExternal: [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/underscore/underscore-min.js',
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/esri2geo/esri2geo.js',
    'bower_components/KNreiseAPI/dist/KNreiseAPI.min.js',
    'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
    'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
    'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
    'bower_components/turf/turf.min.js',
    'bower_components/togeojson/togeojson.js',
    'bower_components/wellknown/wellknown.js',
    'bower_components/proj4/dist/proj4.js',
    'bower_components/CryptoJS/build/components/core.js',
    'bower_components/CryptoJS/build/components/md5.js',
    'bower_components/audiojs/audiojs/audio.min.js',
    'bower_components/video.js/dist/video-js/video.js',
    'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
    'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
    'bower_components/L.EasyButton/easy-button.js',
    'bower_components/cilogi-marker/dist/cilogi-marker.min.js'
  ],
  demoScripts: [
    'common/js/ErrorHandler.js',
    'common/js/util.js',
    'common/js/style.js',
    'common/js/L.Knreise.MarkerClusterGroup.js',
    'common/js/L.Knreise.GeoJSON.js',
    'common/js/L.Knreise.Control.Sidebar.js',
    'common/js/SidebarContent.js',
    'common/js/L.Knreise.Control.Datasets.js',
    'common/js/L.Knreise.Icon.js',
    'common/js/DatasetLoader.js',
    'common/js/L.Knreise.LocateButton.js',
    'common/js/norgeibilder.js',
    'common/js/datasets.js',
    'common/js/SplashScreen.js',
    'common/js/ResponseForm.js',
    'common/js/setupMap.js',
    'common/js/setupCollection.js'
  ],
  demoScriptsExternal3d: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/underscore/underscore-min.js',
        'bower_components/leaflet/dist/leaflet.js',
        'bower_components/esri2geo/esri2geo.js',
        'bower_components/KNreiseAPI/dist/KNreiseAPI.min.js',
        'bower_components/Cesium-1.11/Build/Cesium/Cesium.js',
        'bower_components/togeojson/togeojson.js',
        'bower_components/wellknown/wellknown.js',
        'bower_components/proj4/dist/proj4.js',
        'bower_components/CryptoJS/build/components/core.js',
        'bower_components/CryptoJS/build/components/md5.js',
        'bower_components/jquery-ui/jquery-ui.min.js',
        'bower_components/turf/turf.min.js',
        'bower_components/cesium-minimap/cesium-minimap.min.js',
        'bower_components/audiojs/audiojs/audio.min.js',
        'bower_components/video.js/dist/video-js/video.js',
        'bower_components/jquery-touchswipe/jquery.touchSwipe.js'
  ],
  demoScripts3d: [
        'common/js/ErrorHandler.js',
        'common/js/util.js',
        'common/js/style.js',
        'common/js/PathTracer.js',
        'common/js/CesiumMap.js',
        'common/js/CesiumSidebar.js',
        'common/js/SidebarContent.js',
        'common/js/DatasetLoader.js',
        'common/js/datasets.js',
        'common/js/setup3dMap.js'
  ],
  demoCssExternal: [
    'bower_components/components-font-awesome/css/font-awesome.min.css',
    'bower_components/leaflet/dist/leaflet.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
    'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.css',
    'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
    'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
    'bower_components/Leaflet.Photo/Leaflet.Photo.css',
    'bower_components/video.js/dist/video-js/video-js.css',
    'bower_components/cilogi-marker/dist/cilogi-marker.css'
  ],
  demoCss: [
    'common/css/fullscreenmap.css',
    'common/css/markers.css',
    'common/css/L.Knreise.Control.Sidebar.css',
    'common/css/L.Knreise.Control.Datasets.css',
    'common/css/audiojs.css'
  ],
  demoCssExternal3d: [
        'bower_components/Cesium-1.11/Build/Cesium/Widgets/widgets.css',
        'bower_components/components-font-awesome/css/font-awesome.min.css',
        'bower_components/leaflet/dist/leaflet.css',
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/cesium-minimap/cesium-minimap.css',
        'bower_components/video.js/dist/video-js/video-js.css'
  ],
  demoCss3d: [
        'common/css/L.Knreise.Control.Sidebar.css',
        'common/css/cesium_base.css',
        'common/css/cesium_sidebar.css'
  ],

  demoDatasetTemplates: [
    'verneomraader',
    'kulturminne',
    'kulturminne2',
    'musit',
    'digitalt_museum',
    'digitalt_fortalt',
    'folketelling',
    'wikipedia',
    'ra_sparql',
    'fangstgrop',
    'flickr',
    'husmann',
    'brukerminne',
    'popup',
    'jernbanemuseet'
  ],
  demoTemplates: [
    'list_item',
    'marker',
    'thumbnail',
    'footer',
    'error',
    'message',
    'response_form',
    'splashscreen'
  ],

  demonstrators: [
    {
      id: 'gudbrandsdalsleden',
      name: 'Gudbrandsdalsleden',
      description: 'Hele pilegrimsleden med alt relevant innhold langs og i en viss avstand til denne. Et bredt utvalg kilder med tanke på både de som følger leden og de som ferdes i områder der leden går.'
      //url: 'demonstratorer/config.html?datasets=verneomr%2Cartobs%2Cwikipedia&allstatic=true&line=http%3A%2F%2Fpilegrimsleden.no%2Fassets%2Fkml%2Fgudbrands_062015_r.kml&buffer=2&linecolor=%23000000&layer=norges_grunnkart_graatone'
    }, 
    {
      id: 'telemark',
      name: 'Telemark',
      description: 'Formidling av innhold fra hele Telemark med fokus på ulike former for kulturminner og kulturminnerelatert innhold - data fra Askeladden, brukerregistrert innhold i Kulturminnesøk, Digitalt fortalt og Wikipedia.'//,
      //url: 'demonstratorer/config.html?datasets=difo%2Cwikipedia%2Cark_hist&fylke=8&layer=norges_grunnkart_graatone&geomFilter=true&showGeom=true'
    },
    {
      id: 'dovre',
      name: 'Dovre',
      description: 'Løsning som fokuserer på ett område og spesielt på arbeidet som er gjort med produksjon og bearbeiding av innhold - spesielt fra samarbeidet med SNO om naturdata. Delvis en overlapp med Gudbrandsdalsleden, men en mulighet for å vise litt annet utvalg av innhold og en større bredde i innhold på grunn av begrensning til ett mer definert geografisk område.',
      image: 'http://placekitten.com/g/816/612/'
    },
    {
      id: 'keiserstien',
      name: 'Keiserstien',
      description: 'Samarbeid med DNT og Riksantikvaren om å velge ut en av de rutene de arbeider med. Visning av data for en utvalgt historisk vandrerute og utvalgte data fra aktuelle kilder i nærheten av denne.',
      url: 'demonstratorer/config.html?datasets=difo%2Cark_hist%2Cwikipedia&allstatic=true&line=utno%2F2.8158&buffer=2&linecolor=%230033ff&layer=norges_grunnkart_graatone'
    },
    {
      id: 'keiserstien3d',
      name: 'Keiserstien 3D',
      description: 'Samarbeid med DNT og Riksantikvaren om å velge ut en av de rutene de arbeider med. Visning av data for en utvalgt historisk vandrerute og utvalgte data fra aktuelle kilder i nærheten av denne.',
      url: 'demonstratorer/keiserstien3d.html'
    },
    {
      id: 'kjaerlighetsstien',
      name: 'Kjærlighetsstien med Gamlegata',
      description: 'Brukergenerert og bearbeidet innhold knyttet til turrunde som omfatter Kjærlighetsstien og Gamlegata i Gvarv i Telemark'
    },
    {
      id: 'oslo',
      name: 'Oslo',
      description: 'Stedsbegrenset demonstrator med spesiell fokus på kunst og arkitektur, men også innhold fra pilotarbeidet knyttet til Akerselva og integrasjon med andre lokale kilder.',
      url: 'demonstratorer/config.html?datasets=difo%2Cfolketelling%2Criksantikvaren&komm=301&layer=norges_grunnkart_graatone&geomFilter=true&showGeom=true'
    },
    {
      id: 'folkemusikk',
      name: 'Folkemusikk',
      description: 'Tematisk demo knyttet til folkemusikk i Bø og Sauherad'
    },
    {
      id: 'trondheim',
      name: 'Trondheim',
      description: 'Demonstrator med fokus på Trondheim'
    },
    {
      id: '2verdenskrig',
      name: '2. verdenskrig',
      description: '2. verdenskrig'
    }
  ],
  experiments: [
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
          'common/js/SidebarContent.js',
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
          'list_item'
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
          'common/js/SidebarContent.js',
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
          'list_item'
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
          'common/js/SidebarContent.js',
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
          'list_item',
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
          'common/js/SidebarContent.js',
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
          'list_item',
          'marker',
          'thumbnail',
          'footer',
          'error',
          'spinner',
          'panel'
        ]
    },
    {
        key: 'limit_api',
        name: 'Alt eller ingenting',
        scripts: [
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.min.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/L.Knreise.Control.Datasets.js',
          'common/js/DatasetLoader.js'
          
        ],
        css: [
          'common/css/fullscreenmap.css',
          'common/css/L.Knreise.Control.Datasets.css',
          'common/css/markers.css'
        ],
        templates: [
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
          'bower_components/Cesium-1.11/Build/Cesium/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/cesium-minimap/cesium-minimap.min.js',
          'common/js/CesiumMap.js'
        ],
        css: [
            'bower_components/Cesium-1.11/Build/Cesium/Widgets/widgets.css',
            'bower_components/cesium-minimap/cesium-minimap.css',
            'common/css/cesium_base.css'
        ],
        templates: [
        ]
    },
    {
        key: 'cesium_folgefonna',
        name: 'Folgefonna 3D',
        scripts: [
          'bower_components/Cesium-1.11/Build/Cesium/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'bower_components/turf/turf.min.js',
          'bower_components/cesium-minimap/cesium-minimap.min.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'common/js/PathTracer.js',
          'common/js/CesiumMap.js',
          'common/js/CesiumSidebar.js',
          'common/js/SidebarContent.js',
          'common/js/DatasetLoader.js',
          'common/js/datasets.js',
          'common/js/setup3dMap.js'
        ],
        css: [
            'bower_components/Cesium-1.11/Build/Cesium/Widgets/widgets.css',
            'bower_components/cesium-minimap/cesium-minimap.css',
            'bower_components/video.js/dist/video-js/video-js.css',
            'common/css/L.Knreise.Control.Sidebar.css',
            'common/css/cesium_base.css',
            'common/css/cesium_sidebar.css'
        ],
        templates: [
          'cesium_sparql_kulturminne',
          'cesium_wikipedia',
          'cesium_arc_kulturminne',
          'list_item',
          'marker',
          'thumbnail',
          'footer',
          'error'
        ]
    },
    {
        key: 'cesium_terrain',
        name: 'Terrain',
        scripts: [
          'bower_components/Cesium-1.11/Build/Cesium/Cesium.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
            'bower_components/Cesium-1.11/Build/Cesium/Widgets/widgets.css',
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
          'list_item',
          'marker',
          'thumbnail',
          'footer',
          'error'
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
          'list_item',
          'marker',
          'thumbnail',
          'footer',
          'error'
        ]
    }
  ]
};