KNReise API
===================


This library provides a uniform access to several of the APIs and datasets that are used the the KNReise demos.

The API depends on the external libraries [underscore.js][underscore] and [jQuery][jquery], in addition 

[underscore]: http://underscorejs.org
[jquery]: https://jquery.com

Raw api
----------
The "raw " API provides a uniform way of querying a range of APIs and datasets and returns the results as [GeoJSON][geojson]. 

[geojson]: http://geojson.org

####Creation
Create a new API instance like this (usually only done once):

    var api = new KR.API({
        cartodb: {
            user: 'knreise'
        },
        flickr: {
            apikey: 'FLICKR_API KEY'
        },
        jernbanemuseet: {
            apikey: 'JERNBANEMUSEET_API_KEY'
        }
    });

Note: The cartoDB, flickr and jernbanemuseet config is only needed iof you intend to use thse
APIS.


###Methods

* **getData**: Gets all the data in a dataset

        getData(
            <Dataset> dataset,
            <function> successCallback,
            <function> errorCalback,
            <Options> options
        );
        
* **getBbox**: Gets data within a given [bounding box][bbox]
        
        getBbox(
            <Dataset> dataset,
            <BboxString> bbox,
            <function> successCallback,
            <function> errorCalback,
            <Options> options
        );
Note: For some apis the getBbox uses the getWithin function, as bbox is not supported. If you use the getBbox function your bbox will be converted. 
        

* **getWithin**:  Gets data within a radius "distance" (in meters) of the latLng point supplied.
        
        getWithin(
            <Dataset> dataset,
            <LatLng> latLng,
            <number> distance,
            <function> successCallback,
            <function> errorCalback,
            <Options> options
        );
        
* **getMunicipalityBounds**: Gets the bbox for one or more municipalities identified by their [municipality number][kommunenummer]. Calls successCallback with a bbox-string.

        getMunicipalityBounds(
            <Number | Number[]> municipalities,
            <function> successCallback,
            <function> errorCalback
        );

* **getCountyBounds**: Works as getMunicipalityBounds, but with norwegian counties. Use [fylkesnummer][fylkesnummer]

        getCountyBounds(
            <Number | Number[]> counties,
            <function> successCallback,
            <function> errorCalback
        );
      
* **getItem**: Gets a single item from an api. Calls successCallback with a GeoJSON Feature.

        getItem(
            <Dataset> dataset, // with 'api' and 'id'
            <function> successCallback,
            <function> errorCalback
        );

* **getCollection**: Gets a norvegiana-Collection.


* **addApi**: Lets you add another api at runtime.

        addApi(
            <string> name, // name of api
            <function> api, // api-function
            <dictionary> params // dictionary with properties
        );

###Data types

| Datatype   | Description                                                                                     |
|------------|-------------------------------------------------------------------------------------------------|
| Dataset    | See [Datasets](#datasets)                                                                       |
| Options    | A JavaScript object, currently only supports {allPages: <bool>} (default: false). If true, several requests are made to get all items. Only works for the norvegiana API.|
| LatLng     | A JavaScript objects with two properties: __lat__ and __lng__ in WGS84 ([EPSG:4326][4326]). A Leaflet [LatLng][leaflet-latlng] object can be used|
| BboxString | A comma-separated string with the bounds, expressed as 'southwest_lng,southwest_lat,northeast_lng,northeast_lat'           |
| successCallback| Callback called on success. Must take a geoJSon FeatureCollection parameter |
| errorCallback  | Called when the api returns something other than ``200 OK``. Can contain a parameter with the error.

#### <a name="datasets">Datasets</a>
The datasets object passed to the api is a simple JavaScript object, but these differ a bit depending on the underlying api beeing queried.In it's simplest form it looks like this:

    var dataset = {
        api: 'norvegiana',
        dataset: 'Kulturminnesok'
    };

Other than the __api__ parameter, the parameters depend on the api, see the table below:


| api                   | parameters                                           |
|-----------------------|------------------------------------------------------|
| norvegiana            | dataset, query                                       |
| wikipedia             | -                                                    |
| kulturminnedata       | query, layer, getExtraData, extraDataLayer, matchId  |
| kulturminnedataSparql | limit, filter, fylke, geomType                       |
| cartodb               | table, columns, query                                |
| folketelling          | dataset, limit                                       |
| utno                  | type, id                                             |
| flickr                | user_id, tags, tag_mode, accuracy                    |



#### norvegiana
* **dataset**: ``<string> | <string[]>`` the name of the dataset in norvegiana (delving_spec: will be prepended). 
* **query**:  ``<string>`` this is passed to the qf-parameter of the norvegiana api

See the [norvegiana documentation][norvegiana-doc] for further info.


####wikipedia
* ***category***: ``<string>`` The ``getData`` method can ba called with a wikipedia-category


#### kulturminnedata
* **layer**:  ``<string>`` the Layer name to query
* **query**:  ``<string>`` the query to run (string, f.ex: "Navn='Fangstgrop'")
* **getExtraData**: ``<bool>`` If true, gets extra data for each feature from a table layer
* **extraDataLayer**: ``<int>`` The id of the table layer to get extra data from
* **matchId**: ``<string>`` The id to match layer and extraDataLayer on
See [kulturminnedata.no][kulturminedata] for details on the api.


#### kulturminnedataSparql
* **filter**: ``<string>`` a SPARQL filter expression
* **fylke**: ``<string>`` a [Fylkesnummer][fylkesnummer], (with leadding zero), used instead of filter for convenience
* **limit**: ``<int>`` If presents, limits the number of responses
* **geomType**: ``<string>``: 'point' or 'polygon'


#### cartodb
To use this api you must provide a config-object when initializing the api.
* **table** The table to query
* **columns** ``<string[]> `` a list of columns to fetch (default = ``*``)
* **query** ``<string>`` A complete SQL query to CartoDB (must include a the_geom column in GeoJSON format)
* **county** ``<string>`` A norwegian county number (returns just geom)
* **municipality** ``<string>`` A norwegian municipality number (returns just geom)

#### folketelling
* ***dataset***: ``<string>`` Name of the dataset, currently only 'property'
* ***limit***: ``<int>`` Number of hits, defaults to 1000

#### utno
* ***type***: ``<string>`` Type of data, currently only ``gpx``
* ***id***: ``<string>`` Id of the route, corresponds to id on ut.no (i.e. http://ut.no/tur/2.8158/ gives id=2.8158)

#### flickr
* ***user_id***: ``<string>`` The Flickr user id to get photos from
* ***tags***: ``<string[]>`` A list of tags to query by
* ***tag_mode***: ``<string>`` Tag mode, as pr the [flickr documentation][flickrdoc] (default: ``all``)
* ***accuracy****: ``<int>`` accuracy parameter from [flickr documentation][flickrdoc] (default: ``11``)

#### kml
* ***url***: ``<string>`` Url to the KML file to fetch

#### jernbanemuseet
This dataset takes no parameters


[bbox]: http://en.wikipedia.org/wiki/Minimum_bounding_box
[4326]: http://epsg.io/4326
[leaflet-latlng]: http://leafletjs.com/reference.html#latlng
[norvegiana-doc]: https://norvegianablog.wordpress.com/api-eksempler/
[kulturminedata]: http://www.kulturminnedata.no/api.html 
[kommunenummer]: http://no.wikipedia.org/wiki/Kommunenummer
[fylkesnummer]: http://no.wikipedia.org/wiki/Fylkesnummer
[flickrdoc]: https://www.flickr.com/services/api/flickr.photos.search.html
