import React, {useContext, useEffect, useState} from "react";
import {Button, Col, Dropdown, Form, Nav, Navbar, Row} from "react-bootstrap";
import axios from 'axios';
import {ScrapalotLoadingContext} from '../../utils/ScrapalotLoadingContext';

import styles from "./MainHeader.module.css"
import themes from "../../themes/CustomThemeProvider.module.css"

import logo from '../../../static/img/logo-icon.png';
import ScrapalotReusableModal from '../../utils/ScrapalotReusableModal';
import {useTheme} from '../../themes/ScrapalotThemeContext';

function MainHeader({onSelectDatabase, selectedDatabase, selectedDocument, databases}) {

    const {darkMode, toggleTheme} = useTheme();

    // loading
    const {loading, setLoading} = useContext(ScrapalotLoadingContext);

    const [search, setSearch] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [currentDatabaseCollections, setCurrentDatabaseCollections] = useState([]);
    const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);
    const [isNewDatabaseModalOpen, setIsNewDatabaseModalOpen] = useState(false);
    const [newDatabaseName, setNewDatabaseName] = useState("");
    const [step, setStep] = useState(0);

    const handleUploadClose = () => setIsUploadModalOpen(false);
    const handleUploadModal = () => {
        const databaseToSelect = databases.find(db => db.name === selectedDatabase) || databases[0];
        if (databaseToSelect) {
            onSelectDatabase(databaseToSelect.name);
            setCurrentDatabaseCollections(databaseToSelect.collections);
            setSelectedCollection(databaseToSelect.collections[0]?.name || null);
        }
        setIsUploadModalOpen(true);
    };

    const filteredDatabases = databases.filter(database =>
        database.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const acceptedFiles = files.filter(file => ['application/pdf'].includes(file.type));
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        } else {
            alert('Please select only PDF files');
        }
    };

    const handleNewDatabaseModalOpen = () => {
        setIsNewDatabaseModalOpen(true);
    };

    const handleNewDatabaseModalClose = () => {
        setIsNewDatabaseModalOpen(false);
    };

    const handleNewDatabaseNameChange = (e) => {
        setNewDatabaseName(e.target.value);
    };

    const createNewDatabase = (e) => {
        e.preventDefault();
        setLoading(true);
        const url = `${process.env.REACT_APP_API_BASE_URL}/database/${newDatabaseName}/new`;
        axios.post(url)
            .then(_ => {
                setLoading(false);
                alert('Database created!');
                setStep(1);
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            });
    };

    const submitUploadForm = (e) => {
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
                handleUploadClose();
                alert('Ingestion complete!');
                e.target.reset();
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            })
    };

    const submitNewDatabaseUpload = (e) => {
        e.preventDefault();
        setLoading(true);
        const url = `${process.env.REACT_APP_API_BASE_URL}/upload`;
        const formData = new FormData();
        formData.append('files', file);
        formData.append('database_name', newDatabaseName);

        axios.post(url, formData)
            .then(_ => {
                setLoading(false);
                handleNewDatabaseModalClose();
                alert('Ingestion complete!');
                e.target.reset();
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            });
    }

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

    useEffect(() => {
        document.body.onclick = () => {
            setIsDatabaseDropdownOpen(false);
        }
    }, []);

    // selected document name

    const documentName = selectedDocument ? selectedDocument.name : '';
    const truncatedDocumentName = documentName.length > 80
        ? `${documentName.substring(0, 80)}...`
        : documentName;

    const style = {
        fontSize: '0.8em',
        fontVariant: 'petite-caps',
        color: darkMode ? 'white' : 'black',
        textAlign: 'left',
        width: '100%'
    };

    return (
        <Navbar expand="lg" style={{maxHeight: '57px'}} className={`'px-2' ${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}>
            <Navbar.Brand href="/">
                <img style={{marginLeft: '14px'}}
                     alt="Scrapalot Logo"
                     src={logo}
                     width="30"
                     height="30"
                     className={'d-inline-block align-top'}
                />{" "}
                <span className={`${darkMode ? themes.darkThemeDefault : ''}`} style={{fontVariantCaps: 'all-small-caps'}}>Scrapalot</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="justify-content-end">
                    <Dropdown className={'me-1'}>
                        <Dropdown.Toggle id="dropdown-settings" as="div">
                            <Button variant="outline-primary" style={{textAlign: 'right'}}>
                                <i className="bi bi-gear"></i>
                                &nbsp;&nbsp;
                                Settings
                            </Button>
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{maxHeight: '500px', overflow: 'auto'}}>
                            <Dropdown.Item key="0">
                                <>
                                    <i className="bi bi-robot"></i>
                                    &nbsp;&nbsp;Configure AI
                                </>
                            </Dropdown.Item>
                            <Dropdown.Item key="1" onClick={handleNewDatabaseModalOpen}>
                                <>
                                    <i className="bi bi-database-add"></i>
                                    &nbsp;&nbsp;New Database
                                </>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown className={'me-1'}>
                        <Dropdown.Toggle id="dropdown-basic" as="div">
                            <Button variant="outline-primary" style={{textAlign: 'right'}}>
                                <i className={`bi bi-database-down`}></i>
                                &nbsp;&nbsp;
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
                </Nav>
                {truncatedDocumentName && (
                    <div style={style}>
                        <i className="bi bi-arrow-right-short"></i>
                        &nbsp;&nbsp;
                        {truncatedDocumentName}
                    </div>
                )}
                <div className={`${styles.mainHeaderToolbar}`}>
                    {darkMode ? (
                        <i className={`bi bi-brightness-high-fill ${styles.mainHeaderToolbarIconDark}`} onClick={toggleTheme}></i>
                    ) : (
                        <i className={`bi bi-moon-fill ${styles.mainHeaderToolbarIconLight}`} onClick={toggleTheme}></i>
                    )}
                </div>
                <Button variant="outline-primary" className={'me-2'} onClick={handleUploadModal}>
                    upload
                    &nbsp;&nbsp;<i className="bi bi-upload"></i>
                </Button>

                <ScrapalotReusableModal
                    show={isUploadModalOpen}
                    handleClose={handleUploadClose}
                    darkMode={darkMode}
                    title="Upload files"
                    body={
                        <>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Select a File (pdf)</Form.Label>
                                <Form.Control type="file" accept=".pdf" onChange={handleFileChange}/>
                            </Form.Group>
                            <Row className={'mb-4'}>
                                <Col>
                                    <Form.Group controlId="formDatabase">
                                        <Form.Label>Select a Database</Form.Label>
                                        <Form.Control as="select" defaultValue={selectedDatabase} onChange={e => onSelectDatabase(e.target.value)}>
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
                        </>
                    } // Pass the form fields here
                    onSubmit={submitUploadForm}
                    loading={loading}
                />

                <ScrapalotReusableModal
                    show={isNewDatabaseModalOpen}
                    handleClose={handleNewDatabaseModalClose}
                    darkMode={darkMode}
                    themes={themes}
                    title="Create New Database"
                    body={
                        <>
                            {step === 0 && (
                                <>
                                    <Form.Group controlId="newDatabaseName">
                                        <Form.Label>New Database Name</Form.Label>
                                        <Form.Control type="text" value={newDatabaseName} onChange={handleNewDatabaseNameChange}/>
                                    </Form.Group>
                                </>
                            )}
                            {step === 1 && (
                                <>
                                    <Form.Group controlId="formFile" className="mb-3">
                                        <Form.Label>Select a File (pdf)</Form.Label>
                                        <Form.Control type="file" accept=".pdf" onChange={handleFileChange}/>
                                    </Form.Group>
                                </>
                            )}
                        </>
                    }
                    onSubmit={step === 0 ? createNewDatabase : submitNewDatabaseUpload}
                    loading={loading}
                />

            </Navbar.Collapse>
        </Navbar>
    );
}

export default MainHeader;
