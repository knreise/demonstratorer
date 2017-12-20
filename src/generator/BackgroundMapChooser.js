import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'tilelayer-kartverket';

class Map extends Component {

    componentDidMount() {
        this.map = L.map(ReactDOM.findDOMNode(this)).setView([61.3, 8.7], 10)
        this.layer = L.tileLayer.kartverket(this.props.layer).addTo(this.map);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.layer !== this.props.layer) {
            this.map.removeLayer(this.layer);
            this.layer = L.tileLayer.kartverket(this.props.layer).addTo(this.map);
        }
        if (prevProps.mapPanelOpen !== this.props.mapPanelOpen) {
            this.map.invalidateSize();
        }
    }

    render() {
        return (
            <div className="map"></div>
        );
    }

}


export default function BackgroundMapChooser(props) {
    return (
        <div>
            <div className="panel-body">
                <select
                    className="form-control"
                    value={props.config.maplayer}
                    onChange={e => props.onChange('maplayer', e.target.value)} >
                    {L.tileLayer.kartverket.getLayers().map(function (layerId) {
                        return (
                            <option key={layerId} value={layerId}>
                                {L.tileLayer.kartverket.getLayerName(layerId)}
                            </option>
                        );
                    })}
                </select>
                <Map
                    layer={props.config.maplayer}
                    mapPanelOpen={props.mapPanelOpen}/>
            </div>
        </div>
    );
}