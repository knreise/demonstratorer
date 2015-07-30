Dataset in map configuration
===================


The leaflet Layer integration API depends on the "Raw API", but converts the GeoJSON results to Leaflet Layers (using the L.Knreise.GeoJSON and/or the L.Knreise.MarkerClusterGroup layer).

To use this integration, initialize a KR.DatasetLoader:

    var datasetLoader = new KR.DatasetLoader(api, map, sidebar, errorCallback);
    
####Parameters
* **api**: a KR.API instance
* **map**: A Leaflet map instance
* **sidebar**: A  L.Knreise.Control.Sidebar instance (optional)
* ***errorCallback***: A function that takes an argument error (POJO with "datset" and "error")

#### Methods

* **loadDatasets**: Loads a list of datasets
    
        loadDatasets(
            <DatasetWrapper[]> datasets,
            <BboxString> bbox
        );
    This method returns an array of L.Knreise.GeoJSON instances, already added to the map.

* **reload**: Reloads the datasets
        
        reload(
            <bool> setVisible,
            <function> callback
        );

#### DatasetWrapper
The DatasetWrapper passed to the DatasetLoader is a wrapper around the Dataset object passed to the "raw" api, with several other options:

    var datasetWrapper = { /* options here*/};

##### Options

| Option            | Type           | Default value | Required? | Description                                                                                                                               |
|-------------------|----------------|---------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| dataset           | Dataset        | null          | no        | The dataset definition (see above)                                                                                                        |
| datasets          | Dataset[]      | null          | no        | A list of dataset definitions (see above) NB: Either this or dataset must be set!                                                         |
| grouped           | bool           | false         | no        | If datsests is a list, they will be treated as one entry in the layer switcher                                                            |
| name              | string         | null          | no        | Name of the dataset (used for display purposes), overrides feature data                                                                   |
| provider          | string         | null          | no        | Name of the dataset provider (used for display purposes), overrides feature data                                                          |
| cluster           | bool           | true          | no        | Use clustering on layer                                                                                                                   |
| isStatic          | bool           | true          | no        | if false, reload on zoom/pan                                                                                                              |
| bbox              | bool           | true          | no        | If true, use getBbox, else use getData                                                                                                    |
| minZoom           | Number         | null          | no        | If set, does not show or load data above this zoom level                                                                                  |
| minFeatures       | Number         | null          | no        | If set, do not show data if more than this number of features returned                                                                    |
| getFeatureData    | function       | null          | no        | If provided, called with a feature and a calback to display info in sidebar                                                               |
| template          | function       | null          | no        | A function that can be called like underscore.js template() and return html, describing the feature. Called with the features properties. |
| toPoint           | toPointOptions | null          | no        | If provided, enables "deflation" of polygons (similar to [Leaflet.Deflate][deflate])                                                      |
| extras            | dictionary     | null          | no        | If provided, the properties of this dict will be added to the feature properties                                                          |
| style             | KNreiseStyle   | depends       | no        | The style to apply. Extends the default (for the dataset)                                                                                 |
| noListThreshold   | int            | 10            | no        | Decides if the sidebar shuld display a list. Set to 0 for always list, Infinity for never list                                            |
| hideFromGenerator | bool           | false         | no        | If true, the dataset will not be listed on generator page (but is available to set in config url)                                         |
| description       | string         | null          | no        | Will show up as a descriptioon on the generator page                                                                                      |
| init              | function       | null          | no        | If set, will be called on dataset initialization, with params ``map`` and ``dataset``                                                     |
| loadWhenLessThan  | dict           | null          | no        | If set, with params ``count`` (int) and ``callback`` (function) will call callback when there are less than count features on the map, callback is called with ``map``, ``dataset`` and ``features`` |


***toPointOptions***

| Option         | Type           | Default value | Required? | Description                                                                               |
|----------------|----------------|---------------|-----------|-------------------------------------------------------------------------------------------|
| minSize        | int            | 20            | no        | The minimum width and height in pixels for a polygon to be displayed in its actual shape. |
| showAlways     | bool           | false         | no        | Always show deflated polygons (in addition to polygon)                                    |
| stopPolyClick  | bool           | false         | no        | Stop click events on the polygon to change its style                                      |

[deflate]: https://github.com/oliverroick/Leaflet.Deflate


***KNreiseStyle****

This is a dict, with style properties:

| Option         | Type           | Default value | Required? | Description                                                                               |
|----------------|----------------|---------------|-----------|-------------------------------------------------------------------------------------------|
| fillcolor      | string (hex)   | #38A9DC       | no        | The fill color                                                                            |
| bordercolor    | string (hex)   | Same as fill  | no        | The border color                                                                          |
| thumbnail      | bool           | false         | no        | Show thumbnail                                                                            |
| circle         | bool           | false         | no        | Show marker as thumbnail (if false displays circle)                                       |

fillcolor and bordercolor may also be a function that takes a feature and returns a hex string (in the form #RRGGBB)