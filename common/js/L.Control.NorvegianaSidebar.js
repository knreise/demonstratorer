/*global L:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        this._template = options.template;
        return L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
    },

    showFeature: function (feature) {
        console.log(feature);
        var img = feature.properties.delving_thumbnail;
        if (_.isArray(img)) {
            img = img[0];
        }
        this.setContent(this._template({
            title: feature.properties.dc_title,
            img: img,
            desc: feature.properties.dc_description,
            dataset: feature.properties.europeana_collectionTitle,
            link: feature.properties.europeana_isShownAt
        }));
        this.show();
    }
});

L.control.norvegianaSidebar = function (placeholder, options) {
    return new L.Control.NorvegianaSidebar(placeholder, options);
};