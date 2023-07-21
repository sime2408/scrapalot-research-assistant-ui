import React, {useContext} from 'react';
import ReactDOM from 'react-dom';
import {Spinner} from 'react-bootstrap';
import {ScrapalotLoadingContext} from './ScrapalotLoadingContext';

const ScrapalotSpinner = (props) => {
    const {loading} = useContext(ScrapalotLoadingContext);

    if (!loading) return null;

    return ReactDOM.createPortal(
        <div style={{position: 'fixed', top: '29px', right: '143px', transform: 'translate(-50%, -50%)', zIndex: '9999'}}>
            <Spinner animation="border" variant={props.darkMode ? "light" : "dark"} role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>,
        document.getElementById('scrapalot-loading')
    );
};

export default ScrapalotSpinner;
