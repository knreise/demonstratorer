import * as _ from 'underscore';

import {STYLE_DEFAULTS, SELECTED_STYLE} from '../../config/style';

function evaluate(rule, feature) {
    if (!feature) {
        return rule['default'];
    }
    var value = feature.properties[rule.lookup];
    var match = _.find(rule.cases, function (instance) {
        return instance.values.indexOf(value) > -1;
    });
    if (match) {
        return match.value;
    }
    return rule['default'];
}

export default function Style(style) {

    var fallbacks = {
        bordercolor: 'fillcolor'
    };

    function get(type, feature, selected) {
        if (selected) {
            return getSelected(type, feature);
        }
        var value;
        if (_.has(style, type)) {
            value = style[type];
        } else if (_.has(fallbacks, type) && _.has(style, fallbacks[type])) {
            value = style[fallbacks[type]];
        } else {
            value = STYLE_DEFAULTS[type];
        }
        if (_.isFunction(value)) {
            return value(feature);
        }
        if (_.isObject(value)) {
            return evaluate(value, feature);
        }
        return value;
    }

    function getSelected(type, feature) {
        if (_.has(SELECTED_STYLE, type)) {
            return SELECTED_STYLE[type];
        }
        return get(type, feature, false);
    }

    return {
        get: get,
        getSelected: getSelected,
        isCircle: style.circle,
        isThumbnail: style.thumbnail
    };
}