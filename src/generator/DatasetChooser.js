import React, {Component} from 'react';
import * as _ from 'underscore';

function FilterList(props) {
    if (!props.dataset.filterOptions) {
        return null;
    }
    var filters = props.filters || {};
    return (
        <p className="list-group-item-text" style={{paddingTop: '5px'}}>
            {_.map(props.dataset.filterOptions.filterVariables, function (f) {
                return (
                    <input
                        className="form-control input-sm"
                        type="text"
                        value={filters[f] || ''}
                        onChange={e => props.setFilter(props.dataset.id, f, e.target.value)}
                        style={{'marginBottom': '3px'}}
                        placeholder={f}
                        key={f}
                        disabled={!props.selected} />
                );
            })}
        </p>
    );
}

function Dataset(props) {

    return (
        <div className="list-group-item" style={{float: 'left', height: '145px', width: '360px'}}>
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
            <FilterList
                dataset={props.dataset}
                setFilter={props.setFilter}
                filters={props.filters}
                selected={props.selected} />
        </div>
    );
}



export default class DatasetChooser extends Component {

    constructor(props) {
        super(props);
        this.toggleDataset = this.toggleDataset.bind(this);
        this.setFilter = this.setFilter.bind(this);
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

    setFilter(datasetId, filterId, filters) {
        var selected = _.map(this.props.config.datasets, function (ds) {
            if (ds.id === datasetId) {
                if (!ds.filters) {
                    ds.filters = {};
                }
                ds.filters[filterId] = filters;
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
                                    filterOptions: dataset.filterOptions,
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
                                        filters={isSelected ? _.findWhere(this.props.config.datasets, {id: dataset.id}).filters : {}}
                                        setFilter={this.setFilter}
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