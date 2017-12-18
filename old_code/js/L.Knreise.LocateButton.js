/*global L:false, navigator:false, cilogi: false, KR:false*/
L.Knreise = L.Knreise || {};
(function (ns) {
    'use strict';

    L.Control.EasyButtons2 = L.Control.EasyButtons.extend({
        _addImage: function () {
            var extraClasses = this.options.icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';

            this._icon = L.DomUtil.create('i', this.options.icon + extraClasses, this.link);
            if (this.options.id) {
                this._icon.id = this.options.id;
            }
        },

        changeIcon: function (icon) {
            var extraClasses = this.options.icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';
            this._icon.className = icon + extraClasses;
        }
    });

    ns.LocateButton = function (callback, error, options) {
        options = options || {};
        options.zoom = options.zoom || 10;
        var isLocating = false;
        var marker;
        var _map;
        var _btn;
        var defaultIcon = options.icon || 'fa-user';
        var messageDisplayer = KR.Util.messageDisplayer($('#message_template').html());
        var watchId;


        function _createMarker(pos) {
            return new cilogi.L.Marker(pos, {
                fontIconSize: 3,
                fontIconName: "\uf05b",
                altIconName: "\uf05b",
                fontIconColor: "#FF0000",
                fontIconFont: 'awesome',
                opacity: 1
            });
        }

        function _showPosition(pos) {
            var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
            _btn.changeIcon(defaultIcon);
            if (options.bounds && !options.bounds.contains(p)) {
                messageDisplayer(
                    'warning',
                    'Du befinner deg utenfor området til denne demonstratoren. Viser ikke din posisjon'
                );
                _map.fire('locationError');
                stopLocation();
                return;
            }

            _map.userPosition = p;
            _map.fire('locationChange');
            if (callback) {
                callback(p);
            } else {
                _map.setView(p, 16);
                if (!marker) {
                    marker = _createMarker(p);
                    _map.addLayer(marker);
                } else {
                    marker.setLatLng(p);
                }
            }
        }

        function _positionError() {
            _map.fire('locationError');
            _btn.changeIcon(defaultIcon);
            _btn.getContainer().className = _btn.getContainer().className.replace(' active', '');
        }

        function stopLocation() {
            isLocating = false;
            if (!_.isUndefined(watchId)) {
                navigator.geolocation.clearWatch(watchId);
                _btn.getContainer().className = _btn.getContainer().className.replace(' active', '');
                _map.removeLayer(marker);
                marker = undefined;
                watchId = undefined;
            }
        }

        function getLocation() {
            isLocating = true;
            if (navigator.geolocation) {
                _btn.changeIcon('fa-spinner fa-pulse');
                _btn.getContainer().className += ' active';
                watchId = navigator.geolocation.watchPosition(_showPosition, _positionError);
            } else {
                if (error) {
                    error();
                }
            }
        }

        function toggleLocation() {
            if (isLocating) {
                stopLocation();
                return;
            }
            getLocation();
        }

        function addTo(map) {
            var title = options.title || 'Følg min posisjon';

            _map = map;
            _btn = new L.Control.EasyButtons2(toggleLocation, {icon: defaultIcon, title: title});
            _map.addControl(_btn);
            return _btn;
        }

        return {
            addTo: addTo,
            getLocation: getLocation
        };
    };

}(L.Knreise));
