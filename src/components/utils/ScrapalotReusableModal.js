import React from "react";
import {Button, Form, Modal, Spinner} from "react-bootstrap";

import themes from '../themes/CustomThemeProvider.module.css';

const ScrapalotReusableModal = ({show, handleClose, darkMode, title, body, onSubmit, loading}) => (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header style={{borderRadius: '0'}} closeButton className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}>
            <Form onSubmit={onSubmit}>
                {body}
                <Button variant="primary" className={`mt-3`} type="submit">
                    {loading ? <Spinner animation="border" size="sm"/> : 'Submit'}
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
);

export default ScrapalotReusableModal;
