import * as _ from 'underscore';
import simplify from '@turf/simplify';
import buffer from '@turf/buffer';


import {createFeatureCollection, mergeFeatures} from '../util';

function _simplify(featureCollection) {
    var features = _.map(featureCollection.features, function (feature) {
        return simplify(feature, {tolerance: 0.01, highQuality: false});
    });
    return createFeatureCollection(features);
}

function merge(featureCollection) {
    var features = featureCollection.features;
    return mergeFeatures(features);
}

export default function createGeomFilter(geom, bufferDist) {
    var fc = createFeatureCollection(
        _.map(geom.getLayers(), function (layer) {
            return layer.toGeoJSON();
        })
    );
    var simplified = _simplify(fc);
    if (bufferDist <= 0) {
        return merge(simplified);
    }
    return merge(buffer(simplified, bufferDist, {units: 'kilometers'}));
}