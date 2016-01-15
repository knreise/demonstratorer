/*global L:false */

var KR = this.KR || {};

KR.Style = {};

/*
    Leaflet-Style-related functions
*/

(function (ns) {
    'use strict';

    var verneomrTypes = {
        landskapsvern: {
            ids: [
                'LVO', 'LVOD', 'LVOP', 'LVOPD', 'BV', 'MAV', 'P', 'GVS', 'MIV',
                'NM', 'BVV', 'PO', 'DO', 'D'
            ],
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

    /*
        Pre-defined datasets and their styling
    */
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

    ns.groups = {

    };

    /*
        Gets the style config for a dataset in KR.Style.datasets
    */
    ns.getDatasetStyle = function (name) {
        var config = ns.datasets[mappings[name]];
        if (!config) {
            config = ns.datasets[name];
        }

        return config;
    };

    /*
        Sets or updates the style for a dataset in KR.Style.datasets
    */
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

    function getGroupConfig(groupId) {
        return ns.groups[groupId];
    }

    function getConfig(feature) {
        var config;

        if (feature.properties && feature.properties.groupId) {
            return getGroupConfig(feature.properties.groupId);
        }

        if (feature.properties && feature.properties.datasetId) {
            config = ns.getDatasetStyle(feature.properties.datasetId);
        }
        if (!config) {
            return _.extend({}, DEFAULT_STYLE);
        }
        return config;
    }

    function getCircleOptions(bordercolor, fillcolor, radius) {
        radius = radius || 9;
        return {
            radius: radius,
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
            markerColor: color
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

        var thumbnail = KR.Util.getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(' + thumbnail + ');border-color:' + color + ';"></div>' +
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
        var rest;
        if (_.isArray(color)) {
            rest = _.rest(color);
            color = color[0];
        }

        var thumbnail = KR.Util.getImageCache(photos[0].feature.properties.thumbnail, 50, 50);

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + thumbnail + ');'
        };
        if (rest) {
            styleDict['box-shadow'] = _.map(rest, function (c, index) {
                var width = (index + 1) * 2;
                return '0 0 0 ' + width + 'px ' + c;
            }).join(',') + ';';
        }

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


    /*
        Get Leaflet icon for a cluster, optionally selected
    */
    ns.getClusterIcon = function (cluster, selected) {

        var features = cluster.getAllChildMarkers();

        var groups = _.uniq(_.map(features, function (feature) {
            return feature.feature.properties.groupId;
        }));


        var config = getConfig(features[0].feature);
        var colors;
        if (_.compact(groups).length > 1) {
            var groupIds = _.compact(groups);
            if (groupIds.length > 1) {
                colors = _.map(groupIds, _.compose(getFillColor, getGroupConfig));
            }
        } else {
            colors = getFillColor(config, features[0].feature);
        }
        if (selected) {
            colors = SELECTED_COLOR;
        }

        if (config.thumbnail) {
            var thumbnail = getClusterThumbnailIcon(features, colors, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        return getClusterIcon(features, colors);
    };


    /*
        Get a leaflet Icon for a feature, optionally selected
    */
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
            return getCircleOptions(bordercolor, fillcolor, config.radius);
        }
        return createAwesomeMarker(fillcolor);
    };


    /*
        Get a leaflet marker for a feature, optionally selected
    */
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


    /*
        Gets the color for a feature
    */
    ns.colorForFeature = function (feature, hex, useBaseColor) {
        var config = getConfig(feature);
        if (config) {
            if (hex) {
                return getFillColor(config, feature, useBaseColor);
            }
            return hexToName(getFillColor(config, feature));
        }
    };

    ns.colorForDataset = function (dataset, hex, useBaseColor) {
        var config, datasetId;
        if (dataset.grouped) {
            config = ns.groups[KR.Util.stamp(dataset)];
            if (!config) {
                datasetId = dataset.datasets[0].extras.datasetId;
            }
        } else {
            if (!datasetId) {
                datasetId = dataset.extras.datasetId;
            }
            config = getConfig({
                properties: {datasetId: datasetId}
            });
        }
        if (config) {
            if (hex) {
                return getFillColor(config, null, useBaseColor);
            }
            return hexToName(getFillColor(config, null));
        }
    };


    /*
        Gets Leaflet style for a path feature
    */
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

    ns.getPathStyleForGroup = function (groupId, clickable) {
        var feature = {properties: {groupId: groupId}};
        return ns.getPathStyle(feature, clickable);
    };

}(KR.Style));


KR.Style2 = {};
(function (ns) {
    'use strict';

    var SELECTED_COLOR = '#72B026';
    var DEFAULT_COLOR = '#38A9DC';

    var DEFAULT_STYLE = {
        fillcolor: DEFAULT_COLOR,
        circle: false,
        thumbnail: true
    };

    function _getConfig(dataset) {
        var config;
        var datasetId = KR.Util.getDatasetId(dataset);

        var style = KR.Style.getDatasetStyle(datasetId) || {};

        if (dataset.style) {
            return _.extend({}, DEFAULT_STYLE, style, dataset.style);
        }

        return _.extend({}, DEFAULT_STYLE, style);
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

        var thumbnail = KR.Util.getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(' + thumbnail + ');border-color:' + color + ';"></div>' +
            '</div>';

        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: html,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }

    function getCircleOptions(bordercolor, fillcolor, radius) {
        radius = radius || 9;
        return {
            radius: radius,
            weight: 1,
            opacity: 1,
            color: bordercolor,
            fillColor: fillcolor,
            fillOpacity: 0.4
        };
    }

    function createAwesomeMarker(color) {
        return L.Knreise.icon({
            markerColor: color
        });
    }

    ns.getIcon = function (dataset, feature, selected) {

        var config = _getConfig(dataset);
        var fillcolor = selected ? SELECTED_COLOR : getFillColor(config, feature);
        var bordercolor = selected ? SELECTED_COLOR : getBorderColor(config, feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, bordercolor, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        if (config.circle) {
            return getCircleOptions(bordercolor, fillcolor, config.radius);
        }
        return createAwesomeMarker(fillcolor);
    };

}(KR.Style2));