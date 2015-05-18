/*global L:false, KR:false */
'use strict';

L.NorvegianaGeoJSON = L.GeoJSON.extend({

    options: {
        cluster: true,
        thumbnails: true,
        isStatic: true
    },

    initialize: function (geoJson, sidebar, options) {
        options = options || {};
        L.setOptions(this, options);
        options = L.extend(
            options,
            {
                pointToLayer: _.bind(this._pointToLayer, this),
                onEachFeature: _.bind(this._onEachFeature, this)
            }
        );
        this._sidebar = sidebar;

        L.GeoJSON.prototype.initialize.call(this, geoJson, options);
        if (this.options.cluster) {
            this._cluster = L.markerClusterGroup({
                zoomToBoundsOnClick: false,
                spiderfyOnMaxZoom: false,
                iconCreateFunction: _.bind(this._createClusterIcon, this)
            });
            this._cluster.addLayer(this);
            this._cluster.on('clusterclick', this._clusterClick, this);
        }
    },

    addLayer: function (layer) {
        if (this.options.cluster) {
            var id = this.getLayerId(layer);
            this._layers[id] = layer;
            return this;
        }
        return L.GeoJSON.prototype.addLayer.call(this, layer);
    },

    addGeoJSON: function (geojson) {
        this.addData(geojson);

        if (this.options.cluster) {
            this._cluster.clearLayers();
            this._cluster.addLayers(this.getLayers());
        }
    },

    onAdd: function (map) {
        if (this._cluster) {
            map.addLayer(this._cluster);
        } else {
          L.GeoJSON.prototype.onAdd.call(this, map);
        }
    },

    resetGeoJSON: function (geoJson) {
        this.clearLayers();
        if (this._cluster) {
            this._cluster.clearLayers();
        }
        if (geoJson) {
            this.addGeoJSON(geoJson);
        }
    },

    onRemove: function (map) {
        L.GeoJSON.prototype.onRemove.call(this, map);
        if (this._cluster) {
            map.removeLayer(this._cluster);
        }
    },

    _onEachFeature: function (feature, layer) {
        layer.on('click', _.bind(this._featureClick, this));
    },

    _featureClick: function (e) {
        if (this._sidebar) {
            this._sidebar.showFeature(e.target.feature, this.options.template, this.options.getFeatureData);
        }
    },

    _clusterClick: function (e) {
        if (this._sidebar) {
            var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
                return marker.feature;
            });
            this._sidebar.showFeatures(features, this.options.template);
        }
    },

    _getIconSize: function () {
        if (this.options.smallMarker) {
            return [20, 20];
        }
        return [50, 50];
    },

    _createClusterIcon: function (cluster) {
        var markers = cluster.getAllChildMarkers();
        var photos = _.filter(markers, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (photos.length && this.options.thumbnails) {

            var rotations = ['rotation1', 'rotation2', 'rotation3'];
            var template = _.template('<div class="inner <%= rotation %><% if (first) {print(" first")}%>" style="border-color: <%= color %>;background-image: url(<%= thumbnail %>);"></div>');
            var html = _.map(photos.slice(0, 3), function (photo, idx) {
                var rotation = rotations[idx % rotations.length];
                return template({
                    thumbnail: photo.feature.properties.thumbnail,
                    rotation: rotation,
                    first: idx === 0,
                    color: KR.Util.colorForFeature(photo.feature, 'hex')
                });
            }).join('');

            return new L.DivIcon(L.extend({
                className: 'leaflet-marker-photo',
                html: '<div class="outer">​' + html + '</div><b>' + cluster.getChildCount() + '</b>',
                iconSize: this._getIconSize()
            }, this.icon));
        }
        if (this.options.smallMarker) {
            var icon = KR.Util.iconForFeature(markers[0].feature);
            return new L.DivIcon({
                className: 'leaflet-marker-favicon',
                html: '<div class="outer">​<i class="rot1 fa fa-' + icon + '"></i><i class="rot2 fa fa-' + icon + '"></i></div>',
                iconSize: [12, 12]
            });
        }
        return L.MarkerClusterGroup.prototype._defaultIconCreateFunction(cluster);
    },

    _createFeatureIcon: function (feature) {

        if (feature.properties.thumbnail && this.options.thumbnails) {
            var borderColor = KR.Util.colorForFeature(feature, 'hex');

            return L.divIcon({
                html: '<div class="single" style="border-color: ' + borderColor + '; background-image: url(' + feature.properties.thumbnail + ');"></div>​',
                className: 'leaflet-marker-photo',
                iconSize: this._getIconSize()
            });
        }
        if (this.options.smallMarker) {
            var icon = KR.Util.iconForFeature(feature);
            return new L.DivIcon({
                className: 'leaflet-marker-favicon',
                html: '<div class="outer"><i class="fa fa-' + icon + '"></i></div>',
                iconSize: [12, 12]
            });
        }

        return KR.Util.markerForFeature(feature);
    },

    _pointToLayer: function (feature, latlng) {
        if (feature.properties.circle) {
            return L.circleMarker(latlng, feature.properties.circle);
        }

        return L.marker(latlng, {
            icon: this._createFeatureIcon(feature),
            title: feature.properties.title
        });

    }
});

L.norvegianaGeoJSON = function (geoJson, sidebar, options) {
    return new L.NorvegianaGeoJSON(geoJson, sidebar, options);
};
