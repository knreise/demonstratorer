import React, {Component} from 'react';


import Column from './Column';
import getChooser from './getChooser';
import LineChooser from './LineChooser';
import BboxChooser from './BboxChooser';
var MunicipalityChooser = getChooser('komm', 'municipalities', 'komm', 'navn');
var CountyChooser = getChooser('fylke', 'counties', 'fylkesnr', 'navn');

var defaultBbox = '2.4609,56.9449,33.3984,71.8562';

export default class AreaChooser extends Component {

    constructor(props) {
        super(props);
        this.toggleType = this.toggleType.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            activeType: 'komm'
        };
    }

    toggleType(type) {
        this.setState({activeType: type});
        if (type === 'bbox') {
            this.props.onChange('area', {type: type, value: defaultBbox});
        } else {
            this.props.onChange('area', {type: type, value: null});
        }
    }

    onChange(key, value) {
        this.props.onChange('area', {type: key, value: value});
    }

    render() {
        return (
            <div>
                <div className="panel-body">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                Velg område du vil vise innhold fra - velge enten kommune, fylke, linje/rute eller definer ditt eget område i kartet.
                            </div>
                        </div>
                    </div>

                    <div className="container-fluid">
                        <div className="row">
                            <Column
                                name="Kommune"
                                onChange={() => this.toggleType('komm')}
                                checked={this.state.activeType === 'komm'}>
                                <MunicipalityChooser
                                    onChange={this.onChange}
                                    municipalities={this.props.municipalities}
                                    config={this.props.config}
                                    checked={this.state.activeType === 'komm'}/>
                            </Column>
                            <Column
                                name="Fylke"
                                onChange={() => this.toggleType('fylke')}
                                checked={this.state.activeType === 'fylke'}>
                                <CountyChooser
                                    onChange={this.onChange}
                                    counties={this.props.counties}
                                    config={this.props.config}
                                    checked={this.state.activeType === 'fylke'}/>
                            </Column>
                            <Column
                                name="Linje"
                                onChange={() => this.toggleType('line')}
                                checked={this.state.activeType === 'line'}>
                                <LineChooser
                                    onChange={this.onChange}
                                    config={this.props.config}
                                    checked={this.state.activeType === 'line'} />
                            </Column>
                            <Column
                                name="Område i kart"
                                onChange={() => this.toggleType('bbox')}
                                checked={this.state.activeType === 'bbox'}>
                                <BboxChooser
                                    defaultBbox={defaultBbox}
                                    mapPanelOpen={this.props.mapPanelOpen}
                                    onChange={this.onChange}
                                    config={this.props.config}
                                    checked={this.state.activeType === 'bbox'} />

                            </Column>
                        </div>
                    </div>
                </div>
          </div>
        );
    }
}
