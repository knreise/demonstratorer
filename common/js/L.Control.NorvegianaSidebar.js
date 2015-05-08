/*global L:false, KR: false, audiojs:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        this._template = options.template;
        this.on('hide', this._removeContent, this);
        return L.Control.Sidebar.prototype.initialize.call(this, placeholder, options);
    },

    showFeature: function (feature, template, getData, callbacks) {

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

        if (callbacks && callbacks.close) {
            L.DomEvent.off(this._closeButton, 'click', this.hide, this);
            L.DomEvent.on(this._closeButton, 'click', function (e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.on(this._closeButton, 'click', this.hide, this);
                callbacks.close();
            }, this);
        }
        this.setContent(content);

        if (callbacks && callbacks.prev) {
            //content += '<a href="#">prev</a>';
            var prev = L.DomUtil.create('a', '', this.getContainer());
            prev.innerHTML = 'prev';
            L.DomEvent.on(prev, 'click', callbacks.prev);

        }
        if (callbacks && callbacks.next) {
            var next = L.DomUtil.create('a', '', this.getContainer());
            next.innerHTML = 'next';
            L.DomEvent.on(next, 'click', callbacks.next);
        }

        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        this.show();
    },

    _createListCallbacks: function (feature, index, template, getData, features) {
        var prev;
        if (index > 0) {
            prev = _.bind(function (e) {
                e.preventDefault();
                index = index - 1;
                feature = features[index];
                var callbacks = this._createListCallbacks(feature, index, template, getData, features);
                this.showFeature(feature, template, getData, callbacks);
            }, this);
        }
        var next;
        if (index < features.length - 1) {
            next = _.bind(function (e) {
                e.preventDefault();
                index = index + 1;
                feature = features[index];
                var callbacks = this._createListCallbacks(feature, index, template, getData, features);
                this.showFeature(feature, template, getData, callbacks);
            }, this);
        }

        return {
            prev: prev,
            close: _.bind(function () {
                this.showFeatures(features, template, getData);
            }, this),
            next: next
        };
    },

    _createListElement: function (feature, index, template, getData, features) {
        var icon = KR.Util.iconForFeature(feature);
        var li = $(this.options.listElementTemplate({
            title: feature.properties.title,
            icon: icon
        }));

        li.on('click', _.bind(function (e) {
            e.preventDefault();
            var callbacks = this._createListCallbacks(feature, index, template, getData, features);

            this.showFeature(feature, template, getData, callbacks);
            return false;
        }, this));
        return li;
    },

    showFeatures: function (features, template, getData) {
        var list = $('<div class="list-group"></ul>');
        var elements = _.map(features, function (feature, index) {
            return this._createListElement(feature, index, template, getData, features);
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