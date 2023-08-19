import React from "react";
import {Button, Form, Modal, Spinner} from "react-bootstrap";

import themes from '../themes/CustomThemeProvider.module.css';

const ScrapalotReusableModal = (props) => (
    <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header style={{borderRadius: '0'}} closeButton className={`${props.darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${props.darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}>
            <Form onSubmit={props.onSubmit}>
                {props.body}
                <Button variant="primary" className={`mt-3`} type="submit">
                    {props.loading ? <Spinner animation="border" size="sm"/> : 'Submit'}
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
);

export default ScrapalotReusableModal;
