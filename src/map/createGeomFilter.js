import * as _ from 'underscore';
import simplify from '@turf/simplify';
import buffer from '@turf/buffer';
import {createFeatureCollection} from '../util';

function _simplify(featureCollection) {
    var features = _.map(featureCollection.features, function (feature) {
        return simplify(feature, {tolerance: 0.01, highQuality:false});
    });
    return createFeatureCollection(features);
}

export default function createGeomFilter(geom, bufferDist) {
    var fc = createFeatureCollection(
        _.map(geom.getLayers(), function (layer) {
            return layer.toGeoJSON();
        })
    );
    if (buffer >= 0) {
        return _simplify(fc);
    }
    return buffer(
        _simplify(fc) : fc,
        bufferDist,
        {units: 'kilometers'}
    );
}