export default {
    norvegiana_verneomr: function (api, feature, callback, errorCallback) {
        api.getItem(
            {api: 'norvegiana', id: 'kulturnett_Naturbase_' + feature.properties.iid},
            callback,
            errorCallback
        );
    },
    jernbanemuseet: function (api, feature, callback, errorCallback) {
        api.getItem(
            {api: 'jernbanemuseet', id: feature.properties.id},
            callback,
            errorCallback
        );
    },
    jernbanemuseet_krig: function (api, feature, callback, errorCallback) {
        api.getItem(
            {api: 'jernbanemuseet', id: feature.properties.id, group: 264},
            callback,
            errorCallback
        );
    }
};