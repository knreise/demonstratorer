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

    <link href='bower_components/components-font-awesome/css/font-awesome.min.css' rel='stylesheet' />
    <link href='bower_components/bootstrap/dist/css/bootstrap.min.css' rel='stylesheet' />
    <link href='common/css/generator.css' rel='stylesheet' />

  </head>

  <body>

    <div class="well">
		<img src="common/img/knreise_logo.png"/></br>
		<h1>Kart og demonstratorer</h1>
		<p><a href="http://kulturognaturreise.no">Kultur- og naturreise</a> er et prosjekt og et nasjonalt løft for å øke tilgangen til offentlig informasjon og lokal kunnskap om kultur og natur. Dette tverretatlige samarbeidet under Kommunal- og moderinseringsdepartementet, Klima- og miljødepartementet og Kulturdepartementet legger til rette for at innhold i fagdatabaser skal gjøres tilgjengelig. Innhold og formidlingsløsninger kan tas i bruk og videreutvikles av andre til nye tjenester; av nærings- og reiseliv, i friluftsliv og undervisning. Målet er å øke kunnskap om og skape engasjement for kulturminner og naturverdier.</p>
		<p>Disse prototypene og kartløsningene er som en del av dette arbeidet utviklet med bistand fra <a href="http://norkart.no">Norkart</a> i regi av <a href="http://kulturognaturreise.no">Kultur- og naturreise</a>. Løsningene er fremdeles under utvikling og utover høsten vil det bli jobbet med justering av både funksjonalitet, grensesnitt og design i tillegg til testing og feilretting. Det vil også bli jobbet med å få inn nye kilder og med forbedringer for de datasett og kilder som allerede er inne. Til dette arbeidet setter vi stor pris på <a href="mailto:havard.johansen@kulturradet.no">tilbakemeldinger, spørsmål og kommentarer</a>.</p>
	</div>
	
    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <div class="col-md-6">
          <h2>Demonstratorer</h2>
            <div class="list-group">
              {{ _.each(demos, function (demonstrator) { }}
                <a href="{{= demonstrator.url }}" class="list-group-item">
                  <h4 class="list-group-item-heading">{{= demonstrator.name }}</h4>
                  <p class="list-group-item-text">{{= demonstrator.description }}</p>
                </a>{{ }) }}
            </div>
        </div>
        <div class="col-md-6">
          <h2>Sett opp ditt eget kart</h2>
          <p>Det er enkelt å generere sitt egen kart ved hjelp av et eget web-grensesnitt. Her kan du  velge område,  datasett og kartgrunnlag.</p>
          <p>
	          <a class="btn btn-small btn-info" href="demonstratorer/generator.html">
			  <i class="fa fa-pencil-square-o fa-lg"></i> Lag ditt kart her</a>
	      </p>
        </div>
	  </div>
      <div class="row">
        <div class="col-md-6">
          <h2>Eksperimenter</h2>
          <p>Eksperimenter gjort under utviklingen</p>
          <p><a class="btn btn-default" href="experiments/index.html" role="button">Se liste &raquo;</a></p>  
        </div>
        <div class="col-md-6"></div>
      </div>
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
    
  </body>
</html>
