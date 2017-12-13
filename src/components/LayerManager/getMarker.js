import L from 'leaflet';
import * as _ from 'underscore';

import '../../css/Leaflet.Photo.css';
import './L.Knreise.icon';
import {getImageCache, hexToRgba} from '../../util';

function getIcon(feature, styleFunc, selected) {
    if (styleFunc.isThumbnail && feature.properties && feature.properties.thumbnail) {
        var color = styleFunc.get('fillcolor', feature, selected);
        var thumbnail = getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(\'' + thumbnail + '\');border-color:' + color + ';"></div>' +
            '</div>';

        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: html,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }
    return L.Knreise.icon({
        markerColor: styleFunc.get('fillcolor', feature, selected)
    });
}

function getMarker(feature, latlng, styleFunc, selected) {

    var title;
    if (feature.properties && feature.properties.title) {
        title = feature.properties.title;
    }

    if (styleFunc.isThumbnail && feature.properties && feature.properties.thumbnail) {

        return L.marker(latlng, {
            icon: getIcon(feature, styleFunc, selected),
            title: title,
            clickable: styleFunc.get('clickable', feature, selected)
        });
    }

    if (styleFunc.isCircle) {
        return L.circleMarker(latlng, {
            radius: styleFunc.get('radius', feature, selected),
            weight: 1,
            opacity: 1,
            color: styleFunc.get('bordercolor', feature, selected),
            fillColor: styleFunc.get('fillcolor', feature, selected),
            fillOpacity: 0.4,
            title: title,
            clickable: styleFunc.get('clickable', feature, selected)
        });
    }

    return L.marker(latlng, {
        icon: getIcon(feature, styleFunc, selected),
        title: title,
        clickable: styleFunc.get('clickable', feature, selected)
    });
}

function createStyleString(styleDict) {
    return _.map(styleDict, function (value, key) {
        return key + ': ' + value;
    }).join(';');
}

function _getClusterThumbnail(images, numMarkers, color, borderWidth) {

        var thumbnail = getImageCache(images[0], 50, 50);

        var styleDict = {
            'border-color': color,
            'border-width': borderWidth,
            'background-image': 'url(\'' + thumbnail + '\');'
        };
        if (images.length > 1) {
            styleDict['box-shadow'] = _.map(_.rest(images), function (c, index) {
                var width = (index + 1) * 2;
                return '0 0 0 ' + width + 'px ' + c;
            }).join(',') + ';';
        }

        var html = '<div class="outer">' +
            '<div class="circle" style="' + createStyleString(styleDict) + '"></div>' +
            '</div>' +
            '<b>' + numMarkers + '</b>';

        return new L.DivIcon({
            className: 'leaflet-marker-photo',
            html: html,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
        });
}


function getClusterIcon(cluster, styleFunc, selected) {
    var markers = cluster.getAllChildMarkers();

    var images = _.chain(markers)
            .filter(function (marker) {
                return !!marker.feature.properties.thumbnail;
            })
            .map(function (marker) {
                return marker.feature.properties.thumbnail;
            })
            .value();

    if (styleFunc.isThumbnail && images.length) {

        return _getClusterThumbnail(
            images,
            markers.length,
            styleFunc.get('bordercolor', markers[0].feature, selected),
            styleFunc.get('borderWidth', markers[0].feature, selected)
        );
    }
    var fillcolor = styleFunc.get('fillcolor', markers[0].feature, selected);
    var bordercolor = styleFunc.get('bordercolor', markers[0].feature, selected);
    return new L.DivIcon({
        className: 'leaflet-marker-circle',
        html: '<div class="outer"><div class="circle" style="background-color: ' + hexToRgba(fillcolor, 0.4) + ';border-color:' + bordercolor + ';"></div></div><b>' + markers.length + '</b>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function getLeafletStyleFunction(styleFunc, selected) {
    return function (feature) {
        return {
            fillColor: styleFunc.get('fillcolor', feature, selected),
            color: styleFunc.get('bordercolor', feature, selected),
            weight: styleFunc.get('weight', feature, selected),
            fillOpacity: styleFunc.get('fillOpacity', feature, selected),
            clickable: styleFunc.get('clickable', feature, selected),
        };
    };
}


export {getIcon, getMarker, getClusterIcon, getLeafletStyleFunction};