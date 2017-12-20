import React from 'react';
import * as _ from 'underscore';

import {createQueryParameterString} from '../util';

function getAreaParams(areaConf) {
    if (_.isObject(areaConf.value) && !_.isArray(areaConf.value)) {
        return areaConf.value;
    }
    var params = {};
    params[areaConf.type] = _.isArray(areaConf.value)
        ? areaConf.value.join(',')
        : areaConf.value;
    return params;

}

function getLink(config) {
    var location = window.location;
    var path = location.pathname.replace('/generator.html', '/config.html');

    var params = {
        layer: config.maplayer,
        title: config.title || '',
        description: config.description || ''
    };

    if (!config.area.value || !config.datasets.length) {
        return null;
    }

    _.extend(params, getAreaParams(config.area));

    params['datasets'] = _.map(config.datasets, function (dataset) {
        if (dataset.topics) {
            return `${dataset.id}:${dataset.topics}`;
        }
        return dataset.id;
    }).join(',');

    return `${location.protocol}//${location.host}${path}?${createQueryParameterString(params)}`;
}


export default function LinkDisplayer(props) {

    var link = getLink(props.config);
    var linkTag;
    if (link) {
        linkTag = (
            <a href={link} target="_blank">{link}</a>
        );
    }
    return (
        <div className="well">
            <i className="fa fa-external-link-square"></i> <b>VIS KART:</b>
            <div className="map-link">
                {linkTag}
            </div>
        </div>
    );
}