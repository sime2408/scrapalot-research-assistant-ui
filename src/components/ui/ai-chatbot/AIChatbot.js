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

const AIChatbot = (props) => {
// function AIChatbot({locale, setLocale, setSelectedDatabase, setSelectedDocument, onFootnoteClick, db_name, db_collection_name, messages, setMessages, darkMode}) {

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

    const sendMessage = async () => {
        // Declare and assign the value for savedLocale here
        const savedLocale = Cookies.get("scrapalot-locale") || "en";

        if (inputText.trim() !== "") {
            const newMessage = {answer: inputText, source: "user", language: props.locale};

            props.setMessages((prevMessages) => {
                const newMessages = [...prevMessages, newMessage];
                localStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
                return newMessages;
            });

            setIsLoading(true);

            const requestBody = {
                database_name: props.db_name,
                question: inputText,
                collection_name: props.db_collection_name || props.db_name,
                locale: savedLocale,
                translate_chunks: Cookies.get("scrapalot-translate-chunks") === "true" || false,
            };

            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/query`, requestBody);
                response.data["source"] = "ai"; // source property is now AI
                response.data["language"] = savedLocale

                props.setMessages((prevMessages) => {
                    const newMessages = [...prevMessages, response.data];
                    localStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
                    return newMessages;
                });
            } catch (error) {
                console.error("Failed to send message:", error);
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
            sendButtonRef.current.focus(); // Focus on the send button
        }
    };

    const handleFootnoteClick = (content, pageNumber, messageIndex) => {
        setFootnoteContent({content, messageIndex});
        props.onFootnoteClick(pageNumber - 1); // subtract 1 because PDF.js uses zero-based index
    };

    // dark theme backgrounds
    const spinnerVariant = props.darkMode ? 'light' : 'dark';


    // toolbar

    const renderClearTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            clear the chat messages
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

    return (
        <div style={{padding: '8px 8px 8px 0', height: 'calc(100vh - 134px)'}}>
            <div className={styles.aiChatbotToolbar}>
                <OverlayTrigger
                    style={{cursor: 'pointer'}}
                    placement="bottom"
                    overlay={renderClearTooltip}
                >
                    <button onClick={props.handleClearMessages} style={{border: 'none', background: 'none'}}>
                        <i className="bi bi-trash"></i>
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
                <MessagesList
                    messages={props.messages}
                    setMessages={props.setMessages}
                    setSelectedDatabase={props.setSelectedDatabase}
                    setSelectedDocument={props.setSelectedDocument}
                    handleFootnoteClick={handleFootnoteClick}
                    footnoteContent={footnoteContent}
                    darkMode={props.darkMode}
                />
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
