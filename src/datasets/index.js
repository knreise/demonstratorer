import * as _ from 'underscore';

import getDatasetList from './datasetList';

export default function getDatasets(ids) {
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