/*global L:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        this._template = options.template;
        return L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
    },

    showFeature: function (feature) {
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
    },

    showFeatures: function (features) {
        var list = $('<div class="list-group"></ul>');
        var elements = _.map(features, function (feature) {
         
            var icon = Norvegiana.iconForFeature(feature);
            var li = $(this.options.listElementTemplate({
                title: feature.properties.dc_title,
                icon: icon
            }));
            li.on('click', _.bind(function (e) {
                e.preventDefault();
                this.showFeature(feature);
                return false;
            }, this));
            return li;
        }, this);

        list.append(elements);
        $(this.getContainer()).html(list);
        this.show();
    }
});

L.control.norvegianaSidebar = function (placeholder, options) {
    return new L.Control.NorvegianaSidebar(placeholder, options);
};