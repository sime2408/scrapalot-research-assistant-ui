import React, {useCallback, useContext, useEffect, useState} from "react";
import {Tab, Tabs} from 'react-bootstrap';
import debounce from 'lodash.debounce';
import Cookies from 'js-cookie';

import MainHeader from "./components/ui/main-header/MainHeader";
import BrowseDocumentsSidebar from "./components/ui/browse-document-sidebar/BrowseDocumentsSidebar";
import WebDocumentSidebar from './components/ui/web-document-sidebar/WebDocumentSidebar';
import DocumentViewer from "./components/ui/document-viewer/DocumentViewer";
import AIChatbot from "./components/ui/ai-chatbot/AIChatbot";
import Scratchpad from './components/ui/scratchpad/Scratchpad';

import styles from "./App.module.css";
import themes from './components/themes/CustomThemeProvider.module.css';
import {ScrapalotLoadingContext} from './components/utils/ScrapalotLoadingContext';
import ScrapalotSpinner from './components/utils/ScrapalotSpinner';
import ScrapalotSpeechSynthesis from './components/utils/ScrapalotSpeechSynthesis';
import {useTheme} from './components/themes/ScrapalotThemeContext';

function App() {

    // loading
    const {setLoading} = useContext(ScrapalotLoadingContext);

    // application theme
    const {darkMode} = useTheme();

    useEffect(() => {
        Cookies.set('scrapalot-dark-mode', darkMode.toString()); // Convert to string before setting the cookie
    }, [darkMode]);

    // application locale
    const [locale, setLocale] = useState(() => Cookies.get("scrapalot-locale") || "en");

    // application tabs
    const [activeTabLeftKey, setActiveTabLeftKey] = useState('browse');

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

    const fetchDatabasesAndCollections = useCallback(async (url, retryCount = 5, interval = 5000) => {
        for (let i = 0; i < retryCount; i++) {
            setLoading(true);
            try {
                const response = await fetch(url);
                const data = await response.json();
                const transformedData = data.map(database => ({
                    name: database.database_name,
                    collections: database.collections
                }));
                setDatabases(transformedData);
                setLoading(false);
                break; // Exit the loop if the fetch request was successful
            } catch (error) {
                if (i === retryCount - 1) {
                    setLoading(false);
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
        if (!footnoteClicked) {
            setSelectedDocument(null);
        }
    };

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

    // track if a footnote has been clicked
    const [footnoteClicked, setFootnoteClicked] = useState(false);
    const [footnoteHighlightedText, setFootnoteHighlightedText] = useState('');

    const handleFootnoteClick = (content, pageNumber, index, selectedDatabase, selectedDocument) => {
        setFootnoteClicked(true);
        handleSelectDatabase(selectedDatabase) // pass the triggeredBy parameter
        handleSelectDocument(selectedDocument)
        setFootnoteHighlightedText(content) // the chunk coming from the search
        setSelectedDocumentInitialPage(pageNumber + 1); // Assuming pageNumber is zero-based
    };

    useEffect(() => {
        setFootnoteClicked(false);
    }, [selectedDatabase]);

    // search through documents

    const handleSearch = debounce((search) => {
        setSearchTerm(search);
    }, 300);

    const onSearch = (search) => {
        handleSearch(search);
    }

    // scratchpad
    const [isScratchpadVisible, setIsScratchpadVisible] = useState(false);
    const [isDocumentBrowserVisible, setIsDocumentBrowserVisible] = useState(true);

    const [columnClasses, setColumnClasses] = useState({
        left: 'col-3 col-sm-3 col-md-3 col-lg-2',
        middle: 'col-6 col-sm-6 col-md-6 col-lg-7',
        right: 'col-3 col-sm-3 col-md-3 col-lg-3'
    });

    const handleExpandSidebar = () => {
        setIsDocumentBrowserVisible(prevIsDocumentBrowserVisible => {
            if (prevIsDocumentBrowserVisible) {
                setColumnClasses({
                    left: 'col-0',
                    middle: 'col-8',
                    right: 'col-4'
                });
            } else {
                setColumnClasses({
                    left: 'col-2',
                    middle: 'col-7',
                    right: 'col-3'
                });
            }

            return !prevIsDocumentBrowserVisible;
        });
    };

    const handleExpandScratchpad = () => {
        setIsScratchpadVisible(!isScratchpadVisible)
    }

    const [manuallySelectedTextFromDocument, setManuallySelectedTextFromDocument] = useState('');

    // state for managing DocumentViewer and Scratchpad heights.
    const [isResizing, setIsResizing] = useState(false);
    const [documentViewerHeight, setDocumentViewerHeight] = useState("50%");

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    const handleMouseMove = e => {
        if (!isResizing) return;
        let newHeight = (e.clientY / window.innerHeight) * 100;
        if (newHeight < 20) newHeight = 20;
        if (newHeight > 80) newHeight = 80;
        setDocumentViewerHeight(`${newHeight}%`);
    };

    return (
        <div className={styles.appMainContainer}>
            <MainHeader
                onSelectDatabase={handleSelectDatabase}
                selectedDatabase={selectedDatabase}
                selectedDocument={selectedDocument}
                databases={databases}
            />
            <div className={`container-fluid ${styles.appContainerFluid}`}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}>
                <div className="row" style={{maxHeight: '100vh'}}>
                    {isDocumentBrowserVisible && (
                        <div className={`${columnClasses.left} ${styles.appLeftSidebarColumn} ${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}
                             style={darkMode ?
                                 {
                                     borderRight: "1px solid #41494d",
                                     overflowY: 'hidden',
                                 } :
                                 {
                                     borderRight: "1px solid rgb(229 229 229)",
                                     overflowY: 'hidden',
                                 }}>
                            <Tabs
                                justify
                                activeKey={activeTabLeftKey}
                                onSelect={(k) => setActiveTabLeftKey(k)}
                                transition={false}
                                id="controlled-tab-example"
                                className={`${styles.appColumnDefaults} ${darkMode ? themes.darkThemePrimary : themes.lightThemePrimary}`}
                                style={{
                                    height: '42px',
                                    padding: '0',
                                    marginRight: '-12px'
                                }}
                            >
                                <Tab eventKey="browse" title="documents">
                                    <BrowseDocumentsSidebar
                                        onSearch={onSearch}
                                        setSelectedDocument={setSelectedDocument}
                                        onSelectDatabase={handleSelectDatabase}
                                        selectedDatabase={selectedDatabase}
                                        searchTerm={searchTerm}
                                        databases={databases}
                                        setSelectedDocumentInitialPage={setSelectedDocumentInitialPage}
                                        handleExpandSidebar={handleExpandSidebar}
                                        isDocumentBrowserVisible={isDocumentBrowserVisible}

                                    />
                                </Tab>
                                <Tab eventKey="search" title="search web">
                                    <WebDocumentSidebar/>
                                </Tab>
                            </Tabs>
                        </div>
                    )}
                    <div
                        className={`d-flex justify-content-center align-items-center ${columnClasses.middle} ${styles.appColumnDefaults} ${darkMode ? themes.darkThemePrimary : themes.lightThemeDefault}`}
                        style={
                            isDocumentBrowserVisible ? {
                                paddingLeft: '0',
                                paddingRight: '0'
                            } : {
                                paddingLeft: '12px',
                                paddingRight: '0'
                            }
                        }>
                        <ScrapalotSpeechSynthesis>
                            <div className={styles.appDocViewerContainer}>
                                <div style={{height: isScratchpadVisible ? `${documentViewerHeight}` : '100%'}}>
                                    <DocumentViewer
                                        selectedDatabase={selectedDatabase}
                                        selectedDocument={selectedDocument}
                                        setSelectedDocument={handleSelectDocument}
                                        selectedDocumentInitialPage={selectedDocumentInitialPage}
                                        footnoteHighlightedText={footnoteHighlightedText}
                                        setManuallySelectedTextFromDocument={setManuallySelectedTextFromDocument}
                                    />
                                </div>
                                <div
                                    style={{
                                        borderTop: darkMode ? "1px solid #41494d" : "1px solid rgb(229 229 229)",
                                        height: "6px",
                                        cursor: "row-resize",
                                        userSelect: "none"
                                    }}
                                    onMouseDown={handleMouseDown}
                                ></div>
                                {isScratchpadVisible && (
                                    <div
                                        style={{flexGrow: 1}}>
                                        <Scratchpad
                                            documentViewerHeight={documentViewerHeight}
                                            selectedText={manuallySelectedTextFromDocument}
                                            selectedDocument={selectedDocument}
                                        />
                                    </div>
                                )}
                            </div>
                        </ScrapalotSpeechSynthesis>
                    </div>
                    <div className={`${columnClasses.right} ${styles.appRightSidebarColumn} ${darkMode ? themes.darkThemeSecondary : themes.lightThemePrimary}`}
                         style={
                             {
                                 borderLeft: darkMode ? "1px solid #41494d" : "1px solid rgb(229 229 229)",
                                 overflowY: 'hidden',
                                 display: 'flex',
                                 flexDirection: 'column',
                             }
                         }>
                        <AIChatbot
                            handleClearMessages={handleClearMessages}
                            locale={locale}
                            setLocale={setLocale}
                            handleFootnoteClick={handleFootnoteClick}
                            selectedDatabase={selectedDatabase}
                            selectedDatabaseColl={selectedDatabase}
                            selectedDocument={selectedDocument}
                            messages={messages}
                            setMessages={setMessages}
                            isDocumentBrowserVisible={isDocumentBrowserVisible}
                            handleExpandSidebar={handleExpandSidebar}
                            isScratchpadVisible={isScratchpadVisible}
                            handleExpandScratchpad={handleExpandScratchpad}
                        />
                    </div>
                </div>
            </div>
            <ScrapalotSpinner darkMode={darkMode}/>
        </div>
    );
}

export default App;
