KNReise API
===================


This library provides a uniform access to several og the APIs and datasets that are used the the KNReise demos.

The API depends on the external libraries [underscore.js][underscore] and [jQuery][jquery]. 

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
            apikey: 'API KEY',
            user: 'knreise'
        }
    });

    
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
        
* **getMunicipalityBounds**: Gets the bbox for one or more municipalities identified by their [municipality number][kommunenummer] . Calls successCallback with a bbox-string.

        getMunicipalityBounds(
            <Number | Number[]> municipalities,
            <function> successCallback,
            <function> errorCalback
        );
      
* **getNorvegianaItem**: Gets a single item from norvegiana. Calls successCallback with a GeoJSON Feature.
    
        getNorvegianaItem(
            <string> itemId,
            <function>successCallback
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

| api             | parameters            |
|-----------------|-----------------------|
| norvegiana      | dataset, query        |
| wikipedia       | -                     |
| kulturminnedata | query, layer          |
| cartodb         | table, columns, query |

#### norvegiana
* **dataset**: ``<string> | <string[]>`` the name of the dataset in norvegiana (delving_spec: will be prepended). 
* **query**:  ``<string>`` this is passed to the qf-parameter of the norvegiana api

See the [norvegiana documentation][norvegiana-doc] for further info.

####wikipedia
This dataset takes no parameters

#### kulturminnedata
* **layer**:  ``<string>`` the Layer name to query
*  **query**:  ``<string>`` the query to run (string, f.ex: "Navn='Fangstgrop'")
See [kulturminnedata.no][kulturminedata] for details on the api.

#### cartodb
To use this api you must provide a config-object when initializing the api.
* **table** The table to query
* **columns** ``<string[]> `` a list of columns to fetch (default = ``*``)
* **query** ``<string>`` A complete SQL query to CartoDB (must include a the_geom column in GeoJSON format)


[bbox]: http://en.wikipedia.org/wiki/Minimum_bounding_box
[4326]: http://epsg.io/4326
[leaflet-latlng]: http://leafletjs.com/reference.html#latlng
[norvegiana-doc]: https://norvegianablog.wordpress.com/api-eksempler/
[kulturminedata]: http://www.kulturminnedata.no/api.html 
[kommunenummer]: http://no.wikipedia.org/wiki/Kommunenummer

Leaflet Layer Integration
------------------------------

The leaflet Layer integration API depends on the "Raw API", but converts the GeoJSON results to Leaflet Layers (using the L.Knreise.GeoJSON layer).

To use this integration, initialize a KR.DatasetLoader:

    var datasetLoader = new KR.DatasetLoader(api, map, sidebar);
    
####Parameters
* **api**: a KR.API instance
* **map**: A Leaflet map instance
* **sidebar**: A  L.Knreise.Control.Sidebar instance (optional)

#### Methods

* **loadDatasets**: Loads a list of datasets
    
        loadDatasets(
            <DatasetWrapper[]> datasets,
            <BboxString> bbox
        ):
    This method returns an array of L.Knreise.GeoJSON instances, already added to the map.

#### DatasetWrapper
The DatasetWrapper passed to the DatasetLoader is a wrapper around the Dataset object passed to the "raw" api, with several other options:

    var datasetWrapper = { /* options here*/};

##### Options

| Option         | Type           | Default value | Required? | Description                                                                                                                               |
|----------------|----------------|---------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| dataset        | Dataset        | null          | yes       | The dataset definition (see above                                                                                                         |
| name           | Name           | null          | no        | Name of the dataset (used for display purposes)                                                                                           |
| isStatic       | bool           | true          | no        | if false, reload on zoom/pan                                                                                                              |
| bbox           | bool           | true          | no        | If true, use getBbox, else use getData                                                                                                    |
| cluster        | bool           | true          | no        | Use clustering on layer                                                                                                                   |
| smallMarker    | bool           | false         | no        | Use small markers?                                                                                                                        |
| minZoom        | Number         | null          | no        | If set, does not show or load data above this zoom level                                                                                  |
| minFeatures    | Number         | null          | no        | If set, do not show data if more than this number of features returned                                                                    |
| style          | function       | null          | no        | style-function as pr L.geoJson                                                                                                            |
| selectedStyle  | function       | null          | no        | style-function as pr L.geoJson for a selected feature                                                                                     |
| getFeatureData | function       | null          | no        | If provided, called with a feature and a calback to display info in sidebar                                                               |
| template       | function       | null          | no        | A function that can be called like underscore.js template() and return html, describing the feature. Called with the features properties. |
| circle         | Object         | null          | no        | If provided, this object is passed as options to L.circleMarker in PointToLayer                                                           |
| toPoint        | toPointOptions | null          | no        | If provided, enables "deflation" of polygons (similar to [Leaflet.Deflate][deflate])                                                      |



***toPointOptions***

| Option         | Type           | Default value | Required? | Description                                                                               |
|----------------|----------------|---------------|-----------|-------------------------------------------------------------------------------------------|
| minSize        | int            | 20            | no        | The minimum width and height in pixels for a polygon to be displayed in its actual shape. |
| showAlways     | bool           | false         | no        | Always show deflated polygons (in addition to polygon)                                    |
| stopPolyClick  | bool           | false         | no        | Stop click events on the polygon to change its style                                      |
| circle         | Object         | null          | no        | If provided, this object is passed as options to L.circleMarker in PointToLayer           |
| circleSelected | Object         | null          | no        | If provided, this object is passed as options to L.circleMarker in PointToLayer           |

[deflate]: https://github.com/oliverroick/Leaflet.Deflate
