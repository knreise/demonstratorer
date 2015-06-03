/*global L: false, KR: false */
'use strict';

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
        var minSize = this.options.dataset.toPoint.minSize;
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
            if (layer.setStyle && this.options.dataset.style) {
                var feature = layer.feature;
                if (!feature) {
                    var parent = this.getParentLayer(layer._leaflet_id);
                    feature = parent.feature;
                }
                if (this.options.dataset.toPoint && this.options.dataset.toPoint.circle) {
                    layer.setStyle(this.options.dataset.toPoint.circle(feature));
                } else {
                    layer.setStyle(this.options.dataset.style(feature));
                }
            }
            this._selectedLayer = null;
        }
    },

    _featureClicked: function (e) {
        if (e.parent && this.options.dataset.toPoint.stopPolyClick) {
            return;
        }
        e.layer._map.fire('layerSelected');
        var layer = e.layer;
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
            if (this.options.dataset.selectedStyle) {
                if (this.options.dataset.toPoint && this.options.dataset.toPoint.circleSelected) {
                    layer.setStyle(this.options.dataset.toPoint.circleSelected(feature));
                } else {
                    layer.setStyle(this.options.dataset.selectedStyle(feature));
                }
            }
        }
        this._selectedLayer = layer;
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

    _layeradd: function (event) {
        if (this.options.dataset.toPoint) {
            var feature = event.layer;

            if (feature.isMarker) {
                return;
            }

            if (feature.getBounds && !feature.zoomThreshold && !feature.marker) {
                var zoomThreshold = this.getZoomThreshold(feature);

                var marker = this._createMarker(
                    feature.feature,
                    feature.getBounds().getCenter(),
                    this.options.dataset.toPoint.circle
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

    onAdd: function (map) {

        L.GeoJSON.prototype.onAdd.apply(this, arguments);
        if (this.options.dataset.toPoint) {
            this._zoomend();
            map.on('zoomend', this._zoomend, this);
            this.on('layeradd', this._layeradd, this);
        }
        map.on('layerSelected', this._deselectAll, this);
    },

    _getIconSize: function () {
        if (this.options.dataset && this.options.dataset.smallMarker) {
            return [20, 20];
        }
        return [50, 50];
    },

    _createFeatureIcon: function (feature, selected) {
        if (feature.properties.thumbnail && (this.options.dataset && this.options.dataset.thumbnails)) {
            var borderColor = KR.Util.colorForFeature(feature, 'hex');

            var styleDict = {
                'border-color': borderColor,
                'background-image': 'url(' + feature.properties.thumbnail + ')'
            };
            if (selected) {
                styleDict['border-width'] = '3px';
                styleDict['border-color'] = '#38A9DC';
            }

            return L.divIcon({
                html: '<div class="single" style="' + KR.Util.createStyleString(styleDict) + '"></div>​',
                className: 'leaflet-marker-photo',
                iconSize: this._getIconSize()
            });
        }
        if (this.options.dataset && this.options.dataset.smallMarker && !selected) {
            var icon = KR.Util.iconForFeature(feature);
            return new L.DivIcon({
                className: 'leaflet-marker-favicon',
                html: '<div class="outer"><i class="fa fa-' + icon + '"></i></div>',
                iconSize: [12, 12]
            });
        }
        return KR.Util.markerForFeature(feature, selected);
    },

    _createMarker: function (feature, latlng, circle) {
        if (circle) {
            if (typeof circle === 'function') {
                circle = circle(feature);
            }
            return L.circleMarker(latlng, circle);
        }
        return L.marker(latlng, {
            icon: this._createFeatureIcon(feature),
            title: feature.properties.title
        });
    },

    _pointToLayer: function (feature, latlng) {
        if (this.options.dataset && this.options.dataset.circle) {
            return this._createMarker(feature, latlng, this.options.dataset.circle);
        }
        return this._createMarker(feature, latlng);
    }

});


L.Knreise.geoJson = function (geojson, options) {
    return new L.Knreise.GeoJSON(geojson, options);
};