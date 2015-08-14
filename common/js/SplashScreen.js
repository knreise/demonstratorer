/*global window:false, L:false*/

var KR = this.KR || {};

/*
    Simple splash screen for a leaflet map
*/

KR.SplashScreen = function (map, title, description, image, creator) {
    'use strict';

    function getShouldStayClosed() {
        var url = window.location.href;
        var name = 'remember_' + url + '=';
        var ca = document.cookie.split('; ');
        var l = _.find(ca, function (cookie) {
            return cookie.indexOf(name) === 0;
        });
        if (l) {
            return l.substring(name.length, l.length) === 'true';
        }
        return;
    }

    function setShouldStayClosed(value) {
        var url = window.location.href;
        document.cookie = 'remember_' + url + '=' + value;
    }

    function hideSidebar (e) {
        if (this._gray) {
            this._container.removeChild(this._gray);
        }
        L.Control.Sidebar.prototype.hide.apply(this, arguments);
    };

    function showSidebar (e) {
        this._gray = L.DomUtil.create('div', 'gray', this._container);
        L.Control.Sidebar.prototype.show.apply(this, arguments);
    };


    function createSidebar() {
        var el = L.DomUtil.create('div', '', document.body);
        el.id = 'splashscreen';

        var sidebar = L.control.sidebar('splashscreen', {
            position: 'center',
            autoPan: false
        });

        sidebar.hide = _.bind(hideSidebar, sidebar);
        sidebar.show = _.bind(showSidebar, sidebar);

        map.addControl(sidebar);
        var template = _.template($('#splashscreen_template').html());

        sidebar.setContent(template({
            title: title,
            image: image,
            description: description,
            creator: creator
        }));
        return sidebar;
    }

    function setupRememberCheckbox(sidebar) {

        var checkbox = $(sidebar.getContainer()).find('#persist_splash_cb');

        checkbox.prop('checked', getShouldStayClosed());

        function toggle() {
            setShouldStayClosed(checkbox.prop('checked'));
        }
        checkbox.on('change', toggle);
        toggle();
    }

    function createButton(callback) {
        return L.easyButton(map, callback, {position: 'topright', icon: 'fa-info-circle', title: 'Om'});
    }

    var sidebar = createSidebar();
    createButton(function () {
        if (sidebar.isVisible()) {
            sidebar.hide();
        } else {
            sidebar.show();
        }
    });


    var shouldStayClosed = getShouldStayClosed();
    if (!shouldStayClosed) {
        if (_.isUndefined(shouldStayClosed)) {
            setShouldStayClosed(true);
        }
        setTimeout(function () {
            sidebar.show();
        }, 500);
    }
    setupRememberCheckbox(sidebar);

};
