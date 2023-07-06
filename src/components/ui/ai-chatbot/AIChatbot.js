import React, {useEffect, useRef, useState} from "react";
import {Dropdown, DropdownButton, FormControl, InputGroup, Overlay, OverlayTrigger, Spinner, Tooltip} from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./AIChatbot.module.css";
import themes from '../../themes/CustomThemeProvider.module.css';
import Footnote from "./Footnote";
import englishFlag from '../../../static/img/flags/en.svg';
import germanFlag from '../../../static/img/flags/de.svg';
import spanishFlag from '../../../static/img/flags/es.svg';
import frenchFlag from '../../../static/img/flags/fr.svg';
import italianFlag from '../../../static/img/flags/it.svg';
import croatianFlag from '../../../static/img/flags/hr.svg';
import ScrapalotCookieSwitch from '../../utils/ScrapalotCookieSwitch';

const MessagesList = (props) => {

    const userBgColor = props.darkMode ? 'rgb(65 73 77)' : 'rgba(79, 181, 185, 0.1)';
    const aiBgColor = props.darkMode ? 'rgb(92 102 108)' : '#f8f9fa';
    const textColor = props.darkMode ? 'rgb(244 244 244)' : '#212529';

    const [footnoteShowFullContent, setFootnoteShowFullContent] = useState(false);
    const [footnoteLastClickedIndex, setFootnoteLastClickedIndex] = useState({messageIndex: null, footnoteIndex: null});

    const handleDeleteMessage = (indexToDelete) => {
        // Filter out the message at the given index
        const newMessages = props.messages.filter((message, index) => index !== indexToDelete);
        // Update state
        props.setMessages(newMessages);
        // Update localStorage
        localStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Could not copy text to clipboard: ', err);
        });
    };

    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = (text, lang) => {
        if (!speaking) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;

                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.onvoiceschanged = function () {
                        window.speechSynthesis.speak(utterance);
                    };
                } else {
                    window.speechSynthesis.speak(utterance);
                }

                setSpeaking(true);

                utterance.onend = () => {
                    setSpeaking(false);
                }
            } else {
                console.error("Your browser does not support text to speech.");
            }
        } else {
            window.speechSynthesis.cancel();
            setSpeaking(false);
        }
    };

    return (
        <div className={styles.aiChatbotMessagesList}>
            {props.messages.map((message, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: message.source === "user" ? userBgColor : aiBgColor,
                        color: textColor,
                    }}
                    className={`${styles.aiChatbotMessage} ${
                        message.source === "user" ? styles.userMessage : styles.aiMessage
                    }`}
                >
                    <div className={styles.aiChatbotMessageText}>
                        {message["source"] === "user" ? (
                            message["answer"]
                        ) : (
                            <>
                                {message["answer"]} <br/>
                                <div className={styles.aiMessageFootnote} style={{display: 'flex', flexWrap: 'wrap'}}>
                                    {message["source_documents"] &&
                                        message["source_documents"].map((doc, i) => (
                                            <Footnote
                                                key={i}
                                                index={i + 1}
                                                link={doc["link"]}
                                                content={doc["content"]}
                                                page={doc["page"] || 0}
                                                setSelectedDatabase={props.setSelectedDatabase}
                                                setSelectedDocument={props.setSelectedDocument}
                                                handleFootnoteClick={(content, page) => props.handleFootnoteClick(content, page, index)}
                                                footnoteLastClickedIndex={footnoteLastClickedIndex}
                                                setFootnoteLastClickedIndex={setFootnoteLastClickedIndex}
                                                messageIndex={index}
                                            />
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                    {message["source"] === "ai" && props.footnoteContent.messageIndex === index && (
                        <div style={{fontSize: '0.80rem', fontStyle: 'italic', color: 'rgb(157 157 157)', marginTop: '0.2rem'}}>
                            {footnoteShowFullContent ? `"${props.footnoteContent.content}"` : `"${props.footnoteContent.content.slice(0, 150)}"`}
                            {props.footnoteContent.content.length > 200 && (
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setFootnoteShowFullContent(!footnoteShowFullContent)
                                }}>
                                    {footnoteShowFullContent ? " less" : " more"}
                                </a>
                            )}
                        </div>
                    )}
                    <div className={`${styles.aiChatbotMessageToolbar}`} style={{color: textColor}}>
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-bottom`}>
                                    Delete Message
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-trash" onClick={() => handleDeleteMessage(index)}></i>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-bottom`}>
                                    Copy to Clipboard
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-clipboard" onClick={() => handleCopyToClipboard(message.answer)}></i>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-bottom`}>
                                    Speak Text
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-megaphone" onClick={() => handleSpeak(message.answer, message.language)}></i>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-bottom`}>
                                    {message.source === "user" ? "User Message" : "AI Message"}
                                </Tooltip>
                            }
                        >
                            <i className={`bi ${
                                message.source === "user" ? "bi-person-fill" : "bi-robot"
                            }`}></i>
                        </OverlayTrigger>
                    </div>

                </div>
            ))}
        </div>
    );
}


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
        <div style={{padding: '8px 6px', height: 'calc(100vh - 134px)'}}>
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
