import React from "react";
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import styles from './Scratchpad.module.css';

const Scratchpad = (props) => {

    // toolbar

    const renderExpandTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            expand scratchpad
        </Tooltip>
    );

    return (
        <div style={{padding: '8px', height: 'calc(100vh - 134px)'}}>
            <div className={styles.scratchpadToolbar}>
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderExpandTooltip}
                >
                    <button onClick={props.handleExpandScratchpad} style={{border: 'none', background: 'none'}}>
                        <i className="bi bi-box-arrow-left"></i>
                    </button>
                </OverlayTrigger>
            </div>
        </div>
    );

}

export default Scratchpad;