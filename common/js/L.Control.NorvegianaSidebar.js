/*global L:false, KR: false, audiojs:false */
'use strict';

L.Control.NorvegianaSidebar = L.Control.Sidebar.extend({

    initialize: function (placeholder, options) {
        L.setOptions(this, options);

        this._template = options.template;
        // Find content container
        var content =  L.DomUtil.get(placeholder);

        // Remove the content container from its original parent
        content.parentNode.removeChild(content);

        this._contentContainer = L.DomUtil.create('div', 'sidebar-content', content);

        this.on('hide', this._removeContent, this);

        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container =
            L.DomUtil.create('div', l + 'sidebar ' + this.options.position);

        // Style and attach content container
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = this._closeButton =
                L.DomUtil.create('a', 'close', container);
            close.innerHTML = '&times;';
        }
    },

    _setupSwipe: function (callbacks) {
        if (!callbacks) {
            return;
        }
        $(this.getContainer())
            .swipe({
                swipe: function () {}
            })
            .off('swipeLeft')
            .on('swipeLeft', function () {
                if (callbacks.next) {
                    callbacks.next();
                }
            })
            .off('swipeRight')
            .on('swipeRight', function () {
                if (callbacks.prev) {
                    callbacks.prev();
                }
            });
    },

    showFeature: function (feature, template, getData, callbacks) {
        if (getData) {
            this.setContent('');
            var self = this;
            getData(feature, function (feature) {
                self.showFeature(feature, template);
            });
            return;
        }
        template = template || feature.template || KR.Util.templateForDataset(feature.properties.dataset) || this._template;
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
        this._setupSwipe(callbacks);

        if (callbacks && callbacks.prev) {
            var prev = L.DomUtil.create('a', 'prev', this.getContainer());
            prev.innerHTML = '&#8678;';
            L.DomEvent.on(prev, 'click', callbacks.prev);

        }
        if (callbacks && callbacks.next) {
            var next = L.DomUtil.create('a', 'next', this.getContainer());
            next.innerHTML = '&#8680;';
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
                if (e) {
                    e.preventDefault();
                }
                index = index - 1;
                feature = features[index];
                var callbacks = this._createListCallbacks(feature, index, template, getData, features);
                this.showFeature(feature, template, getData, callbacks);
            }, this);
        }
        var next;
        if (index < features.length - 1) {
            next = _.bind(function (e) {
                if (e) {
                    e.preventDefault();
                }
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