import React, {useEffect, useState} from "react";
import MainHeader from "./components/ui/main-header/MainHeader";
import BelowHeader from "./components/ui/main-header/below-header/BelowHeader";
import LeftSidebar from "./components/ui/left-sidebar/LeftSidebar";
import DocumentViewer from "./components/ui/document-viewer/DocumentViewer";
import AIChatbot from "./components/ui/ai-chatbot/AIChatbot";

import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';


import styles from "./App.module.css";
import themes from './components/themes/CustomThemeProvider.module.css';

function App() {

    // application theme
    const [darkMode, setDarkMode] = useState(() => {
        const storedDarkMode = Cookies.get('scrapalot-dark-mode');
        return storedDarkMode === 'true'; // Convert the cookie value to a boolean
    });

    const toggleTheme = () => {
        const updatedDarkMode = !darkMode;
        setDarkMode(updatedDarkMode);
        Cookies.set('scrapalot-dark-mode', updatedDarkMode.toString()); // Convert to string before setting the cookie
    };

    useEffect(() => {
        Cookies.set('scrapalot-dark-mode', darkMode.toString()); // Convert to string before setting the cookie
    }, [darkMode]);

    // application locale
    const [locale, setLocale] = useState(() => Cookies.get("scrapalot-locale") || "en");

    useEffect(() => {
        const handleStorageChange = () => {
            const savedLocale = Cookies.get("scrapalot-locale");
            if (savedLocale && savedLocale !== locale) {
                setLocale(savedLocale);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [locale]);

    // application database & documents
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedDatabase, setSelectedDatabase] = useState(Cookies.get('scrapalot-selected-db') || null);
    const [databases, setDatabases] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // application AI chatbot messages
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('scrapalot-chat-messages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });

    const handleClearMessages = () => {
        setMessages([]);
        sessionStorage.removeItem('scrapalot-chat-messages');
    };

    // API databases / collections retrieval
    const fetchDatabasesAndCollections = (url, retryCount = 5, interval = 2000) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
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
                    console.error('Failed to fetch databases:', error);
                }
            });
    };

    useEffect(() => {
        fetchDatabasesAndCollections(`${process.env.REACT_APP_API_BASE_URL}/databases`);
    }, []);

    // what to do when user selects the database or documents

    const handleSelectDatabase = (dbName) => {
        setSelectedDatabase(dbName);
        Cookies.set('scrapalot-selected-db', dbName, {expires: 7});
    };

    useEffect(() => {
        setSelectedDocument(null);
    }, [selectedDatabase]);

    const handleSelectDocument = (document) => {
        setSelectedDocument(document);
    };

    // search through documents

    const handleSearch = debounce((search) => {
        setSearchTerm(search);
    }, 300);

    const onSearch = (search) => {
        handleSearch(search);
    }

    return (
        <div className={styles.mainContainer}>
            <MainHeader
                onSelectDatabase={handleSelectDatabase}
                selectedDatabase={selectedDatabase}
                databases={databases}
                toggleTheme={toggleTheme}
                darkMode={darkMode}/>
            <BelowHeader
                setLocale={setLocale}
                fileType={selectedDocument && selectedDocument.name ? selectedDocument.name.split('.').pop() : null}
                onSearch={onSearch}
                handleClearMessages={handleClearMessages}
                darkMode={darkMode}
            />
            <div className={`container-fluid ${styles.containerFluid}`}>
                <div className="row">
                    <div className={`col-md-2 ${styles.leftSidebarColumn} ${darkMode ? themes.darkThemeWithBottomBorderDefault : ''}`}>
                        <LeftSidebar
                            setSelectedDocument={setSelectedDocument}
                            onSelectDatabase={handleSelectDatabase}
                            selectedDatabase={selectedDatabase}
                            searchTerm={searchTerm}
                            databases={databases}
                            darkMode={darkMode}
                        />
                    </div>
                    <div className={`col-md-7 ${styles.documentViewerColumn} ${darkMode ? themes.darkThemePrimary : ''}`}>
                        <DocumentViewer
                            selectedDatabase={selectedDatabase}
                            selectedDocument={selectedDocument}
                            setSelectedDocument={handleSelectDocument}
                            darkMode={darkMode}
                        />
                    </div>
                    <div className={`col-md-3 ${darkMode ? themes.darkThemeSecondary : ''}`}
                         style={darkMode ? {borderLeft: "1px solid #41494d"} : {borderLeft: "1px solid rgb(229 229 229)"}}>
                        <AIChatbot
                            locale={locale}
                            setLocale={setLocale}
                            setSelectedDatabase={setSelectedDatabase}
                            setSelectedDocument={handleSelectDocument}
                            db_name={selectedDatabase}
                            db_collection_name={selectedDatabase}
                            messages={messages}
                            setMessages={setMessages}
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
