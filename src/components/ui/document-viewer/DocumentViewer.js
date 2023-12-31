import React, {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {SpecialZoomLevel, Tooltip, Viewer, Worker} from "@react-pdf-viewer/core";
import {Button as BootstrapButton, Modal, OverlayTrigger} from 'react-bootstrap';
import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';

import styles from "./DocumentViewer.module.css";
import {highlightPlugin, RenderHighlightTargetProps} from '@react-pdf-viewer/highlight';
import {SpeakContext} from '../../utils/ScrapalotSpeechSynthesis';
import axios from 'axios';
import Cookies from 'js-cookie';
import themes from '../../themes/CustomThemeProvider.module.css';
import {useTheme} from '../../themes/ScrapalotThemeContext';

// Handlers for the button actions
const handleCopyToClipboard = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startContainer && range.endContainer) {
            const text = selection.toString();
            if (text !== '') {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Text copied to clipboard');
                }).catch(err => {
                    console.error('Could not copy text to clipboard: ', err);
                });
            }
        }
    }
};

// Function to render the tooltip
const renderTooltip = (props, message) => (
    <Tooltip id={`tooltip-bottom`} {...props}>
        {message}
    </Tooltip>
);

// Create a version of the Button component that forwards the ref it receives
const BootstrapButtonWithRef = forwardRef((props, ref) => (
    <BootstrapButton ref={ref} {...props}>{props.children}</BootstrapButton>
));

const ViewerWrapper = ({fileUrl, initialPage, theme, renderHighlightTarget, footnoteHighlightedText}) => {

    const renderToolbar = (Toolbar) => (
        <Toolbar>
            {(slots) => {
                const {
                    ShowSearchPopover,
                    ZoomOut,
                    Zoom,
                    ZoomIn,
                    GoToPreviousPage,
                    CurrentPageInput,
                    NumberOfPages,
                    GoToNextPage,
                    EnterFullScreen,
                    Download,
                    Print,
                } = slots;
                return (
                    <div
                        style={{
                            alignItems: 'center',
                            display: 'flex',
                            width: '100%',
                        }}
                    >
                        <div style={{padding: '0px 2px'}}>
                            <ShowSearchPopover/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <ZoomOut/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <Zoom/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <ZoomIn/>
                        </div>
                        <div style={{padding: '0px 2px', marginLeft: 'auto'}}>
                            <GoToPreviousPage/>
                        </div>
                        <div style={{padding: '0px 2px', display: 'contents'}}>
                            <CurrentPageInput/> / <NumberOfPages/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <GoToNextPage/>
                        </div>
                        <div style={{padding: '0px 2px', marginLeft: 'auto'}}>
                            <EnterFullScreen/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <Download/>
                        </div>
                        <div style={{padding: '0px 2px'}}>
                            <Print/>
                        </div>
                    </div>
                );
            }}
        </Toolbar>
    );

    // Split the footnoteHighlightedText into words because formatting is not the same
    let searchKeywords = [];
    if (footnoteHighlightedText) {
        const words = footnoteHighlightedText.split(' ');
        for (let i = 0; i < words.length - 1; i++) {
            searchKeywords.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
    }

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [
            // Remove the attachments tab (\`defaultTabs[2]\`)
            defaultTabs[0], // Bookmarks tab
            defaultTabs[1], // Thumbnails tab
        ],
        renderToolbar,
        toolbarPlugin: {
            searchPlugin: {
                keyword: searchKeywords,
                onHighlightKeyword: (props) => {
                    props.highlightEle.style.backgroundColor = 'rgba(253, 196, 70, 0.1)';
                },
            },
        },
        thumbnailPlugin: {
            thumbnailWidth: 150,
        }
    });

    const {toolbarPluginInstance} = defaultLayoutPluginInstance;
    const {searchPluginInstance} = toolbarPluginInstance;
    const {setTargetPages} = searchPluginInstance;

    // Only search in page we selected
    setTargetPages((targetPage) => targetPage.pageIndex === initialPage);

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
    });

    return (
        <Viewer fileUrl={fileUrl}
                defaultScale={SpecialZoomLevel.ActualSize}
                plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
                initialPage={initialPage}
                theme={theme}/>
    );
};

function DocumentViewer({selectedDatabase, selectedDocument, setSelectedDocument, selectedDocumentInitialPage, footnoteHighlightedText, setManuallySelectedTextFromDocument}) {

    const {darkMode} = useTheme();

    // file type state
    const [fileType, setFileType] = useState(null);
    const [showTranslation, setShowTranslation] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const {speak} = useContext(SpeakContext);

    useEffect(() => {
        if (selectedDocument && selectedDocument.name) {
            const fileType = getFileType(selectedDocument);
            setFileType(fileType);
        }
    }, [selectedDatabase, selectedDocument, setSelectedDocument]);

    // when you select the text, prevent selection leaking into other components
    const documentViewerRef = useRef(null);

    useEffect(() => {
        function handleMouseUp(event) {
            // If the mouse up event happens outside the DocumentViewer component
            if (documentViewerRef.current && !documentViewerRef.current.contains(event.target)) {
                // Clear any selection
                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE?
                    document.selection.empty();
                }
            }
        }

        const node = documentViewerRef.current;
        if (node) {
            node.addEventListener('mouseup', handleMouseUp);

            return () => {
                node.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, []);

    function getFileType(selectedDocument) {
        return selectedDocument && selectedDocument.name.split(".").pop();
    }

    // Function to render the highlight target
    const renderHighlightTarget = (props: RenderHighlightTargetProps, handleTranslate, handleSpeak) => (
        <div
            style={{
                marginTop: '6px',
                background: '#eee',
                display: 'flex',
                position: 'absolute',
                left: `${props.selectionRegion.left}%`,
                top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                transform: 'translate(0, 8px)',
                zIndex: 1,
            }}
        >
            <OverlayTrigger
                style={{cursor: 'pointer'}}
                placement="top"
                trigger={["hover", "focus"]}
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Cite')}
            >
                <BootstrapButtonWithRef onClick={handleCite} className={'me-1'}>
                    <i className="bi bi-blockquote-left"></i></BootstrapButtonWithRef>
            </OverlayTrigger>
            <OverlayTrigger
                style={{cursor: 'pointer'}}
                placement="top"
                trigger={["hover", "focus"]}
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Copy')}
            >
                <BootstrapButtonWithRef onClick={handleCopyToClipboard} className={'me-1'}>
                    <i className={"bi bi-clipboard"}></i></BootstrapButtonWithRef>
            </OverlayTrigger>
            <OverlayTrigger
                style={{cursor: 'pointer'}}
                placement="top"
                trigger={["hover", "focus"]}
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Translate')}
            >
                <BootstrapButtonWithRef onClick={handleTranslate} className={'me-1'}>
                    <i className={"bi bi-translate"}></i></BootstrapButtonWithRef>
            </OverlayTrigger>
            <OverlayTrigger
                style={{cursor: 'pointer'}}
                placement="top"
                trigger={["hover", "focus"]}
                delay={{show: 250, hide: 400}}
                overlay={renderTooltip('Speak')}
            >
                <BootstrapButtonWithRef onClick={handleSpeak}>
                    <i className="bi bi-megaphone"></i></BootstrapButtonWithRef>
            </OverlayTrigger>
        </div>
    );

    const handleCite = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startContainer && range.endContainer) {
                let text = selection.toString();
                if (text !== '') {
                    text = text.replace(/\n/g, ' ');  // Replace newline characters with spaces
                    text = text.replace(/-\s/g, ''); // Replace hyphen followed by space with nothing (joining the word parts)
                    setManuallySelectedTextFromDocument(text);  // Set the selected text
                }
            }
        }
    };

    const handleTranslate = async () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startContainer && range.endContainer) {
                const text = selection.toString();
                if (text !== '') {
                    try {
                        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/translate`, {
                            src_lang: "en",
                            dst_lang: Cookies.get("scrapalot-locale") || "en",
                            text: text
                        });
                        setTranslatedText(response.data["translated_text"]);
                        setShowTranslation(true);
                    } catch (error) {
                        console.error("Error translating text:", error);
                    }
                }
            }
        }
    };

    const handleSpeakTranslation = () => {
        speak(translatedText, Cookies.get("scrapalot-locale") || "en");
    };

    const handleSpeak = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startContainer && range.endContainer) {
                const text = selection.toString();
                speak(text);
            }
        }
    };

    return (
        <div className={styles.fileViewer}>
            {selectedDocument ? (
                <>
                    {fileType === "pdf" && (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                            <ViewerWrapper
                                // make sure that react re-render each Footnote click
                                key={`${selectedDocument.name}-${selectedDocumentInitialPage}`}
                                className={styles.filePdfViewer}
                                fileUrl={`${process.env.REACT_APP_API_BASE_URL}/database/${selectedDatabase}/file/${selectedDocument.name}`}
                                initialPage={selectedDocumentInitialPage}
                                theme={darkMode ? "dark" : "light"}
                                renderHighlightTarget={(props) => renderHighlightTarget(props, handleTranslate, handleSpeak, handleCite)}
                                footnoteHighlightedText={footnoteHighlightedText}
                            />
                        </Worker>
                    )}
                    {fileType !== "pdf" && (
                        <div className={styles.fileViewerNoFile}>
                            <h4 style={darkMode ? {textShadow: '0px 0px 3px rgba(66, 73, 77, 0.8)'} : {textShadow: '0 2px 3px rgba(255, 255, 255, 0.8)'}}>
                                unsupported file type
                            </h4>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.fileViewerNoFile}>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '100px'}}>
                        <div style={{textAlign: 'center'}}>
                            <i className="bi bi-upload" style={darkMode ? {color: '#5c676c'} : {color: '#82c5cc'}}></i>
                            <div>
                                <button style={darkMode ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent', color: '#9ca2a7'}}>Upload</button>
                            </div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <i className="bi bi-database-add" style={darkMode ? {color: '#5c676c'} : {color: '#82c5cc'}}></i>
                            <div>
                                <button style={darkMode ? {backgroundColor: 'transparent'} : {backgroundColor: 'transparent', color: '#9ca2a7'}}>New Database</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal show={showTranslation} onHide={() => setShowTranslation(false)}>
                <Modal.Header style={{borderRadius: '0'}} closeButton className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
                    <Modal.Title><i className="bi bi-translate"></i> translated text</Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}>{translatedText}</Modal.Body>
                <Modal.Footer style={{borderRadius: '0'}} className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
                    <BootstrapButton variant="secondary" onClick={handleSpeakTranslation}>
                        <i className="bi bi-megaphone"></i> speak
                    </BootstrapButton>
                    <BootstrapButton variant="primary" onClick={() => setShowTranslation(false)}>
                        <i className="bi bi-x-circle"></i> close
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default DocumentViewer;
