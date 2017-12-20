import React from 'react';
import * as _ from 'underscore';

export default function LineChooser(props) {

    var defaultLine = {line: '', buffer: 2, color: '#0033ff'};

    var value;
    if (props.checked) {
        value = _.extend({}, defaultLine, props.config.area.value);
    } else {
        value = {line: '', buffer: '', color: ''};
    }

    function onChange(key, value) {
        var newData = {};
        newData[key] = value;
        props.onChange('line', _.extend({}, defaultLine, props.config.area.value, newData));
    }

    return (
        <div>
            <input
                type="text"
                className="form-control"
                placeholder="Linje"
                onChange={(e) => onChange('line', e.target.value)}
                disabled={!props.checked}
                value={value.line} />
            <span className="help-block">For linjer fra ut.no: bruk formen utno/id</span>
            <h5>Buffer (km)</h5>
            <input
                type="number"
                className="form-control"
                onChange={(e) => onChange('buffer', e.target.value)}
                disabled={!props.checked}
                value={value.buffer} />
            <h5>Linjefarge (hex)</h5>
            <input
                type="text"
                className="form-control"
                onChange={(e) => onChange('color', e.target.value)}
                disabled={!props.checked}
                value={value.color} />
        </div>
    );
}