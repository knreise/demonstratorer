var KR = this.KR || {};

(function (ns) {
    'use strict';

    /*
        A dataset preview strip as shown in the along line map
    */

    var Panel = function (strip, toggleCallback) {
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
            var panels = strip.find('.panel');
            if (panels.length) {
                return ((panels.last().offset().top - strip.offset().top) > 10);
            }
            return false;
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
            _toggleToggleBtn();
        }

        function _moveRight() {
            if (_moreRight()) {
                var visible = strip.find('.panel').not('.hidden');
                if (visible) {
                    visible.first().addClass('hidden');
                }
            }
            redraw();
        }

        function _moveLeft() {
            var hidden = strip.find('.panel.hidden');
            if (hidden) {
                hidden.last().removeClass('hidden');
            }
            redraw();
        }

        function _toggleToggleBtn() {
            var icon = strip.find('.js-toggle-size .glyphicon');
            if (strip.hasClass('minimal')) {
                icon.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            } else {
                icon.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }
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

        strip.find('.js-toggle-size').on('click', function () {
            strip.toggleClass('minimal');
            if (toggleCallback) {
                toggleCallback(strip.hasClass('minimal'));
            }
            _toggleToggleBtn();
        });

        return {
            redraw: redraw
        };
    };


    ns.PreviewStrip = function (element, map, api, datasets, showFeature, options) {

        options = _.extend({minimal: false, panOnClick: true}, options || {});

        var hasImages = !options.minimal;

        var loadedFeatures;

        var doReload = true;

        var panToMarker = false;

        var position;

        var datasetLoader;
        if (datasets) {
            datasetLoader = new KR.DatasetLoader(api, map, {showFeature: showFeature});
        }

        var spinner = _.template($('#spinner_template').html());

        var panelTemplate = _.template($('#panel_template').html());
        var layers = [];

        var panel;

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
            if (options.panOnClick) {
                feature.on('click', function () {
                    panToMarker = true;
                    map.panTo(feature.getLatLng());
                });
            }

            if (feature.dataset && feature.dataset.panelMap) {
                feature.feature.properties = feature.dataset.panelMap(feature.feature.properties);
            }

            var data = _.extend(
                {},
                feature.feature.properties,
                {
                    icon: KR.Util.iconForContentType(feature.feature),
                    distance: _formatDistance(feature.feature.properties.distance) || null,
                    minimal: options.minimal,
                    color: KR.Style.colorForFeature(feature.feature, true)
                }
            );

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

        function _showFeatures(features) {
            var panels = _.map(features, renderFeature);
            element.find('.strip-container').html(panels);
            element.removeClass('hidden');
            panel.redraw();
        }

        function showFeatures(features) {
            if (position) {
                features = sortFeatures(features);
            }
            loadedFeatures = features;
            _showFeatures(features);
            hasImages = false;
        }

        function showMessage(message) {
            element.find('.strip-container').html(
                '<span class="message">' + message + '</span>'
            );
        }

        panel = new Panel(element, function (isMinimal) {
            options.minimal = isMinimal;
            if (!isMinimal && !hasImages && loadedFeatures) {
                _showFeatures(loadedFeatures);
                hasImages = true;
            }
        });

        function _dataReloaded() {

            var features = _.flatten(_.map(layers, function (layer) {
                return _.map(layer.getLayers(), function (l) {
                    l.dataset = layer.options.dataset;
                    return l;
                });
            }));
            showFeatures(features);
        }

        function moveStart() {
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
            if (datasetLoader) {
                datasetLoader.reload(true, _dataReloaded);
            }
        }

        function setPosition(pos) {
            position = pos;
        }

        function init() {
            if (options.minimal) {
                element.addClass('minimal');
            }

            _hideDatasets();
            if (datasetLoader) {
                layers = datasetLoader.loadDatasets(datasets);
                datasetLoader.reload(true, _dataReloaded);
            }
        }

        if (datasetLoader) {
            map.on('movestart', moveStart);
            map.on('moveend', _moveEnd);
        }

        return {
            init: init,
            showFeatures: showFeatures,
            showMessage: showMessage,
            setPosition: setPosition,
            off: function () {
                doReload = false;
            },
            on: function () {
                doReload = true;
            },
            moveStart: moveStart
        };
    };

}(KR));