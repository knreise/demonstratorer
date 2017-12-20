import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'tilelayer-kartverket';
import '../../map/boundsUtil';
import {round} from '../../util';
import {freezeMap, unFreezeMap} from '../../map';

class BboxMap extends Component {

    componentDidMount() {
        this.map = L.map(ReactDOM.findDOMNode(this)).fitBounds(L.latLngBounds.fromBBoxString(this.props.defaultBbox));
        L.tileLayer.kartverket('norges_grunnkart_graatone').addTo(this.map);
        //this.updateBbox();
        if (!this.props.enabled) {
            freezeMap(this.map);
        }
    }

    updateBbox() {
        if (this.rect) {
            this.map.removeLayer(this.rect);
            this.rect.off('edit');
        }
        if (this.props.bbox) {
            var bounds = L.latLngBounds.fromBBoxString(this.props.bbox);
            this.rect = L.rectangle.fromBounds(bounds);
            this.rect.setStyle({fill: false, color: '#f00', weight: 3});
            this.rect.addTo(this.map);
            this.map.fitBounds(bounds);
        }
        if (this.props.enabled) {
            this.rect.editing.enable();
            this.rect.on('edit', () => this.props.onChange(this.rect.getBounds().toBBoxString()));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.mapPanelOpen !== this.props.mapPanelOpen) {
            this.map.invalidateSize();
            this.map.fitBounds(L.latLngBounds.fromBBoxString(this.props.bbox || this.props.defaultBbox))
        }
        if (prevProps.bbox !== this.props.bbox) {
            this.updateBbox();
        }
        if (prevProps.enabled !== this.props.enabled) {
            if (this.props.enabled) {
                unFreezeMap(this.map);
            } else {
                freezeMap(this.map);
            }
        }
    }

    render() {
        return (
            <div className="map"></div>
        );
    }

}

function roundBbox(bbox) {
    return bbox.split(',').map(bbox => round(parseFloat(bbox), 4)).join(',');
}


export default function BboxChooser(props) {
    var value = '';
    if (props.checked && props.config.area.type === 'bbox') {
        value = !!props.config.area.value
            ? props.config.area.value
            : props.defaultBbox;
    }

    return (
        <div>
            <input
                type="text"
                className="form-control"
                disabled={!props.checked}
                onChange={e => props.onChange('bbox', roundBbox(e.target.value))}
                value={value}/>
            <BboxMap
                bbox={value}
                defaultBbox={props.defaultBbox}
                onChange={bbox => props.onChange('bbox', roundBbox(bbox))}
                enabled={props.checked}
                mapPanelOpen={props.mapPanelOpen} />
        </div>
    );
}