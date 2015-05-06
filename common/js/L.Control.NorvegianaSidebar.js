/*global L:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        this._template = options.template;
        return L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
    },

    showFeature: function (feature, template, getData) {

        if (getData) {
            var self = this;
            getData(feature, function (feature) {
                self.showFeature(feature, template);
            });
            return;
        }

        template = template || this._template;
        var img = feature.properties.images;
        if (_.isArray(img)) {
            img = img[0];
        }
        this.setContent(template(_.extend({image: null}, feature.properties)));
        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        this.show();
    },

    showFeatures: function (features, template) {
        var list = $('<div class="list-group"></ul>');
        var elements = _.map(features, function (feature) {

            var icon = KR.Util.iconForFeature(feature);
            var li = $(this.options.listElementTemplate({
                title: feature.properties.title,
                icon: icon
            }));
            li.on('click', _.bind(function (e) {
                e.preventDefault();
                this.showFeature(feature, template);
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