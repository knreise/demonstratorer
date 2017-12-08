/* eslint max-len: off*/
module.exports = {
  demonstrators: [
    {
      id: 'norge',
      name: 'Norge',
      description: 'Landsdekkende visning av sentrale datasett. Kulturminner, historie og fakta fra Kulturminnesøk (Riksantikvaren), Digitalt Museum, Universitetsmuseene, Digitalt fortalt, Lokalhistoriewike, Folketellingen 1910 (Digitalarkivet), Verneområder, Lokalhistoriewiki og Wikipedia.',
      params: {
        'datasets': [
          'difo',
          'verneomr',
          'folketelling',
          'wikipedia',
          'lokalwiki',
          'arkeologi',
          'historie',
          'kunst'
        ],
        'initUserPos': true,
        'bbox': '4.0223174095,57.6773017445,30.9705657959,71.4034238089',
        'layer': 'norges_grunnkart_graatone',
        'image': 'http://dms01.dimu.org/image/012s7YmtE6EN?dimension=1200x1200',
        'description': '<p><small>Foto: Lindahl, Axel / Norsk Folkemuseum</small></p><p>Landsdekkende visning av sentrale datasett. Kulturminner, historie og fakta fra Kulturminnesøk (Riksantikvaren), Digitalt Museum, Universitetsmuseene, Digitalt fortalt, Lokalhistoriewiki, Folketellingen 1910 (Digitalarkivet), Verneområder, Lokalhistoriewiki og Wikipedia.</p></br>'
      }
    },
    {
      id: 'telemark',
      name: 'Telemark',
      description: 'Innhold fra hele Telemark med fokus på ulike former for kulturminner og kulturminnerelatert innhold - data fra Kulturminnesøk, brukerregistrert innhold i Kulturminnesøk, Digitalt fortalt, Wikipedia og Lokalhistoriewiki.',
      image: 'http://dms05.dimu.org/image/032s7YSB9xFJ?dimension=1200x1200'
    },
    {
      id: 'gudbrandsdalsleden',
      name: 'Gudbrandsdalsleden',
      description: 'Pilegrimsleden fra Oslo til Trondheim, med alt relevant innhold langs denne. Et bredt utvalg kilder med tanke på både de som følger leden og de som ferdes i områder der leden går.'
    },
    {
      id: 'dovre',
      name: 'Dovre',
      description: 'Kart med fokus på ett område og spesielt på arbeidet som er gjort med produksjon og bearbeiding av innhold og samarbeidet med Statens naturoppsyn om naturdata. Delvis en overlapp med Gudbrandsdalsleden, men en mulighet for å vise litt annet utvalg av innhold og en større bredde i innhold på grunn av begrensning til ett mer definert geografisk område.',
      image: 'http://media31.dimu.no/media/image/H-DF/DF.5444/13948?width=800&height=580'
    },
    {
      id: 'keiserstien',
      name: 'Turistvegen over Folgefonna',
      description: 'Historiske vandreruter er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. Turistvegen over Folgefonna er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
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
      id: 'flyktningeruta',
      name: 'Flyktningeruta gjennom Østmarka til Sverige',
      description: 'Historiske vandreruter er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. Flyktningeruta er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
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
      name: 'Brudleruta mellom Sirdal og Kvinesdal',
      description: 'Historiske vandreruter er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. Brudleruta er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      params: {
        datasets: ['difo', 'arkeologi', 'historie', 'riksantikvaren', 'brukerminner', 'wikipedia'],
        allstatic: true,
        line: 'utno/2.17280',
        buffer: 2,
        linecolor: '#deb238',
        layer: 'norges_grunnkart_graatone',
        image: 'https://lokalhistoriewiki.no/images/thumb/Brudler.jpeg/320px-Brudler.jpeg',
        description: '<p>Flyfoto av Brudelene på Josdalsheii i Sirdal kommune.</p><p>Foto: Torill Folkestad, fylkeskonservatoren i Vest-Agder. Lisens: CC BY SA</p><p>Brudleruta er en gammel ferdselsvei mellom Sirdal og Kvinesdal. Turen går gjennom et vakkert heielandskap med mange interessante kulturhistoriske spor.Underveis kan du se de historiske Brudlene. Navnet "brudle" betyr fra gammelt av "et brudefølge"</p></br>'
      }
    },
    {
      id: 'nidelva',
      name: 'Nidelva',
      description: 'Historie og kulturminner langs Nidelva i Trondheim.'
    },
    {
      id: 'akerselva',
      name: 'Akerselva',
      description: 'Historie og kulturminner langs Akerselva i Oslo.'
    },
    {
      id: 'foto',
      name: 'Historiske foto fra hele Norge',
      description: 'Historiske foto fra lokale, regionale og nasjonale fotosamlinger.'
    },
    {
      id: '2verdenskrig',
      name: 'Krigens kulturminner',
      description: 'Kulturminner fra 2. verdenskrig. Eget kartgrunnlag fra Mapbox og innhold knyttet til 2. verdenskrig fra Digitalt Fortalt, Jernbanemuseet, Riksantikvaren, Wikipedia og Digitalt Museum.'
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
      id: 'europeana_art_carto',
      name: 'Europeana 280',
      description: 'Map showing the locations of all works of art in the Europeana 280 collection. Data has been harvested from the Europeana API but has been manually refined for this presentation.'
    }

  ],
  demonstrators_extra: [
    //place demonstrators for 'flere demonstratorer' here
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
      appicon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Akrobaten_gang_og_sykkelbro.jpg/320px-Akrobaten_gang_og_sykkelbro.jpg'
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
      id: 'fotografregister',
      name: 'Fotografregisteret',
      description: 'Kartfesting av virkestedene til fotografene i fotografregisteret til Preus museum'
    },
    {
      id: 'emigrantprotokoller',
      name: 'Emigrantprotokoller',
      description: 'Kartfesting av reisem&aring;lene til norske emigranter'
    },
    {
      id: 'historiskeBrev',
      name: 'Historiske Brev',
      description: 'Kart som viser brev fra historiske personer (Using CartoDB)'
    },
    {
      id: 'sparql_debug',
      name: 'Test av API',
      description: 'Forskjellige tester av Riksantikvarens API'
    }
  ],
  demonstrators_dev: [
    //place demonstrators that will not be listed here
    //obsolete demonstrators
    {
      id: 'gudbrandsdalsleden_line',
      name: 'Gudbrandsdalsleden - "guidet tur"',
      description: 'Velkommen til en guidet tur langs Gudbrandsdalsleden. Mens du beveger deg langs leden vil vi vise deg relevant innhold.',
      url: 'demonstratorer/linemap.html'
    },
    {
      id: 'keiserstien3d',
      name: 'Turistvegen over Folgefonna - 3D',
      description: '3D-visning av <b>Turistvegen over Folgefonna</b> - selve ruta sammen med data fra aktuelle kilder i nærheten av denne.',
      url: 'demonstratorer/keiserstien3d.html'
    },
    //under development
    {
      id: 'nasjonale_turistveger',
      name: 'Nasjonale turistveger',
      description: 'Kart med data knyttet til nasjonale turistveger.'
    },
    {
      id: 'nasjonale_turistveger_hardangervidda',
      name: 'Nasjonal turistveg over Hardangervidda',
      description: 'Kart med kulturdata knyttet til den nasjonale turistvegen over Hardangervidda.'
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
    },
    {
      id: 'europeana_art',
      name: 'Europeana 280',
      description: 'Map showing the locations of all works of art in the Europeana 280 collection'
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
      id: 'europeana_lars',
      name: 'Europeana - slott',
      description: 'Europeanadata; fritekstsøk på "castle", for utvalgte land',
      image: 'https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=http%3A%2F%2Fwww.pictures-bank.eu%2Fpokazobrazek.php%3Ffileno%3D2190%26a%3D1&type=IMAGE?width=600&height=380'
    },
        {
      id: 'drammen',
      name: 'Arkitektur i Drammen',
      description: 'Arkitektur i Drammen'
    }
  ]
};