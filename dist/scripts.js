var KR = this.KR || {};
(function (ns) {
    'use strict';

    ns.parseError = function (error) {
        if (error.responseJSON) {
            if (error.responseJSON.error) {
                return error.responseJSON.error.join(', ');
            }
            if (error.responseJSON.status) {
                return error.responseJSON.status;
            }
        }
        if (error.statusText) {
            return error.statusText;
        }
        if (error.error) {
            if (error.error.info) {
                return error.error.info;
            }
            if (error.error.error) {
                return error.error.error;
            }
            return error.error;
        }
        return 'Unknown error';
    };

    ns.errorHandler = function (template) {

        var alert = $(template);
        alert.find('.close').on('click', function () {
            alert.find('.content').html('');
            alert.remove();
        });
        var templ = _.template('<div><strong><%= dataset %>:</Strong> <%= error %></div>');
        return function (error) {

            var message = templ({
                dataset: error.dataset,
                error: ns.parseError(error.error)
            });
            if (alert.parent()) {
                alert.find('.content').append(message);
            } else {
                alert.find('.content').html(message);
            }
            $('body').append(alert);
        };
    };
}(KR));
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

    datasetIcons: {
        'Artsdatabanken': 'paw',
        'Kulturminnesok': 'archive',
        'Naturbase': 'tree',
        'MUSIT_DiMu': 'flag',
        'Musit': 'flag',
        'DigitaltMuseum': 'flag',
        'fangstlokaliteter': 'circle'
    },

    providerColors: {
        'Artsdatabanken': {name: 'darkpurple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'MUSIT': {name: 'cadetblue', hex: '#436978'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'default': {name: 'blue', hex: '#38A9DC'},
        'fangstlokaliteter': {name: 'cadetblue', hex: '#436978'},
        'Trondheim byarkiv': {name: 'darkred', hex: '#A23336'}
    },

    templates: {}
};

KR.Util = KR.Util || {};

(function (ns) {
    'use strict';

    ns.templateForDataset = function (dataset) {
        if (_.has(KR.Config.templates, dataset)) {
            return KR.Config.templates[dataset];
        }
    };

    ns.iconForDataset = function (dataset) {
        if (_.isArray(dataset)) {
            dataset = dataset.join('_');
        }
        if (_.has(KR.Config.datasetIcons, dataset)) {
            return KR.Config.datasetIcons[dataset];
        }
    };

    ns.createStyleString = function (styleDict) {
        return _.map(styleDict, function (value, key) {
            return key + ': ' + value;
        }).join(';');
    };


    ns.iconForContentType = function (feature) {
        var contentType = feature.properties.contentType;
        if (_.has(KR.Config.contentIcons, contentType)) {
            return KR.Config.contentIcons[contentType];
        }
        return KR.Config.contentIcons['default'];
    };

    ns.iconForFeature = function (feature) {
        var datasetIcon = ns.iconForDataset(feature.properties.dataset);
        if (datasetIcon) {
            return datasetIcon;
        }
        return ns.iconForContentType(feature);
    };


    ns.colorForProvider = function (provider, type) {
        type = type || 'name';
        if (_.has(KR.Config.providerColors, provider)) {
            return KR.Config.providerColors[provider][type];
        }
        return KR.Config.providerColors['default'][type];
    };


    ns.colorForFeature = function (feature, type) {
        return ns.colorForProvider(feature.properties.provider, type);
    };


    ns.markerForFeature = function (feature, selected) {
        //var faIcon = ns.iconForFeature(feature);
        var color = selected
                    ? 'blue'
                    : ns.colorForFeature(feature);

        return L.Knreise.icon({
            markerColor: color,
            prefix: 'fa'
        });
    };

    var verneomrTypes = {
        landskapsvern: {
            ids: ['LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV'],
            style: {
                fillColor: '#d8cb7a',
                color: '#9c8f1b'
            },
        },
        nasjonalpark: {
            ids: ['NP', 'NPS'],
            style: {
                fillColor: '#7f9aac',
                color: '#b3a721'
            },
        },
        naturreservat: {
            ids: ['NR', 'NRS'],
            style: {
                fillColor: '#ef9874',
                color: '#ef9873'
            }
        }
    };

    function getVerneOmrcolors(feature) {
        var id = feature.properties.vernef_id;
        return _.find(verneomrTypes, function (type) {
            return (type.ids.indexOf(id) !== -1);
        });
    }

    ns.getVerneomrStyle = function (opacity) {

        var defaultStyle = {
            fillOpacity: opacity,
            opacity: 0.8,
            weight: 1,
            clickable: false
        };

        return function find(feature) {
            if (!feature) {
                return;
            }
            var res = getVerneOmrcolors(feature);
            if (res) {
                return _.extend({}, defaultStyle, res.style);
            }
            return {stroke: false, fill: false};
        };
    };

    ns.getVerneomrCircleStyle = function (color) {
        var defaultStyle = {
            fillOpacity: 1,
            opacity: 0.8,
            weight: 1,
            radius: 10
        };

        return function find(feature) {
            if (!feature) {
                return;
            }
            var res = getVerneOmrcolors(feature);
            var extra = {};
            if (color) {
                extra.color = color;
            }
            if (res) {
                return _.extend({}, defaultStyle, res.style, extra);
            }
            return {stroke: false, fill: false};
        };
    };


    ns.featureClick = function (sidebar) {
        return function _addFeatureClick(feature, layer, dataset) {
            layer.on('click', function (e) {
                if (dataset.toPoint && dataset.toPoint.stopPolyClick) {
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

    ns.clusterClick = function (sidebar) {
        return function _addClusterClick(clusterLayer, dataset) {
            clusterLayer.on('clusterclick', function (e) {
                var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                    var feature = marker.feature;
                    feature.template = _getTemplateForFeature(feature, dataset);
                    return feature;
                });
                sidebar.showFeatures(
                    features,
                    dataset.template,
                    dataset.getFeatureData,
                    dataset.noListThreshold
                );
            });
        };
    };

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

    ns.filterByBbox = function (features, bbox) {
        var boundPoly = turf.featurecollection([turf.bboxPolygon(KR.Util.splitBbox(bbox))]);
        return turf.within(features, boundPoly);
    };

    ns.getDatasetId = function (dataset) {
        if (dataset.dataset.api === 'norvegiana') {
            if (!dataset.dataset.query) {
                return dataset.dataset.dataset;
            }
        }
        if (dataset.dataset.api === 'wikipedia') {
            return 'wikipedia';
        }
        if (dataset.id) {
            return dataset.id;
        }
        return KR.Util.stamp(dataset);
    };

    if (typeof L !== 'undefined') {
        L.latLngBounds.fromBBoxString = function (bbox) {
            bbox = KR.Util.splitBbox(bbox);
            return new L.LatLngBounds(
                new L.LatLng(bbox[1], bbox[0]),
                new L.LatLng(bbox[3], bbox[2])
            );
        };
    }

    ns.parseQueryString = function (qs) {
        var queryString = decodeURIComponent(qs);
        if (queryString === '') {
            return;
        }
        return _.reduce(queryString.replace('?', '').split('&'), function (acc, qs) {
            qs = qs.split('=');
            acc[qs[0]] = qs[1];
            return acc;
        }, {});
    };

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
    }

}(KR.Util));

/*global L:false */

var KR = this.KR || {};

KR.Style = {};

(function (ns) {
    'use strict';

    var verneomrTypes = {
        landskapsvern: {
            ids: ['LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV', 'NM', 'BVV'],
            style: {
                fillColor: '#d8cb7a',
                color: '#9c8f1b'
            },
        },
        nasjonalpark: {
            ids: ['NP', 'NPS'],
            style: {
                fillColor: '#7f9aac',
                color: '#b3a721'
            },
        },
        naturreservat: {
            ids: ['NR', 'NRS'],
            style: {
                fillColor: '#ef9874',
                color: '#ef9873'
            }
        }
    };

    function getVerneOmrcolor(feature) {
        var id = feature.properties.vernef_id;
        return _.find(verneomrTypes, function (type) {
            return (type.ids.indexOf(id) !== -1);
        });
    }

    var SELECTED_COLOR = '#72B026';
    var DEFAULT_COLOR = '#38A9DC';

    var DEFAULT_STYLE = {
        fillcolor: DEFAULT_COLOR,
        circle: false,
        thumbnail: true
    };

    var mappings = {
        'difo': 'Digitalt fortalt',
        'Kulturminnesok': 'Kulturminnesok',
        'DiMu': 'DigitaltMuseum',
        'MUSIT': 'Musit',
        'Artsdatabanken': 'Artsdatabanken',
        'wikipedia': 'wikipedia',
        'riksantikvaren': 'riksantikvaren'
    };

    ns.datasets = {
        'Digitalt fortalt': {
            fillcolor: '#F69730',
            circle: false,
            thumbnail: true
        },
        'Kulturminnesok': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'DigitaltMuseum': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'Musit': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: false
        },
        'Artsdatabanken': {
            fillcolor: '#5B396B',
            thumbnail: false,
            circle: true
        },
        'riksantikvaren': {
            fillcolor: '#436978',
            circle: false,
            thumbnail: true
        },
        'verneomraader': {
            fillcolor: function (feature) {
                if (feature) {
                    var c = getVerneOmrcolor(feature);
                    if (c) {
                        return c.style.fillColor;
                    }
                }
                return "#009300";
            },
            bordercolor: function (feature) {
                if (feature) {
                    var c = getVerneOmrcolor(feature);
                    if (c) {
                        return c.style.color;
                    }
                }
                return "#009300";
            },
            thumbnail: false,
            circle: true
        },
        'wikipedia': {
            fillcolor: '#D14020',
            thumbnail: true,
        }
    };

    ns.getDatasetStyle = function (name) {
        var config = ns.datasets[mappings[name]];
        if (!config) {
            config = ns.datasets[name];
        }
        return config;
    };

    ns.setDatasetStyle = function (name, style) {
        if (!_.has(mappings, name)) {
            mappings[name] = name;
        }
        var old = ns.getDatasetStyle(name);
        if (!old) {
            old = DEFAULT_STYLE;
        }

        ns.datasets[mappings[name]] = _.extend({}, old, style);
    };

    var colors = {
        '#F69730': 'orange',
        '#38A9DC': 'blue',
        '#A23336': 'darkred',
        '#72B026': 'green',
        '#436978': 'cadetblue',
        '#5B396B': 'darkpurple',
        '#728224': 'darkgreen',
        '#D252B9': 'purple',
        '#D14020': 'red'
    };

    function hexToName(hex) {
        return colors[hex] || 'blue';
    }

    function valueOrfunc(dict, key, feature, dropFeature) {
        if (_.isFunction(dict[key])) {
            if (dropFeature) {
                return dict[key]();
            }
            return dict[key](feature);
        }
        return dict[key];
    }

    function getFillColor(config, feature, useBaseColor) {
        if (useBaseColor) {
            return valueOrfunc(config, 'fillcolor', feature, true);
        }
        return valueOrfunc(config, 'fillcolor', feature);
    }

    function getBorderColor(config, feature) {
        if (!config.bordercolor) {
            return getFillColor(config, feature);
        }
        return valueOrfunc(config, 'bordercolor', feature);
    }


    function getConfig(feature) {
        var config;
        if (feature.properties && feature.properties.datasetId) {
            config = ns.getDatasetStyle(feature.properties.datasetId);
        }
        if (!config) {
            return _.extend({}, DEFAULT_STYLE);
        }
        return config;
    }

    function getCircleOptions(bordercolor, fillcolor) {
        return {
            radius: 9,
            weight: 1,
            opacity: 1,
            color: bordercolor,
            fillColor: fillcolor,
            fillOpacity: 0.4
        };
    }

    function getCircle(latlng, bordercolor, fillcolor) {
        return L.circleMarker(latlng, getCircleOptions(bordercolor, fillcolor));
    }

    function createAwesomeMarker(color) {
        return L.Knreise.icon({
            markerColor: hexToName(color)
        });
    }

    function createMarker(feature, latlng, icon) {
        var title = '';
        if (feature.properties && feature.properties.title) {
            title = feature.properties.title;
        }

        return L.marker(latlng, {
            icon: icon,
            title: title
        });
    }

    function getThumbnail(feature, color, selected) {
        if (!feature.properties || !feature.properties.thumbnail) {
            return;
        }

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + feature.properties.thumbnail + ')'
        };

        if (selected) {
            styleDict['border-width'] = '3px';
        }

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(' + feature.properties.thumbnail + ');border-color:' + color + ';"></div>' +
            '</div>';

        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: html,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }

    function getClusterThumbnailIcon(features, color, selected) {
        var photos = _.filter(features, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (!photos.length) {
            return;
        }

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + photos[0].feature.properties.thumbnail + ');'
        };

        if (selected) {
            styleDict['border-width'] = '3px';
        }

        var html = '<div class="outer">' +
            '<div class="circle" style="' + KR.Util.createStyleString(styleDict) + '"></div>' +
            '</div>' +
            '<b>' + features.length + '</b>';

        return new L.DivIcon({
            className: 'leaflet-marker-photo',
            html: html,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
        });

    }

    function getClusterIcon(features, color) {
        var rgbaColor = KR.Util.hexToRgba(color, 0.4);
        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: '<div class="outer"><div class="circle" style="background-color: ' + rgbaColor + ';border-color:' + color + ';"></div></div><b>' + features.length + '</b>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }


    ns.getClusterIcon = function (cluster, selected) {

        var features = cluster.getAllChildMarkers();

        var config = getConfig(features[0].feature);

        var color = selected ? SELECTED_COLOR : getFillColor(config, features[0].feature);

        if (config.thumbnail) {
            var thumbnail = getClusterThumbnailIcon(features, color, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        return getClusterIcon(features, color);
    };

    ns.getIcon = function (feature, selected) {
        var config = getConfig(feature);
        var fillcolor = selected ? SELECTED_COLOR : getFillColor(config, feature);
        var bordercolor = selected ? SELECTED_COLOR : getBorderColor(config, feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, bordercolor, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        if (config.circle) {
            return getCircleOptions(bordercolor, fillcolor);
        }
        return createAwesomeMarker(fillcolor);
    };

    ns.getMarker = function (feature, latlng) {
        var config = getConfig(feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, getBorderColor(config, feature), false);
            if (thumbnail) {
                return createMarker(feature, latlng, thumbnail);
            }
        }
        if (config.circle) {
            return getCircle(latlng, getBorderColor(config, feature), getFillColor(config, feature));
        }
        return createMarker(feature, latlng, ns.getIcon(feature, false));
    };

    ns.colorForFeature = function (feature, hex, useBaseColor) {
        var config = getConfig(feature);
        if (config) {
            if (hex) {
                return getFillColor(config, feature, useBaseColor);
            }
            return hexToName(getFillColor(config, feature));
        }
    };

    ns.getPathStyle = function (feature, clickable) {
        clickable = clickable || false;
        var config = getConfig(feature);
        var fill = getFillColor(config, feature);
        var border = getBorderColor(config, feature);
        return {
            weight: 1,
            color: border,
            fillColor: fill,
            clickable: clickable,
            opacity: 0.8,
            fillOpacity: 0.4
        };
    };

}(KR.Style));

/*global L:false, KR:false*/

'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.MarkerClusterGroup = L.MarkerClusterGroup.extend({

    options: {
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false,
        polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6}
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        if (!this.options.iconCreateFunction) {
            this.options.iconCreateFunction = this._iconCreator.bind(this);
        }

        this._featureGroup = L.featureGroup();
        this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._nonPointGroup = L.featureGroup();
        this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._inZoomAnimation = 0;
        this._needsClustering = [];
        this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
        //The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
        this._currentShownBounds = null;

        this._queue = [];
        this.on('clusterclick', this._clusterClicked, this);
    },

    onAdd: function (map) {
        L.MarkerClusterGroup.prototype.onAdd.apply(this, arguments);
        map.on('layerSelected', this._deselectAll, this);
    },

    _deselectAll: function () {
        _.each(this._gridClusters, function (g) {
            _.each(g._grid, function (h) {
                _.each(h, function (i) {
                    _.each(i, function (cluster) {
                        if (cluster.selected) {
                            cluster.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, cluster);
                            cluster._updateIcon();
                            cluster.selected = false;
                        }
                    });
                });
            });
        });

        this.eachLayer(function (layer) {
            if (layer.selected) {
                layer.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, layer);
                layer.setIcon(_.bind(L.Knreise.GeoJSON.prototype._createFeatureIcon, this)(layer.feature));
                layer.selected = false;
            }
        }, this);
    },

    _clusterClicked: function (e) {
        this._map.fire('layerSelected');
        var layer = e.layer;
        var iconCreate = _.bind(this._iconCreator, this);
        layer.createIcon = function () {
            return iconCreate(this, true).createIcon();
        };
        layer.selected = true;
        layer._updateIcon();
    },

    _iconCreator: function (cluster, selected) {
        return KR.Style.getClusterIcon(cluster, selected);
    }

});

L.Knreise.markerClusterGroup = function (options) {
    return new L.Knreise.MarkerClusterGroup(options);
};

/*global L: false, KR: false, turf: false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.GeoJSON = L.GeoJSON.extend({

    initialize: function (geojson, options) {
        L.setOptions(this, options);

        this._layers = {};
        this.options.pointToLayer = this._pointToLayer.bind(this);

        if (geojson) {
            this.addData(geojson);
        }
        this.on('click', this._featureClicked, this);
        this._selectedLayer = null;
    },

    removedPaths: [],

    isCollapsed: function (path, zoom) {
        var minSize = this.options.dataset.toPoint.minSize || 20;
        var bounds = path.getBounds();

        var ne_px = this._map.project(bounds.getNorthEast(), zoom);
        var sw_px = this._map.project(bounds.getSouthWest(), zoom);

        var width = ne_px.x - sw_px.x;
        var height = sw_px.y - ne_px.y;
        return (height < minSize || width < minSize);
    },

    _deselectAll: function () {
        if (this._selectedLayer) {
            var layer = this._selectedLayer;
            if (layer.setIcon) {
                layer.setIcon(this._createFeatureIcon(layer.feature, false));
                layer.setZIndexOffset(0);
            }
            if (layer.setStyle) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }
                layer.setStyle(this._createFeatureIcon(feature, false));
                if (layer.getParent) {
                    var p = layer.getParent();
                    p.setStyle(this._createFeatureIcon(feature, false));
                }
            }
            this._selectedLayer = null;
        }
    },

    _featureClicked: function (e) {
        if (this.options.dataset && this.options.dataset.toPoint && this.options.dataset.toPoint.stopPolyClick) {
            if (e.layer.toGeoJSON().geometry.type !== 'Point') {
                return;
            }
        }
        e.layer._map.fire('layerSelected');
        var layer = e.layer;
        if (layer.setIcon) {
            layer.setIcon(this._createFeatureIcon(layer.feature, true));
            layer.setZIndexOffset(1000);
        }
        if (layer.setStyle) {

            var feature = layer.feature;
            if (!feature) {
                var parent = this.getParentLayer(layer._leaflet_id);
                feature = parent.feature;
            }
            if (feature) {
                layer.setStyle(this._createFeatureIcon(feature, true));
                layer.bringToFront();
            }

            if (layer.getParent) {
                var p = layer.getParent();
                p.setStyle(this._createFeatureIcon(feature, true));
            }

        }
        this._selectedLayer = layer;
    },

    getParentLayer: function (id) {
        var l = this._layers[id];
        if (l) {
            return l;
        }
        var key, layer, found;
        for (key in this._layers) {
            if (this._layers.hasOwnProperty(key)) {
                layer = this._layers[key];
                if (layer.getLayer) {
                    found = layer.getLayer(id);
                    if (found) {
                        return layer;
                    }
                }
            }
        }
    },

    getZoomThreshold: function (path) {
        var zoomThreshold = null;
        var zoom = this._map.getZoom();
        if (this.isCollapsed(path, this._map.getZoom())) {
            while (!zoomThreshold) {
                zoom += 1;
                if (!this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom - 1;
                }
            }
        } else {
            while (!zoomThreshold) {
                zoom -= 1;
                if (this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom;
                }
            }
        }
        return zoomThreshold;
    },

    _zoomend: function () {
        if (!this.options.dataset.toPoint) {
            return;
        }
        var removedTemp = [],
            feature,
            i;

        this.eachLayer(function (feature) {
            if (this._map.getZoom() <= feature.zoomThreshold) {
                this.removeLayer(feature);
                if (!this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
                removedTemp.push(feature);
            }
        }, this);

        for (i = 0; i < this.removedPaths.length; i++) {
            feature = this.removedPaths[i];
            if (this._map.getZoom() > feature.zoomThreshold) {
                if (!this.options.dataset.toPoint.showAlways) {
                    this.removeLayer(feature.marker);
                }
                this.addLayer(feature);
                this.removedPaths.splice(i, 1);
                i = i - 1;
            }
        }
        this.removedPaths = this.removedPaths.concat(removedTemp);
    },

    _getCenter: function (feature) {
        if (typeof turf !== 'undefined') {
            var p = turf.pointOnSurface(feature.toGeoJSON());
            return L.latLng(p.geometry.coordinates.reverse());
        }
        return feature.getBounds().getCenter();
    },

    _layeradd: function (event) {
        var feature = event.layer;
        if (feature.feature.geometry.type !== 'Point' && !feature.isMarker) {
            feature.setStyle(KR.Style.getPathStyle(feature.feature));
            feature.bringToBack();
        }

        if (this.options.dataset.toPoint) {

            if (feature.isMarker) {
                return;
            }
            if (feature.getBounds && !feature.zoomThreshold && !feature.marker) {
                var zoomThreshold = this.getZoomThreshold(feature);
                var marker = this._pointToLayer(
                    feature.feature,
                    this._getCenter(feature)
                );
                marker.feature = feature.feature;
                marker.on('click', function (e) {
                    feature.fire('click', {
                        containerPoint: e.containerPoint,
                        latlng: e.latlng,
                        layerPoint: e.layerPoint,
                        originalEvent: e.originalEvent,
                        target: e.target,
                        type: e.type,
                        parent: true
                    });
                });

                feature.zoomThreshold = zoomThreshold;
                this.removedPaths.push(feature);
                feature.marker = marker;
                feature.marker.isMarker = true;
                feature.marker.getParent = function () {
                    return feature;
                };
                if (this._map.getZoom() <= zoomThreshold) {
                    this.removeLayer(feature);
                    if (!this.options.dataset.toPoint.showAlways) {
                        this.addLayer(feature.marker);
                    }
                }
                if (this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
            }
        }
    },

    setMap: function (map) {
        map.on('layerSelected', this._deselectAll, this);
    },

    onAdd: function (map) {
        L.GeoJSON.prototype.onAdd.apply(this, arguments);
        if (this.options.dataset && this.options.dataset.toPoint) {
            this._zoomend();
            map.on('zoomend', this._zoomend, this);
            this.on('layeradd', this._layeradd, this);
        }
        this.setMap(map);
    },

    _createFeatureIcon: function (feature, selected) {
        return KR.Style.getIcon(feature, selected);
    },

    _pointToLayer: function (feature, latlng) {
        return KR.Style.getMarker(feature, latlng);
    }

});


L.Knreise.geoJson = function (geojson, options) {
    return new L.Knreise.GeoJSON(geojson, options);
};
/*global L:false, KR: false, audiojs:false */
'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.Control = L.Knreise.Control || {};

L.Knreise.Control.Sidebar = L.Control.Sidebar.extend({

    options: {
        noListThreshold: 10
    },

    initialize: function (placeholder, options) {
        options = options || {};
        options.autoPan = false;
        L.setOptions(this, options);

        this._template = options.template;

        // Find content container
        var content =  L.DomUtil.get(placeholder);
        L.DomEvent.on(content, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
        });
        // Remove the content container from its original parent
        content.parentNode.removeChild(content);

        var top = L.DomUtil.create('div', 'top-menu', content);
        this._contentContainer = L.DomUtil.create('div', 'sidebar-content', content);

        this.on('hide', this._removeContent, this);

        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container = L.DomUtil.create('div', l + 'sidebar knreise-sidebar ' + this.options.position);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = this._closeButton = L.DomUtil.create('a', 'close pull-right', top);
            close.innerHTML = '&times;';
        }
        this._top = L.DomUtil.create('span', '', top);

        // Style and attach content container
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        this.on('hide', function () {
            if (this._map) {
                this._map.fire('layerSelected');
            }

        }, this);
    },

    _setupSwipe: function (callbacks) {
        if (!callbacks) {
            return;
        }
        $(this.getContainer())
            .swipe({
                swipe: function () {},
                allowPageScroll: 'vertical'
            })
            .off('swipeLeft')
            .on('swipeLeft', function () {
                if (callbacks.next) {
                    callbacks.next();
                }
            })
            .off('swipeRight')
            .on('swipeRight', function () {
                if (callbacks.prev) {
                    callbacks.prev();
                }
            });
    },

    showFeature: function (feature, template, getData, callbacks, index, numFeatures) {
        if (getData) {
            this.setContent('');
            var self = this;
            getData(feature, function (newFeature) {
                newFeature.properties = _.extend(feature.properties, newFeature.properties);
                self.showFeature(newFeature, template, null, callbacks, index, numFeatures);
            });
            return;
        }

        template = template || feature.template || KR.Util.templateForDataset(feature.properties.dataset) || this._template;
        var img = feature.properties.images;
        if (_.isArray(img)) {
            img = img[0];
        }

        if (feature.properties.allProps && feature.properties.allProps.europeana_rights) {
            feature.properties.license = feature.properties.allProps.europeana_rights[0];
        } else {
            feature.properties.license = null;
        }


        var color = KR.Style.colorForFeature(feature, true, true);
        var content = '<span class="providertext" style="color:' + color + ';">' + feature.properties.provider + '</span>' +
            template(_.extend({image: null}, feature.properties));

        if (this.options.footerTemplate && feature.properties.link) {
            content += this.options.footerTemplate(feature.properties);
        }

        this.setContent(content);
        this._setupSwipe(callbacks);

        $(this._container).find('.prev-next-arrows').remove();

        this._top.innerHTML = '';
        if (callbacks) {
            var list = L.DomUtil.create('a', 'pull-left list-btn', this._top);
            list.innerHTML = '<i class="fa fa-bars"></i>';

            var text = L.DomUtil.create('div', 'top-text pull-left', this._top);
            text.innerHTML = index + 1 + ' av ' + numFeatures;

            L.DomEvent.on(list, 'click', function () {
                callbacks.close();
            });

            var prev = L.DomUtil.create('a', 'prev-next-arrows prev circle', this._container);
            prev.innerHTML = '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>';
            if (callbacks.prev) {
                L.DomEvent.on(prev, 'click', callbacks.prev);
                L.DomUtil.addClass(prev, 'active');
            }

            var next = L.DomUtil.create('a', 'prev-next-arrows next circle', this._container);
            next.innerHTML = '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
            if (callbacks.next) {
                L.DomEvent.on(next, 'click', callbacks.next);
                L.DomUtil.addClass(next, 'active');
            }
        }

        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        this.show();
        $(this.getContainer()).scrollTop(0);
    },

    _createListCallbacks: function (feature, index, template, getData, features, close) {
        var prev;
        if (index > 0) {
            prev = _.bind(function (e) {
                if (e) {
                    e.preventDefault();
                }
                index = index - 1;
                feature = features[index];
                var callbacks = this._createListCallbacks(feature, index, template, getData, features, close);
                this.showFeature(feature, template, getData, callbacks, index, features.length);
            }, this);
        }
        var next;
        if (index < features.length - 1) {
            next = _.bind(function (e) {
                if (e) {
                    e.preventDefault();
                }
                index = index + 1;
                feature = features[index];
                var callbacks = this._createListCallbacks(feature, index, template, getData, features, close);
                this.showFeature(feature, template, getData, callbacks, index, features.length);
            }, this);
        }

        if (!close) {
            close = _.bind(function () {
                this.showFeatures(features, template, getData, this.options.noListThreshold, true);
            }, this);
        }

        return {
            prev: prev,
            close: close,
            next: next
        };
    },

    _createListElement: function (feature, index, template, getData, features) {
        var marker;
        if (feature.properties.thumbnail) {
            marker = this.options.thumbnailTemplate({
                thumbnail: feature.properties.thumbnail,
                color: KR.Style.colorForFeature(feature, true)
            });
        } else {
            marker = this.options.markerTemplate({
                icon: '',
                color: KR.Style.colorForFeature(feature)
            });
        }

        var li = $(this.options.listElementTemplate({
            title: feature.properties.title,
            marker: marker
        }));

        li.on('click', _.bind(function (e) {
            e.preventDefault();
            var callbacks = this._createListCallbacks(feature, index, template, getData, features);

            this.showFeature(feature, template, getData, callbacks, index, features.length);
            return false;
        }, this));
        return li;
    },

    showFeatures: function (features, template, getData, noListThreshold, forceList) {
        noListThreshold = (noListThreshold === undefined) ? this.options.noListThreshold : noListThreshold;
        var shouldSkipList = (features.length <= noListThreshold);
        if (shouldSkipList && forceList !== true) {
            var feature = features[0];
            $(this.getContainer()).html('');
            var callbacks = this._createListCallbacks(feature, 0, template, getData, features);
            this.showFeature(feature, template, getData, callbacks, 0, features.length);
            return;
        }

        var count = $('<span class="circle">' + features.length + '</span>');
        $(this._top).html(count);

        var grouped = _.chain(features)
            .groupBy(function (feature) {
                return feature.properties.provider;
            })
            .map(function (featuresInGroup, key) {
                var wrapper = $('<div></div>');
                var list = $('<div class="list-group"></ul>');
                var elements = _.map(featuresInGroup, function (feature) {
                    var index = _.findIndex(features, function (a) {
                        return a === feature;
                    });
                    return this._createListElement(feature, index, template, getData, features);
                }, this);

                list.append(elements);
                wrapper.append('<h5 class="providertext">' + key + '</h5>');
                wrapper.append(list);
                return wrapper;
            }, this).value();
        $(this.getContainer()).html(grouped);
        this.show();
        $(this.getContainer()).scrollTop(0);
    },

    _removeContent: function () {
        $(this.getContainer()).html('');
    }
});

L.Knreise.Control.sidebar = function (placeholder, options) {
    return new L.Knreise.Control.Sidebar(placeholder, options);
};
/*global L:false, KR: false */


(function () {
    'use strict';

    L.Knreise = L.Knreise || {};
    L.Knreise.Control = L.Knreise.Control || {};

    var Label = function (dataset, layer) {
        var enabled = layer.enabled;
        var _error = null;
        var label, _icon;

        function _getDatasetId() {
            if (dataset.grouped) {
                return dataset.datasets[0].extras.datasetId;
            }
            return dataset.extras.datasetId;
        }

        function _getIcon(iconAppend) {
            var icon = document.createElement('i');
            icon.className = 'layericon fa';
            if (dataset.visible) {
                icon.className += ' fa-check-square-o';
            } else {
                icon.className += ' fa-square-o';
            }
            if (iconAppend) {
                icon.className += ' ' + iconAppend;
            }

            if (layer.isLoading) {
                icon.className = 'layericon fa fa-spinner fa-pulse';
            }

            if (layer.enabled) {
                icon.style.color = KR.Style.colorForFeature({
                    properties: {datasetId: _getDatasetId()}
                }, true, true);
            } else {
                icon.style.color = '#ddd';
            }
            return icon;
        }

        function _redrawIcon() {
            var newIcon = _getIcon();
            label.replaceChild(newIcon, _icon);
            _icon = newIcon;
        }

        function _toggle() {
            dataset.visible = !dataset.visible;
            _redrawIcon();
            if (dataset.visible) {
                layer.fire('show');
            } else {
                layer.fire('hide');
            }
        }

        function _showError(error) {
            _error = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle');
            _error.setAttribute('title', KR.parseError(error));
            label.insertBefore(_error, label.childNodes[0]);
        }

        function _createLabel() {
            label = document.createElement('label');
            if (_.isUndefined(dataset.visible)) {
                dataset.visible = true;
            }

            var name = document.createElement('span');
            name.innerHTML = ' ' + dataset.name;

            _icon = _getIcon();
            label.appendChild(_icon);
            label.appendChild(name);

            if (layer.error) {
                _showError(layer.error);
            }

            if (!layer.enabled) {
                label.className = 'disabled';
            }

            L.DomEvent.on(label, 'click', function () {
                var canToggle = layer.enabled && !layer.isLoading;
                if (canToggle) {
                    _toggle();
                }
            });
        }

        function _enabledChanged() {
            if (layer.enabled === enabled) {
                return;
            }

            enabled = layer.enabled;

            _redrawIcon();
            if (enabled) {
                label.className = label.className.replace('disabled', '');
            } else {
                label.className += 'disabled';
            }
        }

        _createLabel();
        layer.on('changeEnabled', _enabledChanged);
        layer.on('dataloadstart', function () {
            if (_error) {
                label.removeChild(_error);
                _error = null;
            }
            _redrawIcon();
        });
        layer.on('dataloadend', _redrawIcon);
        layer.on('error', _showError);
        function getLabel() {
            return label;
        }

        return {
            getLabel: getLabel,
            hasError: function () {
                return !!layer.error;
            }
        };
    };


    L.Control.Datasets = L.Control.extend({

        initialize: function (layers, options) {
            L.setOptions(this, options);
            this._labels = [];
            this._handlingClick = false;
            this.expanded = false;
            this.numLoading = 0;
            var i;
            for (i in layers) {
                if (layers.hasOwnProperty(i)) {
                    this._addLayer(layers[i]);
                }
            }
        },

        _addLayer: function (layer) {
            var i;
            var dataset = layer.options.dataset;

            if (dataset.datasets) {
                if (dataset.grouped) {
                    this._addDataset(dataset, layer);
                } else {
                    for (i = 0; i < dataset.datasets.length; i++) {
                        this._addDataset(dataset.datasets[i]);
                    }
                }
            } else {
                this._addDataset(dataset, layer);
            }
        },

        _addDataset: function (dataset, layer) {
            if (layer.isLoading) {
                this.numLoading += 1;
                this._checkSpinner();
            }
            var label = new Label(dataset, layer);

            this._labels.push(label);

            layer.on('dataloadstart', function () {this._loadStart(); }, this);
            layer.on('dataloadend', function () {this._loadEnd(); }, this);
        },

        _loadStart: function () {
            this.numLoading += 1;
            this._checkSpinner();
        },

        _loadEnd: function () {
            this.numLoading -= 1;
            this._checkSpinner();
        },

        _hasErrors: function () {
            return !!_.find(this._labels, function (label) {
                return label.hasError();
            });
        },

        _checkError: function () {
            if (this._hasErrors()) {
                this._errorIcon.className = this._errorIcon.className.replace(
                    ' hidden',
                    ''
                );
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
            }
        },

        _checkSpinner: function () {
            if (!this._btnIcon) {
                return;
            }
            if (this.numLoading === 0) {
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-spinner fa-pulse',
                    ' fa-bars'
                );
                this._checkError();
            } else {
                if (this._errorIcon.className.indexOf('hidden') < 0) {
                    this._errorIcon.className += ' hidden';
                }
                this._btnIcon.className = this._btnIcon.className.replace(
                    ' fa-bars',
                    ' fa-spinner fa-pulse'
                );
            }
        },

        onAdd: function (map) {
            this._map = map;
            this._initLayout();
            this._update();
            return this._container;
        },

        _update: function () {
            if (!this._container) {
                return;
            }

            this._overlaysList.innerHTML = '';
            var i, label;
            //for (i in this._labels) {
            for (i = 0; i < this._labels.length; i++) {
                label = this._labels[i];
                this._overlaysList.appendChild(label.getLabel());
            }
            this._checkError();
        },

        _initLayout: function () {
            var className = 'leaflet-control-layers';
            this._container = L.DomUtil.create('div', '');

            //Makes this work on IE10 Touch devices by stopping it 
            //from firing a mouseout event when the touch is released
            this._container.setAttribute('aria-haspopup', true);

            if (!L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(this._container)
                    .disableScrollPropagation(this._container);
            } else {
                L.DomEvent.on(
                    this._container,
                    'click',
                    L.DomEvent.stopPropagation
                );
            }

            this._form = L.DomUtil.create('form', className + '-list');

            this._map.on('click', this._collapse, this);
            this._overlaysList = L.DomUtil.create(
                'div',
                className + '-overlays',
                this._form
            );

            this._closeDiv = L.DomUtil.create('div', 'clearfix');
            var closeBtn = L.DomUtil.create(
                'button',
                'btn btn-default pull-right',
                this._closeDiv
            );
            closeBtn.title = 'Kartlag';
            L.DomEvent.on(closeBtn, 'click', function () {
                this._toggle();
            }, this);

            this._errorIcon = L.DomUtil.create('i', 'error-icon fa fa-exclamation-triangle hidden', closeBtn);
            closeBtn.appendChild(document.createTextNode(' '));
            if (this.numLoading > 0) {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-spinner fa-pulse', closeBtn);
            } else {
                this._btnIcon = L.DomUtil.create('i', 'fa fa-bars', closeBtn);
            }

            this._container.appendChild(this._closeDiv);

            this._listContainer = L.DomUtil.create('div', className + ' hidden');
            this._listContainer.appendChild(this._form);
            this._container.appendChild(this._listContainer);
        },

        _toggle: function () {
            if (this.expanded) {
                this._collapse();
            } else {
                this._expand();
            }
        },

        _expand: function () {
            L.DomUtil.addClass(
                this._listContainer,
                'leaflet-control-layers-expanded'
            );
            this.expanded = true;
            this._listContainer.className = this._listContainer.className.replace(
                ' hidden',
                ''
            );
        },

        _collapse: function () {
            this._listContainer.className = this._listContainer.className.replace(
                ' leaflet-control-layers-expanded',
                ''
            );
            L.DomUtil.addClass(
                this._listContainer,
                'hidden'
            );
            this.expanded = false;
        }
    });

    L.control.datasets = function (layers, options) {
        return new L.Control.Datasets(layers, options);
    };
}());

L.Knreise = L.Knreise || {};
L.Knreise.Icon = L.AwesomeMarkers.Icon.extend({
    options: {
        icon: null
    }
});

L.Knreise.icon = function (options) {
    return new L.Knreise.Icon(options);
};
/*global L:false, turf:false */
var KR = this.KR || {};

KR.DatasetLoader = function (api, map, sidebar, errorCallback) {
    'use strict';

    var reloads = [];

    var _defaults = {
        isStatic: true,
        bbox: true,
        cluster: true,
        visible: true
    };

    var _addClusterClick, _addFeatureClick;
    if (sidebar) {
        _addClusterClick = KR.Util.clusterClick(sidebar);
        _addFeatureClick = KR.Util.featureClick(sidebar);
    }

    function _mapper(dataset) {
        var id = KR.Util.stamp(dataset);
        return function (features) {
            if (!features || !features.features.length) {
                return features;
            }
            _.each(features.features, function (feature) {
                feature.properties.datasetID = id;
                if (_.has(dataset, 'circle')) {
                    feature.properties.circle = dataset.circle;
                }
                if (_.has(dataset, 'provider')) {
                    feature.properties.provider = dataset.provider;
                }
                if (_.has(dataset, 'extras')) {
                    feature.properties = _.extend(feature.properties, dataset.extras);
                }
                if (_.has(dataset, 'mappings')) {
                    _.each(dataset.mappings, function (value, key) {
                        feature.properties[key] = feature.properties[value];
                    });
                }
            });
            return features;
        };
    }

    function _copyProperties(dataset) {
        var params = _.reduce(_.without(_.keys(dataset), 'datasets'), function (acc, key) {
            acc[key] = dataset[key];
            return acc;
        }, {});
        dataset.datasets  = _.map(dataset.datasets, function (dataset) {
            return _.extend({}, params, dataset);
        });
        return dataset;
    }

    function _createGeoJSONLayer(geoJson, dataset) {
        var options = {
            dataset: dataset,
            onEachFeature: function (feature, layer) {
                if (_addFeatureClick) {
                    _addFeatureClick(feature, layer, dataset);
                }
            }
        };
        if (dataset.style) {
            options.style = dataset.style;
        }
        return L.Knreise.geoJson(geoJson, options);
    }

    function _resetDataGeoJson(layer, featurecollections) {
        layer.clearLayers();
        var features = _.reduce(featurecollections, function (acc, data) {
            return acc.concat(data.toGeoJSON().features);
        }, []);
        layer.addData(KR.Util.createFeatureCollection(features));
    }

    function _resetClusterData(clusterLayer, featurecollections) {
        clusterLayer.clearLayers();
        var layers = _.reduce(featurecollections, function (acc, geoJSONLayer) {
            geoJSONLayer.setMap(map);
            return acc.concat(geoJSONLayer.getLayers());
        }, []);
        clusterLayer.addLayers(layers);
    }

    function _setupToggle(layer, reloadFunc) {
        layer.on('hide', function () {
            reloadFunc(true);
        });

        layer.on('show', function () {
            reloadFunc(true);
        });
    }

    function _createVectorLayer(dataset, map) {
        var vectorLayer;
        if (dataset.cluster) {
            vectorLayer = new L.Knreise.MarkerClusterGroup({dataset: dataset}).addTo(map);
            if (_addClusterClick) {
                _addClusterClick(vectorLayer, dataset);
            }
        } else {
            vectorLayer = _createGeoJSONLayer(null, dataset).addTo(map);
        }
        var enabled = true;
        if (dataset.minFeatures) {
            enabled = false;
        }
        vectorLayer.enabled = enabled;
        return vectorLayer;
    }

    function _toggleEnabled(vectorLayer, enabled) {
        if (vectorLayer.enabled !== enabled) {
            vectorLayer.enabled = enabled;
            vectorLayer.fire('changeEnabled');
        }
    }

    function _getvisible(dataset) {
        if (dataset.datasets && !dataset.grouped) {
            var numVisible = _.filter(dataset.datasets, function (d) {
                return d.visible;
            }).length;
            return (numVisible > 0);
        }

        return dataset.visible;
    }

    function _checkShouldLoad(dataset) {
        if (!dataset.minZoom) {
            return _getvisible(dataset);
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return _getvisible(dataset);
    }

    function _checkEnabled(dataset) {
        if (!dataset.minZoom) {
            return true;
        }

        if (map.getZoom() < dataset.minZoom) {
            return false;
        }
        return true;
    }

    function _isStatic(dataset) {
        if (dataset.datasets) {
            return _.filter(dataset.datasets, function (dataset) {
                return (dataset.isStatic === false);
            }).length === 0;
        }
        return dataset.isStatic;
    }

    function _checkLoadWhenLessThan(dataset) {
        var datasetList = [];
        if (dataset.datasets) {
            datasetList = dataset.datasets;
        } else {
            datasetList.push(dataset);
        }

        _.each(datasetList, function (dataset) {
            if (dataset.loadWhenLessThan) {

                var check = function () {
                    if (!dataset.geoJson) {
                        return;
                    }
                    var poly = turf.bboxPolygon(KR.Util.splitBbox(map.getBounds().toBBoxString()));
                    var inside = _.filter(dataset.geoJson.features, function (p) {
                        return turf.inside(p, poly);
                    });
                    if (inside.length <= dataset.loadWhenLessThan.count) {
                        dataset.loadWhenLessThan.callback(map, dataset, inside);
                    } else {
                        dataset.loadWhenLessThan.callback(map, dataset);
                    }
                };
                map.on('moveend', check);
                check();
            }
        });
    }


    function _initDataset(dataset) {
        if (dataset.init) {
            dataset.init(map, dataset);
        }
    }

    function _addDataset(dataset, filter, initBounds) {
        var vectorLayer = _createVectorLayer(dataset, map);

        if (dataset.datasets) {
            _.each(dataset.datasets, _initDataset);
        } else {
            _initDataset(dataset);
        }

        function checkData(geoJson, vectorLayer) {
            if (dataset.minFeatures) {
                if (geoJson.numFound && dataset.minFeatures < geoJson.numFound) {
                    _toggleEnabled(vectorLayer, false);
                    return KR.Util.createFeatureCollection([]);
                }
                _toggleEnabled(vectorLayer, true);
            }
            return geoJson;
        }

        var lastBounds;

        var _reloadData = function (e, bbox, forceVisible, callback) {
            var first = !e;

            vectorLayer.enabled = _checkEnabled(dataset);
            vectorLayer.fire('changeEnabled');
            var shouldLoad = forceVisible || _checkShouldLoad(dataset);
            if (!shouldLoad) {
                vectorLayer.clearLayers();
                return;
            }

            var newBounds = bbox || map.getBounds().toBBoxString();
            var toLoad;
            if (dataset.datasets) {
                toLoad = _.filter(dataset.datasets, function (d) {
                    return d.visible;
                });
            } else {
                toLoad = [dataset];
            }

            var featurecollections = [];
            var finished = _.after(toLoad.length, function () {
                vectorLayer.isLoading = false;
                vectorLayer.fire('dataloadend');
                if (dataset.cluster) {
                    _resetClusterData(vectorLayer, featurecollections);
                } else {
                    _resetDataGeoJson(vectorLayer, featurecollections);
                }
                if (callback) {
                    callback();
                }
            });

            vectorLayer.isLoading = true;
            vectorLayer.fire('dataloadstart');
            _.each(toLoad, function (dataset) {
                var mapper = _mapper(dataset);

                function dataLoaded(geoJson) {
                    dataset.geoJson = geoJson;
                    vectorLayer.error = null;
                    if (filter) {
                        geoJson = filter(geoJson);
                    }
                    var geoJSONLayer;
                    if (dataset.cluster) {
                        geoJSONLayer = _createGeoJSONLayer(
                            mapper(checkData(geoJson, vectorLayer)),
                            dataset
                        );
                        dataset.geoJSONLayer = geoJSONLayer;
                    } else {
                        geoJSONLayer = L.geoJson(mapper(checkData(geoJson, vectorLayer)));
                    }
                    featurecollections.push(geoJSONLayer);
                    finished();
                }

                function loadError(error) {
                    vectorLayer.error = error;
                    finished();
                    //do not display errors for abort
                    if (error.statusText === 'abort') {
                        return;
                    }
                    if (errorCallback) {
                        errorCallback({
                            dataset: dataset.name,
                            error: error,
                            layer: vectorLayer
                        });
                    } else {
                        vectorLayer.fire('error', error);
                    }
                }

                //if this is not the first load, and dataset is static: do not load
                if ((!first && dataset.isStatic) || lastBounds === newBounds) {
                    dataLoaded(dataset.geoJson);
                    return;
                }

                //load according to strategy
                if (dataset.bbox) {
                    api.getBbox(
                        dataset.dataset,
                        newBounds,
                        dataLoaded,
                        loadError
                    );
                } else {
                    api.getData(
                        dataset.dataset,
                        dataLoaded,
                        loadError
                    );
                }
            });
            lastBounds = newBounds;
        };

        _reloadData(null, initBounds, undefined, function () {
            _checkLoadWhenLessThan(dataset);
        });

        if (!_isStatic(dataset) || dataset.minZoom) {
            map.on('moveend', _reloadData);
        }

        _setupToggle(vectorLayer, _reloadData);

        return {layer: vectorLayer, reload: _reloadData};
    }

    function _setStyle(dataset) {
        var id = KR.Util.getDatasetId(dataset);
        dataset.extras = dataset.extras || {};
        dataset.extras.datasetId = id;
        if (dataset.style) {
            KR.Style.setDatasetStyle(id, dataset.style);
        }
    }

    function reload(setVisible, callback) {
        var finished = _.after(reloads.length, function () {
            if (callback) {
                callback();
            }
        });
        _.each(reloads, function (reload) {
            reload(null, null, setVisible, finished);
        });
    }

    function loadDatasets(datasets, bounds, filter) {
        var res = _.map(datasets, function (dataset) {

            //extend with defaults
            dataset = _.extend({}, _defaults, dataset);

            //copy properties from parent
            if (dataset.datasets) {
                _copyProperties(dataset);
            }

            //set default style
            if (KR.Style.setDatasetStyle) {
                if (dataset.datasets) {
                    _.each(dataset.datasets, _setStyle);
                } else {
                    _setStyle(dataset);
                }
            }

            if (!dataset.visible) {
                dataset.notLoaded = true;
            }
            if (dataset.minZoom && dataset.bbox) {
                dataset.isStatic = false;
            }
            return _addDataset(dataset, filter, bounds);
        });
        reloads = _.pluck(res, 'reload');
        return _.pluck(res, 'layer');
    }

    return {
        loadDatasets: loadDatasets,
        reload: reload
    };
};

/*global L:false, navigator:false*/
L.Knreise = L.Knreise || {};
(function (ns) {
    'use strict';
    ns.LocateButton = function (callback, error, options) {
        options = options || {};
        options.zoom = options.zoom || 10;
        var _map;

        function showPosition(pos) {
            var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
            if (callback) {
                callback(p);
            } else {
                _map.setView(p, 16);
            }
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                if (error) {
                    error();
                }
            }
        }

        function addTo(map) {
            var title = options.title || 'Finn meg';
            var icon = options.icon || 'fa-user';
            _map = map;
            return L.easyButton(map, getLocation, {icon: icon, title: title});
        }

        return {
            addTo: addTo
        };
    };

}(L.Knreise));

/*global L:false */
var KR = this.KR || {};

//see: https://github.com/mylen/leaflet.TileLayer.WMTS
L.TileLayer.WMTS=L.TileLayer.extend({defaultWmtsParams:{service:"WMTS",request:"GetTile",version:"1.0.0",layer:"",style:"",tilematrixSet:"",format:"image/jpeg"},initialize:function(a,b){this._url=a;var c=L.extend({},this.defaultWmtsParams),d=b.tileSize||this.options.tileSize;c.width=c.height=b.detectRetina&&L.Browser.retina?2*d:d;for(var e in b)this.options.hasOwnProperty(e)||"matrixIds"==e||(c[e]=b[e]);this.wmtsParams=c,this.matrixIds=b.matrixIds||this.getDefaultMatrix(),L.setOptions(this,b)},onAdd:function(a){L.TileLayer.prototype.onAdd.call(this,a)},getTileUrl:function(a,b){var c=this._map;return crs=c.options.crs,tileSize=this.options.tileSize,nwPoint=a.multiplyBy(tileSize),nwPoint.x+=1,nwPoint.y-=1,sePoint=nwPoint.add(new L.Point(tileSize,tileSize)),nw=crs.project(c.unproject(nwPoint,b)),se=crs.project(c.unproject(sePoint,b)),tilewidth=se.x-nw.x,b=c.getZoom(),ident=this.matrixIds[b].identifier,X0=this.matrixIds[b].topLeftCorner.lng,Y0=this.matrixIds[b].topLeftCorner.lat,tilecol=Math.floor((nw.x-X0)/tilewidth),tilerow=-Math.floor((nw.y-Y0)/tilewidth),url=L.Util.template(this._url,{s:this._getSubdomain(a)}),url+L.Util.getParamString(this.wmtsParams,url)+"&tilematrix="+ident+"&tilerow="+tilerow+"&tilecol="+tilecol},setParams:function(a,b){return L.extend(this.wmtsParams,a),b||this.redraw(),this},getDefaultMatrix:function(){for(var a=new Array(22),b=0;22>b;b++)a[b]={identifier:""+b,topLeftCorner:new L.LatLng(20037508.3428,-20037508.3428)};return a}}),L.tileLayer.wmts=function(a,b){return new L.TileLayer.WMTS(a,b)};


(function (ns) {
    'use strict';

    function getMatrix(tilematrixSet) {
        var matrixIds3857 = new Array(30);
        for (var i= 0; i<22; i++) {
            matrixIds3857[i]= {
                identifier: tilematrixSet + ':' + i,
                topLeftCorner: new L.LatLng(2.0037508E7, -2.003750834E7)
            };
        }
        return matrixIds3857;
    }

    ns.SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';

    ns.getNibLayer = function (callback, wmsc) {
        ns.Util.sendRequest(KR.SKTokenUrl, null, function (token) {
            var layer;
            if (wmsc) {
                layer = L.tileLayer.wms('http://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.nibcache', {
                    layers: 'NiB',
                    format: 'image/jpeg',
                    transparent: false,
                    attribution: 'Kartverket'
                });
            } else {
                var url = 'http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts';
                var tilematrixSet = 'EPSG:900913';
                layer = new L.TileLayer.WMTS(url, {
                    layer: 'NiB',
                    style: 'normal',
                    tilematrixSet: tilematrixSet,
                    matrixIds: getMatrix(tilematrixSet),
                    format: 'image/jpeg',
                    attribution: 'Kartverket'
                });
            }
            layer.setParams({GKT: token});
            callback(layer);
        });
    };

}(KR));

/*global L:false*/
var KR = this.KR || {};
KR.Config = KR.Config || {};

(function (ns) {
    'use strict';

    ns.getDatasetList = function (api, komm) {

        function loadKulturminnePoly(map, dataset, features) {
            if (!features) {
                dataset.extraFeatures.clearLayers();
            }
            if (features) {
                var ids = _.map(features, function (feature) {
                    return feature.properties.id;
                });
                if (ids.length) {
                    var q = {
                        api: 'kulturminnedataSparql',
                        type: 'lokalitetpoly',
                        lokalitet: ids
                    };
                    api.getData(q, function (geoJson) {
                        dataset.extraFeatures.clearLayers().addData(geoJson);
                    });
                }
            }
        }

        function initKulturminnePoly(map, dataset) {
            dataset.extraFeatures = L.geoJson(null, {
                onEachFeature: function (feature, layer) {
                    feature.properties.datasetId = dataset.id;
                    layer.setStyle(KR.Style.getPathStyle(feature, true));
                    layer.on('click', function () {
                        var parent = _.find(dataset.geoJSONLayer.getLayers(), function (parentLayer) {
                            return (parentLayer.feature.properties.id === feature.properties.lok);
                        });
                        if (parent) {
                            parent.fire('click');
                        }
                    });
                }
            }).addTo(map);
        }

        if (komm && komm.length === 3) {
            komm = '0' + komm;
        }

        return {
            'difo': {
                name: 'Digitalt fortalt',
                dataset: {dataset: 'difo', api: 'norvegiana'},
                cluster: true,
                template: _.template($('#digitalt_fortalt_template').html()),
                noListThreshold: Infinity,
                description: 'Digitalt fortalt'
            },
            'verneomr': {
                id: 'verneomraader',
                dataset: {
                    api: 'cartodb',
                    table: 'naturvernomrader_utm33_2',
                    columns: ['iid', 'omradenavn', 'vernef_id', 'verneform'],
                },
                provider: 'Naturbase',
                name: 'Verneområder',
                template: _.template($('#verneomraader_template').html()),
                getFeatureData: function (feature, callback) {
                    api.getNorvegianaItem('kulturnett_Naturbase_' + feature.properties.iid, callback);
                },
                toPoint: {
                    showAlways: true,
                    stopPolyClick: true,
                    minSize: 20
                },
                cluster: false,
                description: 'Verneområder fra Naturbase, polygoner og punkter'
            },
            'artobs': {
                name: 'Artsobservasjoner',
                dataset: {
                    api: 'norvegiana',
                    dataset: 'Artsdatabanken'
                },
                cluster: false,
                description: 'Artsobservasjoner fra Artsdatabanken'
            },
            'folketelling': {
                name: 'Folketelling 1910',
                provider: 'Folketelling 1910',
                dataset: {
                    api: 'folketelling',
                    dataset: 'property',
                },
                isStatic: false,
                minZoom: 14,
                template: _.template($('#folketelling_template').html()),
                getFeatureData: function (feature, callback) {
                    api.getData({
                        api: 'folketelling',
                        type: 'propertyData',
                        propertyId: feature.properties.efid
                    }, function (feature) {
                        feature.properties.provider = 'Folketelling 1910';
                        callback(feature);
                    });
                },
                mappings: {
                    'title': 'gaardsnavn_gateadr'
                },
                noListThreshold: 0,
                description: 'Eiendommer fra folketelling 1910'
            },
            'wikipedia': {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                style: {thumbnail: true},
                minZoom: 13,
                template: _.template($('#wikipedia_template').html()),
                description: 'Geotaggede artikler fra bokmålswikipedia'
            },
            'ark_hist': {
                grouped: true,
                name: 'Arkeologi og historie',
                datasets: [
                    {
                        name: 'MUSIT',
                        provider: 'Universitetsmuseene',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'MUSIT'
                        },
                        template: _.template($('#musit_template').html())
                    },
                    {
                        name: 'DiMu',
                        dataset: {
                            api: 'norvegiana',
                            dataset: 'DiMu'
                        },
                        template: _.template($('#digitalt_museum_template').html()),
                        isStatic: false
                    },
                    {
                        id: 'riksantikvaren',
                        name: 'Riksantikvaren',
                        provider: 'Riksantikvaren',
                        dataset: {
                            api: 'kulturminnedataSparql',
                            kommune: komm
                        },
                        template: _.template($('#ra_sparql_template').html()),
                        bbox: false,
                        isStatic: true,
                        init: initKulturminnePoly,
                        loadWhenLessThan: {
                            count: 5,
                            callback: loadKulturminnePoly
                        }
                    }
                ],
                description: 'Data fra Universitetsmuseene, Digitalt museum og Riksantikvaren'
            }
        };
    };

    ns.getDatasets = function (ids, api, komm) {

        var datasetConfig = ns.getDatasetList(api, komm);
        return _.chain(ids)
            .map(function (dataset) {
                if (_.has(datasetConfig, dataset)) {
                    return datasetConfig[dataset];
                }
            })
            .compact()
            .value();
    };

}(KR.Config));

/*global window:false, L:false*/

var KR = this.KR || {};

KR.SplashScreen = function (map, title, description, image) {
    'use strict';

    function getShouldStayClosed() {
        var url = window.location.href;
        var name = 'remember_' + url + '=';
        var ca = document.cookie.split('; ');
        var l = _.find(ca, function (cookie) {
            return cookie.indexOf(name) === 0;
        });
        if (l) {
            return l.substring(name.length, l.length) === 'true';
        }
        return;
    }

    function setShouldStayClosed(value) {
        var url = window.location.href;
        document.cookie = 'remember_' + url + '=' + value;
    }

    function hideSidebar (e) {
        if (this._gray) {
            this._container.removeChild(this._gray);
        }
        L.Control.Sidebar.prototype.hide.apply(this, arguments);
    };

    function showSidebar (e) {
        this._gray = L.DomUtil.create('div', 'gray', this._container);
        L.Control.Sidebar.prototype.show.apply(this, arguments);
    };


    function createSidebar() {
        var el = L.DomUtil.create('div', '', document.body);
        el.id = 'splashscreen';

        var sidebar = L.control.sidebar('splashscreen', {
            position: 'center',
            autoPan: false
        });

        sidebar.hide = _.bind(hideSidebar, sidebar);
        sidebar.show = _.bind(showSidebar, sidebar);

        map.addControl(sidebar);

        var content = '<h2>' + title + '</h2>';
        if (image) {
            content += '<img class="splash-image" src="' + image +'" />';
        }
        if (description) {
            content += '<div class="splash-content">'+ description + '</div>';
        }
        sidebar.setContent(content);
        return sidebar;
    }

    function setupRememberCheckbox(sidebar) {

        var checkbox = $('<input type="checkbox">');

        checkbox.prop('checked', getShouldStayClosed());
        var label = $('<label class="splash-content"></label');
        label.append([
            checkbox,
            ' Ikke vis ved oppstart.'
        ]);
        $(sidebar.getContainer()).append(label);

        function toggle() {
            setShouldStayClosed(checkbox.prop('checked'));
        }
        checkbox.on('change', toggle);
        toggle();
    }

    function createButton(callback) {
        return L.easyButton(map, callback, {position: 'topright', icon: 'fa-info-circle', title: 'Om'});
    }

    var sidebar = createSidebar();
    createButton(function () {
        if (sidebar.isVisible()) {
            sidebar.hide();
        } else {
            sidebar.show();
        }
    });


    var shouldStayClosed = getShouldStayClosed();
    if (!shouldStayClosed) {
        if (_.isUndefined(shouldStayClosed)) {
            setShouldStayClosed(true);
        }
        setTimeout(function () {
            sidebar.show();
        }, 500);
    }
    setupRememberCheckbox(sidebar);

};

/*global L:false, alert:false, KR:false, turf:false */

var KR = this.KR || {};
(function (ns) {
    'use strict';

    function _setupSidebar(map) {
        var popupTemplate = _.template($('#popup_template').html());
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
    }

    function _getBaseLayer(layerName, callback) {
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
    }

    function _createMap(options) {
        //create the map
        var map = L.map('map', {maxZoom: 21});

        var baseLayer = options.layer || 'norges_grunnkart_graatone';

        _getBaseLayer(baseLayer, function (layer) {
            layer.addTo(map);
        });

        L.Knreise.LocateButton().addTo(map);
        return map;
    }

    function _loadDatasets(api, datasets, fromUrl, komm) {
        if (fromUrl) {
            datasets = KR.Config.getDatasets(datasets, api, komm);
        }
        return datasets;
    }


    function _municipalityHandler(options, api, datasets, fromUrl, callback) {
        api.getMunicipalityBounds(options.komm, function (bbox) {
            datasets = _loadDatasets(api, datasets, fromUrl, options.komm);
            var bounds = L.latLngBounds.fromBBoxString(bbox);
            callback(bounds, datasets);
        });
    }

    function _bboxHandler(options, api, datasets, fromUrl, callback) {
        datasets = _loadDatasets(api, datasets, fromUrl);
        var bounds = L.latLngBounds.fromBBoxString(options.bbox);
        callback(bounds, datasets);
    }

    function _lineHandler(options, api, datasets, fromUrl, callback) {
        if (options.line.indexOf('utno/') !== 0) {
            return;
        }
        var id = options.line.replace('utno/', '');
        var lineData = {
            api: 'utno',
            id: id,
            type: 'gpx'
        };
        api.getData(lineData, function (line) {
            var lineOptions = {};
            if (options.linecolor) {
                lineOptions.color = options.linecolor;
            }
            var lineLayer = L.geoJson(line, lineOptions);
            var bounds = lineLayer.getBounds();
            datasets = _loadDatasets(api, datasets, fromUrl);

            function filter(features) {
                if (line && options.buffer) {
                    var buffered = turf.buffer(line, options.buffer, 'kilometers');
                    var within = turf.within(features, buffered);
                    return within;
                }
                return features;
            }

            callback(bounds, datasets, filter, lineLayer);
        });
    }


    ns.setupMap = function (api, datasetIds, options, fromUrl) {
        options = options || {};

        var map = _createMap(options);
        var sidebar = _setupSidebar(map);
        var datasetLoader = new KR.DatasetLoader(api, map, sidebar);

        function showDatasets(bounds, datasets, filter, lineLayer) {
            if (options.allstatic) {
                datasets = _.map(datasets, function (dataset) {
                    dataset.isStatic = true;
                    return dataset;
                });
            }

            map.fitBounds(bounds);
            var layers = datasetLoader.loadDatasets(datasets, null, filter);
            if (lineLayer) {
                lineLayer.addTo(map);
            }
            L.control.datasets(layers).addTo(map);
            if (options.title) {
                KR.SplashScreen(map, options.title, options.description, options.image);
            }
        }

        if (options.komm) {
            _municipalityHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.line) {
            _lineHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else if (options.bbox) {
            _bboxHandler(options, api, datasetIds, fromUrl, showDatasets);
        } else {
            alert('Missing parameters!');
        }
    };

    ns.setupMapFromUrl = function (api, datasetIds, options) {
        ns.setupMap(api, datasetIds, options, true);
    };

}(KR));
