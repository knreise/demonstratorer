/*global L: false, turf: false */

var KR = this.KR || {};

KR.Config = {
    contentIcons: {
        'IMAGE': 'camera-retro',
        'VIDEO': 'file-video-o',
        'SOUND': 'music',
        'TEXT': 'file-text',
        'default': 'file-o'
    },
    templates: {}
};

KR.Util = KR.Util || {};

(function (ns) {
    'use strict';


    /*
        Returns the name of a font-awesome icon for a 
        Norvegiana content type, or a default one
    */
    ns.iconForContentType = function (feature) {
        var contentType = feature.properties.contentType;
        if (_.has(KR.Config.contentIcons, contentType)) {
            return KR.Config.contentIcons[contentType];
        }
        return KR.Config.contentIcons['default'];
    };


    /*
        Loads a template from /templates/datasets
    */
    ns.getDatasetTemplate = function (name) {
        var content = $('#' + name + '_template').html();
        if (content) {
            return _.template(content);
        }
    };


    /*
        Gets a template from KR.Config.templates
    */
    ns.templateForDataset = function (dataset) {
        if (_.has(KR.Config.templates, dataset)) {
            return KR.Config.templates[dataset];
        }
    };


    /*
        Creates a html style siring (to put in style=""), given a dictionary
    */
    ns.createStyleString = function (styleDict) {
        return _.map(styleDict, function (value, key) {
            return key + ': ' + value;
        }).join(';');
    };


    /*
        Gets a color for a given dataset provider id, see 
        KR.Style.datasets
    */
    ns.colorForProvider = function (provider, type) {
        var hex = true;
        if (type !== 'hex') {
            hex = false;
        }
        var feature = {properties: {datasetId: provider}};
        return KR.Style.colorForFeature(feature, hex, true);
    };


    /*
        Utility function to register clicks om a feature
    */
    ns.featureClick = function (sidebar) {
        return function _addFeatureClick(feature, layer, dataset) {
            layer.on('click', function (e) {
                if (dataset && dataset.toPoint && dataset.toPoint.stopPolyClick) {
                    if (!e.parent) {
                        return;
                    }
                }

                if (dataset) {
                    sidebar.showFeature(
                        feature,
                        dataset.template,
                        dataset.getFeatureData
                    );
                } else {
                    sidebar.showFeature(feature);
                }
            });
        };
    };


    function _getTemplateForFeature(feature, dataset) {
        if (dataset.datasets) {
            var d = _.find(dataset.datasets, function (dataset) {
                return (dataset._knreise_id === feature.properties.datasetID);
            });
            return d.template;
        }
        return dataset.template;
    }


    /*
        Utility function to handle clicks on a feature cluster
    */
    ns.clusterClick = function (sidebar) {
        return function _addClusterClick(clusterLayer, dataset) {
            clusterLayer.on('clusterclick', function (e) {
                var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                    var feature = marker.feature;
                    if (dataset) {
                        feature.template = _getTemplateForFeature(feature, dataset);
                    }
                    return feature;
                });
                var props = _.extend({}, dataset, {template: null, getFeatureData: null, noListThreshold: null});
                sidebar.showFeatures(
                    features,
                    props.template,
                    props.getFeatureData,
                    props.noListThreshold
                );
            });
        };
    };


    /*
        Converts a hex color to rgba with optional transparency
    */
    ns.hexToRgba = function (hex, transparency) {
        transparency = transparency || 1;
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (!result) {
            return 0;
        }
        var rgb = {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + transparency + ')';
    };


    /*
        Filter a GeoJSON featurecollection with a bbox-string
    */
    ns.filterByBbox = function (features, bbox) {
        var boundPoly = turf.featurecollection([turf.bboxPolygon(KR.Util.splitBbox(bbox))]);
        return turf.within(features, boundPoly);
    };


    /*
        Get id for a dataset
    */
    ns.getDatasetId = function (dataset) {
        if (dataset.dataset.api === 'norvegiana') {
            return dataset.dataset.dataset;
        }
        if (dataset.dataset.api === 'wikipedia') {
            return 'wikipedia';
        }
        if (dataset.id) {
            return dataset.id;
        }
        return KR.Util.stamp(dataset);
    };

    //utility for Leaflet if defined
    if (typeof L !== 'undefined') {

        L.latLngBounds.fromBBoxArray = function (bbox) {
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };

        L.latLngBounds.fromBBoxString = function (bbox) {
            return L.latLngBounds.fromBBoxArray(KR.Util.splitBbox(bbox));
        };
    }

    /*
        Parse a url query string to a dict, handles true/falsa as strings
    */
    ns.parseQueryString = function (qs) {
        var queryString = decodeURIComponent(qs);
        if (queryString === '') {
            return;
        }
        return _.reduce(queryString.replace('?', '').split('&'), function (acc, qs) {
            qs = qs.split('=');
            var value = qs[1];
            if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            }
            acc[qs[0]] = value;
            return acc;
        }, {});
    };


    /*
        Handle the persons notation from folketelling api
    */
    var personsTemplate = _.template('<%= totalt %> (<%= menn %> menn, <%= kvinner %> kvinner)');
    ns.formatPersons = function (persons) {
        var split = persons.split('-');
        if (split.length < 2) {
            return persons;
        }
        return personsTemplate({
            totalt: split[0],
            menn: split[1],
            kvinner: split[2]
        });
    };


    /*
        Returns a Leaflet layer based on layer name string
    */
    ns.getBaseLayer = function (layerName, callback) {
        var layers = {
            'nib': KR.getNibLayer,
            'hist': function (callback) {
                callback(L.tileLayer.wms('http://wms.geonorge.no/skwms1/wms.historiskekart', {
                    layers: 'historiskekart',
                    format: 'image/png',
                    attribution: 'Kartverket'
                }));
            }
        };
        if (_.has(layers, layerName)) {
            layers[layerName](callback);
        } else {
            callback(L.tileLayer.kartverket(layerName));
        }
    };

    function _stringEndsWith(a, str) {
        var lastIndex = a.lastIndexOf(str);
        return (lastIndex !== -1) && (lastIndex + str.length === a.length);
    }

    /*
        Loads a line geometry according to the setup in the generator
    */
    ns.getLine = function (api, line, callback) {
        if (_.isFunction(line)) {
            line(function (res) {
                callback(res);
            });
            return;
        }
        var lineData;
        if (line.indexOf('utno/') === 0) {
            var id = line.replace('utno/', '');
            lineData = {
                api: 'utno',
                id: id,
                type: 'gpx'
            };
        } else if (line.indexOf('http') === 0) {
            if (_stringEndsWith(line, 'kml')) {
                lineData = {
                    api: 'kml',
                    url: line
                };
            }
        }
        if (lineData) {
            api.getData(lineData, function (line) {
                callback(line);
            });
        }
    };

    ns.messageDisplayer = function (template) {
        return function (type, message) {
            var container = $(template);
            container.find('.close').on('click', function () {
                container.find('.content').html('');
                container.remove();
            });
            container.addClass('alert-' + type);
            container.find('.content').html(message);
            $('body').append(container);
        };
    };

    /*
        Query cartodb to find the municipality which "mostly" covers a given
        bbox. 
    */
    ns.mostlyCoveringMunicipality = function (api, bbox, callback) {
        var makeEnvelope = 'ST_MakeEnvelope(' + bbox + ', 4326)';
        var query = 'SELECT komm FROM kommuner WHERE ' +
            'ST_Intersects(the_geom, ' + makeEnvelope + ')' +
            'ORDER BY st_area(st_intersection(the_geom, ' + makeEnvelope + ')) DESC LIMIT 1';

        var dataset = {
            'api': 'cartodb',
            'query': query,
            'mapper': function (res) {
                return res.rows[0].komm;
            }
        };
        api.getData(dataset, callback);
    };


    /*
        Round a number to n decimals
    */
    ns.round = function (number, decimals) {
        decimals = decimals || 2;
        var exp = Math.pow(10, decimals);
        return Math.round(number * exp) / exp;
    };

    /*
        Given lat, lng and zoom, return an url hash
    */
    var hashTemplate = _.template('#<%= zoom %>/<%= lat %>/<%= lon %>');
    ns.getPositionHash = function (lat, lng, zoom) {
        return hashTemplate({
            zoom: zoom,
            lat: ns.round(lat, 4),
            lon: ns.round(lng, 4)
        });
    };

    ns.WORLD = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[
                [-180, -90],
                [-180,  90],
                [ 180,  90],
                [ 180, -90],
                [-180, -90]
            ]]
        }
    };

    ns.createMap = function (div, options) {
        //create the map
        var map = L.map(div, {
            minZoom: 3,
            maxZoom: 21,
            maxBounds: L.geoJson(ns.WORLD).getBounds()
        });


        var baseLayer = options.layer || 'norges_grunnkart_graatone';
        if (_.isString(baseLayer)) {
            KR.Util.getBaseLayer(baseLayer, function (layer) {
                layer.addTo(map);
            });
        } else {
            baseLayer.addTo(map);
        }
        return map;
    };

    ns.setupSidebar = function (map) {
        var popupTemplate = KR.Util.getDatasetTemplate('popup');
        var listElementTemplate = _.template($('#list_item_template').html());
        var markerTemplate = _.template($('#marker_template').html());
        var thumbnailTemplate = _.template($('#thumbnail_template').html());
        var footerTemplate = _.template($('#footer_template').html());

        //the sidebar, used for displaying information
        var sidebar = L.Knreise.Control.sidebar('sidebar', {
            position: 'left',
            template: popupTemplate,
            listElementTemplate: listElementTemplate,
            markerTemplate: markerTemplate,
            thumbnailTemplate: thumbnailTemplate,
            footerTemplate: footerTemplate
        });
        map.addControl(sidebar);
        return sidebar;
    };

}(KR.Util));
