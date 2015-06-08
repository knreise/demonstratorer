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

        function _checkRight() {
            if (strip.find('.panel').not('.hidden').length < 2) {
                rightBtn.addClass('hidden');
            } else {
                rightBtn.removeClass('hidden');
            }
        }

        function _setupToggle() {
            _checkLeft();

            rightBtn.on('click', function () {
                strip.find('.panel').not('.hidden').first().addClass('hidden');
                _checkLeft();
                _checkRight();
            });
            leftBtn.on('click', function () {
                strip.find('.panel.hidden').last().removeClass('hidden');
                _checkLeft();
                _checkRight();
            });
        }

        _setupToggle();

        strip.find('.js-close').on('click', function () {
            strip.addClass('hidden');
        });
    };


    ns.PreviewStrip = function (element, map, api, datasets, featureClicked) {

        var doReload = true;

        var position;

        var datasetLoader = new KR.DatasetLoader(api, map, {showFeature: featureClicked});

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

                if (feature.dataset.panelMap) {
                    feature.feature.properties = feature.dataset.panelMap(feature.feature.properties);
                }

                feature.feature.properties.icon = KR.Util.iconForContentType(feature.feature);
                feature.feature.properties.distance = _formatDistance(feature.feature.properties.distance) || null;
                var el = $(panelTemplate(feature.feature.properties));
                el.on('click', function () {
                    if (featureClicked) {
                        featureClicked(feature.feature);
                    }
                });
                return el;
            });

            element.find('.strip-container').html(panels);
            element.removeClass('hidden');
        }

        function _moveStart() {

            if (!doReload) {
                return;
            }

            _.each(layers, function (layer) {
                layer.clearLayers();
            });
            element.find('.strip-container').html(spinner);
        }

        function _moveEnd() {
            if (!doReload) {
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