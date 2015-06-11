/*global turf:false, L:false */
var KR = this.KR || {};

(function (ns) {
    'use strict';

    ns.FollowLineMap = function (map, api, sidebar, datasets, options) {

        options = _.extend({
            circleStyle: {
                stroke: false,
                fillColor: '#f00',
                radius: 10,
                fillOpacity: 0.8
            }
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
                marker = L.circleMarker(
                    position,
                    options.circleStyle
                ).addTo(map);
            } else {
                marker.setLatLng(position);
            }
        }

        function positionChanged(position) {
            previewStrip.moveStart();
            markerLayer.clearLayers();
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
                api.getBbox(
                    dataset,
                    bbox,
                    datasetLoaded,
                    errorCallback,
                    {allPages: true}
                );
            });
        }

        return {
            positionChanged: positionChanged
        };
    };

}(KR));
