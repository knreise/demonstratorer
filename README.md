Kultur- og naturreise - kartdemonstratorer
==========================================

Dette prosjektet har som mål å vise eksempler på bruk av Norvegiana-data 
i kartløsninger, samt å utvikle gjenbrukbare komponenter for å sette opp
egne kartløsninger basert på Norvegiana-dataene. 

Prosjektet er i oppstartsfasen, og ingenting er låst enda.


For utviklingsnotater, se https://www.evernote.com/shard/s314/sh/e525b518-c431-43d7-8fcb-7263fee568e3/cd5751ded0d168fc


For live demo, se http://development.atlefren-kulturraadet.divshot.io/


Lisens
------
Apache Software License, Version 1.1, se [LICENSE][LICENSE.md]

[LICENSE]: https://github.com/knreise/demonstratorer/blob/master/LICENSE.md

Kodestruktur
------------

Dette repositoriet inneholder en rekke demoer, samt en del Leaflet-plugins og 
hjelpefunksjoner. Disse hjelpefunksjonene befinner seg i ``/common/js``. 
Se hver fil for en beskrivelse

I tillegg ligger kode for å snakke med diverse APIer i et eget repository: [KNreiseAPI][KNreiseAPI]


[KNreiseAPI]: https://github.com/knreise/KNReiseAPI


Dokumentasjon
-------------
Mye av dokumentasjonen er inline-kode-kommentarer.

- [howto.md][howto] for noen beskrivelser av oppsett
- [api_doc.md][api_doc] for beskrivelse av datasett-konseptet

[howto]: https://github.com/knreise/demonstratorer/blob/master/howto.md
[api_doc]: https://github.com/knreise/demonstratorer/blob/master/api_doc.md

Bygging
-------
Koden under mappa ```demonstratorer``` er pre-generert med grunt. Installer 
grunt (```npm install```) og kjør ```grunt``` for å bygge på nytt etter å ha 
endret build.config.js eller filer i ```demonstrator_content/```

For å kontinuerlig bygge på nytt når du endrer, kjør ```grunt watch```.