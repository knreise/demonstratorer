/*global turf:false, L:false, window:false */

var KR = this.KR || {};
KR.LineMap = function (api, map, dataset, options) {
    'use strict';

    options = _.extend({
        scrollLength: 0.6 //km
    }, options || {});


    function _length(lines) {
        return _.reduce(lines, function (length, line) {
            return length + turf.lineDistance(line, 'kilometers');
        }, 0);
    }

    function _stepsForLine(line, steps, stepLength) {
        return _.map(_.range(0, steps + 1), function (step) {
            var pos = stepLength * step;
            return turf.along(line, pos, 'kilometers');
        });
    }

    function _getSteps(lines, stepLength) {
        var totalLength = _length(lines);
        var steps = Math.round(totalLength / stepLength);
        return _.flatten(_.map(lines, function (line) {
            var length = _length([line]);
            var lineSteps = Math.round(steps * (length / totalLength));
            return _stepsForLine(line, lineSteps, stepLength);
        }));
    }

    function _multiToSimple(geoJson) {

        var lines = _.map(geoJson.geometry.coordinates, function (line) {
            if (_.last(line)[1] > _.first(line)[1]) {
                line = line.reverse();
            }
            return turf.linestring(line);
        });

        lines.sort(function (a, b) {
            return (b.geometry.coordinates[0][1] - a.geometry.coordinates[0][1]);
        });
        return lines;
    }

    function _getZoomToIndex(steps, positionCallback) {
        return function _zoomToIndex(index) {
            var step = steps[index];
            if (step !== undefined) {
                var pos = L.geoJson(step).getLayers()[0].getLatLng();
                if (positionCallback) {
                    positionCallback(pos);
                }
            }
        };
    }

    function _initHandlers(callback) {
        document.onkeydown = function (e) {
            e = e || window.event;
            var key = e.which || e.keyCode;
            if (key === 38) {
                callback(1);
            }
            if (key === 40) {
                callback(-1);
            }
        };

        L.DomEvent.on($('#map')[0], 'mousewheel', function (e) {
            var delta = L.DomEvent.getWheelDelta(e);
            callback(delta);
        });

        $('#map').swipe({
            swipe: function (e, direction) {
                if (direction === 'up' || direction === 'left') {
                    callback(-1);
                }
                if (direction === 'down' || direction === 'right') {
                    callback(1);
                }
            }
        });
    }

    function _setupMove(steps, positionCallback) {
        var index = 0;
        var zoomToIndex = _getZoomToIndex(steps, positionCallback);
        zoomToIndex(index);

        function move(delta) {
            if (delta === 1) {
                if (index > 0) {
                    index--;
                    zoomToIndex(index);
                }
            } else if (delta === -1) {
                if (index < steps.length - 1) {
                    index++;
                    zoomToIndex(index);
                }
            }
        }
        _initHandlers(move);
    }

    function _initScroll(map, geoJson, positionCallback) {
        var lines;
        if (geoJson.geometry.type === 'MultiLineString') {
            lines = _multiToSimple(geoJson);
        } else {
            lines = [geoJson];
        }
        var steps = _getSteps(lines, options.scrollLength);
        _setupMove(steps, positionCallback);
    }


    function init(callback) {
        var alongLine = new KR.AlongLine(api);
        alongLine.getLine(dataset, function (res) {
            var geoJson = res.line.toGeoJSON();
            L.geoJson(geoJson).addTo(map);
            _initScroll(map, geoJson.features[0], callback);
        });
    }

    return {
        init: init
    };
};