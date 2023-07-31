import React, {useEffect, useRef, useState} from "react";
import {Dropdown, DropdownButton, FormControl, InputGroup, Overlay, OverlayTrigger, Spinner, Tooltip} from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./AIChatbot.module.css";
import themes from '../../themes/CustomThemeProvider.module.css';
import englishFlag from '../../../static/img/flags/en.svg';
import germanFlag from '../../../static/img/flags/de.svg';
import spanishFlag from '../../../static/img/flags/es.svg';
import frenchFlag from '../../../static/img/flags/fr.svg';
import italianFlag from '../../../static/img/flags/it.svg';
import croatianFlag from '../../../static/img/flags/hr.svg';
import ScrapalotCookieSwitch from '../../utils/ScrapalotCookieSwitch';
import MessagesList from './MessagesList';
import ScrapalotSpeechSynthesis from '../../utils/ScrapalotSpeechSynthesis';

const AIChatbot = (props) => {

    const [inputText, setInputText] = useState("");
    const [inputValid, setInputValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [footnoteContent, setFootnoteContent] = useState({content: null, messageIndex: null});

    const inputRef = useRef(null); // Ref to track the input element
    const sendButtonRef = useRef(null); // New Ref for InputGroup.Text (send button)

    // React to the locale change
    useEffect(() => {
        const handleStorageChange = () => {
            const savedLocale = Cookies.get("scrapalot-locale");
            if (savedLocale && savedLocale !== props.locale) {
                props.setLocale(savedLocale);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [props.locale]); // eslint-disable-line react-hooks/exhaustive-deps

    // Function to update messages
    const updateMessages = (newMessage) => {
        props.setMessages((prevMessages) => {
            const newMessages = [...prevMessages, newMessage];
            localStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
            return newMessages;
        });
    };

    // Function to prepare request body
    const prepareRequestBody = (text, savedLocale) => {
        const filterOptions = {
            filter_document: askThisDocument,
            filter_document_name: props.selectedDocument ? props.selectedDocument.name : null,
            translate_chunks: Cookies.get("scrapalot-translate-chunks") === "true" || false,
        };

        return askWeb ? {
            database_name: "web",
            collection_name: "web",
            question: text,
            locale: savedLocale,
            filter_options: filterOptions,
        } : {
            database_name: props.selectedDatabase,
            collection_name: props.selectedDatabaseColl || props.selectedDatabase,
            question: text,
            locale: savedLocale,
            filter_options: filterOptions,
        };
    };

    const sendMessage = async (messageText: string) => {
        const text = typeof messageText === 'string' ? messageText : inputText;
        const savedLocale = Cookies.get("scrapalot-locale") || "en";

        if (typeof text === 'string' && text.trim() !== "") {
            const userMessage = {answer: text, source: "user", language: props.locale};
            updateMessages(userMessage);

            setIsLoading(true);

            const uriPath = askWeb ? '/query-web' : '/query-llm';
            const requestBody = prepareRequestBody(text, savedLocale);

            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}${uriPath}`, requestBody);

                const aiMessage = {...response.data, source: "ai", language: savedLocale};
                updateMessages(aiMessage);
            } catch (error) {
                console.error("Failed to send message:", error.message);
                setInputValid(false);
            } finally {
                setIsLoading(false);
                setInputText("");
                setInputValid(true);
            }
        } else {
            setInputValid(false);
        }
    };

    // when pressing keyboard Enter
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
        // Add this condition to handle 'Tab' key press
        if (event.key === "Tab") {
            event.preventDefault(); // Prevent the default action
            sendButtonRef.current.focus(); // Focus on the 'send' button
        }
    };

    // repeat the question if the user is not satisfied with the answer
    const handleRepeatQuestion = async () => {
        // Get the last user message
        const lastUserMessage = props.messages.filter(message => message.source === "user").slice(-1)[0];
        if (lastUserMessage) {
            // Remove the last user message from the message array
            const newMessages = props.messages.filter((message, index) => index !== props.messages.indexOf(lastUserMessage));
            props.setMessages(newMessages);
            localStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));

            // Call sendMessage to send the question to the backend API
            await sendMessage(lastUserMessage.answer);
        }
    };

    const handleFootnoteClick = (content, pageNumber, messageIndex, selectedDatabase, selectedDocument) => {
        setFootnoteContent({content, messageIndex});
        if (!askWeb) {
            props.handleFootnoteClick(content, pageNumber - 1, messageIndex, selectedDatabase, selectedDocument); // subtract 1 because PDF.js uses zero-based index
        }
    };

    // dark theme backgrounds
    const spinnerVariant = props.darkMode ? 'light' : 'dark';


    // toolbar

    const renderSidebar = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            sidebar
        </Tooltip>
    );

    const renderScratchpad = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            scratchpad
        </Tooltip>
    );

    const renderClearTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            clear the chat messages
        </Tooltip>
    );

    const renderAskThisDocument = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            ask this document
        </Tooltip>
    );

    const renderAskWeb = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            ask web
        </Tooltip>
    );

    const languages = [
        {id: 'en', name: 'English', flag: englishFlag},
        {id: 'de', name: 'German', flag: germanFlag},
        {id: 'es', name: 'Spanish', flag: spanishFlag},
        {id: 'fr', name: 'French', flag: frenchFlag},
        {id: 'it', name: 'Italian', flag: italianFlag},
        {id: 'hr', name: 'Croatian', flag: croatianFlag},
    ];

    const savedLocale = Cookies.get('scrapalot-locale') || 'en';
    const initialLanguage = languages.find(lang => lang.id === savedLocale) || languages[0];
    const [language, setLanguage] = useState(initialLanguage);

    const handleLocaleChange = (newLocale) => {
        setLanguage(newLocale);
        props.setLocale(newLocale.id);
        Cookies.set('scrapalot-locale', newLocale.id, {expires: 30});
    };

    const [askThisDocument, setAskThisDocument] = useState(false);
    const handleAskThisDocument = () => {
        setAskThisDocument(prevState => !prevState);
        setAskWeb(false);
    }

    const [askWeb, setAskWeb] = useState(() => Cookies.get("scrapalot-ask-web") === "true" || false);
    const handleAskWeb = () => {
        const newState = !askWeb
        Cookies.set('scrapalot-ask-web', newState.toString());
        setAskWeb(newState);
        setAskThisDocument(false);
    }

    return (
        <div style={{padding: '8px 8px 8px 0', height: 'calc(100vh - 96px)'}}>
            <div className={styles.aiChatbotToolbar}>
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderSidebar}
                >
                    <div>
                        {props.isDocumentBrowserVisible && (
                            <button onClick={props.handleExpandSidebar} style={{border: 'none', background: 'none'}}>
                                <i className="bi bi-box-arrow-left"></i>
                            </button>
                        )}
                        {!props.isDocumentBrowserVisible && (
                            <button onClick={props.handleExpandSidebar} style={{border: 'none', background: 'none'}}>
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
                        )}
                    </div>
                </OverlayTrigger>
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderClearTooltip}
                >
                    <button onClick={props.handleClearMessages} style={{border: 'none', background: 'none'}}>
                        <i className="bi bi-trash"></i>
                    </button>
                </OverlayTrigger>
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderScratchpad}
                >
                    <div>
                        <button onClick={props.handleExpandScratchpad} style={{border: 'none', background: 'none'}}>
                            {
                                props.isScratchpadVisible
                                    ? <i className="bi bi-pencil-fill" style={{color: '#44abb6'}}></i>
                                    : <i className="bi bi-pencil"></i>
                            }
                        </button>
                    </div>
                </OverlayTrigger>
                {props.selectedDocument && (
                    <OverlayTrigger
                        style={{cursor: 'pointer'}}
                        placement="bottom"
                        overlay={renderAskThisDocument}
                    >
                        <button onClick={handleAskThisDocument} style={{border: 'none', background: 'none'}}>
                            {
                                askThisDocument
                                    ? <i className="bi bi-file-check-fill" style={{color: '#44abb6'}}></i>
                                    : <i className="bi bi-file-check"></i>
                            }
                        </button>
                    </OverlayTrigger>
                )}
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderAskWeb}
                >
                    <button onClick={handleAskWeb} style={{border: 'none', background: 'none'}}>
                        {
                            askWeb
                                ? <i className="bi bi-globe" style={{color: '#44abb6'}}></i>
                                : <i className="bi bi-globe"></i>
                        }
                    </button>
                </OverlayTrigger>

                <span className={styles.aiChatbotTranslateChunks}>
                    <ScrapalotCookieSwitch toggleLabel={"translate footnotes"} cookieKey={"scrapalot-translate-chunks"}/>
                </span>
                <div className={styles.aiChatbotLangContainer}>
                    <DropdownButton
                        align="end"
                        size='sm'
                        className={`${styles.aiChatbotLangDropdown} border-0 p-0`}
                        variant="default"
                        id="dropdown-basic-button"
                        title={<img src={language.flag} alt={language.name} style={{width: '18px', height: '18px'}}/>}
                    >
                        <Dropdown.Header>Languages</Dropdown.Header>
                        {languages.map(lang => (
                            <Dropdown.Item key={lang.id} onClick={() => handleLocaleChange(lang)}>
                                <img src={lang.flag} alt={lang.name} style={{width: '16px', height: '16px'}}/> {lang.name}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </div>
            </div>
            <div className={styles.aiChatbot}>

                <ScrapalotSpeechSynthesis>
                    <MessagesList
                        messages={props.messages}
                        setMessages={props.setMessages}
                        handleFootnoteClick={handleFootnoteClick}
                        handleRepeatQuestion={handleRepeatQuestion}
                        footnoteContent={footnoteContent}
                        darkMode={props.darkMode}
                        askWeb={askWeb}
                    />
                </ScrapalotSpeechSynthesis>
                <div className={styles.aiChatbotInputMessageContainer}>
                    <InputGroup className={styles.aiChatbotInputMessage}>
                        <FormControl placeholder="Ask a question"
                                     aria-label="Ask a question"
                                     value={inputText}
                                     onChange={(e) => setInputText(e.target.value)}
                                     onKeyDown={handleKeyDown} // Use onKeyDown event
                                     ref={inputRef}
                                     style={props.darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', borderColor: '#212529'} : {backgroundColor: ''}}
                        />

                        <InputGroup.Text
                            style={props.darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', borderColor: '#212529'} : {backgroundColor: ''}}
                            className={`${styles.aiChatbotInputSendButton} ${props.darkMode ? `${themes.darkThemeInputGroup} ${themes.darkThemeButtons}` : ''}`} onClick={sendMessage}>

                            <button ref={sendButtonRef} style={{border: "none", background: 'none'}}>
                                {isLoading ? (
                                    <Spinner animation="border" variant={spinnerVariant} size="sm"/>
                                ) : (
                                    <i style={props.darkMode ? {color: 'white', borderColor: '#212529'} : {color: 'black'}} className="bi bi-cursor-fill"></i>
                                )}
                            </button>
                        </InputGroup.Text>

                        <Overlay target={inputRef.current} show={!inputValid} placement="top">
                            {(props) => <Tooltip id="overlay-example" {...props}>Please type your message.</Tooltip>}
                        </Overlay>
                    </InputGroup>
                </div>
            </div>
        </div>
    );
}

export default AIChatbot;
