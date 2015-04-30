/*global L:false, KR:false */
'use strict';

L.NorvegianaGeoJSON = L.GeoJSON.extend({

    options: {
        cluster: true,
        thumbnails: true
    },

    initialize: function (sidebar, options) {
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

        L.GeoJSON.prototype.initialize.call(this, null, options);
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
        if (this.options.cluster) {
            map.addLayer(this._cluster);
        }
        L.GeoJSON.prototype.onAdd.call(this, map);
    },

    _onEachFeature: function (feature, layer) {
        var img = feature.properties.delving_thumbnail;
        if (_.isArray(img)) {
            img = img[0];
        }

        layer.on('click', _.bind(this._featureClick, this));
    },

    _featureClick: function (e) {
        this._sidebar.showFeature(e.target.feature);
    },

    _clusterClick: function (e) {
        var features = _.map(e.layer.getAllChildMarkers(), function (marker) {
            return marker.feature;
        });
        this._sidebar.showFeatures(features);
    },

    _createClusterIcon: function (cluster) {
        var photos = _.filter(cluster.getAllChildMarkers(), function (marker) {
            return marker.feature.properties.europeana_type === 'IMAGE';
        });
        if (photos.length && this.options.thumbnails) {

            var rotations = ['rotation1', 'rotation2', 'rotation3'];
            var template = _.template('<div class="inner <%= rotation %><% if (first) {print(" first")}%>" style="border-color: <%= color %>;background-image: url(<%= thumbnail %>);"></div>');
            var html = _.map(photos, function (photo, idx) {
                var rotation = rotations[idx % rotations.length];
                return template({
                    thumbnail: photo.feature.properties.delving_thumbnail,
                    rotation: rotation,
                    first: idx === 0,
                    color: KR.Util.colorForFeature(photo.feature, 'hex')
                });
            }).join('');

            return new L.DivIcon(L.extend({
                className: 'leaflet-marker-photo',
                html: '<div class="outer">​' + html + '</div><b>' + cluster.getChildCount() + '</b>',
                iconSize: [50, 50]
            }, this.icon));
        }

        return L.MarkerClusterGroup.prototype._defaultIconCreateFunction(cluster);
    },

    _createFeatureIcon: function (feature) {

        var faIcon = KR.Util.iconForFeature(feature);
        if (feature.properties.europeana_type === 'IMAGE' && this.options.thumbnails) {
            var borderColor = KR.Util.colorForFeature(feature, 'hex');
            return L.divIcon({
                html: '<div class="single" style="border-color: ' + borderColor + '; background-image: url(' + feature.properties.delving_thumbnail + ');"></div>​',
                className: 'leaflet-marker-photo',
                iconSize: [50, 50]
            });
        }
        var color = KR.Util.colorForFeature(feature);
        return L.AwesomeMarkers.icon({
            icon: faIcon,
            markerColor: color,
            prefix: 'fa'
        });
    },

    _pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: this._createFeatureIcon(feature)
        });
    }
});

L.norvegianaGeoJSON = function (sidebar, pointToLayer, options) {
    return new L.NorvegianaGeoJSON(sidebar, pointToLayer, options);
};
