import React from 'react';

function trim(str, length) {
    if (str.length > length) {
        return str.substring(0, length);
    }
    return str;
}

export default function BasicInfo(props) {
    return (
        <div className="panel panel-default" style={{border: '0px'}}>
            <div className="panel-body">
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Navn på kart"
                        onChange={e => props.onChange('title', e.target.value)}
                        value={props.config.title ? props.config.title : ''} />
                </div>
                <div className="form-group">
                    <textarea
                        className="form-control"
                        placeholder="Beskrivelse av demonstrator (maks 140 tegn)..."
                        rows="3"
                        maxLength="140"
                        onChange={e => props.onChange('description', trim(e.target.value, 140))}
                        value={props.config.description ? props.config.description : ''} />
                </div>
            </div>
        </div>
    );
}