import * as _ from 'underscore';

import datasetList from './datasetList';

export function getDataset(id) {
    if (!_.has(datasetList, id)) {
        console.error('missing datasetId: ', id);
        return null;
    }
    return datasetList[id];
}

export function getDatasets(ids) {
    if (_.isString(ids)) {
        ids = ids.split(',');
    }

    return _.chain(ids)
        .map(function (datasetOrg) {
            var dataset = _.clone(datasetOrg);
            var query;
            if (dataset.indexOf(':') > -1) {
                var parts = dataset.split(':');
                dataset = parts[0];
                query = parts[1];
            }
            if (_.has(datasetList, dataset)) {
                var datasetConfig = datasetList[dataset];
                if (query && datasetConfig.dataset.api === 'norvegiana') {
                    datasetConfig.dataset.query = 'dc_subject_text:' + query;
                }
                return datasetConfig;
            }
            return null;
        })
        .compact()
        .value();
}