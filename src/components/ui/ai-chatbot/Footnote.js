import React, {useState} from 'react';
import {Button, Modal} from 'react-bootstrap';

const Footnote = ({index, link, content, page, setSelectedDatabase, setSelectedDocument, onFootnoteClick}) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = (databaseName, fileName) => {
        setSelectedDocument({name: fileName});
        setSelectedDatabase(databaseName)
        handleClick(page); // Navigate to the page related to this footnote
        setShow(true);

    };

    const handleClick = (pageNumber) => {
        // Other click handling code...
        // Call the callback function with the desired page number
        onFootnoteClick(pageNumber - 1); // subtract 1 because PDF.js uses zero-based index
    };

    // Extract the database and file name from the link
    const pathArray = link.split(new RegExp('\\\\|/'));
    const fileName = pathArray.pop();
    const databaseName = pathArray.pop();

    return (
        <>
            <sup style={{cursor: 'pointer'}} className={'mt-1 me-1'} onClick={() => handleShow(databaseName, fileName)}>
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
