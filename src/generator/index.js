/* eslint max-len: off*/
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as _ from 'underscore';
import {Collapse} from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

import knreise_logo from '../images/knreise_logo.png';
import '../css/generator.css';

import {getCountyList, getMunicipalityList} from './api';
import datasetList from '../datasets/datasetList';

import BasicInfo from './BasicInfo';
import AreaChooser from './AreaChooser';
import DatasetChooser from './DatasetChooser';
import BackgroundMapChooser from './BackgroundMapChooser';
import LinkDisplayer from './LinkDisplayer';

function CollapsePanel(props) {
    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h4 className="panel-title">
                    <button type="button" className="btn btn-link toggle-btn" onClick={ () => props.toggle(props.id)}>
                        <span className="fa-stack fa-lg">
                            <i className="fa fa-circle fa-stack-2x"></i>
                            <i className="fa fa-inverse fa-stack-1x">{props.number}</i>
                        </span> {props.text}
                    </button>
                </h4>
            </div>
            <Collapse isOpen={props.isOpen} onEntered={props.onEntered} onExited={props.onExited}>
                {props.children}
            </Collapse>
        </div>
    );
}


class Generator extends Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.toggleSection = this.toggleSection.bind(this);
        this.state = {
            config: {
                title: null,
                description: null,
                area: {},
                datasets: [],
                maplayer: 'norges_grunnkart_graatone'
            },
            openSection: null,
            counties: null,
            municipalities: null,
            bboxMapPanelOpen: false,
            layerMapOpen: false
        };
    }

    componentDidMount() {
        getCountyList((err, data) => this.setState({counties: !!data ? data : []}));
        getMunicipalityList((err, data) => this.setState({municipalities: !!data ? data : []}));
    }

    onChange(key, value) {
        var newData = {};
        if (key) {
            newData[key] = value;
        }
        this.setState({
            config: _.extend({}, this.state.config, newData)
        });
    }

    toggleSection(section) {
        this.setState({
            openSection: (this.state.openSection === section) ? null : section
        });
    }

    render() {
        return (
            <div>
                <div className="well">
                    <img src={knreise_logo} alt="Knreise logo"/>
                    <h2>Sett opp ditt eget kart</h2>
                    <div>
                       Dette er et grensesnitt for å sette opp egendefinerte kart med utvalgt informasjon fra ulike datasett med stedfestet kulturhistorie, naturinformasjon, historiske kilder og leksikalsk informasjon. Tjenesten er utviklet med bistand fra <a href="http://norkart.no">Norkart</a> i regi av <a href="http://kulturognaturreise.no">Kultur- og naturreise</a> - koden som er brukt ligger på <a href="https://github.com/knreise/demonstratorer/">GitHub</a> og det finnes også flere eksempler på <a href="../">ferdig definerte kart</a>.
                    </div>
                </div>
                <BasicInfo config={this.state.config} onChange={this.onChange} />
                <form autoComplete="off">
                    <div className="panel-group">
                        <CollapsePanel
                            id="area"
                            toggle={this.toggleSection}
                            number={1}
                            onEntered={() => this.setState({bboxMapPanelOpen: true})}
                            onExited={() => this.setState({bboxMapPanelOpen: false})}
                            text="Velg område"
                            isOpen={this.state.openSection === 'area'}>
                            <AreaChooser
                                mapPanelOpen={this.state.bboxMapPanelOpen}
                                counties={this.state.counties}
                                municipalities={this.state.municipalities}
                                config={this.state.config}
                                onChange={this.onChange} />
                        </CollapsePanel>
                        <CollapsePanel
                            id="dataset"
                            toggle={this.toggleSection}
                            number={2}
                            text="Velg datasett"
                            isOpen={this.state.openSection === 'dataset'}>
                            <DatasetChooser
                                datasets={this.props.datasets}
                                config={this.state.config}
                                onChange={this.onChange} />
                        </CollapsePanel>
                        <CollapsePanel
                            id="map"
                            toggle={this.toggleSection}
                            number={3}
                            onEntered={() => this.setState({layerMapPanelOpen: true})}
                            onExited={() => this.setState({layerMapPanelOpen: false})}
                            text="Velg bakgrunnskart"
                            isOpen={this.state.openSection === 'map'}>
                            <BackgroundMapChooser
                                mapPanelOpen={this.state.layerMapPanelOpen}
                                config={this.state.config}
                                onChange={this.onChange} />
                        </CollapsePanel>
                    </div>
                    <LinkDisplayer config={this.state.config} />
                </form>
            </div>
        );
    }
};


ReactDOM.render(
    <Generator
        datasets={datasetList}
    />,
    document.getElementById('root')
);
