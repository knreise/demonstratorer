/*global L:false */

var KR = this.KR || {};

KR.Style = {};

(function (ns) {
    'use strict';

    var SELECTED_COLOR = '#72B026';
    var DEFAULT_COLOR = '#38A9DC';

    var DEFAULT_STYLE = {
        color: DEFAULT_COLOR,
        circle: false,
        thumbnail: true
    };

    var mappings = {
        'difo': 'Digitalt fortalt',
        'Kulturminnesok': 'Kulturminnesok',
        'DiMu': 'DigitaltMuseum',
        'MUSIT': 'Musit',
        'Artsdatabanken': 'Artsdatabanken'
    };

    ns.datasets = {
        'Digitalt fortalt': {
            color: '#F69730',
            circle: false,
            thumbnail: true
        },
        'Kulturminnesok': {
            color: '#436978',
            circle: false,
            thumbnail: false
        },
        'DigitaltMuseum': {
            color: '#436978',
            circle: false,
            thumbnail: false
        },
        'Musit': {
            color: '#436978',
            circle: false,
            thumbnail: false
        },
        'Artsdatabanken': {
            color: '#5B396B',
            thumbnail: false,
            circle: true
        }
    };

    ns.getDatasetStyle = function (name) {
        return ns.datasets[mappings[name]];
    };

    ns.setDatasetStyle = function (name, style) {
        if (_.has(mappings, name)) {
            mappings[name] = name;
        }
        ns.datasets[mappings[name]] = _.extend({}, DEFAULT_STYLE, style);
    };

    ns.providerColors = {
        'default': {name: 'blue', hex: '#38A9DC'},
        'Artsdatabanken': {name: 'darkpurple', hex: '#5B396B'},
        'Digitalt fortalt': {name: 'orange', hex: '#F69730'},
        'DigitaltMuseum': {name: 'cadetblue', hex: '#436978'},
        'Industrimuseum': {name: 'darkred', hex: '#A23336'},
        'MUSIT': {name: 'cadetblue', hex: '#436978'},
        'Kulturminnesøk': {name: 'green', hex: '#72B026'},
        'Naturbase': {name: 'purple', hex: '#D252B9'},
        'Sentralt stedsnavnregister': {name: 'darkgreen', hex: '#728224'},
        'fangstlokaliteter': {name: 'cadetblue', hex: '#436978'},
        'Trondheim byarkiv': {name: 'darkred', hex: '#A23336'}
    };

    var colors = {
        '#F69730': 'orange',
        '#38A9DC': 'blue',
        '#A23336': 'darkred',
        '#72B026': 'green',
        '#436978': 'cadetblue',
        '#5B396B': 'darkpurple'
    };

    function hexToName(hex) {
        return colors[hex] || 'blue';
    }

    function getConfig(feature) {
        var config;
        if (feature.properties && feature.properties.datasetId) {
            config = ns.datasets[mappings[feature.properties.datasetId]];
        }
        if (!config) {
            console.error("dataset not defined!", feature);
            return;
        }
        return config;
    }

    function getCircleOptions(color) {
        return {
            radius: 9,
            weight: 1,
            opacity: 1,
            color: color,
            fillOpacity: 0.4
        };
    }

    function getCircle(latlng, color) {
        return L.circleMarker(latlng, getCircleOptions(color));
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

        return L.divIcon({
            html: '<div class="single" style="' + KR.Util.createStyleString(styleDict) + '"></div>​',
            className: 'leaflet-marker-photo',
            iconSize: [50, 50]
        });
    }

    function getClusterThumbnailIcon(features, color, selected) {
        var photos = _.filter(features, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (!photos) {
            return;
        }

        var rotations = ['rotation1', 'rotation2', 'rotation3'];
        var template = _.template('<div class="inner <%= rotation %><% if (first) {print(" first")}%>" style="<%= style %>"></div>');
        var html = _.map(photos.slice(0, 3), function (photo, idx) {
            var rotation = rotations[idx % rotations.length];

            var styleDict = {
                'border-color': color,
                'background-image': 'url(' + photo.feature.properties.thumbnail + ');'
            };

            if (selected) {
                styleDict['border-width'] = '3px';
            }

            return template({
                style: KR.Util.createStyleString(styleDict),
                rotation: rotation,
                first: idx === 0
            });
        }).join('');

        return new L.DivIcon({
            className: 'leaflet-marker-photo',
            html: '<div class="outer">​' + html + '</div><b>' + features.length + '</b>',
            iconSize: [50, 50]
        });
    }

    function getClusterIcon(features, color) {
        var rgbaColor = KR.Util.hexToRgba(color, 0.4);
        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: '<div class="outer">​<div class="circle" style="background-color: ' + rgbaColor + ';border-color:' + color + ';"></div></div><b>' + features.length + '</b>',
            iconSize: [20, 20]
        });
    }


    ns.getClusterIcon = function (cluster, selected) {

        var features = cluster.getAllChildMarkers();

        var config = getConfig(features[0].feature);

        var color = selected ? SELECTED_COLOR : config.color;

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
        var color = selected ? SELECTED_COLOR : config.color;
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, color, selected);
            if (thumbnail) {
                return thumbnail;
            }
        }
        if (config.circle) {
            return getCircleOptions(color);
        }
        return createAwesomeMarker(color);
    };

    ns.getMarker = function (feature, latlng) {
        var config = getConfig(feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, config.color, false);
            if (thumbnail) {
                return createMarker(feature, latlng, thumbnail);
            }
        }
        if (config.circle) {
            return getCircle(latlng, config.color);
        }
        return createMarker(feature, latlng, ns.getIcon(feature, false));
    };

    ns.colorForFeature = function (feature, hex) {
        var config = getConfig(feature);
        if (config) {
            if (hex) {
                return config.color;
            }
            return hexToName(config.color);
        }
    };

}(KR.Style));
