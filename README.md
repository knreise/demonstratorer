Kultur- og naturreise - kartdemonstratorer
==========================================

Dette prosjektet har som mål å vise eksempler på bruk av Norvegiana-data 
i kartløsninger, samt å utvikle gjenbrukbare komponenter for å sette opp
egne kartløsninger basert på Norvegiana-dataene. 

Prosjektet er i oppstartsfasen, og ingenting er låst enda.


For utviklingsnotater, se https://www.evernote.com/shard/s26/sh/00391d0e-2827-47b1-bbcd-cf06a5c73c18/09862cb8f9a5ed90


For live demo, se http://development.atlefren-kulturraadet.divshot.io/


Lisens
------
Apache Software License, Version 1.1, se LICENSE.md


Kodestruktur
------------

Dette er et "work in progress", og det er planer om å dra ut de komponentene som lages til egne GitHub-repositories, slik at disse kan gjenbrukes. Pr i dag ligger disse i ```/common/js``` og ```/common/css```, og inkluderer:

- api.js: en wrapper over apiet fra Norvegiana, CartoDB og Wikipedia. Depender på underscore.js og jQuery
- util.js: en rekke hjelpefunksjoner
- En rekke Leaflet-pluins


Bygging
-------
Koden under mappa ```demonstratorer``` er pre-generert med grunt. Installer 
grunt (```npm install```) og kjør ```grunt``` for å bygge på nytt etter å ha 
endret build.config.js eller filer i ```demonstrator_content/```

For å kontinuerlig bygge på nytt når du endrer, kjør ```grunt watch```.