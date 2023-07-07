import React from "react";
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import styles from './Scratchpad.module.css';

const Scratchpad = (props) => {

    // toolbar

    return (
        <div style={{padding: '8px', height: 'calc(100vh - 134px)'}}>
            <div className={styles.scratchpadToolbar}>

            </div>
        </div>
    );

}

export default Scratchpad;