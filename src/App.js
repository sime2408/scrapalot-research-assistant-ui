import React, {useEffect, useState} from "react";
import MainHeader from "./components/ui/main-header/MainHeader";
import BelowHeader from "./components/ui/main-header/below-header/BelowHeader";
import LeftSidebar from "./components/ui/left-sidebar/LeftSidebar";
import DocumentViewer from "./components/ui/document-viewer/DocumentViewer";
import AIChatbot from "./components/ui/ai-chatbot/AIChatbot";
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';


import styles from "./App.module.css";
import CustomSpinner from './components/utils/CustomSpinner';

function App() {

    // state variable for tracking loading status
    const [isLoading, setIsLoading] = useState(false);

    // selected database / document
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedDatabase, setSelectedDatabase] = useState(Cookies.get('scrapalot-selected-db') || null);
    const [databases, setDatabases] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // document viewer state
    const [numPages, setNumPages] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [currentPage, setCurrentPage] = useState(1);
    // document viewer toolbar
    const onNextPage = (updateInputPage) => {
        setCurrentPage((prev) => {
            const newPage = Math.min(numPages, prev + 1);
            updateInputPage(newPage);
            return newPage;
        });
    };
    const onPreviousPage = (updateInputPage) => {
        setCurrentPage((prev) => {
            const newPage = Math.max(1, prev - 1);
            updateInputPage(newPage);
            return newPage;
        });
    };
    const onZoomIn = () => setZoomLevel((prev) => Math.min(2.0, prev + 0.1));
    const onZoomOut = () => setZoomLevel((prev) => Math.max(0.5, prev - 0.1));
    // AI chatbot
    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem('scrapalot-chat-messages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });

    const handleClearMessages = () => {
        setMessages([]);
        sessionStorage.removeItem('scrapalot-chat-messages');
    };

    useEffect(() => {
        const pageDiv = document.getElementById(`page_${currentPage}`);
        if (pageDiv) {
            pageDiv.scrollIntoView({behavior: 'smooth'});
        }
    }, [currentPage]);

    // databases / collections retrieval
    const fetchDatabasesAndCollections = (url, retryCount = 5, interval = 2000) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                setIsLoading(false);
                const transformedData = data.map(database => ({
                    name: database.database_name,
                    collections: database.collections
                }));
                setDatabases(transformedData);
            })
            .catch(error => {
                if (retryCount > 0) {
                    console.log(`Retrying in ${interval}ms... (${retryCount} tries left)`);
                    setTimeout(() => fetchDatabasesAndCollections(url, retryCount - 1, interval), interval);
                } else {
                    setIsLoading(false);
                    console.error('Failed to fetch databases:', error);
                }
            }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        setIsLoading(true);
        fetchDatabasesAndCollections(`${process.env.REACT_APP_API_BASE_URL}/databases`);
    }, []);

    const handleSearch = debounce((search) => {
        setSearchTerm(search);
    }, 300);

    const onSearch = (search) => {
        handleSearch(search);
    }

    const handleSelectDatabase = (dbName) => {
        setSelectedDatabase(dbName);
        Cookies.set('scrapalot-selected-db', dbName, {expires: 7});
    };

    const handleSelectDocument = (document) => {
        setSelectedDocument(document);
        if (document && document.name.split('.').pop() !== 'pdf') {
            setNumPages(1);
        } else {
            // logic to get numPages for pdf document
        }
    };

    return (
        <div className={styles.mainContainer}>
            <MainHeader
                onSelectDatabase={handleSelectDatabase}
                selectedDatabase={selectedDatabase}
                databases={databases}/>
            <BelowHeader
                fileType={selectedDocument && selectedDocument.name ? selectedDocument.name.split('.').pop() : null}
                onSearch={onSearch}
                onNextPage={onNextPage}
                onPreviousPage={onPreviousPage}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                numPages={numPages} // pass numPages as a prop
                setCurrentPage={setCurrentPage} // pass setCurrentPage as a prop
                handleClearMessages={handleClearMessages}
            />
            <div className={`container-fluid ${styles.containerFluid}`}>
                <div className="row">
                    <div className={`col-md-2 ${styles.leftSidebarColumn}`}>
                        <LeftSidebar
                            selectedDocument={selectedDocument}
                            setSelectedDocument={setSelectedDocument}
                            onSelectDatabase={handleSelectDatabase}
                            selectedDatabase={selectedDatabase}
                            searchTerm={searchTerm} // Pass searchTerm as a prop to LeftSidebar
                            databases={databases}
                        />
                    </div>
                    <div className={`col-md-7 ${styles.documentViewerColumn}`}>
                        <DocumentViewer
                            selectedDatabase={selectedDatabase}
                            selectedDocument={selectedDocument}
                            setSelectedDocument={handleSelectDocument}
                            zoomLevel={zoomLevel}
                            setNumPages={setNumPages}
                        />
                    </div>
                    <div className="col-md-3">
                        <AIChatbot
                            selectedDocument={selectedDocument}
                            setSelectedDocument={handleSelectDocument}
                            db_name={selectedDatabase}
                            db_collection_name={selectedDatabase}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </div>
                </div>
            </div>
            {isLoading &&
                <CustomSpinner/>
            }
        </div>
    );
}

export default App;
