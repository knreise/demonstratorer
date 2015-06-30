<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <title>KNReise - demonstratorer</title>

    <link href='../bower_components/components-font-awesome/css/font-awesome.min.css' rel='stylesheet' />
    <link href='../bower_components/bootstrap/dist/css/bootstrap.min.css' rel='stylesheet' />
  </head>

  <body>

    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">KNReise - demonstratorer</a>
        </div>
      </div>
    </nav>

    <!-- Main jumbotron for a primary marketing message or call to action -->
    <div class="jumbotron">
      <div class="container">
        <h1>KNReise - demonstratorer</h1>
        <p>Kultur- og naturreise er et nasjonalt løft for å øke tilgangen til offentlig informasjon og lokal kunnskap om kultur og natur. Utrustet med en smarttelefon skal alle få tilgang til aktuelle fakta og fortellinger om natur og kultur på stedet der de er. Dette tverretatlige samarbeidet under Kommunal- og moderinseringsdepartementet, klima- og miljødepartementet og Kulturdepartementet legger til rette for at innhold i fagdatabaser åpnes opp og gjøres tilgjengelig. Innholdet kan tas i bruk og videreutvikles av andre til nye tjenester; av nærings- og reiseliv, i friluftsliv og undervisning. Målet er å øke kunnskap om og skape engasjement for kulturminner og naturverdier.</p>
      </div>
    </div>

    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <div class="col-md-6">
          <h2>Demonstratorer</h2>
            <p>Demonstratorer utviklet i løpet av prosjektet</p>
            <div class="list-group">
              {{ _.each(demos, function (demonstrator) { }}
                <a href="{{= demonstrator.url }}" class="list-group-item">
                  <h4 class="list-group-item-heading">{{= demonstrator.name }}</h4>
                  <p class="list-group-item-text">{{= demonstrator.description }}</p>
                </a>{{ }) }}
            </div>
        </div>
        <div class="col-md-6">
          <h2>Demonstratorgenerator</h2>
          <p>Det er enkelt å generere sin egen demonstrator ved hjelp av et web-verktøy!</p>
          <p><a class="btn btn-default" href="experiments/generator.html" role="button">Prøv her &raquo;</a></p>
       </div>
    </div>
    <div class="row">
        <div class="col-md-6">
          <h2>Eksperimenter</h2>
          <p>Eksperimenter gjort under utviklingen</p>
          <p><a class="btn btn-default" href="experiments/index.html" role="button">Se liste &raquo;</a></p>  
        </div>
        <div class="col-md-6">
          <h2>Kode</h2>
          <p>All koden er fritt tilgjengelig på <a href="https://github.com/knreise">GitHub</a> under Apache Software License, Version 1.1, se spesifikt <a href="https://github.com/knreise/demonstratorer">github.com/knreise/demonstratorer</a> og <a href="https://github.com/knreise/KNReiseAPI">github.com/knreise/KNReiseAPI</a></p>
        </div>
      </div>

      <hr>

      <footer>
        <p></p>
      </footer>
    </div>
  </body>
</html>
