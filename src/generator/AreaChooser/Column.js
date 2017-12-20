import React from 'react';

export default function Column(props) {
    return (
        <div className="col-md-3">
            <h3>
                <input
                    onChange={props.onChange}
                    type="radio"
                    checked={props.checked}/>
                {' '}{props.name}
            </h3>
            {props.children}
        </div>
    );
}