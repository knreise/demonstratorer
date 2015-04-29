/*global L:false */
'use strict';

L.NorvegianaGeoJSON = L.GeoJSON.extend({

    initialize: function (sidebar, pointToLayer, options) {
        options = options || {};
        options =  L.extend(
            options,
            {
                pointToLayer: pointToLayer,
                onEachFeature: _.bind(this._onEachFeature, this)
            }
        );
        this._sidebar = sidebar;
        return L.GeoJSON.prototype.initialize.call(this, null, options);
    },

    _onEachFeature: function (feature, layer) {
        var img = feature.properties.delving_thumbnail;
        if (_.isArray(img)) {
            img = img[0];
        }

        layer.on('click', _.bind(this._featureClick, this));
    },

    _featureClick: function (e) {
        this._sidebar.showFeature(e.target.feature);
    }
});

L.norvegianaGeoJSON = function (sidebar, pointToLayer, options) {
    return new L.NorvegianaGeoJSON(sidebar, pointToLayer, options);
};
