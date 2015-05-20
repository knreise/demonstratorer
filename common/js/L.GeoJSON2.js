L.GeoJSON2 = L.GeoJSON.extend({

    initialize: function (geojson, options) {
        L.setOptions(this, options);

        this._layers = {};

        this.options.pointToLayer = this._pointToLayer.bind(this);

        if (geojson) {
            this.addData(geojson);
        }
    },

    _getIconSize: function () {
        if (this.options.dataset.smallMarker) {
            return [20, 20];
        }
        return [50, 50];
    },

    _createFeatureIcon: function (feature) {
        if (feature.properties.thumbnail && this.options.dataset.thumbnails) {
            var borderColor = KR.Util.colorForFeature(feature, 'hex');

            return L.divIcon({
                html: '<div class="single" style="border-color: ' + borderColor + '; background-image: url(' + feature.properties.thumbnail + ');"></div>​',
                className: 'leaflet-marker-photo',
                iconSize: this._getIconSize()
            });
        }
        if (this.options.dataset.smallMarker) {
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

        if (this.options.dataset.circle) {
            return L.circleMarker(latlng, this.options.dataset.circle);
        }

        return L.marker(latlng, {
            icon: this._createFeatureIcon(feature),
            title: feature.properties.title
        });
    }

});


L.geoJson2 = function (geojson, options) {
    return new L.GeoJSON2(geojson, options);
};