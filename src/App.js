import React, {useCallback, useEffect, useState} from "react";
import MainHeader from "./components/ui/main-header/MainHeader";
import BrowseDocumentsSidebar from "./components/ui/left-sidebar/BrowseDocumentsSidebar";
import DocumentViewer from "./components/ui/document-viewer/DocumentViewer";
import AIChatbot from "./components/ui/ai-chatbot/AIChatbot";

import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';

import styles from "./App.module.css";
import themes from './components/themes/CustomThemeProvider.module.css';
import {Tab, Tabs} from 'react-bootstrap';

const WebDocumentSidebar = () => <div style={{padding: '8px'}}>Web Document Sidebar</div>;
const Scratchpad = () => <div style={{padding: '8px'}}>Scratchpad</div>;

function App() {

    // tabs
    const [activeTabLeftKey, setActiveTabLeftKey] = useState('browse');
    const [activeTabRightKey, setActiveTabRightKey] = useState('chatbot');

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

    const handleTabColors = useCallback((tab) => {
        if (darkMode) {
            tab.classList.add(styles.appDarkModeTab);
            tab.classList.remove(styles.appLightModeTab);
            if (tab.classList.contains('active')) {
                tab.classList.add(styles.appDarkModeTabActive);
                tab.classList.remove(styles.appLightModeTabActive);
            } else {
                tab.classList.remove(styles.appDarkModeTabActive);
                tab.classList.add(styles.appDarkModeTab);
            }
        } else {
            tab.classList.add(styles.appLightModeTab);
            tab.classList.remove(styles.appDarkModeTab);
            if (tab.classList.contains('active')) {
                tab.classList.add(styles.appLightModeTabActive);
                tab.classList.remove(styles.appDarkModeTabActive);
            } else {
                tab.classList.remove(styles.appLightModeTabActive);
                tab.classList.add(styles.appLightModeTab);
            }
        }
    }, [darkMode]);

    // application tabs

    useEffect(() => {
        const tabs = document.querySelectorAll('.nav-tabs .nav-link');
        const observers = []; // Array to hold the observers

        tabs.forEach(tab => {
            handleTabColors(tab);
            // MutationObserver to listen for changes to the class list
            const observer = new MutationObserver((mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.attributeName === 'class') {
                        const prevClassList = mutation.oldValue.split(' ');
                        const currClassList = tab.className.split(' ');
                        const wasActive = prevClassList.includes('active');
                        const isActive = currClassList.includes('active');
                        if (wasActive !== isActive) {
                            handleTabColors(tab);
                        }
                    }
                }
            });
            // Start observing the tab button for changes to its class list
            observer.observe(tab, {attributes: true, attributeFilter: ['class'], attributeOldValue: true});
            /// Add the observer to the array
            observers.push(observer);
        });

        // Return a cleanup function that disconnects all the observers
        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, [handleTabColors]);

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
    const [selectedDocumentInitialPage, setSelectedDocumentInitialPage] = useState(0);

    const fetchDatabasesAndCollections = useCallback(async (url, retryCount = 5, interval = 2000) => {
        for (let i = 0; i < retryCount; i++) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                const transformedData = data.map(database => ({
                    name: database.database_name,
                    collections: database.collections
                }));
                setDatabases(transformedData);
                break; // Exit the loop if the fetch request was successful
            } catch (error) {
                if (i === retryCount - 1) {
                    console.error('Failed to fetch databases:', error);
                } else {
                    console.log(`Retrying in ${interval}ms... (${retryCount - i - 1} tries left)`);
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
            }
        }
    }, []);

    useEffect(() => {
        fetchDatabasesAndCollections(`${process.env.REACT_APP_API_BASE_URL}/databases`);
    }, [fetchDatabasesAndCollections]);

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

    // application AI chatbot messages
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('scrapalot-chat-messages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });

    const handleClearMessages = () => {
        setMessages([]);
        localStorage.removeItem('scrapalot-chat-messages');
    };
    const handleFootnoteClick = (pageNumber) => {
        setSelectedDocumentInitialPage(pageNumber + 1); // Assuming pageNumber is zero-based
    };

    // search through documents

    const handleSearch = debounce((search) => {
        setSearchTerm(search);
    }, 300);

    const onSearch = (search) => {
        handleSearch(search);
    }

    return (
        <div className={styles.appMainContainer}>
            <MainHeader
                onSelectDatabase={handleSelectDatabase}
                selectedDatabase={selectedDatabase}
                databases={databases}
                toggleTheme={toggleTheme}
                darkMode={darkMode}/>
            <div className={`container-fluid ${styles.appContainerFluid}`}>
                <div className="row">
                    <div className={`col-md-2 ${styles.appLeftSidebarColumn} ${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}
                         style={darkMode ?
                             {
                                 borderRight: "1px solid #41494d",
                                 overflowY: 'hidden',
                                 paddingLeft: '14px',
                                 paddingRight: '0',
                             } :
                             {
                                 borderRight: "1px solid rgb(229 229 229)",
                                 overflowY: 'hidden',
                                 paddingLeft: '14px',
                                 paddingRight: '0',
                             }}>
                        <Tabs
                            justify
                            activeKey={activeTabLeftKey}
                            onSelect={(k) => setActiveTabLeftKey(k)}
                            transition={false}
                            id="controlled-tab-example"
                            className={`${styles.appDocumentViewerColumn} ${darkMode ? themes.darkThemePrimary : themes.lightThemePrimary}`}
                            style={{height: '42px', padding: '0'}}
                        >
                            <Tab eventKey="browse" title="my documents">
                                <BrowseDocumentsSidebar
                                    onSearch={onSearch}
                                    setSelectedDocument={setSelectedDocument}
                                    onSelectDatabase={handleSelectDatabase}
                                    selectedDatabase={selectedDatabase}
                                    searchTerm={searchTerm}
                                    databases={databases}
                                    setSelectedDocumentInitialPage={setSelectedDocumentInitialPage}
                                    darkMode={darkMode}
                                />
                                <WebDocumentSidebar/>
                            </Tab>
                            <Tab eventKey="search" title="search web">
                                Tab content for Search
                            </Tab>
                        </Tabs>
                    </div>
                    <div className={`col-md-7 ${styles.appDocumentViewerColumn} ${darkMode ? themes.darkThemePrimary : themes.lightThemeDefault}`}>
                        <DocumentViewer
                            selectedDatabase={selectedDatabase}
                            selectedDocument={selectedDocument}
                            setSelectedDocument={handleSelectDocument}
                            selectedDocumentInitialPage={selectedDocumentInitialPage}
                            darkMode={darkMode}
                        />
                    </div>
                    <div className={`col-md-3 ${darkMode ? themes.darkThemeSecondary : themes.lightThemePrimary}`}
                         style={darkMode ?
                             {
                                 borderLeft: "1px solid #41494d",
                                 overflowY: 'hidden',
                                 paddingLeft: '0',
                                 paddingRight: '12px',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 // justifyContent: 'space-between',
                             } :
                             {
                                 borderLeft: "1px solid rgb(229 229 229)",
                                 overflowY: 'hidden',
                                 paddingLeft: '0',
                                 paddingRight: '12px',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 // justifyContent: 'space-between',
                             }}>
                        <Tabs
                            justify
                            activeKey={activeTabRightKey}
                            onSelect={(k) => setActiveTabRightKey(k)}
                            transition={false}
                            id="controlled-tab-example"
                            className={`${styles.appDocumentViewerColumn} ${darkMode ? themes.darkThemePrimary : themes.lightThemePrimary}`}
                            style={{height: '42px', padding: '0'}}
                        >
                            <Tab eventKey="chatbot" title="chat">
                                <AIChatbot
                                    handleClearMessages={handleClearMessages}
                                    locale={locale}
                                    setLocale={setLocale}
                                    setSelectedDatabase={setSelectedDatabase}
                                    setSelectedDocument={handleSelectDocument}
                                    onFootnoteClick={handleFootnoteClick}
                                    db_name={selectedDatabase}
                                    db_collection_name={selectedDatabase}
                                    messages={messages}
                                    setMessages={setMessages}
                                    darkMode={darkMode}
                                />
                            </Tab>
                            <Tab eventKey="scratchpad" title="scratchpad">
                                <Scratchpad/>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default App;
