import React, {useContext} from 'react';
import ReactDOM from 'react-dom';
import {Spinner} from 'react-bootstrap';
import {ScrapalotLoadingContext} from './ScrapalotLoadingContext';

const ScrapalotSpinner = () => {
    const { loading } = useContext(ScrapalotLoadingContext);

    if (!loading) return null;

    return ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999' }}>
            <Spinner animation="border" variant="dark" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>,
        document.getElementById('scrapalot-loading')
    );
};

export default ScrapalotSpinner;
