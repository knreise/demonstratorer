/*global L: false, KR: false, turf: false */
'use strict';

/*
    Wrapper over L.GeoJSON to handle unclustered KNreise datasets
*/

L.Knreise = L.Knreise || {};
L.Knreise.GeoJSON = L.GeoJSON.extend({

    initialize: function (geojson, options) {
        L.setOptions(this, options);

        this._layers = {};
        this.options.pointToLayer = this._pointToLayer.bind(this);

        if (geojson) {
            this.addData(geojson);
        }
        this.on('click', this._featureClicked, this);
        this._selectedLayer = null;
    },

    removedPaths: [],

    isCollapsed: function (path, zoom) {
        var minSize = this.options.dataset.toPoint.minSize || 20;
        var bounds = path.getBounds();

        var ne_px = this._map.project(bounds.getNorthEast(), zoom);
        var sw_px = this._map.project(bounds.getSouthWest(), zoom);

        var width = ne_px.x - sw_px.x;
        var height = sw_px.y - ne_px.y;
        return (height < minSize || width < minSize);
    },

    _deselectAll: function () {
        if (this._selectedLayer) {
            var layer = this._selectedLayer;
            if (layer.setIcon) {
                layer.setIcon(this._createFeatureIcon(layer.feature, false));
                layer.setZIndexOffset(0);
            }
            if (layer.setStyle) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }

                layer.setStyle(this._createFeatureIcon(feature, false));

                if (layer.getParent) {
                    var p = layer.getParent();
                    p.setStyle(this._createFeatureIcon(feature, false));
                }
            }
            this._selectedLayer = null;
        }
    },

    deselectAllNew: function () {

        _.each(this.getLayers(), function (layer) {
            if (layer.setIcon) {
                layer.setIcon(this._createFeatureIcon(layer.feature, false));
                layer.setZIndexOffset(0);
            }
            if (layer.setStyle) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }

                layer.setStyle(this._createFeatureIcon(feature, false));

                if (layer.getParent) {
                    var p = layer.getParent();
                    p.setStyle(this._createFeatureIcon(feature, false));
                }
            }
        }, this);
    },

    setLayerSelected: function (layer) {
        if (layer.setIcon) {
            layer.setIcon(this._createFeatureIcon(layer.feature, true));
            layer.setZIndexOffset(1000);
        }
        if (layer.setStyle) {

            var feature = layer.feature;
            if (!feature) {
                var parent = this.getParentLayer(layer._leaflet_id);
                feature = parent.feature;
            }
            if (feature) {
                layer.setStyle(this._createFeatureIcon(feature, true));
                layer.bringToFront();
            }

            if (layer.getParent) {
                var p = layer.getParent();
                p.setStyle(this._createFeatureIcon(feature, true));
            }

        }
        this._selectedLayer = layer;
    },

    _featureClicked: function (e) {
        if (this.options.dataset && this.options.dataset.toPoint && this.options.dataset.toPoint.stopPolyClick) {
            if (e.layer.toGeoJSON().geometry.type !== 'Point') {
                return;
            }
        }
        if (e.layer._map) {
            e.layer._map.fire('layerSelected');
        }
        var layer = e.layer;
        this.setLayerSelected(layer);
    },

    getParentLayer: function (id) {
        var l = this._layers[id];
        if (l) {
            return l;
        }
        var key, layer, found;
        for (key in this._layers) {
            if (this._layers.hasOwnProperty(key)) {
                layer = this._layers[key];
                if (layer.getLayer) {
                    found = layer.getLayer(id);
                    if (found) {
                        return layer;
                    }
                }
            }
        }
    },

    getZoomThreshold: function (path) {
        var zoomThreshold = null;
        var zoom = this._map.getZoom();
        if (this.isCollapsed(path, this._map.getZoom())) {
            while (!zoomThreshold) {
                zoom += 1;
                if (!this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom - 1;
                }
            }
        } else {
            while (!zoomThreshold) {
                zoom -= 1;
                if (this.isCollapsed(path, zoom)) {
                    zoomThreshold = zoom;
                }
            }
        }
        return zoomThreshold;
    },

    _zoomend: function () {
        if (!this.options.dataset.toPoint) {
            return;
        }
        var removedTemp = [],
            feature,
            i;

        this.eachLayer(function (feature) {
            if (this._map.getZoom() <= feature.zoomThreshold) {
                this.removeLayer(feature);
                if (!this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
                removedTemp.push(feature);
            }
        }, this);

        for (i = 0; i < this.removedPaths.length; i++) {
            feature = this.removedPaths[i];
            if (this._map.getZoom() > feature.zoomThreshold) {
                if (!this.options.dataset.toPoint.showAlways) {
                    this.removeLayer(feature.marker);
                }
                this.addLayer(feature);
                this.removedPaths.splice(i, 1);
                i = i - 1;
            }
        }
        this.removedPaths = this.removedPaths.concat(removedTemp);
    },

    _getCenter: function (feature) {
        if (typeof turf !== 'undefined') {
            var p = turf.pointOnSurface(feature.toGeoJSON());
            return L.latLng(p.geometry.coordinates.reverse());
        }
        return feature.getBounds().getCenter();
    },

    _layeradd: function (event) {
        var feature = event.layer;
        if (feature.feature.geometry.type !== 'Point' && !feature.isMarker) {
            feature.setStyle(KR.Style.getPathStyle(feature.feature));
            feature.bringToBack();
        }

        if (this.options.dataset.toPoint) {

            if (feature.isMarker) {
                return;
            }
            if (feature.getBounds && !feature.zoomThreshold && !feature.marker) {
                var zoomThreshold = this.getZoomThreshold(feature);
                var marker = this._pointToLayer(
                    feature.feature,
                    this._getCenter(feature)
                );
                marker.feature = feature.feature;
                marker.on('click', function (e) {
                    feature.fire('click', {
                        containerPoint: e.containerPoint,
                        latlng: e.latlng,
                        layerPoint: e.layerPoint,
                        originalEvent: e.originalEvent,
                        target: e.target,
                        type: e.type,
                        parent: true
                    });
                });

                feature.zoomThreshold = zoomThreshold;
                this.removedPaths.push(feature);
                feature.marker = marker;
                feature.marker.isMarker = true;
                feature.marker.getParent = function () {
                    return feature;
                };
                if (this._map.getZoom() <= zoomThreshold) {
                    this.removeLayer(feature);
                    if (!this.options.dataset.toPoint.showAlways) {
                        this.addLayer(feature.marker);
                    }
                }
                if (this.options.dataset.toPoint.showAlways) {
                    this.addLayer(feature.marker);
                }
            }
        }
    },

    setMap: function (map) {
        map.on('layerSelected', this._deselectAll, this);
    },

    onAdd: function (map) {
        L.GeoJSON.prototype.onAdd.apply(this, arguments);
        if (this.options.dataset && this.options.dataset.toPoint) {
            this._zoomend();
            map.on('zoomend', this._zoomend, this);
            this.on('layeradd', this._layeradd, this);
        }
        this.setMap(map);
    },

    _createFeatureIcon: function (feature, selected) {
        return KR.Style.getIcon(feature, selected);
    },

    _pointToLayer: function (feature, latlng) {
        return KR.Style.getMarker(feature, latlng);
    }

});


L.Knreise.geoJson = function (geojson, options) {
    return new L.Knreise.GeoJSON(geojson, options);
};