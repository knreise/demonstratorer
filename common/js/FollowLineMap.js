/*global turf:false, L:false */
var KR = this.KR || {};

(function (ns) {
    'use strict';

    /*
        Setup for a "follow line map demonstrator"
    */
    ns.FollowLineMap = function (map, api, sidebar, datasets, options) {

        options = _.extend({
            zoom: 15
        }, options || {});

        var previewStrip = new KR.PreviewStrip(
            $('#strip'),
            map,
            null,
            null,
            null,
            {
                panOnClick: false,
                minimal: true
            }
        );

        var markerLayer = L.Knreise.geoJson().addTo(map);

        markerLayer.on('click', function (e) {
            var feature = e.layer.feature;
            if (sidebar) {
                sidebar.showFeature(feature);
            }
        });

        function _gotFeatures(features) {
            markerLayer.clearLayers().addData(features);
            previewStrip.showFeatures(markerLayer.getLayers());
            if (!features.features.length) {
                previewStrip.showMessage('<em>Ingen funnet!</em>');
            }
        }

        var marker;
        function _updateMarker(position) {
            if (!marker) {
                if (options.circleStyle) {
                    marker = L.circleMarker(
                        position,
                        options.circleStyle
                    ).addTo(map);
                } else if (options.icon) {
                    marker = L.marker(position, {icon: options.icon}).addTo(map);
                } else {
                    marker = L.marker(position).addTo(map);
                }
            } else {
                marker.setLatLng(position);
            }
        }

        function _datasetLoader(bbox, loadedFunc, errorCallback, dataset) {
            var id = KR.Util.getDatasetId(dataset);
            if (dataset.style) {
                KR.Style.setDatasetStyle(id, dataset.style);
            }
            function datasetLoaded(features) {
                _.each(features.features, function (feature) {
                    feature.properties.datasetId = id;
                });

                loadedFunc(features);
            }
            api.getBbox(
                dataset.dataset,
                bbox,
                datasetLoaded,
                errorCallback,
                {allPages: true}
            );
        }

        function positionChanged(position) {
            previewStrip.moveStart();
            markerLayer.clearLayers();
            map.setZoom(options.zoom);
            map.panTo(position);
            _updateMarker(position);

            previewStrip.setPosition(position);

            var found = [];
            var featuresLoaded = _.after(datasets.length, function () {
                _gotFeatures(KR.Util.createFeatureCollection(found));
            });

            function errorCallback() {
                previewStrip.showMessage('En feil oppstod!');
                featuresLoaded();
            }

            var bbox = map.getBounds().toBBoxString();
            function datasetLoaded(features) {
                features = KR.Util.filterByBbox(features, bbox);
                found = found.concat(features.features);
                featuresLoaded();
            }
            _.each(datasets, function (dataset) {
                _datasetLoader(bbox, datasetLoaded, errorCallback, dataset);
            });
        }

        return {
            positionChanged: positionChanged
        };
    };

}(KR));
