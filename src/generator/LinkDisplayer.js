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

function createFilterString(selectedDataset, dataset) {
    return _.map(selectedDataset.filters, function (value, key) {
        var index = dataset.filterOptions.filterVariables.indexOf(key);
        return `${index};${value}`;
    }).join(':');

}

function createDatasetParams(datasets) {
    return _.map(datasets, function (dataset) {
        return 'datasets=' + encodeURIComponent(dataset);
    }).join('&');
}

function getLink(config, datasets) {
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

    var datasets = _.map(config.datasets, function (selectedDataset) {
        var dataset = datasets[selectedDataset.id];

        if (dataset.filterOptions && selectedDataset.filters) {
            return `${selectedDataset.id}:${createFilterString(selectedDataset, dataset)}`;
        }
        return selectedDataset.id;
    });

    //params['datasets'] = datasets.join(',');

    var paramString = createQueryParameterString(params);
    paramString += `&${createDatasetParams(datasets)}`;
    return `${location.protocol}//${location.host}${path}?${paramString}`;
}


export default function LinkDisplayer(props) {

    var link = getLink(props.config, props.datasets);
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