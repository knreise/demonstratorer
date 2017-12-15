(function () {
    'use strict';



    var datasets = [
         {
            name: 'Europeana Art History Collection',
            hideFromGenerator: true,
            provider: 'Europeana Art History Collection',
            dataset: {
                api: 'europeana',
                qf: '(DATA_PROVIDER:"Östasiatiska museet" NOT TYPE:TEXT) OR (DATA_PROVIDER:"Medelhavsmuseet") OR (DATA_PROVIDER:"Rijksmuseum") OR (europeana_collectionName: "91631_Ag_SE_SwedishNationalHeritage_shm_art") OR (DATA_PROVIDER:"Bibliothèque municipale de Lyon") OR (DATA_PROVIDER:"Museu Nacional d\'Art de Catalunya") OR (DATA_PROVIDER:"Victoria and Albert Museum") OR (DATA_PROVIDER:"Slovak national gallery") OR (DATA_PROVIDER:"Thyssen-Bornemisza Museum") OR (DATA_PROVIDER:"Museo Nacional del Prado") OR (DATA_PROVIDER:"Statens Museum for Kunst") OR (DATA_PROVIDER:"Hungarian University of Fine Arts, Budapest") OR (DATA_PROVIDER:"Hungarian National Museum") OR (DATA_PROVIDER:"Museum of Applied Arts, Budapest") OR (DATA_PROVIDER:"Szépművészeti Múzeum") OR (DATA_PROVIDER:"Museum of Fine Arts - Hungarian National Gallery, Budapest") OR (DATA_PROVIDER:"Schola Graphidis Art Collection. Hungarian University of Fine Arts - High School of Visual Arts, Budapest") OR (PROVIDER:"Ville de Bourg-en-Bresse") OR (DATA_PROVIDER:"Universitätsbibliothek Heidelberg") OR ((what:("fine art" OR "beaux arts" OR "bellas artes" OR "belle arti" OR "schone kunsten" OR konst OR "bildende kunst" OR "Opere \'arte visiva" OR "decorative arts" OR konsthantverk OR "arts décoratifs" OR paintings OR schilderij OR pintura OR peinture OR dipinto OR malerei OR måleri OR målning OR sculpture OR skulptur OR sculptuur OR beeldhouwwerk OR drawing OR poster OR tapestry OR gobelin OR jewellery OR miniature OR prints OR träsnitt OR holzschnitt OR woodcut OR lithography OR chiaroscuro OR "old master print" OR estampe OR porcelain OR mannerism OR rococo OR impressionism OR expressionism OR romanticism OR "Neo-Classicism" OR "Pre-Raphaelite" OR Symbolism OR Surrealism OR Cubism OR "Art Deco" OR "Art Déco" OR Dadaism OR "De Stijl" OR "Pop Art" OR "art nouveau" OR "art history" OR "http://vocab.getty.edu/aat/300041273" OR "histoire de l\'art" OR kunstgeschichte OR "estudio de la historia del arte" OR Kunstgeschiedenis OR "illuminated manuscript" OR buchmalerei OR enluminure OR "manuscrito illustrado" OR "manoscritto miniato" OR boekverluchting OR kalligrafi OR calligraphy OR exlibris)) AND (provider_aggregation_edm_isShownBy:*)) NOT (what: "printed serial" OR what:"printedbook" OR "printing paper" OR "printed music" OR DATA_PROVIDER:"NALIS Foundation" OR DATA_PROVIDER:"Ministère de la culture et de la communication, Musées de France" OR DATA_PROVIDER:"CER.ES: Red Digital de Colecciones de museos de España" OR PROVIDER:"OpenUp!" OR PROVIDER:"BHL Europe" OR PROVIDER:"EFG - The European Film Gateway" OR DATA_PROVIDER: "Malta Aviation Museum Foundation" OR DATA_PROVIDER:"National Széchényi Library - Digital Archive of Pictures" OR PROVIDER:"Swiss National Library")'
            },
            bbox: true,
            isStatic: false,
            minZoom: 12,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#ff0000'
                },
            description: 'Europeana Art History Collection'
        }
    ];

    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 

    KR.setupMap(null, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        image: 'https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fqpl39c1v2bj3q67%2FNO_Munch_The_Scream_NG.M.00939.jpg%3Fraw%3D1&size=LARGE&type=IMAGE',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 4,
        layer: layer,
        showLayerList: true
    });
}());
