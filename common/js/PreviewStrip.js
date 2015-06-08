var KR = this.KR || {};

(function (ns) {
    'use strict';

    var Panel = function (strip) {
        var leftBtn = strip.find('.js-left');
        var rightBtn = strip.find('.js-right');

        function _checkLeft() {
            if (strip.find('.panel.hidden').length > 0) {
                leftBtn.removeClass('hidden');
            } else {
                leftBtn.addClass('hidden');
            }
        }

        function _moreRight() {
            return ((strip.find('.panel').last().offset().top - strip.offset().top) > 10);
        }

        function _checkRight() {
            if (!_moreRight()) {
                rightBtn.addClass('hidden');
            } else {
                rightBtn.removeClass('hidden');
            }
        }

        function redraw() {
            _checkLeft();
            _checkRight();
        }

        function _moveRight() {
            if (_moreRight()) {
                strip.find('.panel').not('.hidden').first().addClass('hidden');
            }
            redraw();
        }

        function _moveLeft() {
            strip.find('.panel.hidden').last().removeClass('hidden');
            redraw();
        }

        function _setupToggle() {
            _checkLeft();

            rightBtn.on('click', _moveRight);
            leftBtn.on('click', _moveLeft);
        }

        _setupToggle();

        strip.swipe({
            swipe: function (e, direction) {
                if (direction === 'left') {
                    _moveRight();
                }
                if (direction === 'right') {
                    _moveLeft();
                }
            }
        });

        strip.find('.js-close').on('click', function () {
            strip.addClass('hidden');
        });

        return {
            redraw: redraw
        };
    };


    ns.PreviewStrip = function (element, map, api, datasets, showFeature, options) {

        options = _.extend({minimal: false}, options || {});

        var doReload = true;

        var panToMarker = false;

        var position;

        var datasetLoader = new KR.DatasetLoader(api, map, {showFeature: showFeature});

        var spinner = _.template($('#spinner_template').html());

        var panelTemplate = _.template($('#panel_template').html());

        var layers = [];

        var panel = new Panel(element);

        function _hideDatasets() {
            _.each(datasets, function (dataset) {
                dataset.visible = false;
            });
        }

        function _formatDistance(meters) {
            var km = meters / 1000;
            return Math.round(km * 10) / 10;
        }

        function renderFeature(feature) {
            feature.on('click', function () {
                panToMarker = true;
                map.panTo(feature.getLatLng());
            });

            if (feature.dataset.panelMap) {
                feature.feature.properties = feature.dataset.panelMap(feature.feature.properties);
            }

            feature.feature.properties.icon = KR.Util.iconForContentType(feature.feature);
            feature.feature.properties.distance = _formatDistance(feature.feature.properties.distance) || null;
            var data = feature.feature.properties;
            data.minimal = options.minimal;
            var el = $(panelTemplate(data));
            el.on('click', function () {
                feature.fire('click');
            });
            return el;
        }

        function sortFeatures(features) {
            features = _.map(features, function (feature) {
                feature.feature.properties.distance = feature.getLatLng().distanceTo(position);
                return feature;
            });
            return features.sort(function (a, b) {
                if (a.feature.properties.distance < b.feature.properties.distance) {
                    return -1;
                }
                if (a.feature.properties.distance > b.feature.properties.distance) {
                    return 1;
                }
                return 0;
            });
        }

        function showFeatures(features) {
            if (position) {
                features = sortFeatures(features);
            }

            var panels = _.map(features, renderFeature);

            element.find('.strip-container').html(panels);
            element.removeClass('hidden');
            panel.redraw();
        }

        function _dataReloaded() {

            var features = _.flatten(_.map(layers, function (layer) {
                return _.map(layer.getLayers(), function (l) {
                    l.dataset = layer.options.dataset;
                    return l;
                });
            }));

            showFeatures(features);
        }

        function _moveStart() {
            if (!doReload || panToMarker) {
                return;
            }
            _.each(layers, function (layer) {
                layer.clearLayers();
            });
            element.find('.strip-container').html(spinner({
                size: options.minimal ? '3x' : '5x'
            }));
        }

        function _moveEnd() {
            if (!doReload || panToMarker) {
                panToMarker = false;
                return;
            }
            datasetLoader.reload(true, _dataReloaded);
        }

        function setPosition(pos) {
            position = pos;
        }

        function init() {
            if (options.minimal) {
                element.addClass('minimal');
            }
            console.log();

            _hideDatasets();
            layers = datasetLoader.loadDatasets(datasets);
            datasetLoader.reload(true, _dataReloaded);
        }

        map.on('movestart', _moveStart);

        map.on('moveend', _moveEnd);

        return {
            init: init,
            showFeatures: showFeatures,
            setPosition: setPosition,
            off: function () {
                doReload = false;
            },
            on: function () {
                doReload = true;
            }
        };
    };

}(KR));