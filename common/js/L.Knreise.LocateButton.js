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
        var marker;
        var _map;
        var _btn;
        var defaultIcon = options.icon || 'fa-user';
        var messageDisplayer = KR.Util.messageDisplayer($('#message_template').html());

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
            _map.userPosition = p;
            _btn.changeIcon(defaultIcon);
            if (options.bounds && !options.bounds.contains(p)) {
                messageDisplayer(
                    'warning',
                    'Du befinner deg utenfor området til denne demonstratoren. Viser ikke din posisjon'
                );
                return;
            }
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

        function _getLocation() {
            if (navigator.geolocation) {
                _btn.changeIcon('fa-spinner fa-pulse');
                navigator.geolocation.getCurrentPosition(_showPosition);
            } else {
                if (error) {
                    error();
                }
            }
        }

        function addTo(map) {
            var title = options.title || 'Finn meg';

            _map = map;
            _btn = new L.Control.EasyButtons2(_getLocation, {icon: defaultIcon, title: title});
            _map.addControl(_btn);
            return _btn;
        }

        return {
            addTo: addTo
        };
    };

}(L.Knreise));
