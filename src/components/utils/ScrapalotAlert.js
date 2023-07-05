import React from 'react';
import {Alert} from 'react-bootstrap';

const ScrapalotAlert = ({message, onClose}) => {
    const alertStyle = {
        position: "fixed",
        top: "165px",
        left: "45%",
        transform: "translate(-50%, -50%)",
        zIndex: "10000",
        width: '400px',
        maxWidth: '600px'
    };
    return (
        <Alert variant="danger" onClose={onClose} dismissible style={alertStyle}>
            {message}
        </Alert>
    );
};

export default ScrapalotAlert;
