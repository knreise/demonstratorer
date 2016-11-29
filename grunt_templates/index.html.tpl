<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">

    <title>KNReise - demonstratorer</title>

    <link href='bower_components/fontawesome/css/font-awesome.min.css' rel='stylesheet' />
    <link href='bower_components/bootstrap/dist/css/bootstrap.min.css' rel='stylesheet' />
    <link href='common/css/generator.css' rel='stylesheet' />

  </head>

  <body>

    <div class="well" style="padding: 35px;">
		<img src="common/img/knreise_logo.png"/></br>
		<h1>Kart og demonstratorer</h1>
		<div class="lead">
		<p><img src="common/img/map_detail.png" class="img-circle img-thumbnail" width="130" align="right" style="margin: 0px 20px 20px 30px;"/><a href="http://kulturognaturreise.no">Kultur- og naturreise</a> er et prosjekt og et nasjonalt løft for å øke tilgangen til offentlig informasjon og lokal kunnskap om kultur og natur. Dette tverretatlige samarbeidet under Kommunal- og moderinseringsdepartementet, Klima- og miljødepartementet og Kulturdepartementet legger til rette for at innhold i fagdatabaser skal gjøres tilgjengelig. Prosjektet er et samarbeid mellom <a href="http://www.kulturradet.no">Kulturrådet</a>, <a href="http://www.	riksantikvaren.no">Riksantikvaren</a>, <a href="http://www.riksarkivet.no">Riksarkivet</a> og <a href="http://www.kartverket.no">Kartverket</a>. Innhold og formidlingsløsninger kan tas i bruk og videreutvikles av andre til nye tjenester; av nærings- og reiseliv, i friluftsliv og undervisning. Målet er å øke kunnskap om og skape engasjement for kulturminner og naturverdier.</p>
		<p>Disse prototypene og kartløsningene er som en del av dette arbeidet utviklet med bistand fra <a href="http://norkart.no">Norkart</a> i regi av <a href="http://kulturognaturreise.no">Kultur- og naturreise</a>. Løsningen er inspirert av og i ulike grader basert på åpne og nettleserbasert rammeverk og kartløsninger - blant annet <a href="http://leafletjs.com/">Leaflet</a>, <a href="http://cartodb.com">CartoDB</a>, <a href="http://mapbox.com">Mapbox</a>, <a href="http://cesiumjs.org/">Cesium</a>, <a href="http://turfjs.org/">Turf</a> og arbeidene til <a href="http://mastermaps.com">Bjørn Sandvik</a>. Løsningene er fremdeles under utvikling og utover høsten vil det bli jobbet med justering av både funksjonalitet, grensesnitt og design i tillegg til testing og feilretting. Det vil også bli jobbet med å få inn nye kilder og med forbedringer for de datasett og kilder som allerede er inne. Til dette arbeidet setter vi stor pris på <a href="mailto:havjoh@arkivverket.no">tilbakemeldinger, spørsmål og kommentarer</a>.</p>
		</div>
	</div>
	
    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <div class="col-md-6">
          <h2>Demonstratorer</h2>
            <div class="list-group">
              {{ _.each(demos, function (demonstrator) { }}
                <a href="{{= demonstrator.url }}" class="list-group-item" target="_blank">
                  <h4 class="list-group-item-heading"><i class="fa fa-map-o"></i> {{= demonstrator.name }}</h4>
                  <p class="list-group-item-text">{{= demonstrator.description }}</p>
                </a>{{ }) }}
            </div>

            {{if (extraDemos.length) { }}
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="headingOne">
                  <h4 class="panel-title">
                    <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      Flere Demonstratorer
                    </a>
                  </h4>
                </div>
                
                <div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                    <div class="list-group">
                      {{ _.each(extraDemos, function (demonstrator) { }}
                        <a href="{{= demonstrator.url }}" class="list-group-item" target="_blank">
                          <h4 class="list-group-item-heading"><i class="fa fa-map-o"></i> {{= demonstrator.name }}</h4>
                          <p class="list-group-item-text">{{= demonstrator.description }}</p>
                        </a>{{ }) }}
                    </div>
                </div>
              </div>
              {{ } }}

        </div>
        <div class="col-md-6">
	      <div>
	          <h2>Sett opp ditt eget kart</h2>
	          <p>Det er som en del av arbeidet med å sette opp ulike kartvisninger og demonstratorer også utviklet et web-grensesnitt der du enkelt kan generere ditt eget kart. Her kan du velge område, hvilke datasett du vil ha med og hvilket kartgrunnlag du ønsker å bruke.</p>
	          <p>
		          <a class="btn btn-small btn-info" href="demonstratorer/generator.html">
				  <i class="fa fa-pencil-square-o fa-lg"></i> Lag ditt kart her</a>
		      </p>
	      </div>
	      
	      <div class="panel" style="margin-top: 20px;">
          </div>
		      
	      <div class="well">
	        <h4>Datasett</h4>
	        <p>Det er i dette rammeverket og disse løsningene gitt tilgang til en rekke ulike datasett. Noen av dem er integrert direkte, mens andre er gjort tilgjengelig ved hjelp av ulike aggregeringsløsninger. </p>
	        <p>Den viktigste aggegeringsløsningen som er er brukt er <a href="http://www.norvegiana.no">Norvegiana</a>. Dette er en tjeneste som forvaltes av <a href="http://kulturradet.no">Kulturrådet</a> og som gir samlet tilgang til data fra en rekke datasett. I denne løsningen er det gitt tilgang til stedfestede data fra <a href="http://digitaltfortalt.no">Digitalt fortalt</a>, <a href="http://www.unimus.no/">Universitetsmuseene (Musit)</a>, <a href="http://industrimuseum.no">Industrimuseum</a>, data fra tjenesten <a href="http://kystreise.no">Kystreise</a> og <a href="http://digitaltmuseum">Digitalt Museum</a>.</p>
	        <p>Riksantivaren har ulike tjenester som er gjort tilgjengelig. Fagdata fra Askeladden og <a href="http://kulturminnesok.no">Kulturminnesøk</a> og bilder fra tjenesten <a href="http://kulturminnebilder.ra.no/">Kulturminnebilder</a> er gjort tilgjengelig ved hjelp av Riksantikvarens SPARQL-grensesnitt. Brukerregistrerte kulturminner fra Kulturminnesøk er gjort tilgjengelig ved hjelp av deres Husmann API.</p>
	        <p>Den stedfestede <a href="https://arkivverket.no/arkivverket/Digitalarkivet/Om-Digitalarkivet/Om-kjeldene/Folketellingen-1910">folketellingen fra 1910</a> fra Riksarkivet her gjort tilgjengelig ved hjelp av <a href="https://arkivverket.no/arkivverket/content/download/12760/123213/version/5/file/API_1910_koord.pdf">Digitalarkivets API</a></p>
	        <p>Stedfestede artikler fra Wikipedia - <a href="http://no.wikipedia.org">bokmål</a> og <a href="http://nn.wikipedia.org">nynorsk</a> - er hentes fra Wikipedia sitt <a href="http://https://www.mediawiki.org/wiki/Extension:GeoData">eget API</a> for uthenting av stedfestede artikler. Et tilsvarende API er gjort tilgjengelig av <a href="http://lokalhistoriewiki.no/index.php/Norsk_lokalhistorisk_institutt">Norsk Lokalhistorisk institutt</a> for uthenting av stedfestede artikler fra <a href="http://lokalhistoriewiki.no">Lokalhistoriewiki</a>.</p>
	        <p>En del innhold er lagt inn i ulike løsninger for lagring og tilgjengeliggjøring av stedfestede data - uten en direkte kobling til original kilde. Dette er gjort for å vise muligheter ved integrasjon av ulike datatyper og i de tilfeller der det ikke var praktisk mulig å hente data direkte. Et statisk uttrekk av artsobservasjoner er gjort tilgjengelig ved hjelp av Norvegiana. <a href="http://www.miljodirektoratet.no/no/Tema/Verneomrader/">Verneområder</a> fra <a href="">Miljødirektoratet</a> og <a href="http://www.oppdaggroruddalen.no/">Oppdag Groruddalen</a> fra <a href="https://www.oslo.kommune.no/politikk-og-administrasjon/etater-og-foretak/byantikvaren/">Byantikvaren i Oslo</a> og <a href="https://www.nb.no/">Nasjonalbibliotekets</a> <a href="http://www.genealogi.no/mediawiki/index.php/Liste_over_digitaliserte_bygdeb%C3%B8ker_%E2%80%93_Telemark">bygdebøker fra Telemark</a> er gjort tilgjengelig ved hjelp av <a href="http://cartodb.com">CartoDB</a>. Ulike formidlingsrettede fortellinger er gjort tilgjengelig ved hjelp av tjenesten <a href="http://digitaltfortalt.no">Digitalt fortalt</a> - dette gjelder innhold fra <a href="http://pilegrimsleden.no/">Nasjonalt Pilegrimssenter</a>, <a href="https://www.oslo.kommune.no/politikk-og-administrasjon/etater-og-foretak/byantikvaren/">Byantikvaren i Oslo</a> og <a href="http://arkivverket.no/">Arkivverket</a>.</p>
	        <p><a href="http://jernbanemuseet.no">Jernbanemuseet</a> sitt innhold knyttet til 2. verdenskrig er hentet ut fra tjenesten <a href="http://kulturit.org/kulturpunkt">Kulturpunkt</a>.</p>
	        <p>Historiske foto er gjort tilgjengelig fra ulike kilder. Et stort antall er gjort tilgjengelig fra <a href="http://digitaltmuseum">Digitalt Museum</a> og en rekke mindre samlinger av stedfestede foto er gjort tilgjengelig fra <a href="http://flickr.com">Flickr</a> -<a href="https://www.trondheim.kommune.no/byarkivet">Trondheim byarkiv</a>, <a href="https://wideroevestfold.wordpress.com/">flyfoto fra Vestfoldmuseene</a>, <a href="http://www.arkivinordland.no/">krigsbilder fra Arkiv i Nordland</a>, foto fra <a href="http://riksarkivet.no">Riksarkivet</a>, <a href="http://nb.no">Nasjonalbiblioteket</a>, <a href="http://nve.no">NVE</a>, <a href="https://www.oslo.kommune.no/natur-kultur-og-fritid/byarkivet/">Oslo byarkiv</a> og <a href="http://www.perspektivet.no/en/">Perspektivet Museum</a>.</p>
	        <p>Pilegrimsleden er gjort tilgjengelig fra <a href="http://pilegrimsleden.no/">Nasjonalt Pilegrimssenter</a> og det er gjort mulig å ta i bruk alle stier og ruter fra <a href="http://ut.no/">ut.no</a>.</p>
	        <p><a href="http://kartverket.no/kart/gratis-kartdata/">Åpent tilgjengelige kart fra Kartverket</a> er brukt som bakgrunnskart. I tillegg er det brukt kart basert på <a href="http://openstreetmap.org">OpenStreetMap</a> og tjenesten <a href="http://mapbox.com">Mapbox</a>. Terrengdata for visning av 3D-kart er basert på data fra <a href="http://kartverket.no">Kartverket</a> og <a href="http://cesiumjs.org/">Cesium</a>.</p>
	        
          </div>
	      
        </div>
	  </div>
      <!-- div class="row">
        <div class="col-md-6">
          <h2>Eksperimenter</h2>
          <p>Eksperimenter gjort under utviklingen</p>
          <p><a class="btn btn-default" href="experiments/index.html" role="button">Se liste &raquo;</a></p>  
        </div>
        <div class="col-md-6"></div>
      </div -->
	</div>
	
	<footer class="generatorfooter">
	<p class="small container" align="center">All koden er fritt tilgjengelig på <a href="https://github.com/knreise">GitHub</a> under Apache Software License, Version 1.1, se spesifikt <a href="https://github.com/knreise/demonstratorer">github.com/knreise/demonstratorer</a> og <a href="https://github.com/knreise/KNReiseAPI">github.com/knreise/KNReiseAPI</a>
	</p>
	<div class="generatorfooter">
		<img src="common/img/samarbeidspartnere_ra1.png"/>
		<img src="common/img/samarbeidspartnere_kulturradet.png"/>
		<img src="common/img/samarbeidspartnere_sk_4.png"/>
		<img src="common/img/samarbeidspartnere_riksarkivet.png"/>
	</div>
	</footer>

    <script src="bower_components/jquery/dist/jquery.min.js" type="text/javascript"></script>
    <script type="text/javascript" src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
  </body>
</html>
