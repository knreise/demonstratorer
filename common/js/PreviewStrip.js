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
            return (strip.find('.panel').last().offset().top > 2 * strip.height());
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
                swipe: function () {}
            })
            .off('swipeLeft')
            .on('swipeLeft', _moveRight)
            .off('swipeRight')
            .on('swipeRight', _moveLeft);

        strip.find('.js-close').on('click', function () {
            strip.addClass('hidden');
        });

        return {
            redraw: redraw
        };
    };


    ns.PreviewStrip = function (element, map, api, datasets, showFeature) {

        var doReload = true;

        var panToMarker = false;

        var position;

        var datasetLoader = new KR.DatasetLoader(api, map, {showFeature: showFeature});

        var spinner = $('#spinner_template').html();

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

        map.on('movestart', _moveStart);

        map.on('moveend', _moveEnd);

        function _dataReloaded() {

            var features = _.flatten(_.map(layers, function (layer) {
                return _.map(layer.getLayers(), function (l) {
                    l.dataset = layer.options.dataset;
                    return l;
                });
            }));

            if (position) {
                features = _.map(features, function (feature) {
                    feature.feature.properties.distance = feature.getLatLng().distanceTo(position);
                    return feature;
                });
                features = features.sort(function (a, b) {
                    if (a.feature.properties.distance < b.feature.properties.distance) {
                        return -1;
                    }
                    if (a.feature.properties.distance > b.feature.properties.distance) {
                        return 1;
                    }
                    return 0;
                });
            }

            var panels = _.map(features, function (feature) {

                feature.on('click', function () {
                    panToMarker = true;
                    map.panTo(feature.getLatLng());
                });

                if (feature.dataset.panelMap) {
                    feature.feature.properties = feature.dataset.panelMap(feature.feature.properties);
                }

                feature.feature.properties.icon = KR.Util.iconForContentType(feature.feature);
                feature.feature.properties.distance = _formatDistance(feature.feature.properties.distance) || null;
                var el = $(panelTemplate(feature.feature.properties));
                el.on('click', function () {
                    feature.fire('click');
                });
                return el;
            });

            element.find('.strip-container').html(panels);
            element.removeClass('hidden');
            panel.redraw();
        }

        function _moveStart() {
            if (!doReload || panToMarker) {
                return;
            }

            _.each(layers, function (layer) {
                layer.clearLayers();
            });
            element.find('.strip-container').html(spinner);
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
            _hideDatasets();
            layers = datasetLoader.loadDatasets(datasets);
            datasetLoader.reload(true, _dataReloaded);
        }

        return {
            init: init,
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