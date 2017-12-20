import * as _ from 'underscore';

import getDatasetList from './datasetList';

export function getDataset(id) {
    var datasetList = getDatasetList();
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

    var datasetList = getDatasetList();
    return _.chain(ids)
        .map(function (dataset) {
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