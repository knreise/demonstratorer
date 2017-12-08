import L from 'leaflet';

import './L.Knreise.icon';
import {getImageCache} from '../../util';

export default function getMarker(feature, latlng, styleFunc, selected) {

    var title;
    if (feature.properties && feature.properties.title) {
        title = feature.properties.title;
    }

    if (styleFunc.isThumbnail && feature.properties && feature.properties.thumbnail) {
        var color = styleFunc.get('fillcolor', feature, selected);
        var thumbnail = getImageCache(feature.properties.thumbnail, 50, 50);

        var html = '<div class="outer">' +
            '<div class="circle" style="background-image: url(\'' + thumbnail + '\');border-color:' + color + ';"></div>' +
            '</div>';

        return L.marker(latlng, {
            icon: new L.DivIcon({
                className: 'leaflet-marker-circle',
                html: html,
                iconSize: [50, 50],
                iconAnchor: [25, 25]
            }),
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
        icon: L.Knreise.icon({
            markerColor: styleFunc.get('fillcolor', feature, selected)
        }),
        title: title,
        clickable: styleFunc.get('clickable', feature, selected)
    });

}