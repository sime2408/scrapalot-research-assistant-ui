import React, {useState} from 'react';
import {Button, Modal} from 'react-bootstrap';

const Footnote = ({index, link, content, selectedDocument, setSelectedDocument}) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = (fileName) => {
        setSelectedDocument({name: fileName});
        setShow(true);
    };

    // Extract the file name from the link
    const fileName = link.split('/').pop();

    return (
        <>
            <sup style={{cursor: 'pointer'}} className={'mt-1 me-1'} onClick={() => handleShow(fileName)}>
                [{index}]
            </sup>

            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header style={{padding: '10px'}}>
                    <Modal.Title style={{fontSize: '0.85rem'}}>{fileName}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{padding: '10px', fontSize: '0.90rem'}}>{content}</Modal.Body>
                <Modal.Footer style={{padding: '10px'}}>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Footnote;
