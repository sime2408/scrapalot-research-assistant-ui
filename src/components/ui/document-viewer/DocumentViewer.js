import React, {useContext, useEffect, useState} from "react";
import {Icon, SpecialZoomLevel, Tooltip, Viewer, Worker} from "@react-pdf-viewer/core";
import {Button as BootstrapButton, Modal, OverlayTrigger} from 'react-bootstrap';
import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';

import styles from "./DocumentViewer.module.css";
import {highlightPlugin, RenderHighlightTargetProps} from '@react-pdf-viewer/highlight';
import {SpeakContext} from '../../utils/ScrapalotSpeechSynthesis';
import axios from 'axios';
import Cookies from 'js-cookie';

// Handlers for the button actions
const handleCite = () => {
    console.log("Cite button was clicked.");
};

const handleCopy = () => {
    console.log("Copy button was clicked.");
};

// Function to render the tooltip
const renderTooltip = (props, message) => (
    <Tooltip id={`tooltip-bottom`} {...props}>
        {message}
    </Tooltip>
);

// Create a version of the Button component that forwards the ref it receives
const BootstrapButtonWithRef = React.forwardRef((props, ref) => (
    <BootstrapButton ref={ref} {...props}>{props.children}</BootstrapButton>
));

// Function to render the highlight target
const renderHighlightTarget = (props: RenderHighlightTargetProps, handleTranslate, handleSpeak) => (
    <div
        style={{
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
            placement="top"
            delay={{show: 250, hide: 400}}
            overlay={renderTooltip('Cite')}
        >
            <BootstrapButtonWithRef onClick={handleCite} className={'me-1'}>
                <i className="bi bi-bookmark"></i></BootstrapButtonWithRef>
        </OverlayTrigger>
        <OverlayTrigger
            placement="top"
            delay={{show: 250, hide: 400}}
            overlay={renderTooltip('Copy')}
        >
            <BootstrapButtonWithRef onClick={handleCopy} className={'me-1'}>
                <i className={"bi bi-clipboard"}></i></BootstrapButtonWithRef>
        </OverlayTrigger>
        <OverlayTrigger
            placement="top"
            delay={{show: 250, hide: 400}}
            overlay={renderTooltip('Translate')}
        >
            <BootstrapButtonWithRef onClick={handleTranslate} className={'me-1'}>
                <i className={"bi bi-translate"}></i></BootstrapButtonWithRef>
        </OverlayTrigger>
        <OverlayTrigger
            placement="top"
            delay={{show: 250, hide: 400}}
            overlay={renderTooltip('Speak')}
        >
            <BootstrapButtonWithRef onClick={handleSpeak}>
                <i className="bi bi-megaphone"></i></BootstrapButtonWithRef>
        </OverlayTrigger>
    </div>
);

const ViewerWrapper = ({fileUrl, initialPage, theme, handleTranslate, handleSpeak}) => {

    const renderToolbar = (Toolbar) => (
        <Toolbar>
            {(slots) => {
                const {
                    CurrentPageInput,
                    Download,
                    EnterFullScreen,
                    GoToNextPage,
                    GoToPreviousPage,
                    NumberOfPages,
                    Print,
                    ShowSearchPopover,
                    Zoom,
                    ZoomIn,
                    ZoomOut,
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

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
        thumbnailPlugin: {
            thumbnailWidth: 150,
        },
        sidebarTabs: (defaultTabs) =>
            defaultTabs.concat({
                content: <div style={{textAlign: 'center', width: '100%'}}>Notes are listed here</div>,
                icon: (
                    <Icon size={16}>
                        <path d="M23.5,17a1,1,0,0,1-1,1h-11l-4,4V18h-6a1,1,0,0,1-1-1V3a1,1,0,0,1,1-1h21a1,1,0,0,1,1,1Z"/>
                        <path d="M5.5 12L18.5 12"/>
                        <path d="M5.5 7L18.5 7"/>
                    </Icon>
                ),
                title: 'Notes',
            }),
    });

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget: (props) => renderHighlightTarget(props, handleTranslate, handleSpeak),
    });

    return (
        <Viewer fileUrl={fileUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
                plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
                initialPage={initialPage}
                theme={theme}/>
    );
};

function DocumentViewer({selectedDatabase, selectedDocument, setSelectedDocument, selectedDocumentInitialPage, darkMode}) {

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

    function getFileType(selectedDocument) {
        return selectedDocument && selectedDocument.name.split(".").pop();
    }

    const handleTranslate = async () => {
        const text = window.getSelection().toString();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/translate`, {
                src_lang: "en",
                dst_lang: Cookies.get("scrapalot-locale") || "en",
                text: text
            });
            setTranslatedText(response.data.translated_text);
            setShowTranslation(true);
        } catch (error) {
            console.error("Error translating text:", error);
        }
    };

    const handleSpeakTranslation = () => {
        speak(translatedText, Cookies.get("scrapalot-locale") || "en");
    };

    const handleSpeak = () => {
        const text = window.getSelection().toString();
        speak(text);
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
                                handleTranslate={handleTranslate}
                                handleSpeak={handleSpeak}
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
                    <h1 style={darkMode ? {textShadow: '0px 0px 3px rgba(66, 73, 77, 0.8)'} : {textShadow: '0 2px 3px rgba(255, 255, 255, 0.8)'}}>
                        please select a document
                    </h1>
                </div>
            )}

            <Modal show={showTranslation} onHide={() => setShowTranslation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Translated Text</Modal.Title>
                </Modal.Header>
                <Modal.Body>{translatedText}</Modal.Body>
                <Modal.Footer>
                    <BootstrapButton variant="secondary" onClick={handleSpeakTranslation}>
                        Speak
                    </BootstrapButton>
                    <BootstrapButton variant="primary" onClick={() => setShowTranslation(false)}>
                        Close
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default DocumentViewer;
