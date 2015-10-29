How to add a dataset to the api
===============================

This library has support for a lot of APIs / datasets, and works on a simple 
assumption: query the API using various methods, and map the resulting data to a
known GeoJSON structure in EPSG:4326


Requirements
------------

To add another API to the KNreiseAPI there are a few pre-conditions that must be
met:

- [ ] The data must be exposed through an web accessible API (preferrably supporting CORS)
- [ ] The data must have a spatial component (i.e a "record" in the data should map to a point)
- [ ] The data should have a way to query within a radius


Registering your api
--------------------

Start off by setting up stuff:
- create a new file in /src/, name it something like myapi.js. 
- Give it a skeleton of code (see below). In principle it should place an 
  object on the KR namespace that has the name MyApiNameAPI and provides at 
  least one of the following methods (these are described in doc.md):
    - getData
    - getBbox
    - getWithin
    - getItem
- edit src/api.js, add an entry to apiConfig describing your dataset. 
Remember to keep the key the dictionary unique.


Developing your API
-------------------
The best tip here is to look at the other APIs and see how stuff is done there. 
Remember that KR.Util contains a lot of helper functions for sending requests 
and creating GeoJSON. Also remember that proj4js is available for coordinate transforms.

If you include new libraries as dependencies, install them with Bower so projects using the API gets them too!

run ```grunt watch``` in order to rebuild on save, and create an example in examples to test.
Consider including a live example in examples/api.html


Common properties of GeoJSON features
-------------------------------------
Some properties of the GeoJSON features have special meaning when used in the 
demonstratorer-project, so you should take care to map these.

    - thumbnail: Link to a thumbnail image
    - images: An array of links to full-size images
    - title: A sting that is treated as the title
    - description: A longer string that is the description

In addition the GeoJSON Feature ID is set throughout this API, and is on the form 

    NAME-OF-API_UNIQUE-ID-IN-API


Supporting within bbox-query
----------------------------

If the API you are trying to wrap doesn't contain an operation for getting
features within a bbox, you can skip implementing ```getBbox``` and implement 
```getWithin``` instead. The api.js will detect this and map a bbox to a point 
and a radius


Async
-----
All the API functions are considered async, they are not expected to return 
anything, but they all get passed a callback and an errorCallback. Use them as
appropriate.


Code style
----------
Use a linter and common sense, try to follow the general style of the library.


API-code-template
-----------------

    var KR = this.KR || {};

    KR.MyApiNameAPI = function (apiName) {
        'use strict';

        function getData(dataset, callback, errorCallback) {
            //get all data, possibly filtered by a property in dataset
            callback();
        }

        function getWithin(dataset, latLng, distance, callback, errorCallback, options) {
            callback();
        }

        function getBbox(dataset, bbox, callback, errorCallback, options) {
            callback();
        }

        function getItem(dataset, callback, errorCallback) {
            callback();
        }

        return {
            getData: getData
            getWithin: getWithin,
            getBbox: getBbox,
            getItem: getItem
        };
    };

