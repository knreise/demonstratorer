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


Development - getting started
-----------------------------
1. Install nodejs with npm (refer to proper docs for your os, see)
2. Install bower: ```npm install -g bower```
3. Install grunt: ```npm install -g grunt-cli```
4. Clone the project (```git clone https://github.com/knreise/demonstratorer.git```)
5. Run ```npm install to set up stuff```
6. All bower packages are pre-installed
7. There are three grunt targets that can be run
    - the default (```grunt```) builds all javascript and the example pages
    - the demos target (```grunt demos```) builds all demonstrators, and index page
    - the watch target (```grunt watch```) re-runs the default target when things change
8. For some of the demonstrators to work, a locally running webserver is required, I've used python:
    - (cd to root of project): ```python -m SimpleHTTPServer
    - Another option is node simple-http-server: npm install simple-http-server -g
    - And then: (cd to root of project): ```nserver -p 8000
    - The project is now available at localhost:8000


Releasing a new version
-----------------------
1. Make sure all your changes are commited
2. Run ``grunt release``
    - This bumps the version number, commits the package.json and bower.json, creates a new tag and creates a .tar.gz file with data ready to be transferred to the webhost
3. Transfer the kulturraadet-demonstratorer_VERSION.tar.gz to the webhost
    - ``scp kulturraadet-demonstratorer_VERSION.tar.gz knreise@login.domeneshop.no:~/www``
4. Login to server and change dir
    - ``ssh knreise@login.domeneshop.no``
    - ``cd www``
5. unpack file
    - ``tar -zxvf kulturraadet-demonstratorer_VERSION.tar.gz``
6. Check that new version is working, visit http://knreise.no/demonstratorer_VERSION
7. When happy, go back to server:
    - delete durrent version: ``rm -r demonstratorer``
    ⁻ rename new: ``mv demonstratorer_VERSION/ demonstratorer/``
8. Cleanup by removing .tar.gz-file: ``rm kulturraadet-demonstratorer_VERSION.tar.gz``
9. New version is now live, exit ssh: ``exit``
