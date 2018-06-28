//import 'babel-polyfill';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import L from 'leaflet';
import * as _ from 'underscore';
import turfBbox from '@turf/bbox';

import {getDatasets, getDataset} from './datasets';
import {
    UrlFunctions,
    boundsToPoly,
    extendOptions,
    parseQueryString
} from './util';
import {createMap, freezeMap, unFreezeMap, addExtraLayers} from './map/index';

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
import KNreiseAPI from 'knreise-api';

function lookupDatasets(datasets) {
    return _.chain(datasets)
        .map(function (dataset) {
            if (_.isString(dataset)) {
                return getDataset(dataset);
            }
            return dataset;
        })
        .filter(function (dataset) {
            if (!_.isObject(dataset)) {
                return false;
            }
            return true;
        })
        .value();
}

function getApi() {
    return KNreiseAPI({
        flickr: {
            apikey: 'ab1f664476dabf83a289735f97a6d56c'
        },
        jernbanemuseet: {
            apikey: '336a8e06-78d9-4d2c-84c9-ac4fab6e8871'
        },
        europeana: {
            apikey: 'pYEaya4fK'
        }
    });
}

function setupMap(api, datasets, options) {
    if (!api) {
        api = getApi();
    }

    datasets = lookupDatasets(datasets);
    options = extendOptions(options);

    var map = createMap('map', options);
    var datasetChooser = L.control.datasetChooser().addTo(map);
    datasetChooser.startLoad();
    freezeMap(map);
    addExtraLayers(map, options);

    setupSplashScreen(map, options);

    var locateBtn = addLocateButton(map);

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
            locateBtn.setBounds(bounds);


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

            var bbox = (!!filter)
                ? turfBbox(filter)
                : null;
            if (bbox) {

                map.setMaxBounds([
                    [bbox[1], bbox[0]],
                    [bbox[3], bbox[2]]
                ]);
            }

            var loader = DatasetLoader(datasets, map, api, map.getBounds(), filter);
            datasetChooser.addLoader(loader);
            var layerManager = LayerManager(map, loader);
            layerManager.onSelect(onFeatureClick);
            layerManager.onDeSelect(onDeSelect);
            layerManager.init();
            loader.init();
            datasetChooser.stopLoad();

        });
    });

    return map;

};


function setupMapFromUrl(datasetIds, options) {
    var api = getApi();
    setupMap(api, getDatasets(datasetIds), options);
};

function setupMapFromQueryString(queryString) {
    var api = getApi();
    var params = parseQueryString(queryString);

    if (params.komm || params.fylke) {
        params.showGeom = params.showGeom || true;
        params.geomFilter = params.geomFilter || true;
    }
    if (params.datasets && _.isString(params.datasets)) {
        params.datasets = [params.datasets];
    }
    var datasets = getDatasets(params.datasets || params.dataset);
    var options = _.omit(params, 'datasets');
    setupMap(api, datasets, options);
};


window.setupMap = setupMap;
window.setupMapFromUrl = setupMapFromUrl;
window.setupMapFromQueryString = setupMapFromQueryString;