import L from 'leaflet';
import * as _ from 'underscore';

import '../../css/Leaflet.Photo.css';
import './L.Knreise.icon';
import {getImageCache, hexToRgba} from '../../util';




var icons = {
    marker: function (feature, styleFunc, selected) {
        return L.Knreise.icon({
            size: styleFunc.get('size', feature, selected),
            borderWidth: styleFunc.get('borderWidth', feature, selected),
            borderColor: styleFunc.get('bordercolor', feature, selected),
            markerColor: styleFunc.get('fillcolor', feature, selected)
        });
    },
    triangle: function (feature, styleFunc, selected) {

        var style = createStyleString({
            'fill': styleFunc.get('fillcolor', feature, selected),
            'stroke': styleFunc.get('bordercolor', feature, selected),
            'stroke-width': styleFunc.get('weight', feature, selected),
        });

        return L.divIcon({
            className: '',
            html: '<svg width="' + styleFunc.get('size', feature, selected) + 'px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="0,0 64,0 32,64" style="' + style + '" /></svg>'
        });
    }
};


function getIcon(feature, styleFunc, selected) {
    if (styleFunc.isThumbnail && feature.properties && feature.properties.thumbnail) {
        var color = styleFunc.get('bordercolor', feature, selected);
        var borderWidth = styleFunc.get('borderWidth', feature, selected);
        var thumbnail = getImageCache(feature.properties.thumbnail, 50, 50);

        var styleDict = {
            'border-color': color,
            'border-width': borderWidth,
            'background-image': 'url(\'' + thumbnail + '\');'
        };
        var styleString = createStyleString(styleDict);

        var html = '<div class="outer">' +
            '<div class="circle" style="' + styleString + '"></div>' +
            '</div>';

        return new L.DivIcon({
            className: 'leaflet-marker-circle',
            html: html,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }

    var iconFunc = (!!icons[styleFunc.icon])
        ? icons[styleFunc.icon]
        : icons['marker'];

    return iconFunc(feature, styleFunc, selected);
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
        console.log('circle', styleFunc.get('radius', feature, selected), styleFunc.get('weight', feature, selected))
        return L.circleMarker(latlng, {
            radius: styleFunc.get('radius', feature, selected),
            weight: styleFunc.get('weight', feature, selected),
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

function _getClusterThumbnail(images, markers, styleFunc, selected) {

    var thumbnail = getImageCache(images[0], 50, 50);
    var color = styleFunc.get('bordercolor', markers[0].feature, selected);
    var borderWidth = styleFunc.get('borderWidth', markers[0].feature, selected);

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

    var styleString = createStyleString(styleDict);

    var html = '<div class="outer">' +
        '<div class="circle" style="' + styleString + '"></div>' +
        '</div>' +
        '<b>' + markers.length + '</b>';

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
        return _getClusterThumbnail(images, markers, styleFunc, selected);
    }

    var fillcolor = styleFunc.get('fillcolor', markers[0].feature, selected);
    var bordercolor = styleFunc.get('bordercolor', markers[0].feature, selected);
    var borderWidth = styleFunc.get('borderWidth', markers[0].feature, selected);

    var styleString = createStyleString({
        'background-color': hexToRgba(fillcolor, 0.4),
        'border-color': bordercolor,
        'border-width': borderWidth
    });

    return new L.DivIcon({
        className: 'leaflet-marker-circle',
        html: '<div class="outer"><div class="circle" style="' + styleString + '"></div></div><b>' + markers.length + '</b>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function getLeafletStyleFunction(styleFunc, selected) {
    return function (feature) {
        var style = {
            fillColor: styleFunc.get('fillcolor', feature, selected),
            color: styleFunc.get('bordercolor', feature, selected),
            fillOpacity: styleFunc.get('fillOpacity', feature, selected),
            clickable: styleFunc.get('clickable', feature, selected),
            weight: styleFunc.get('weight', feature, selected)
        };
        return style;
    };
}


export {getIcon, getMarker, getClusterIcon, getLeafletStyleFunction};