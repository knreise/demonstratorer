/*global Cesium:false*/

function CesiumMiniMap(parentViewer, options) {
    'use strict';

    options = options || {};
    var expanded = options.expanded || true;
    var _viewer, _container, _toggleButton;

    var CESIUM_OPTS = {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        orderIndependentTranslucency: false,
        sceneMode: Cesium.SceneMode.SCENE2D,
        mapProjection: new Cesium.WebMercatorProjection()
    };

    function _getContainer() {
        var parentDiv = document.createElement('div');
        parentDiv.className = 'cesium-minimap';
        parentViewer.bottomContainer.appendChild(parentDiv);
        return parentDiv;
    }

    function _addLayer(layer) {
        _viewer.imageryLayers.addImageryProvider(layer.imageryProvider);
    }

    function _setupMap(div) {

        CESIUM_OPTS.creditContainer = document.createElement('div');

        var viewer = new Cesium.Viewer(div, CESIUM_OPTS);
        viewer.scene.imageryLayers.removeAll();

        var scene = viewer.scene;
        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableZoom = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;

        parentViewer.scene.imageryLayers.layerAdded.addEventListener(_addLayer);

        _viewer = viewer;
    }

    function _setupListener() {
        var camera = _viewer.scene.camera;
        var parentCamera = parentViewer.scene.camera;
        parentCamera.moveEnd.addEventListener(function () {
            var pos = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
                parentCamera.position.clone()
            );
            pos.height = Math.max(pos.height * 2, 100000);
            camera.setView({
                positionCartographic: pos,
                heading: parentCamera.heading
            });
        });
    }

    function _toggle() {
        expanded = !expanded;

        if (expanded) {
            _container.style.width = '150px';
            _container.style.height = '150px';
            _toggleButton.className = _toggleButton.className.replace(
                ' minimized',
                ''
            );
        } else {
            //close
            _container.style.width = '19px';
            _container.style.height = '19px';
            _toggleButton.className += ' minimized';
        }
    }

    function _createToggleButton() {
        var btn = document.createElement('a');
        btn.className = 'minimap-toggle-display';
        btn.onclick = function (e) {
            e.preventDefault();
            _toggle();
            return false;
        };
        return btn;
    }


    function init() {
        var div = document.createElement('div');
        div.className = 'minimap-container';

        _container = _getContainer();
        _container.appendChild(div);
        _toggleButton = _createToggleButton();
        _container.appendChild(_toggleButton);
        _setupMap(div);
        _setupListener();
        if (parentViewer.imageryLayers.length) {
            _addLayer(parentViewer.imageryLayers.get(0));
        }
    }

    init();
}