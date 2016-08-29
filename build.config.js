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
    'bower_components/fontawesome/css/font-awesome.min.css',
    'bower_components/leaflet/dist/leaflet.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css'
  ],
  demoScriptsExternal: [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/underscore/underscore-min.js',
    'bower_components/leaflet/dist/leaflet.js',
    'bower_components/pouchdb/dist/pouchdb.min.js',
    'bower_components/Leaflet.TileLayer.PouchDBCached/L.TileLayer.PouchDBCached.min.js',
    'bower_components/esri2geo/esri2geo.min.js',
    'bower_components/KNreiseAPI/dist/KNreiseAPI.min.js',
    'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
    'bower_components/leaflet-sidebar/src/L.Control.Sidebar.min.js',
    'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
    'bower_components/turf/turf.min.js',
    'bower_components/togeojson/togeojson.min.js',
    'bower_components/wellknown/wellknown.min.js',
    'bower_components/proj4/dist/proj4.js',
    'bower_components/CryptoJS/build/components/core.min.js',
    'bower_components/CryptoJS/build/components/md5.min.js',
    'bower_components/audiojs/audiojs/audio.min.js',
    'bower_components/video.js/dist/video-js/video.js',
    'bower_components/jquery-touchswipe/jquery.touchSwipe.min.js',
    'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
    'bower_components/L.EasyButton/easy-button.min.js',
    'bower_components/cilogi-marker/dist/cilogi-marker.min.js',
    'bower_components/abdmob/x2js/xml2json.min.js'
  ],
  demoScripts: [
    'common/js/ErrorHandler.js',
    'common/js/util.js',
    'common/js/style.js',
    'common/js/L.Knreise.MarkerClusterGroup.js',
    'common/js/L.Knreise.GeoJSON.js',
    'common/js/L.Knreise.Control.Sidebar.js',
    'common/js/urlInfo.js',
    'common/js/mediaCarousel.js',
    'common/js/SidebarContent.js',
    'common/js/L.Knreise.Control.Datasets.js',
    'common/js/L.Knreise.Icon.js',
    'common/js/DatasetLoader.js',
    'common/js/L.Knreise.LocateButton.js',
    'common/js/norgeibilder.js',
    'common/js/KulturminneFunctions.js',
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
        'common/js/KulturminneFunctions.js',
        'common/js/datasets.js',
        'common/js/setup3dMap.js'
  ],
  demoCssExternal: [
    'bower_components/fontawesome/css/font-awesome.min.css',
    'bower_components/leaflet/dist/leaflet.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
    'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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
        'bower_components/fontawesome/css/font-awesome.min.css',
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
    'jernbanemuseet',
    'foto_sf',
    'nasjonalbiblioteket',
    'byantikvaren_oslo',
    '3d_sketchfab',
    'nordkirker',
    'bensinstasjoner',
    'europeana280',
    'europeana280_2',
    'ksamsok'
  ],
  demoTemplates: [
    'list_item',
    'marker',
    'thumbnail',
    'footer',
    'error',
    'message',
    'response_form',
    'splashscreen',
    'user_position'
  ],

  demonstrators: [
    {
      id: 'norge',
      name: 'Norge',
      description: 'Landsdekkende visning av sentrale datasett. Kulturminner, historie og fakta fra Kulturminnesøk (Riksantikvaren), Digitalt Museum, Universitetsmuseene, Digitalt fortalt, Lokalhistoriewike, Folketellingen 1910 (Digitalarkivet), Verneområder, Lokalhistoriewiki og Wikipedia.',
      params: {
        "datasets": [
          "difo",
          "verneomr",
          "folketelling",
          "wikipedia",
          "lokalwiki",
          "arkeologi",
          "historie",
          "kunst"
        ],
        "initUserPos": true,
        "bbox": "4.0223174095,57.6773017445,30.9705657959,71.4034238089",
        "layer": "norges_grunnkart_graatone",
        "image": 'http://dms01.dimu.org/image/012s7YmtE6EN?dimension=1200x1200',
        "description": '<p><small>Foto: Lindahl, Axel / Norsk Folkemuseum</small></p><p>Landsdekkende visning av sentrale datasett. Kulturminner, historie og fakta fra Kulturminnesøk (Riksantikvaren), Digitalt Museum, Universitetsmuseene, Digitalt fortalt, Lokalhistoriewike, Folketellingen 1910 (Digitalarkivet), Verneområder, Lokalhistoriewiki og Wikipedia.</p></br>'
      }
    },
    {
      id: 'gudbrandsdalsleden',
      name: 'Gudbrandsdalsleden',
      description: 'Hele pilegrimsleden med alt relevant innhold langs denne. Et bredt utvalg kilder med tanke på både de som følger leden og de som ferdes i områder der leden går.'
    }, 
    {
      id: 'gudbrandsdalsleden_line',
      name: 'Gudbrandsdalsleden - "guidet tur"',
      description: 'Velkommen til en guidet tur langs Gudbrandsdalsleden. Mens du beveger deg langs leden vil vi vise deg relevant innhold.',
      url: 'demonstratorer/linemap.html'
    }, 
    {
      id: 'telemark',
      name: 'Telemark',
      description: 'Innhold fra hele Telemark med fokus på ulike former for kulturminner og kulturminnerelatert innhold - data fra Kulturminnesøk, brukerregistrert innhold i Kulturminnesøk, Digitalt fortalt og Wikipedia.',
      image: 'http://dms05.dimu.org/image/032s7YSB9xFJ?dimension=1200x1200'
    },
    {
      id: 'dovre',
      name: 'Dovre',
      description: 'Kart med fokus på ett område og spesielt på arbeidet som er gjort med produksjon og bearbeiding av innhold og samarbeidet med SNO om naturdata. Delvis en overlapp med Gudbrandsdalsleden, men en mulighet for å vise litt annet utvalg av innhold og en større bredde i innhold på grunn av begrensning til ett mer definert geografisk område.',
      image: 'http://media31.dimu.no/media/image/H-DF/DF.5444/13948?width=800&height=580'
    },
    {
      id: 'keiserstien',
      name: 'Turistvegen over Folgefonna',
      description: '<b>Historiske vandreruter</b> er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. <b>Turistvegen over Folgefonna</b> er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      params: {
        datasets: ['difo', 'arkeologi', 'historie', 'riksantikvaren', 'brukerminner', 'wikipedia'],
        allstatic: true,
        line: 'utno/2.8158',
        buffer: 2,
        linecolor: '#000',
        layer: 'norges_grunnkart',
        image: 'http://dms07.dimu.org/image/012wWX5cXPto?dimension=600x380',
        description: '<p>Turistvegen over Folgefonna er en klassisk bretur, fra Sunndalen over Fonnabu/Folgefonna til Tokheim ved Sørfjorden.</p><p>«Folgefonnens is dækker det ujevne lands overflade, men selve fonnen er forholdsvis jevn i overflaten, og den syder sin rand udover til siderne og tildels sender den sin is langt ned i dalene». Slik ble Folgefonna skildret i «Norges Land og folk i 1896». Turistvegen over Folgefonna er en fottur som følger i sporene etter de europeiske turistene som flokket til fjord-Norge fra midten av 1800-tallet.</p></br>'
      }
    },
    {
      id: 'keiserstien3d',
      name: 'Turistvegen over Folgefonna - 3D',
      description: '3D-visning av <b>Turistvegen over Folgefonna</b> - selve ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      url: 'demonstratorer/keiserstien3d.html'
    },
    {
      id: 'flyktningeruta',
      name: 'Flyktningeruta',
      description: '<b>Historiske vandreruter</b> er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. <b>Flyktningeruta</b> er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      params: {
        datasets: ['difo', 'arkeologi', 'historie', 'riksantikvaren', 'brukerminner', 'wikipedia'],
        allstatic: true,
        line: 'utno/2.11234',
        buffer: 2,
        linecolor: '#deb238',
        layer: 'norges_grunnkart_graatone',
        image: 'https://gfx.nrk.no/WzBhldVq62wY6EAlgNRIPwoDLjogR3DINIdh_Vw2LY9Q',
        description: '<p>Foto: Dag Olav Brækkan</p><p>Flyktningeruta går fra Skullerudstua i Oslo og helt til Grenselosmuseet ved vannet Skjervangen i Eidskog. En tur på borti 120 km. Det fins flere flyktningeruter i Norge, men denne tar utgangspunkt i trafikken som gikk ut fra Oslo og østover til Sverige.</p></br>'
      }
    },
    {
      id: 'brudleruta',
      name: 'Brudleruta',
      description: '<b>Historiske vandreruter</b> er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. <b>Flyktningeruta</b> er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      params: {
        datasets: ['difo', 'arkeologi', 'historie', 'riksantikvaren', 'brukerminner', 'wikipedia'],
        allstatic: true,
        line: 'utno/2.17280',
        buffer: 2,
        linecolor: '#deb238',
        layer: 'norges_grunnkart_graatone',
        image: 'https://gfx.nrk.no/WzBhldVq62wY6EAlgNRIPwoDLjogR3DINIdh_Vw2LY9Q',
        description: '<p>Foto: Dag Olav Brækkan</p><p>Flyktningeruta går fra Skullerudstua i Oslo og helt til Grenselosmuseet ved vannet Skjervangen i Eidskog. En tur på borti 120 km. Det fins flere flyktningeruter i Norge, men denne tar utgangspunkt i trafikken som gikk ut fra Oslo og østover til Sverige.</p></br>'
      }
    },    
	{
      id: 'kjaerlighetsstien',
      name: 'Kjærlighetsstien og Gamlegata',
      description: 'Brukergenerert og bearbeidet innhold langs turrunden Kjærlighetsstien gjennomg Gamlegata i Gvarv i Telemark',
      image: 'http://media31.dimu.no/media/image/H-DF/DF.4920/12312?width=600&height=380'
    },
    {
      id: 'oslo',
      name: 'Oslo',
      description: 'Stedsbegrenset demonstrator med spesiell fokus på kunst og arkitektur, men også innhold fra pilotarbeidet knyttet til Akerselva og integrasjon med andre lokale kilder.',
      url: 'demonstratorer/config.html?datasets=difo%2Cwikipedia%2Clokalwiki%2Chistorie%2Ckunst%2Criksantikvaren%2Cgroruddalen%2Coslobyarkiv&komm=301&layer=norges_grunnkart_graatone&geomFilter=true&showGeom=true#13/59.9174/10.7649',
      appicon:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Akrobaten_gang_og_sykkelbro.jpg/320px-Akrobaten_gang_og_sykkelbro.jpg'
    },
    {
      id: 'folkemusikk',
      name: 'Folkemusikk',
      description: 'Tematisk demo knyttet til folkemusikk i Bø og Sauherad'
    },
    {
      id: 'trondheim',
      name: 'Trondheim',
      description: 'Demonstrator med fokus på Trondheim - innhold fra Digitalt fortalt, Kulturminnesøk, Trondheim byarkiv, Universitetsmueene, Digitalt Musuem og Wikipedia.'
    },
	{
      id: 'nidelva',
      name: 'Nidelva',
      description: 'Historie og kulturminner langs Nidelva i Trondheim kommune'
    },
    {
      id: 'akerselva',
      name: 'Akerselva - DOGA',
      description: 'Historie og kulturminner langs Akerselva og ved DOGA'
    },
    {
      id: 'foto',
      name: 'Foto',
      description: 'Historiske foto fra ulike kilder i hele landet'
    },
    {
      id: '2verdenskrig',
      name: '2. verdenskrig',
      description: '2. verdenskrig og krigens kulturminner. Eget kartgrunnlag basert på tjenesten Mapbox og innhold knyttet til 2. verdenskrig fra Digitalt Fortalt, Jernbanemuseet, Riksantikvaren, Wikipedia og Digitalt Museum.'
    },
    {
      id: 'stavkirker',
      name: 'Stavkirker',
      description: 'Stavkirker og innhold knyttet til stavkirker fra Digitalt Fortalt, Jernbanemuseet, Riksantikvaren, Wikipedia og Digitalt Museum.'
    },
    {
      id: 'stavkirker_ra',
      name: 'Stavkirker - Riksantikvaren',
      description: 'Stavkirker fra Riksantikvaren og Kulturminnesøk'
    },
    {
      id: 'nordkirker',
      name: 'Kirker i Norden',
      description: 'Testkart for visning av kirker i Norden'
    },
    {
      id: 'middelalderkirker',
      name: 'Middelalderkirker - Riksantikvaren',
      description: 'Middelalderkirker fra Riksantikvaren og Kulturminnesøk'
    },
    {
      id: '3d_telemark',
      name: '3D - Telemark',
      description: '3D visning av kulturminner i Telemark'
    },
    {
      id: 'grenseomraader',
      name: 'Kulturminner langs grensen',
      description: 'Eksempel på kulturminner langs grensen mellom Norge og Sverige'
    },
    {
      id: 'bensinstasjoner',
      name: 'Historiske bensinstasjoner',
      description: 'Historiske bensinstasjoner fra Riksarkivets fotosamlinger'
    },
    {
      id: 'NVE',
      name: 'NVE - "kulturminner i kart"',
      description: 'Kulturminner fra NVE (Norges vassdrags- og energidirektorat).',
      url: 'demonstratorer/kulturminner-nve.html'
    },
    {
      id: 'europeana280',
      name: 'Europeana 280',
      description: 'Map showing the locations of all works of art in the Europeana 280 collection (Using CartoDB)'
    },
    {
      id: 'europeana280_2',
      name: 'Europeana 280',
      description: 'Map showing the locations of all works of art in the Europeana 280 collection'
    },
    {
      id: 'europeana_arthistory',
      name: 'Europeana Art History Collection',
      description: 'Europeana Art History Collection'
    },
    {
      id: 'ksamsok',
      name: 'K-samsök eksempel',
      description: 'K-samsök eksempel'
    },
    {
      id: 'europeana_ksamsok',
      name: 'K-samsök eksempel från Europeana',
      description: 'K-samsök eksempel från Europeana'
    }    
  ],
  experiments: [
    {
        key: 'dovre_kulturminne',
        name: 'Dovre Kulturminner',
        scripts: [
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
          'common/js/L.Knreise.Icon.js',
        ],
        css: [
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/DatasetLoader.js'
        ],
        css: [
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
          'bower_components/togeojson/togeojson.js',
          'bower_components/turf/turf.min.js',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.js',
          'bower_components/audiojs/audiojs/audio.min.js',
          'bower_components/video.js/dist/video-js/video.js',
          'bower_components/jquery-touchswipe/jquery.touchSwipe.js',
          'bower_components/Leaflet-MiniMap/dist/Control.MiniMap.min.js',
          'bower_components/CryptoJS/build/components/core.js',
          'bower_components/CryptoJS/build/components/md5.js',
          'bower_components/L.EasyButton/easy-button.js',
          'bower_components/cilogi-marker/dist/cilogi-marker.min.js',
          'bower_components/wellknown/wellknown.js',
          'bower_components/proj4/dist/proj4.js',
          'common/js/SplashScreen.js',
          'common/js/L.Knreise.Control.Sidebar.js',
          'common/js/SidebarContent.js',
          'common/js/L.Knreise.GeoJSON.js',
          'common/js/PreviewStrip.js',
          'common/js/FollowLineMap.js',
          'common/js/AlongLine.js',
          'common/js/LineMap.js',
          'common/js/L.Knreise.Icon.js'
        ],
        css: [
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
          'bower_components/leaflet-sidebar/src/L.Control.Sidebar.css',
          'bower_components/video.js/dist/video-js/video-js.css',
          'bower_components/Leaflet-MiniMap/dist/Control.MiniMap.min.css',
          'bower_components/cilogi-marker/dist/cilogi-marker.css',
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
        key: 'limit_api',
        name: 'Alt eller ingenting',
        scripts: [
          'bower_components/L.TileLayer.Kartverket/dist/L.TileLayer.Kartverket.min.js',
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
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
          'common/js/KulturminneFunctions.js',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.min.js',
          'common/js/L.Knreise.Icon.js',
          'common/js/style.js'
        ],
        css: [
          'bower_components/Leaflet.Photo/Leaflet.Photo.css',
          'bower_components/leaflet.knreise-markers/dist/leaflet.knreise-markers.css',
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