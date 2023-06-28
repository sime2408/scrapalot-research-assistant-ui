import React, {useEffect, useRef, useState} from "react";
import {FormControl, InputGroup, Overlay, Spinner, Tooltip} from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./AIChatbot.module.css";
import Footnote from "./Footnote";

// MessagesList component
function MessagesList({messages, selectedDocument, setSelectedDocument}) {
    return (
        <div className={styles.aiChatbotMessagesList}>
            {messages.map((message, index) => (
                <div
                    key={index}
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
                                <div className={styles.aiMessageFootnote}>
                                    {message["source_documents"] &&
                                        message["source_documents"].map((doc, i) => (
                                            <Footnote
                                                key={i}
                                                index={i + 1}
                                                link={doc["link"]}
                                                content={doc["content"]}
                                                selectedDocument={selectedDocument}
                                                setSelectedDocument={setSelectedDocument}
                                            />
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className={styles.aiChatbotMessageToolbar}>
                        <i className="bi bi-trash"></i>
                        <i className="bi bi-clipboard"></i>
                        <i className="bi bi-megaphone"></i>
                        <i
                            className={`bi ${
                                message.source === "user" ? "bi-person-fill" : "bi-robot"
                            }`}
                        ></i>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AIChatbot({selectedDocument, setSelectedDocument, db_name, db_collection_name, messages, setMessages}) {

    // Load the locale or set to 'en' by default
    const [locale, setLocale] = useState(() => Cookies.get("scrapalot-locale") || "en");
    const [inputText, setInputText] = useState("");
    const [inputValid, setInputValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef(null); // Ref to track the input element
    const sendButtonRef = useRef(null); // New Ref for InputGroup.Text (send button)

    // React to the locale change
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

    const sendMessage = async () => {
        if (inputText.trim() !== "") {
            const savedLocale = Cookies.get("scrapalot-locale");
            if (savedLocale) {
                setLocale(savedLocale);
            }

            // Create a new message object
            const newMessage = {answer: inputText, source: "user"};

            setMessages((prevMessages) => {
                // Save the new messages to sessionStorage before updating state
                const newMessages = [...prevMessages, newMessage];
                sessionStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
                return newMessages;
            });

            setIsLoading(true);

            const requestBody = {
                database_name: db_name,
                question: inputText,
                collection_name: db_collection_name || db_name,
                locale: Cookies.get("scrapalot-locale") || "en",
                translate_chunks: Cookies.get("scrapalot-translate-chunks") === "true" || false,
            };

            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/query`, requestBody);
                response.data["source"] = "ai"; // source property is now AI

                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages, response.data];
                    sessionStorage.setItem("scrapalot-chat-messages", JSON.stringify(newMessages));
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

    return (
        <div className={styles.aiChatbot}>
            <MessagesList
                messages={messages}
                selectedDocument={selectedDocument}
                setSelectedDocument={setSelectedDocument}
            />
            <div className={styles.aiChatbotInputMessageContainer}>
                <InputGroup className={styles.aiChatbotInputMessage}>
                    <FormControl
                        placeholder="Ask a question"
                        aria-label="Ask a question"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown} // Use onKeyDown event
                        ref={inputRef}
                    />
                    <InputGroup.Text className={styles.sendButton} onClick={sendMessage}>
                        <button ref={sendButtonRef} style={{border: "none", background: "none"}}>
                            {isLoading ? (
                                <Spinner animation="border" variant="dark" size="sm"/>
                            ) : (
                                <i className="bi bi-cursor-fill"></i>
                            )}
                        </button>
                    </InputGroup.Text>

                    <Overlay target={inputRef.current} show={!inputValid} placement="top">
                        {(props) => <Tooltip id="overlay-example" {...props}>Please type your message.</Tooltip>}
                    </Overlay>
                </InputGroup>
            </div>
        </div>
    );
}

export default AIChatbot;
