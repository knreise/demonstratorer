import $ from 'jquery';
import {getTemplate, round, distanceAndBearing} from '../../util';
import turfHelpers from '@turf/helpers';

export default function PositionDisplayer() {
    var map, div, feature, content;

    var template = getTemplate('user_position_template');

    function _distanceAndBearing(feature) {
        if (map && map.userPosition) {
            var pos = turfHelpers.point([
                map.userPosition.lng,
                map.userPosition.lat
            ]);
            var distBear = distanceAndBearing(pos, feature);
            var dist = distBear.distance;
            if (dist < 1000) {
                dist = round(dist, 0) + ' Meter';
            } else {
                dist = round(dist / 1000, 2) + ' Kilometer';
            }
            return {
                dist: dist,
                rot: distBear.bearing - 45 //-45 because of rotation of fa-location-arrow
            };
        }
    }


    function _showPosition() {
        if (div && map && map.userPosition && feature) {

            if (content) {
                content.remove();
            }

            var header = div.find('h3').eq(0);
            var distBear = _distanceAndBearing(feature);
            content = $(template({distanceBearing: distBear}));
            if (header.length) {
                header.after(content);
            } else {
                div.prepend(content);
            }
        }
    }

    function selectFeature(_feature, _div) {
        div = _div;
        feature = _feature;
        _showPosition();
    }

    return {
        setMap: function (_map) {
            map = _map;
            map.on('locationChange', _showPosition);
        },
        selectFeature: selectFeature
    };
}