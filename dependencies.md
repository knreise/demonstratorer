
Updating dependencies
=====================

This project uses [bower][bower] for package management of js and css libraries.

The installed dependencies are checked in to git as well, and can be found in
the ```bower_components/``` folder.

To update a depencency to a newer version, use bower:

    bower install packagename#version -S

(You might get prompted about conflicts, accept the new version and persist)


To find the name of an installed dependency, see ```/bower.json```.

Known issues:
-------------
Some of the packages does not contain minified versions, and in order to build
```dist/scripts_external.js```, these libraries had to be minified manually.
On upgrade these minified files will be lost, and stuff wil break.

This affects the following libraries:

- Leaflet.TileLayer.PouchDBCached
- esri2geo
- leaflet-sidebar
- togeojson
- wellknown
- CryptoJS
- jquery-touchswipe
- EasyButton

To re-create the minified versions for these, you have to use uglifyjs from the 
command line. Install it with

    npm install forever -g

and, in order to re-create the minified version of esri2geo

    cd bower_components
    cd esri2geo
    uglifyjs esri2geo.js > esri2geo.min.js


###Audiojs
Audio js uses relative links to graphics and fallback flash, this breaks when
combining. Make sure to add these lines:

    audiojs.settings.imageLocation = "../bower_components/audiojs/audiojs/player-graphics.gif";
    audiojs.settings.swfLocation = '../bower_components/audiojs/audiojs/audiojs.swf';

to the bottom of ```bower_components/audiojs/audiojs/audio.min.js``` if updating this library

[bower]: http://bower.io
