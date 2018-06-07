export default function ApiLoader(api, flattenedDatasets) {
    return function (datasetId, requestedBbox, callback) {
        var dataset = flattenedDatasets[datasetId];
        try {
            if (dataset.bbox || (dataset.isStatic && dataset.fixedBbox)) {
                var bbox = (!!dataset.fixedBbox) ? dataset.fixedBbox : requestedBbox;
                api.getBbox(
                    dataset.dataset,
                    bbox,
                    function (data) {
                        callback(null, data);
                    },
                    function (error) {
                        callback(error, null);
                    }
                );
            } else {
                api.getData(
                    dataset.dataset,
                    function (data) {
                        callback(null, data);
                    },
                    function (error) {
                        callback(error, null);
                    }
                );
            }
        } catch (error) {
            callback(error, null);
        }
    };
}