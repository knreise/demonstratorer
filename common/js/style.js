/*global L:false */

var KR = this.KR || {};

KR.Style = {};

(function (ns) {
    'use strict';

    //name: 'orange', hex: 

    ns.datasets = {
        'Digitalt fortalt': {
            color: '#F69730',
            circle: false,
            thumbnail: true
        }
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
        '#F69730': 'orange'
    };

    function hexToName(hex) {
        return colors[hex] || 'blue';
    }

    function getConfig(feature) {
        var config;
        if (feature.properties && feature.properties.dataset) {
            config = ns.datasets[feature.properties.dataset];
        }
        if (!config) {
            console.error("dataset not defined!");
            return;
        }
        return config;
    }

    function getCircle(latlng, color) {
        return L.circleMarker(latlng, {
            radius: 9,
            weight: 1,
            opacity: 1,
            color: color,
            fillOpacity: 0.4
        });
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

    function getThumbnail(feature, latlng, color) {
        if (!feature.properties || !feature.properties.thumbnail) {
            return;
        }

        var styleDict = {
            'border-color': color,
            'background-image': 'url(' + feature.properties.thumbnail + ')'
        };
        /*
        if (selected) {
            styleDict['border-width'] = '3px';
            styleDict['border-color'] = '#38A9DC';
        }
        */

        return L.divIcon({
            html: '<div class="single" style="' + KR.Util.createStyleString(styleDict) + '"></div>​',
            className: 'leaflet-marker-photo',
            iconSize: [50, 50]
        });
    }

    function getClusterThumbnailIcon(features, color) {
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
            /*
            if (selected) {
                styleDict['border-width'] = '3px';
                styleDict['border-color'] = '#38A9DC';
            }
            */
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


    ns.getClusterIcon = function (cluster) {

        var features = cluster.getAllChildMarkers();

        var config = getConfig(features[0].feature);

        if (config.thumbnail) {
            var thumbnail = getClusterThumbnailIcon(features, config.color);
            if (thumbnail) {
                return thumbnail;
            }
        }
        return getClusterIcon(features, config.color);
    };

    ns.getIcon = function (feature, selected) {
        var config = getConfig(feature);
        var color = (selected) ? '#ff0000' : config.color;
        return createAwesomeMarker(color);
    }

    ns.getMarker = function (feature, latlng) {
        var config = getConfig(feature);
        if (config.thumbnail) {
            var thumbnail = getThumbnail(feature, latlng, config.color);
            if (thumbnail) {
                return createMarker(feature, latlng, thumbnail);
            }
        }
        if (config.circle) {
            return getCircle(latlng, config.color);
        }
        return createMarker(feature, latlng, ns.getIcon(feature, false));
    };

}(KR.Style));
