import React, {useCallback, useEffect, useRef, useState} from "react";
import {Accordion, Card, FormControl, InputGroup, ListGroup, Overlay, OverlayTrigger, Tooltip} from "react-bootstrap";
import styles from "./BrowseDocumentsSidebar.module.css";
import ScrapalotToggle from '../../utils/ScrapalotToggle';
import themes from '../../themes/CustomThemeProvider.module.css';

function BrowseDocumentsSidebar({onSearch, setSelectedDocument, onSelectDatabase, selectedDatabase, searchTerm, databases, setSelectedDocumentInitialPage, darkMode, handleExpandSidebar, isDocumentBrowserVisible}) {

    // what happens when you click on the sidebar database/collection name
    const [openDatabase, setOpenDatabase] = useState('0');
    const [openCollection, setOpenCollection] = useState(null);
    // loaded documents on database/collection click
    const [documents, setDocuments] = useState([]);
    // Fetch abort controller
    const abortController = new AbortController();

    // this one refreshes the database if it's selected from other components
    useEffect(() => {
        if (selectedDatabase) {
            fetchDatabaseDocuments(selectedDatabase);
        }
        // Clean up function
        return () => {
            abortController.abort();
        };
    }, [selectedDatabase, databases]);

    const fetchDatabaseDocuments = useCallback((databaseName, retryCount = 5, interval = 2000) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}/database/${databaseName}`;
        fetch(url, {signal: abortController.signal})  // Added signal option to listen to abort events
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setDocuments(data);
                const index = databases.findIndex(db => db.name === databaseName);
                if (index !== -1) {
                    setOpenDatabase(index.toString());
                    onSelectDatabase(databaseName);  // Update the selectedDatabase state
                }
            })
            .catch(error => {
                if (retryCount > 0) {
                    console.log(`Retrying in ${interval}ms... (${retryCount} tries left)`);
                    setTimeout(() => fetchDatabaseDocuments(databaseName, retryCount - 1, interval), interval);
                } else {
                    if (error.name === 'AbortError') {
                        console.log('Fetch cancelled');
                    } else {
                        console.error('Error:', error);
                        // Display error message to user...
                    }
                }
            });
    }, [databases, onSelectDatabase, abortController.signal]);

    useEffect(() => {
        if (documents.length > 0) {
            //setIsLoading(false);
        }
    }, [documents /*,setIsLoading*/]);

    const fetchCollectionDocuments = (databaseName, collectionName) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}/database/${databaseName}/collection/${collectionName}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                setDocuments(data);
                const dbIndex = databases.findIndex(db => db.name === databaseName);
                const collectionIndex = databases[dbIndex].collections.findIndex(collection => collection.name === collectionName);
                if (dbIndex !== -1 && collectionIndex !== -1) {
                    setOpenCollection(`${dbIndex}_${collectionIndex}`);
                }
            })
            .catch(error => console.error('Error:', error));
    };

    // Helper function to determine the appropriate file icon
    const determineFileTypeIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'bi bi-file-pdf-fill';
            default:
                return 'bi bi-file-earmark-text';
        }
    };

    // searchbar
    // search through files from the sidebar
    const searchThroughFiles = useRef(null);
    // search
    const [search, setSearch] = useState("");
    // question/answers state
    const [qaInputValid, setQaInputValid] = useState(true);

    useEffect(() => {
        if (search.length >= 3 || search.length === 0) {
            setQaInputValid(true);
            onSearch(search);
        } else {
            setQaInputValid(false);
        }
    }, [search, onSearch]);

    const renderSearchTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            search documents from your database
        </Tooltip>
    );

    return (
        <div style={{padding: '12px 0px 8px 12px'}}>
            <div style={{width: "100%"}}>
                <InputGroup className={styles.inputGroup}>
                    <OverlayTrigger
                        placement="bottom"
                        delay={{show: 250, hide: 400}}
                        overlay={renderSearchTooltip}
                        trigger={["hover", "focus"]}
                    >
                        <FormControl
                            placeholder="search documents"
                            aria-label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            ref={searchThroughFiles}
                            style={darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', paddingRight: '35px', borderRadius: '0', borderColor: '#212529'} : {
                                paddingRight: '35px',
                                borderRadius: '0'
                            }}
                        />
                    </OverlayTrigger>
                    <InputGroup.Text
                        style={darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', borderColor: '#212529'} : {backgroundColor: ''}}
                        className={`${styles.leftSidebarSearchBarInput} ${darkMode ? `${themes.darkThemeInputGroup} ${themes.darkThemeButtons}` : ''}`}>
                        <i style={darkMode ? {color: 'white', borderColor: '#212529'} : {color: 'black'}} className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Overlay target={searchThroughFiles.current} show={!qaInputValid} placement="top">
                        {(props) => (
                            <Tooltip id="overlay-example" {...props}>
                                Please type at least 3 characters.
                            </Tooltip>
                        )}
                    </Overlay>
                </InputGroup>
            </div>
            <div className={`${styles.leftSidebar} ${darkMode ? themes.darkThemeWithBottomBorderDefault : ''}`}>
                {databases.length > 0 && (
                    <Accordion className={`${styles.leftSidebarDropdown} ${darkMode ? themes.darkThemeSecondary : ''}`}>
                        {databases.map((database, dbIndex) => (
                            <Card key={`database_${dbIndex}`} className={`${styles.leftSidebarDropdownCard} ${darkMode ? themes.darkThemeSecondary : ''}`}>
                                <Card.Header className={styles.leftSidebarDropdownCardHeader}>
                                    <ScrapalotToggle eventKey={dbIndex.toString()} handleOnClick={() => fetchDatabaseDocuments(database.name)} setOpen={setOpenDatabase}>
                                        {database.name}
                                    </ScrapalotToggle>
                                </Card.Header>
                                <Accordion.Collapse in={dbIndex.toString() === openDatabase} eventKey={dbIndex.toString()}>
                                    <Card.Body className={styles.leftSidebarCardBody}>
                                        {database.collections.map((collection, collectionIndex) => (
                                            <div key={`collection_${dbIndex}_${collectionIndex}`} className={styles.collectionItem}>
                                                {collection.name !== 'langchain' && collection.name !== database.name && (
                                                    <ScrapalotToggle eventKey={`${dbIndex.toString()}_${collectionIndex.toString()}`}
                                                                     handleOnClick={() => fetchCollectionDocuments(database.name, collection.name)}
                                                                     setOpen={setOpenCollection}>
                                                        <div style={{padding: "8px 16px", borderTop: "1px #d2d2d2 solid", borderBottom: "1px #d2d2d2 solid"}}>
                                                            <i className={'bi bi-arrow-return-right'}/> {document.name}
                                                            {collection.name}
                                                        </div>
                                                    </ScrapalotToggle>

                                                )}
                                                <Card className={`${styles.leftSidebarDocItems} ${darkMode ? themes.darkThemeSecondary : ''}`}>
                                                    <ListGroup>
                                                        {documents && documents
                                                            .filter(document => (!searchTerm || document.name.toLowerCase().includes(searchTerm.toLowerCase())))
                                                            .map((document, docIndex) => (
                                                                <ListGroup.Item
                                                                    key={`document_${dbIndex}_${docIndex}`}
                                                                    className={`${styles.leftSidebarDocItems} ${darkMode ? themes.darkThemeWithBottomBorderDefault : ''}`}
                                                                    onClick={() => {
                                                                        setSelectedDocument(document); // Update the selected document
                                                                        setSelectedDocumentInitialPage(0); // reset initial page
                                                                    }}
                                                                >
                                                                    <i className={determineFileTypeIcon(document.name)}/> {document.name}
                                                                </ListGroup.Item>
                                                            ))}
                                                    </ListGroup>
                                                </Card>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}

export default BrowseDocumentsSidebar;
