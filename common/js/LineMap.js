/*global turf:false, L:false, window:false */

/*
    Utility function for setting up an "along line" demonstrator.
*/
var KR = this.KR || {};
KR.LineMap = function (api, map, getLineFunc, options) {
    'use strict';

    var MiniMap = L.Control.MiniMap.extend({

        onAdd: function (map) {

            this._mainMap = map;

            //Creating the container and stopping events from spilling through to the main map.
            this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
            this._container.style.width = this.options.width + 'px';
            this._container.style.height = this.options.height + 'px';
            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

            this._miniMap = new L.Map(this._container, {
                attributionControl: false,
                keyboard: false,
                zoomControl: false,
                zoomAnimation: this.options.zoomAnimation,
                autoToggleDisplay: this.options.autoToggleDisplay,
                touchZoom: !this.options.zoomLevelFixed,
                scrollWheelZoom: !this.options.zoomLevelFixed,
                doubleClickZoom: !this.options.zoomLevelFixed,
                boxZoom: !this.options.zoomLevelFixed,
                crs: map.options.crs
            });

            this._miniMap.addLayer(this._layer);

            //These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
            this._mainMapMoving = false;
            this._miniMapMoving = false;

            //Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
            this._userToggledDisplay = false;
            this._minimized = false;

            if (this.options.toggleDisplay) {
                this._addToggleButton();
            }

            this._miniMap.whenReady(L.Util.bind(function () {
                this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
                this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);
                this._mainMap.on('moveend', this._onMainMapMoved, this);
                this._mainMap.on('move', this._onMainMapMoving, this);
                this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
                this._miniMap.on('move', this._onMiniMapMoving, this);
                this._miniMap.on('moveend', this._onMiniMapMoved, this);
            }, this));

            this._miniMap.on('mouseup', function () {
                if (this.options.moveCallback) {
                    this.options.moveCallback(this._miniMap.getCenter());
                }
            }, this);

            return this._container;
        },

        _onMiniMapMoved: function () {

            if (!this._mainMapMoving) {
                this._miniMapMoving = true;
                this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
            } else {
                this._mainMapMoving = false;
            }
        }
    });


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

    function _initMiniMap(position, geoJson, callback) {
        map.setZoom(15);
        map.panTo(position);

        var layer = new L.TileLayer.Kartverket('topo2graatone');
        var line = L.geoJson(geoJson);

        return new MiniMap(L.layerGroup([layer, line]), {
            position: 'topright',
            zoomLevelFixed: 8,
            zoomLevelOffset: -6,
            moveCallback: function (miniMapPos) {
                callback(turf.point([miniMapPos.lng, miniMapPos.lat]));
            }
        }).addTo(map);
    }

    function _setupMove(steps, positionCallback, geoJson) {
        var index = 0;

        var zoomToIndex = _getZoomToIndex(steps, positionCallback);

        var initPos = L.geoJson(steps[index]).getLayers()[0].getLatLng();
        positionCallback(initPos);

        function miniMapMoved(miniMapCenter) {

            var distance = Infinity;
            var closestIndex = -1;
            _.each(steps, function (step, index) {
                var dist = turf.distance(miniMapCenter, step);
                if (dist < distance) {
                    distance = dist;
                    closestIndex = index;
                }
            });

            if (closestIndex !== index) {
                index = closestIndex;
                zoomToIndex(index);
            }
        }
        _initMiniMap(initPos, geoJson, miniMapMoved);


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

    function _initScroll(geoJson, positionCallback) {
        var lines;
        if (geoJson.geometry.type === 'MultiLineString') {
            lines = _multiToSimple(geoJson);
        } else {
            lines = [geoJson];
        }
        var steps = _getSteps(lines, options.scrollLength);
        _setupMove(steps, positionCallback, geoJson);
    }

    function init(callback) {
        var alongLine = new KR.AlongLine(api, getLineFunc);

        alongLine.getLine(function (res) {
            var geoJson = res.line.toGeoJSON();
            L.geoJson(geoJson).addTo(map);
            _initScroll(geoJson.features[0], callback);
        });
    }

    return {
        init: init
    };
};