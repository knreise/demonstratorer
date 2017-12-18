/*global window:false, L:false*/

var KR = this.KR || {};

/*
    Simple splash screen for a leaflet map
*/

KR.SplashScreen = function (map, title, description, image, creator, showSpinner) {
    'use strict';

    function getUrl() {
        return window.location.href.replace(window.location.hash, '');
    }

    function getShouldStayClosed() {
        var url = getUrl();
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
        document.cookie = 'remember_' + getUrl() + '=' + value;
    }

    function hideSidebar() {
        if (this._gray) {
            this._container.removeChild(this._gray);
        }
        L.Control.Sidebar.prototype.hide.apply(this, arguments);
    }

    function showSidebar() {
        this._gray = L.DomUtil.create('div', 'gray', this._container);
        L.Control.Sidebar.prototype.show.apply(this, arguments);
    }

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


        var content = $('<div>' + template({
            title: title,
            image: image,
            description: description,
            creator: creator,
            spinner: !!showSpinner
        }) + '</div>');

        if (KR.Util.isInIframe()) {
            content.find('a').attr('target','_blank');
        }
        sidebar.setContent(content.html());

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
        sidebar.show();
    }
    setupRememberCheckbox(sidebar);

    return {
        finishedLoading: function () {
            var spinner = $(sidebar.getContainer()).find('#splash_spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

};
