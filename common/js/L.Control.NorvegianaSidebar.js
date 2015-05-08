/*global L:false, KR: false, audiojs:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        this._template = options.template;
        this.on('hide', this._removeContent, this);
        return L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
    },

    showFeature: function (feature, template, getData, showList) {

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
        var content = template(_.extend({image: null}, feature.properties));

        if (showList) {
            L.DomEvent.off(this._closeButton, 'click', this.hide, this);
            L.DomEvent.on(this._closeButton, 'click', function (e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.on(this._closeButton, 'click', this.hide, this);
                showList();
            }, this);
        }

        this.setContent(content);

        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        this.show();
    },

    showFeatures: function (features, template, getData) {
        var list = $('<div class="list-group"></ul>');
        var elements = _.map(features, function (feature) {

            var icon = KR.Util.iconForFeature(feature);
            var li = $(this.options.listElementTemplate({
                title: feature.properties.title,
                icon: icon
            }));
            li.on('click', _.bind(function (e) {
                e.preventDefault();
                this.showFeature(feature, template, getData, _.bind(function () {
                    console.log("show list");
                    this.showFeatures(features, template, getData);
                }, this));
                return false;
            }, this));
            return li;
        }, this);

        list.append(elements);
        $(this.getContainer()).html(list);
        this.show();
    },

    _removeContent: function () {
        $(this.getContainer()).html('');
    }
});

L.control.norvegianaSidebar = function (placeholder, options) {
    return new L.Control.NorvegianaSidebar(placeholder, options);
};