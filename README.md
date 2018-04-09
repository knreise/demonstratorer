# Kultur- og naturreise - kartdemonstratorer


Kultur- og naturreise er et prosjekt og et nasjonalt løft for å øke tilgangen til offentlig informasjon og lokal kunnskap om kultur og natur. Dette tverretatlige samarbeidet under Kommunal- og moderinseringsdepartementet, Klima- og miljødepartementet og Kulturdepartementet legger til rette for at innhold i fagdatabaser skal gjøres tilgjengelig. Prosjektet er et samarbeid mellom Kulturrådet, Riksantikvaren, Riksarkivet og Kartverket. Innhold og formidlingsløsninger kan tas i bruk og videreutvikles av andre til nye tjenester; av nærings- og reiseliv, i friluftsliv og undervisning. Målet er å øke kunnskap om og skape engasjement for kulturminner og naturverdier.

Disse prototypene og kartløsningene er som en del av dette arbeidet utviklet med bistand fra Norkart i regi av Kultur- og naturreise. Løsningen er inspirert av og i ulike grader basert på åpne og nettleserbasert rammeverk og kartløsninger - blant annet Leaflet, CartoDB, Mapbox, Cesium, Turf og arbeidene til Bjørn Sandvik. Løsningene er fremdeles under utvikling og det vil bli jobbet med justering av både funksjonalitet, grensesnitt og design i tillegg til testing og feilretting i tiden fremover. Det vil også bli jobbet med å få inn nye kilder og med forbedringer for de datasett og kilder som allerede er inne. Til dette arbeidet setter vi stor pris på tilbakemeldinger, spørsmål og kommentarer.


## Utvikling


### Oppsett
0. Installer node og npm
1. Sjekk ut git-repoet:  ```git clone https://github.com/knreise/demonstratorer.git```
2. Installer dependencies: ```npm install```
3. Start dev-server: ```npm start```
4. Editerer du i ```src/demonstrators/index.js``` må du kjøre ```npm run build-demos``` før endringene er synlige


### Konsepter

- **Demonstrator** er en kartside som inneholder ett eller flere datasett
- **Datasett** er en en samling data fra en API-kilde

### Publisere ny versjon

1. Sørg for å ha nyeste kode lokalt
2. Kjør ```npm run build```
3. Innholdet i mappa ```/dist``` kan nå kopieres til en webserver

### Legge til en ny demonstrator

All konfigurasjon av demonstratorer gjøres i ```/src/demonstrators/index.js```. Denne fila eksporterer en dictionary med tre innslag

- **demonstrators**: Demonstratorene som listes på forsiden
- **demonstrators_extra**: Demonstratorer skjult bak "flere demonstratorer"
- **demonstrators_dev**: Demonstratorer som ikke vises på nettsiden, men som kan direkte linkes til

Definisjonen av en demonstrator består av følgende:

- **id**: en id som må være unik, brukes som filnavn på demonstratoren
- **name**: navn på demonstratoren som vises i lista
- **description**: beskrivelsse av demonstratoren som vises i lista
- **params**: en dictionary med atributter som beskriver selve demonstratoren

Params består av:

- **description**: (string) Beskrivelse som vises ved oppstart
- **image**: (string) Url til bilde som vises ved oppstart
- **datasets**: (string[]) En liste med datasett-id'er (samsvarer med listen i ```/src/datasets/datasetList.js```)
- **layer**: (string) Navn på bakgrunnskartlag (fra kartverket), eller en full xyz-tile url
- **bbox**: (string) Avgrensning av demonstratoren som en bounding box
- **komm**: (string) Kommunenummer demonstratoren gjelder for
- **fylke**: (string) Fylkesnummer demonstratoren gjelder for
- **line**: (string) Url til linjegeometri demonstratoren gjelder for (GeoJSON/KML)?
- **buffer**: (int) Hvis line: buffer rundt linje det skal vises data for?
- **geomFilter**: (bool) Skal dataene filtreres på kummune/fylkesgeometrien? Default: false
- **showGeom**: (bool) Skal dataene filtreres på kummune/fylkesgeometrien? Default: false
- **restrictMap**: (bool) Skal man kunne panorere kartet utenfor initiell begrensing? Default: false
- **initUserPos**: (bool) Skal vi spørre om brukerens posisjon og starte demonstratoren der? Default: false

Default-verdier settes i ```/src/config/defaultOptions.js```

NB: Angi enten bbox, komm, fylke, eller line

NB: Du må kjøre ```npm run build-demos``` før endringene er synlige


### Legge til nytt datasett
Editer ```/src/datasets/datasetList.js```

1. lag en ny variabel som refererer til en dictionary med datasett-parametre.
2. Legg til denne i dictioanryen som eksporteres i bunnen av fila. Merk at keyen her er datasett-iden.

Datasett-konfigurasjonen består av:

- **name**: (string) Navn på datsettet
- **provider**: (string) Navn på den som tilbyr datasettet
- **dataset**: (DatasetDef) Datasett-definisjon fra KNReiseAPI
- **datasets**: (DatasetConfig[0]) Liste av datasett-definisjoner om dette er en gruppe
- **template**: (string) Filnavn (minus .tmpl) på template i ```/src/templates/templates/datsets/```. Default: popup
- **style**: (Style) Stil-informasjon, se under.
- **bbox**: (bool) Skal data lastes på grunnlag av bbox? Default: true
- **cluster**: (bool) Skal punkter clustres? Default: true
- **commonCluster**: (bool) Hvis gruppe, skal punkter fra alle datasett clustres sammen? Default: false
- **isStatic**: (bool) Apiet spørres på nytt når kartet beveges? Default: false. NB: kartet cacher en del data, det er mest fornuftig å ha denne false om bbox=true
- **grouped**: (bool) Er dette en gruppe med datasett? Default false
- **hideFromGenerator**: (bool) Skal datasettet være skjult på generatorsiden? Default false
- **minZoom**: (int) Minste zoomnivå data skal vises på
- **maxZoom**: (int) Største zoomnivå data skal vises på
- **loadExtraData**: (bool) Skal Knreise-Api-metoden getData kalles når brukeren trykker på en feature? (default false)
- **polygonsAsPoints**: (bool) Skal polygoner vises som punkter? Default false
- **polygonsAsPointsPixelThreshold**: (int) Hvor lite i pixler polygonet må være før det vises som punkt. Default = 50
- **polygonsAsPointsZoomThreshold**: (int) Zoomnivå hvor polygon vises som punkt. Default = 18
- **loadSubLayer**: (bool) Skal en "sublayer" lastes når en feature velges? Default=false
- **sublayerConfig**: (DatasetConfig) Konfigurasjon for en sublayer, brukes når loadSubLayer = true.

En style er definert med følgende:

- **bordercolor**: (hex-farge) Farge på kanter. Default = #38A9DC
- **fillcolor**:  (hex-farge) Fyllfarge. Default = #38A9DC
- **radius**: (int) Radius på sirkler. Default = 9
- **clickable**: (bool) Skal det være mulig å klikke på markøren/geometrien? Default = true
- **weight**: (int) Størrelse. Samsvarer med LEaflet sin weight. Default = 2
- **fillOpacity**: (number) Gjennomsiktighet, fyll. Default = 0.2
- **borderWidth**: (string) Tykkelse, kanter, Default = 2px


