/*global turf:false, L:false */

/*
    Utility function for setting up an "along line" demonstrator.

    See LineMap.js
*/


var KR = this.KR || {};
KR.AlongLine = function (api) {
    'use strict';

    var line, bounds, buffer;

    function fetchDatasets(datasets, callback) {
        var bbox = bounds.toBBoxString();
        var results = [];
        var finished = _.after(datasets.length, function () {
            var filtered = _.map(results, function (layer) {
                var filteredFeatures = _.filter(layer.features, function (feature) {
                    return turf.inside(feature, buffer);
                });
                return turf.featurecollection(filteredFeatures);
            });
            callback(filtered);
        });

        _.each(datasets, function (dataset) {
            api.getBbox(
                dataset.dataset,
                bbox,
                function (geoJson) {
                    results.push(geoJson);
                    finished();
                },
                null,
                dataset.options
            );
        });
    }

    function getLine(dataset, callback) {


        api.getData(dataset, function (geoJson) {

            var coordinates = _.map(geoJson.features, function (feature) {
                return feature.geometry.coordinates;
            });

            var feature = {
                type: 'Feature',
                geometry: {
                    type: 'MultiLineString',
                    coordinates: _.flatten(coordinates, true)
                }
            };

            line = L.geoJson(feature);

            var s = _.min(line.getLayers(), function (layer) {
                return layer.getBounds().getSouth();
            });

            var latLngs = _.flatten(s.getLatLngs());
            var firstPoint = _.min(latLngs, function (latLng) {
                return latLng.lat;
            });

            var lastPoint = _.max(latLngs, function (latLng) {
                return latLng.lat;
            });

            var bufferFeatures = _.map(geoJson.features, function (feature) {
                feature = {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: feature.geometry.coordinates[0]
                    }
                };
                return turf.buffer(turf.simplify(feature, 0.001, false), 1, 'kilometers').features[0];
            });

            buffer = turf.merge({
                'type': 'FeatureCollection',
                'features': bufferFeatures
            });

            bounds = L.geoJson(buffer).getBounds();

            callback({
                line: line,
                buffer: buffer,
                bounds: bounds,
                firstPoint: firstPoint,
                lastPoint: lastPoint
            });
        });
    }

    function snapPoint(latLng) {
        var pt = L.marker(latLng).toGeoJSON();
        return _.chain(line.getLayers()[0].getLayers())
            .map(function (layer) {
                return turf.pointOnLine(layer.toGeoJSON(), pt);
            })
            .min(function (layer) {
                return layer.properties.dist;
            })
            .value();
    }

    function orderByDistance(featurecollections, point) {

        var measured = _.chain(featurecollections)
            .map(function (fc) {
                return fc.features;
            })
            .flatten(true)
            .map(function (feature) {
                feature.properties.distance = turf.distance(point, feature);
                return feature;
            })
            .value();
        return turf.featurecollection(measured.sort(function (a, b) {
            if (a.properties.distance < b.properties.distance) {
                return -1;
            }
            if (a.properties.distance > b.properties.distance) {
                return 1;
            }
            return 0;
        }));
    }

    return {
        getLine: getLine,
        snapPoint: snapPoint,
        fetchDatasets: fetchDatasets,
        orderByDistance: orderByDistance
    };
};
