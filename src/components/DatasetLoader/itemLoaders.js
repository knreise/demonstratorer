export default {
    norvegiana_verneomr: function (api, feature, callback, errorCallback) {
        api.getItem(
            {api: 'norvegiana', id: 'kulturnett_Naturbase_' + feature.properties.iid},
            callback,
            errorCallback
        );
    }
};