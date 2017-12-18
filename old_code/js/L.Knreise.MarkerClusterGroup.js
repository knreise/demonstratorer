/*global L:false, KR:false*/

'use strict';

/*
    Wrapper over L.GeoJSON to handle clustered KNreise datasets
*/

L.Knreise = L.Knreise || {};
L.Knreise.MarkerClusterGroup = L.MarkerClusterGroup.extend({

    options: {
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false,
        polygonOptions: {fillColor: '#ddd', weight: 2, color: '#999', fillOpacity: 0.6}
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
        this.isUnclustred = false;
    },

    onAdd: function (map) {
        L.MarkerClusterGroup.prototype.onAdd.apply(this, arguments);
        map.on('layerSelected', this._deselectAll, this);
        this._map = map;
        if (_.has(this.options, 'unclusterCount')) {
            this._unclustred = L.featureGroup().addTo(map);
             this._unclustred.on('click', _.bind(function (e) {
                this.fire('click', e);
             }, this));

             this.on('hide', function () {
                map.removeLayer(this._unclustred);
             });
             this.on('show', function () {
                map.addLayer(this._unclustred);
             });
        }
    },

    getVisibleLayers: function (layers) {
        var bounds = this._map.getBounds();
        return _.chain(layers)
            .filter(function (layer) {
                if (layer.getLatLng) {
                    return bounds.contains(layer.getLatLng());
                }
                return true;
            })
            .value()
    },

    getLayers: function () {
        if (this.isUnclustred) {
            return this.getUnclustredLayers();
        }
        return L.MarkerClusterGroup.prototype.getLayers.apply(this, arguments);
    },

    getUnclustredLayers: function () {
        return this._unclustred.getLayers();
    },

    addLayers: function (layers) {

        var prevLayers = this.getLayers();

        var showThreshold = this.options.unclusterCount;
        var visible = this.getVisibleLayers(layers);

        if (this._unclustred) {
            this._unclustred.clearLayers();
        }

        if (visible.length <= showThreshold) {
            this.isUnclustred = true;
            _.each(visible, function (layer) {
                this._unclustred.addLayer(layer);
            }, this);
        } else {
            this.isUnclustred = false;
            L.MarkerClusterGroup.prototype.addLayers.apply(this, arguments);
        }
        this.fire('dataloaded', {prevLayers: prevLayers});
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
        return KR.Style.getClusterIcon(cluster, selected);
    }

});

L.Knreise.markerClusterGroup = function (options) {
    return new L.Knreise.MarkerClusterGroup(options);
};
