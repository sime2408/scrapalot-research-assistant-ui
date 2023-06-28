import React from 'react';
import {Spinner} from 'react-bootstrap';

const CustomSpinner = () => (
    <div style={{position: 'fixed', top: '50%', left: '45%', zIndex: '9999'}}>
        <Spinner animation="border" variant="dark" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
);

export default CustomSpinner;
