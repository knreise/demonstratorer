import * as _ from 'underscore';

import datasetList from './datasetList';

export function getDataset(id) {
    if (!_.has(datasetList, id)) {
        console.error('missing datasetId: ', id);
        return null;
    }
    return datasetList[id];
}

function createFilterList(string) {
    return _.map(string.split(','), function (s) {
        return `'${s.trim()}'`;
    }).join(', ');
};

var QUERY_GENERATORS = {
    norvegiana: function (filter) {
        if (filter.type === 'emneord') {
            return 'dc_subject_text:' + filter.query;
        }
    },
    kulturminne: function (filter) {
        if (filter.type === 'Lokalitetskategori') {
            return `LokalitetskategoriID IN (${createFilterList(filter.query)})`;

        }
        if (filter.type === 'Lokalitetsart') {
            return `LokalitetsartID IN (${createFilterList(filter.query)})`;
        }
    }
};

function createQuery(dataset, filter) {
    var filters = _.map(filter.split(':'), function (filter) {
        var s = filter.split(';');
        var filterIdx = parseInt(s[0], 10);
        var query = s[1];
        return {
            type: dataset.filterOptions.filterVariables[filterIdx],
            query: query
        };
    });

    if (!_.has(QUERY_GENERATORS, dataset.filterOptions.filterType)) {
        return null;
    }
    var generator = QUERY_GENERATORS[dataset.filterOptions.filterType];

    var q = _.map(filters, generator).join(' AND ');
    return q;
}

export function getDatasets(ids) {

    if (_.isString(ids)) {
        ids = ids.split(',');
    }
    return _.chain(ids)
        .map(function (id) {
            return {
                id: id.split(':')[0],
                filter: (id.indexOf(':') > -1) ? id.substring(id.indexOf(':') + 1) : null
            };
        })
        .filter(function (dataset) {
            //remove unknown datasets
            return _.has(datasetList, dataset.id);
        })
        .map(function (dataset) {
            var datasetConfig = datasetList[dataset.id];
            if (dataset.filter && datasetConfig.filterOptions) {
                datasetConfig.dataset.query = createQuery(datasetConfig, dataset.filter);
            }
            return datasetConfig;
        })
        .value();
}