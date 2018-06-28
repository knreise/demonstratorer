/* eslint max-len: off*/

//DO NOT CHANGE THIS TO export default, grunt is stupid!
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
                    'musit',
                    'industrimuseum',
                    'foto_sf',
                    'kystreise',
                    'dimu',
                    'ra_kulturmiljo',
                    'ra_lokalitet'
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
            params: {
                'datasets': [
                    'difo',
                    'ra_kulturmiljo',
                    'ra_lokalitet',
                    'musit',
                    'dimu',
                    'wikipedia',
                    'lokalwiki',
                    'nasjonalbiblioteket_bygdebok'
                ],
                fylke: '8',
                geomFilter: true,
                showGeom: true,
                layer: 'norges_grunnkart_graatone',
                image: 'http://dms05.dimu.org/image/032s7YSB9xFJ?dimension=1200x1200',
                description: 'Innhold fra hele Telemark med fokus p&aring; ulike former for kulturminner og kulturminnerelatert innhold - data fra Kulturminnes&oring;k, brukerregistrert innhold i Kulturminnes&oring;k, Digitalt fortalt, Wikipedia og Lokalhistoriewiki.</br></br>'
            }
        },
        {
            id: 'trondheim',
            name: 'Trondheim kommune',
            description: 'Historie og kulturminner i Trondheim.',
            params: {
                datasets: [
                    'verneomr',
                    'difo',
                    'trondheimbyarkiv',
                    'wikipedia',
                    'lokalwiki'
                ],
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/TrondheimNidelva-improved.jpg/640px-TrondheimNidelva-improved.jpg',
                description: '<p>Kulturminner og historie i Trondheim kommune.</p><p>Denne kartl&oslash;sningen inkluderer data fra Riksantikvarens kulturminnes&oslash;k, Trondheim byarkiv, Digitalt museum, Universitetsmuseene, Digitalt fortalt, Milj&oslash;direktoratets verneomr&aring;der, Lokalhistoriewiki og Wikipedia.</p></br>',
                /*line: 'http://www.knreise.no/miniProxy/miniProxy.php/http://knreise.no/demonstratorer/demonstratorer/nidelva.kml',*/
                komm: '1601',
                geomFilter: true,
                showGeom: true,
                layer: 'norges_grunnkart_graatone'
            }
        },
        {
            id: 'flyktningeruta',
            name: 'Flyktningeruta gjennom Østmarka til Sverige',
            description: 'Historiske vandreruter er et samarbeid mellom Den Norske Turistforening (DNT) og Riksantikvaren med mål om å øke kjennskapen til og bruken av gamle ferdselsruter med kulturhistoriske og friluftslivsmessige kvaliteter. Flyktningeruta er en av de utvalgte rutene og her vises ruta sammen med data fra aktuelle kilder i nærheten av denne.',
            params: {
                datasets: [
                    'difo',
                    'ra_lokalitet',
                    'brukerminner',
                    'wikipedia'
                ],
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
            id: 'nidelva',
            name: 'Nidelva',
            description: 'Historie og kulturminner langs Nidelva i Trondheim.',
            params: {
                datasets: [
                    'verneomr',
                    'difo',
                    'trondheimbyarkiv',
                    'wikipedia',
                    'lokalwiki',
                    'ra_kulturmiljo',
                    'ra_lokalitet'
                ],
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/TrondheimNidelva-improved.jpg/640px-TrondheimNidelva-improved.jpg',
                description: '<p>Kulturminner og historie langs Nidelva i Trondheim kommune.</p><p>Denne kartl&oslash;sningen inkluderer data fra Riksantikvarens kulturminnes&oslash;k, Trondheim byarkiv, Digitalt museum, Universitetsmuseene, Digitalt fortalt, Milj&oslash;direktoratets verneomr&aring;der, Lokalhistoriewiki og Wikipedia.</p></br>',
                line: 'http://kd-miniproxy.ra.no/miniProxy.php/http://knreise.no/demonstratorer/data/nidelva.kml',
                buffer: 0.5,
                layer: 'https://{s}.tiles.mapbox.com/v4/havardgj.9013e600/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGF2YXJkZ2oiLCJhIjoiQTlGM3A3NCJ9.fDQKmxi1WcYfBUWm0cQrGg',
                maxZoom: 18,
                minZoom: 12
            }
        },
        {
            id: 'bensinstasjoner',
            name: 'Historiske bensinstasjoner',
            description: 'Historiske bensinstasjoner fra Riksarkivets fotosamlinger',
            params: {
                datasets: [
                    'arkivverket_bensinstasjoner'
                ],
                bbox: '2.4609375,56.9449741808516,33.3984375,71.85622888185527',
                image: 'http://knreise.no/img/riksarkivet/SAS2009-10-1643.jpg',
                description: '<p class="small"><b>Bensinstasjon Lena</b></p>',
                geomFilter: true,
                showGeom: true,
                showScaleBar: true,
                minZoom: 5
            }
        },
        {
            id: 'kulturminnedata',
            name: 'Kulturminnedata fra Riksantikvaren',
            description: 'Kulturminner fra Riksantikvaren.',
            params: {
                datasets: [
                    'ra_kulturmiljo',
                    'ra_lokalitet_arkeologisk',
                    'ra_lokalitet_kirkesteder',
                    'ra_lokalitet_bebyggelse'
                ],
                'bbox': '4.0223174095,57.6773017445,30.9705657959,71.4034238089'
            }
        }

    ],
    demonstrators_extra: [
        //place demonstrators for 'flere demonstratorer' here
        /*{
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
        }*/
    ],
    demonstrators_dev: [
        //place demonstrators that will not be listed here
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