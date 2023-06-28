import React, {useEffect, useState} from "react";
import {Button, Col, Dropdown, Form, Modal, Nav, Navbar, Row, Spinner} from "react-bootstrap";
import axios from 'axios';

import logo from '../../../static/img/logo-icon.png'; // telling webpack this JS file uses this image

function MainHeader({onSelectDatabase, selectedDatabase, databases}) {
    const [search, setSearch] = useState('');
    const [show, setShow] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [currentDatabaseCollections, setCurrentDatabaseCollections] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        // Ensure the first database and its first collection are always selected when the modal opens.
        const firstDatabase = databases[0];
        if (firstDatabase) {
            onSelectDatabase(firstDatabase.name);
            setCurrentDatabaseCollections(firstDatabase.collections);
            setSelectedCollection(firstDatabase.collections[0]?.name || null);
        }
        setShow(true);
    };

    const filteredDatabases = databases.filter(database =>
        database.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const acceptedFiles = files.filter(file => ['application/pdf', 'application/epub+zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type));
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        } else {
            alert('Please select only PDF, EPUB or DOCX files');
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        setLoading(true);
        const url = `${process.env.REACT_APP_API_BASE_URL}/upload`;
        const formData = new FormData();
        formData.append('files', file);
        formData.append('database_name', selectedDatabase);
        if (selectedCollection) {
            formData.append('collection_name', selectedCollection);
        }

        axios.post(url, formData)
            .then(_ => {
                setLoading(false);
                handleClose();
                alert('Ingestion complete!');
                e.target.reset();
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            })
    };

    useEffect(() => {
        if (selectedDatabase) {
            const selectedDb = databases.find(db => db.name === selectedDatabase);
            if (selectedDb && selectedDb.collections) {
                setCurrentDatabaseCollections(selectedDb.collections);
                setSelectedCollection(selectedDb.collections[0]?.name || null);  // select the first collection by default
            } else {
                setSelectedCollection(null);  // clear the selected collection if there are no collections
            }
        }
    }, [selectedDatabase, databases]);

    return (
        <Navbar bg="light" expand="lg" className={'px-2'}>
            <Navbar.Brand href="#home">
                <img
                    alt="Scrapalot Logo"
                    src={logo}
                    width="30"
                    height="30"
                    className={'d-inline-block align-top'}
                />{" "}
                Scrapalot
            </Navbar.Brand>
            <Dropdown className={'me-1'}>
                <Dropdown.Toggle variant="light" id="dropdown-basic" as="div">
                    <Button variant="light" style={{textAlign: 'right'}}>
                        {selectedDatabase || 'Select Database'}
                    </Button>
                </Dropdown.Toggle>

                <Dropdown.Menu style={{maxHeight: '500px', overflow: 'auto'}}>
                    <Dropdown.Item as="div">
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown.Item>

                    {filteredDatabases.map((db, index) =>
                        <Dropdown.Item key={index} onClick={() => onSelectDatabase(db.name)} href={`#/book-${index + 1}`}>{db.name}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="justify-content-end" style={{width: "100%"}}>
                    <Button variant="outline-primary" className={'mx-1'} onClick={handleShow}>Upload</Button>
                </Nav>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Upload files</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={submitForm}>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Select a File</Form.Label>
                                <Form.Control type="file" accept=".pdf,.epub,.docx" onChange={handleFileChange}/>
                            </Form.Group>
                            <Row className={'mb-4'}>
                                <Col>
                                    <Form.Group controlId="formDatabase">
                                        <Form.Label>Select a Database</Form.Label>
                                        <Form.Control as="select" onChange={e => onSelectDatabase(e.target.value)}>
                                            {databases.map((db, index) =>
                                                <option key={index} value={db.name}>{db.name}</option>
                                            )}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                {currentDatabaseCollections.length > 0 && (
                                    <Col>
                                        <Form.Group controlId="formCollection">
                                            <Form.Label>Select a Collection</Form.Label>
                                            <Form.Control as="select" onChange={e => setSelectedCollection(e.target.value)}>
                                                {currentDatabaseCollections.map((collection, index) =>
                                                    <option key={index} value={collection.name}>{collection.name}</option>
                                                )}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                )}
                            </Row>
                            <Button variant="primary" type="submit">
                                {loading ? <Spinner animation="border" size="sm"/> : 'Submit'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default MainHeader;
