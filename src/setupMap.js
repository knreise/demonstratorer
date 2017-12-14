//import 'babel-polyfill';
import 'font-awesome/css/font-awesome.css';
import L from 'leaflet';
import * as _ from 'underscore';

import {getDatasets, getDataset} from './datasets';
import {extendOptions} from './util';
import {createMap, freezeMap, unFreezeMap, addExtraLayers} from './map/index';
import {UrlFunctions, boundsToPoly} from './util';

import {addLocateButton} from './components/LocateButton';
import setupSplashScreen from './components/splashscreen';
import setupSidebar from './components/sidebar';

import getUserPos from './map/getUserPos';
import getInitBounds from './map/getInitBounds';
import getInverted from './map/getInverted';
import createGeomFilter from './map/createGeomFilter';
import DatasetLoader from './components/DatasetLoader/index';
import LayerManager from './components/LayerManager';
import './components/L.control.datasetChooser';


function lookupDatasets(datasets) {
    return _.map(datasets, function (dataset) {
        if (_.isString(dataset)) {
            return getDataset(dataset);
        }
        return dataset;
    });
}


function setupMap(api, datasets, options) {

    datasets = lookupDatasets(datasets);

    options = extendOptions(options);

    var map = createMap('map', options);

    freezeMap(map);
    addExtraLayers(map, options);

    /*var splashScreen =*/ setupSplashScreen(map, options);

    /*var locateBtn =*/ addLocateButton(map);

    var sidebar = setupSidebar(map, {featureHash: options.featureHash});

    function onFeatureClick(feature, dataset) {
        if (_.isArray(feature)) {
            sidebar.showFeatures(feature, dataset);
        } else {
            sidebar.showFeature(feature, dataset);
        }
    }
    function onDeSelect() {
        sidebar.hide();
    }

    if (options.loactionHash) {
        UrlFunctions.setupLocationUrl(map);
    }

    getInitBounds(api, options, function (err, bounds, filterGeom) {

        if (err) {
            console.error(err);
            return;
        }

        getUserPos(map, options, function (initPos) {
            unFreezeMap(map);
            if (initPos && bounds.contains(L.latLng(initPos.lat, initPos.lon))) {
                map.setView([initPos.lat, initPos.lon], initPos.zoom);
            } else {
                map.fitBounds(bounds);
            }
            if (options.restrictMap) {
                //restrict the map
                map.setMaxBounds(bounds);
                map.options.minZoom = map.getBoundsZoom(bounds);
            }

            if (filterGeom && options.line) {
                filterGeom.addTo(map);
            }
            if (filterGeom && options.showGeom) {
                 var inverted = getInverted(filterGeom);
                 inverted.addTo(map);
            }

            var filter;
            if (filterGeom && options.buffer) {
                filter = createGeomFilter(filterGeom, options.buffer);
            } else if (options.geomFilter) {
                filter = !!filterGeom
                    ? createGeomFilter(filterGeom, options.buffer || 0)
                    : boundsToPoly(bounds);
            }

            var loader = DatasetLoader(datasets, map, api, bounds, filter);

            var layerManager = LayerManager(map, loader);
            layerManager.onSelect(onFeatureClick);
            layerManager.onDeSelect(onDeSelect);

            L.control.datasetChooser(loader).addTo(map);

            layerManager.init();
            loader.init();

        });
    });

    return map;
};


function setupMapFromUrl(api, datasetIds, options) {
    setupMap(api, getDatasets(datasetIds), options);
};


window.setupMap = setupMap;
window.setupMapFromUrl = setupMapFromUrl;