import React, {useState} from 'react';
import styles from './AIChatbot.module.css';
import Footnote from './Footnote';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

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

export default MessagesList;
