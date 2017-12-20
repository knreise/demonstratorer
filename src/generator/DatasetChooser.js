import React, {Component} from 'react';
import * as _ from 'underscore';

function Dataset(props) {
    var emneord;
    if (props.dataset.allowTopic) {
        emneord = (
            <p className="list-group-item-text" style={{paddingTop: '5px'}}>
                <input
                    className="form-control input-sm"
                    type="text"
                    value={props.topics || ''}
                    onChange={e => props.setTopics(props.dataset.id, e.target.value)}
                    placeholder="emneord"
                    disabled={!props.selected} />
            </p>
        );
    }
    return (
        <div className="list-group-item" style={{float: 'left', height: '135px', width: '360px'}}>
            <div className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={props.selected}
                        onChange={e => props.toggleDataset(props.dataset.id, e.target.checked)}
                        className="checkbox-primary"/>
                    <b>{props.dataset.name}</b>
                </label>
            </div>
            <p className="list-group-item-text">
                {props.dataset.description}
            </p>
            {emneord}
        </div>
    );
}



export default class DatasetChooser extends Component {

    constructor(props) {
        super(props);
        this.toggleDataset = this.toggleDataset.bind(this);
        this.setTopics = this.setTopics.bind(this);
    }

    toggleDataset(datasetId, isSelected) {
        var selected = _.clone(this.props.config.datasets);
        var exists = _.findWhere(selected, {id: datasetId});

        if (isSelected && !exists) {
            selected.push({id: datasetId});
        } else if (!isSelected && exists) {
            selected = _.reject(selected, d => d.id === datasetId);
        }
        this.props.onChange('datasets', selected);
    }

    setTopics(datasetId, topics) {
        var selected = _.map(this.props.config.datasets, function (ds) {
            if (ds.id === datasetId) {
                ds.topics = topics;
            }
            return ds;
        });
        this.props.onChange('datasets', selected);
    }

    render() {
        var selected = this.props.config.datasets.map(d => d.id);
        return (
            <div>
                <div className="panel-body">
                    <div id="datasets" className="list-group">
                        {_.chain(this.props.datasets)
                            .map(function (dataset, key) {
                                return {
                                    id: key,
                                    name: dataset.name || key,
                                    allowTopic: dataset.allowTopic,
                                    description: dataset.description || 'Ingen beskrivelse',
                                    hideFromGenerator: _.has(dataset, 'hideFromGenerator')
                                        ? dataset.hideFromGenerator
                                        : false
                                };
                            })
                            .reject(d => d.hideFromGenerator)
                            .map(function (dataset) {
                                var isSelected = selected.indexOf(dataset.id) > -1;
                                return (
                                    <Dataset
                                        toggleDataset={this.toggleDataset}
                                        topics={isSelected ? _.findWhere(this.props.config.datasets, {id: dataset.id}).topics : ''}
                                        setTopics={this.setTopics}
                                        selected={isSelected}
                                        key={dataset.id}
                                        dataset={dataset}/>
                                );
                            }, this)
                            .value()
                        }
                    </div>
                </div>
            </div>
        );
    }
}