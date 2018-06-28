import * as _ from 'underscore';
import simplify from '@turf/simplify';
import buffer from '@turf/buffer';
import union from '@turf/union';

import {createFeatureCollection} from '../util';

function _simplify(featureCollection) {
    var features = _.map(featureCollection.features, function (feature) {
        return simplify(feature, {tolerance: 0.01, highQuality: false});
    });
    return createFeatureCollection(features);
}

function merge(features) {
    if (features.length < 2) {
        return features;
    }
    var first = features[0];
    var rest = _.rest(features);
    return _.reduce(rest, function (acc, feature) {
        return union(feature, acc);
    }, first);
}

export default function createGeomFilter(geom, bufferDist) {
    var fc = createFeatureCollection(
        _.map(geom.getLayers(), function (layer) {
            return layer.toGeoJSON();
        })
    );
    var simplified = _simplify(fc);
    if (bufferDist <= 0) {
        return merge(simplified.features);
    }
    return merge(buffer(simplified, bufferDist, {units: 'kilometers'}));
}