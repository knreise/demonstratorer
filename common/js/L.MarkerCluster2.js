L.MarkerClusterGroup2 = L.MarkerClusterGroup.extend({

    options: {
        zoomToBoundsOnClick: false,
        spiderfyOnMaxZoom: false
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        if (!this.options.iconCreateFunction) {
            
            //this.options.iconCreateFunction = this._defaultIconCreateFunction;
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
    },

    _getIconSize: function () {
        if (this.options.dataset.smallMarker) {
            return [20, 20];
        }
        return [50, 50];
    },

    _iconCreator: function (cluster) {
        var markers = cluster.getAllChildMarkers();
        var photos = _.filter(markers, function (marker) {
            return marker.feature.properties.thumbnail;
        });
        if (photos.length && this.options.dataset.thumbnails) {

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
        if (this.options.dataset.smallMarker) {
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


L.markerClusterGroup2 = function (options) {
    return new L.MarkerClusterGroup2(options);
};