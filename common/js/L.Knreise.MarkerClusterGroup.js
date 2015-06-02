/*global L:false, KR:false*/

'use strict';

L.Knreise = L.Knreise || {};
L.Knreise.MarkerClusterGroup = L.MarkerClusterGroup.extend({

    options: {
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        if (!this.options.iconCreateFunction) {
            this.options.iconCreateFunction = this._iconCreator.bind(this);
        }

        this._featureGroup = L.featureGroup();
        this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._nonPointGroup = L.featureGroup();
        this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

        this._inZoomAnimation = 0;
        this._needsClustering = [];
        this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
        //The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
        this._currentShownBounds = null;

        this._queue = [];
        this.on('clusterclick', this._clusterClicked, this);
    },

    onAdd: function (map) {
        L.MarkerClusterGroup.prototype.onAdd.apply(this, arguments);
        map.on('layerSelected', this._deselectAll, this);
    },

    _getIconSize: function () {
        if (this.options.dataset.smallMarker) {
            return [20, 20];
        }
        return [50, 50];
    },

    _deselectAll: function () {
        _.each(this._gridClusters, function (g) {
            _.each(g._grid, function (h) {
                _.each(h, function (i) {
                    _.each(i, function (cluster) {
                        if (cluster.selected) {
                            cluster.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, cluster);
                            cluster._updateIcon();
                            cluster.selected = false;
                        }
                    });
                });
            });
        });

        this.eachLayer(function (layer) {
            if (layer.selected) {
                layer.createIcon = _.bind(L.MarkerCluster.prototype.createIcon, layer);
                layer.setIcon(_.bind(L.Knreise.GeoJSON.prototype._createFeatureIcon, this)(layer.feature));
                layer.selected = false;
            }
        }, this);
    },

    _clusterClicked: function (e) {
        this._map.fire('layerSelected');
        var layer = e.layer;
        var iconCreate = _.bind(this._iconCreator, this);
        layer.createIcon = function () {
            return iconCreate(this, true).createIcon();
        };
        layer.selected = true;
        layer._updateIcon();
    },

    _iconCreator: function (cluster, selected) {

        var markers = cluster.getAllChildMarkers();
        var photos = _.filter(markers, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (photos.length && this.options.dataset.thumbnails) {

            var rotations = ['rotation1', 'rotation2', 'rotation3'];
            var template = _.template('<div class="inner <%= rotation %><% if (first) {print(" first")}%>" style="<%= style %>"></div>');
            var html = _.map(photos.slice(0, 3), function (photo, idx) {
                var rotation = rotations[idx % rotations.length];

                var styleDict = {
                    'border-color': KR.Util.colorForFeature(photo.feature, 'hex'),
                    'background-image': 'url(' + photo.feature.properties.thumbnail + ');'
                };
                if (selected) {
                    styleDict['border-width'] = '3px';
                    styleDict['border-color'] = '#38A9DC';
                }
                return template({
                    style: KR.Util.createStyleString(styleDict),
                    rotation: rotation,
                    first: idx === 0
                });
            }).join('');

            return new L.DivIcon(L.extend({
                className: 'leaflet-marker-photo',
                html: '<div class="outer">​' + html + '</div><b>' + cluster.getChildCount() + '</b>',
                iconSize: this._getIconSize()
            }, this.icon));
        }
        if (this.options.dataset.smallMarker && !selected) {
            var icon = KR.Util.iconForFeature(markers[0].feature);
            return new L.DivIcon({
                className: 'leaflet-marker-favicon',
                html: '<div class="outer">​<i class="rot1 fa fa-' + icon + '"></i><i class="rot2 fa fa-' + icon + '"></i></div>',
                iconSize: [12, 12]
            });
        }
        return this._defaultIconCreateFunction(cluster);
    }

});

L.Knreise.markerClusterGroup = function (options) {
    return new L.Knreise.MarkerClusterGroup(options);
};
