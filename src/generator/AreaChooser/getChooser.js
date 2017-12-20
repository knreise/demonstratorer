import React from 'react';
import * as _ from 'underscore';

export default function getChooser(type, listName, keyAttr, valueAttr) {
    return function Chooser(props) {
        return (
            <select
                className="form-control"
                multiple
                disabled={!props.checked}
                value={(props.checked && props.config.area.type === type && props.config.area.value)
                    ? props.config.area.value
                    : []
                }
                onChange={(e) => props.onChange(
                    type,
                    _.map(e.target.selectedOptions, (o) => o.value)
                )}
                size="10">
                {_.map(props[listName], function (el) {
                    return (
                        <option
                            key={el[keyAttr]}
                            value={el[keyAttr]}>
                            {el[valueAttr]}
                        </option>
                    );
                })}
            </select>
        );
    };
}