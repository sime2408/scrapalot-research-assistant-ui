import React, {useEffect, useState} from "react";
import {Accordion, Card, ListGroup} from "react-bootstrap";
import styles from "./LeftSidebar.module.css";
import CustomToggle from '../../utils/CustomToggle';
import CustomSpinner from '../../utils/CustomSpinner';

function LeftSidebar({selectedDocument, setSelectedDocument, onSelectDatabase, selectedDatabase, searchTerm, databases}) {

    // state variable for tracking loading status
    const [isLoading, setIsLoading] = useState(false); // <-- initialize loading state
    // what happens when you click on the sidebar database/collection name
    const [openDatabase, setOpenDatabase] = useState('0');
    const [openCollection, setOpenCollection] = useState(null);
    // loaded documents on database/collection click
    const [documents, setDocuments] = useState([]);
    // Fetch abort controller
    const [abortController, setAbortController] = useState(new AbortController());


    useEffect(() => {
        if (selectedDatabase) {
            fetchDatabaseDocuments(selectedDatabase);
        }
        // Clean up function
        return () => {
            abortController.abort();
        };
    }, [selectedDatabase, databases]);

    const fetchDatabaseDocuments = (databaseName, retryCount = 5, interval = 2000) => {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_API_BASE_URL}/database/${databaseName}`;
        fetch(url)
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
                    setIsLoading(false); // <-- set loading to false once a document has loaded
                }
            })
            .catch(error => {
                if (retryCount > 0) {
                    console.log(`Retrying in ${interval}ms... (${retryCount} tries left)`);
                    setTimeout(() => fetchDatabaseDocuments(databaseName, retryCount - 1, interval), interval);
                } else {
                    setIsLoading(false);
                    if (error.name === 'AbortError') {
                        console.log('Fetch cancelled');
                    } else {
                        console.error('Error:', error);
                        // Display error message to user...
                    }
                }
            })
            .finally(() => setIsLoading(false));
    };

    const fetchCollectionDocuments = (databaseName, collectionName) => {
        setIsLoading(true);
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
            .catch(error => console.error('Error:', error))
            .finally(() => setIsLoading(false));
    };

    // Helper function to determine the appropriate file icon
    const determineFileTypeIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'bi bi-file-pdf-fill';
            case 'doc':
            case 'docx':
                return 'bi bi-file-word-fill';
            case 'epub':
                return 'bi bi-book-fill';
            default:
                return 'bi bi-file-earmark-text';
        }
    };

    return (
        <div className={styles.leftSidebar}>
            {isLoading && <CustomSpinner/>}
            {databases.length > 0 && (
                <Accordion className={styles.leftSidebarDropdown}>
                    {databases.map((database, dbIndex) => (
                        <Card key={`database_${dbIndex}`} className={styles.leftSidebarDropdownCard}>
                            <Card.Header className={styles.leftSidebarDropdownCardHeader}>
                                <CustomToggle eventKey={dbIndex.toString()} handleOnClick={() => fetchDatabaseDocuments(database.name)} setOpen={setOpenDatabase}>
                                    {database.name}
                                </CustomToggle>
                            </Card.Header>
                            <Accordion.Collapse in={dbIndex.toString() === openDatabase} eventKey={dbIndex.toString()}>
                                <Card.Body className={styles.leftSidebarCardBody}>
                                    {database.collections.map((collection, collectionIndex) => (
                                        <div key={`collection_${dbIndex}_${collectionIndex}`} className={styles.collectionItem}>
                                            {collection.name !== 'langchain' && collection.name !== database.name && (
                                                <CustomToggle eventKey={`${dbIndex.toString()}_${collectionIndex.toString()}`}
                                                              handleOnClick={() => fetchCollectionDocuments(database.name, collection.name)}
                                                              setOpen={setOpenCollection}>
                                                    <div style={{padding: "8px 16px", borderTop: "1px #d2d2d2 solid", borderBottom: "1px #d2d2d2 solid"}}>
                                                        <i className={'bi bi-arrow-return-right'}/> {document.name}
                                                        {collection.name}
                                                    </div>
                                                </CustomToggle>

                                            )}
                                            <Card className={styles.leftSidebarDocItems}>
                                                <ListGroup>
                                                    {documents && documents
                                                        .filter(document => (!searchTerm || document.name.toLowerCase().includes(searchTerm.toLowerCase())))
                                                        .map((document, docIndex) => (
                                                            <ListGroup.Item
                                                                key={`document_${dbIndex}_${docIndex}`}
                                                                className={styles.leftSidebarDocItems}
                                                                onClick={() => {
                                                                    setSelectedDocument(document); // Update the selected document
                                                                    setIsLoading(true);
                                                                    setTimeout(() => {
                                                                        setIsLoading(false);
                                                                    }, 5000);
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
    );
}

export default LeftSidebar;
