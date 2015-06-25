/*global Cesium:false, turf:false */
var KR = this.KR || {};

KR.PathTracer = function (viewer, line, geojson) {
    'use strict';

    var SPEED = 1.4; // m/s
    var MULTIPLIER = 35;

    var running = false;

    var pitchCorr = 0;

    function _addClock(start, stop) {
        //Set the random number seed for consistent results.
        Cesium.Math.setRandomNumberSeed(3);
        //Make sure viewer is at the desired time.
        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
        viewer.clock.multiplier = MULTIPLIER;
        viewer.clock.shouldAnimate = false;
    }

    function _createEntity(startTime, stopTime, position) {
        var entity = viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: startTime,
                stop: stopTime
            })]),
            position: position,
            orientation: new Cesium.VelocityOrientationProperty(position)/*,
            path : {
                resolution : 1,
                material : new Cesium.PolylineGlowMaterialProperty({
                    glowPower : 0.1,
                    color : Cesium.Color.YELLOW
                }),
                width : 10
            }*/
        });
        return entity;
    }

    function _getFlight(startTime, curve, line) {

        //reverse
        curve = curve.reverse();
        line.geometry.coordinates = line.geometry.coordinates.reverse();

        var dist = 0;
        var lastPoint = turf.point(line.geometry.coordinates[0]);
        var property = new Cesium.SampledPositionProperty();
        _.each(curve, function (pos, i) {
            var stopPoint = turf.point(line.geometry.coordinates[i]);
            dist = dist + turf.distance(lastPoint, stopPoint, 'kilometers') * 1000;
            lastPoint = stopPoint;
            var time = Cesium.JulianDate.addSeconds(startTime, dist / SPEED, new Cesium.JulianDate());
            var position = new Cesium.Cartesian3(pos.x, pos.y, pos.z + 2);
            property.addSample(time, position);
        });
        return property;
    }

    function _setupCamera(entity) {
        viewer.clock.onTick.addEventListener(function (clock) {

            if (!running) {
                return;
            }

            //get 2 positions close together timewise
            var CC3 = Cesium.Cartesian3;
            var position1 = entity.position.getValue(
                clock.currentTime,
                new CC3()
            );
            var position2 = entity.position.getValue(
                Cesium.JulianDate.addSeconds(
                    clock.currentTime,
                    1 / 60,
                    new Cesium.JulianDate()
                ),
                new CC3()
            );

            //velocity in terms of Earth Fixed
            var Wvelocity = CC3.subtract(position2, position1, new CC3());
            CC3.normalize(Wvelocity, Wvelocity);
            var Wup = new CC3();
            var Weast = new CC3();
            var Wnorth = new CC3();
            Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(position1, Wup);
            CC3.cross({x: 0, y: 0, z: 1}, Wup, Weast);
            CC3.cross(Wup, Weast, Wnorth);

            //velocity in terms of local ENU
            var Lvelocity = new CC3();
            Lvelocity.x = CC3.dot(Wvelocity, Weast);
            Lvelocity.y = CC3.dot(Wvelocity, Wnorth);
            Lvelocity.z = CC3.dot(Wvelocity, Wup);

            //angle of travel
            var Lup = new CC3(0, 0, 1);
            var Least = new CC3(1, 0, 0);
            var Lnorth = new CC3(0, 1, 0);
            var x = CC3.dot(Lvelocity, Least);
            var y = CC3.dot(Lvelocity, Lnorth);
            var z = CC3.dot(Lvelocity, Lup);
            var angle = Math.atan2(x, y);//math: y b4 x, heading: x b4 y
            var pitch = Math.asin(z);//make sure Lvelocity is unitized

            //angles offsets
            angle += 0 / 180 * Math.PI;
            pitch += -20 / 180 * Math.PI;

            var range = 800;
            var offset = new Cesium.HeadingPitchRange(angle, pitch + pitchCorr, range);
            viewer.scene.camera.lookAt(
                entity.position.getValue(clock.currentTime),
                offset
            );
        });
    }

    function _init() {
        var feature = geojson.features[0];
        var length = turf.lineDistance(feature, 'kilometers') * 1000;
        var duration = length / SPEED;
        var startTime = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
        var stopTime = Cesium.JulianDate.addSeconds(startTime, duration, new Cesium.JulianDate());

        _addClock(startTime, stopTime);

        var position = _getFlight(startTime, line, feature);
        var entity = _createEntity(startTime, stopTime, position);
        entity.position.setInterpolationOptions({
            interpolationDegree : 5,
            interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
        });

        viewer.trackedEntity = undefined;
        _setupCamera(entity);
    }

    function start() {
        running = true;
        viewer.clock.shouldAnimate = true;
    }

    function stop() {
        running = false;
        viewer.clock.shouldAnimate = false;
    }

    //start it
    _init();

    return {
        start: start,
        stop: stop,
        isRunning: function () {return running; },
        setPitchCorr: function (corr) {pitchCorr = corr; }
    };
};