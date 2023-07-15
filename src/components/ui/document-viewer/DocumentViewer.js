import React, {ReactElement, useEffect, useState} from "react";
import {Button, Icon, Position, SpecialZoomLevel, Tooltip, Viewer, Worker} from "@react-pdf-viewer/core";

import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';

import styles from "./DocumentViewer.module.css";
import {highlightPlugin, MessageIcon, RenderHighlightTargetProps} from '@react-pdf-viewer/highlight';

const renderToolbar = (Toolbar: (props) => ReactElement) => (
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

const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
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
        <Tooltip
            position={Position.TopCenter}
            target={
                <Button onClick={props.toggle}>
                    <MessageIcon/>
                </Button>
            }
            content={() => <div style={{width: '100px'}}>Add a note</div>}
            offset={{left: 0, top: -8}}
        />
    </div>
);

const ViewerWrapper = ({fileUrl, initialPage, theme}) => {
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
        renderHighlightTarget,
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

    useEffect(() => {
        if (selectedDocument && selectedDocument.name) {
            const fileType = getFileType(selectedDocument);
            setFileType(fileType);
        }
    }, [selectedDatabase, selectedDocument, setSelectedDocument]);

    function getFileType(selectedDocument) {
        return selectedDocument && selectedDocument.name.split(".").pop();
    }

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
                            />
                        </Worker>
                    )}
                    {fileType !== "pdf" && (
                        <div className={styles.fileViewerNoFile}>
                            <h4 style={darkMode ? { textShadow: '0px 0px 3px rgba(66, 73, 77, 0.8)' } : { textShadow: '0 2px 3px rgba(255, 255, 255, 0.8)' }}>
                                unsupported file type
                            </h4>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.fileViewerNoFile}>
                    <h1 style={darkMode ? { textShadow: '0px 0px 3px rgba(66, 73, 77, 0.8)' } : { textShadow: '0 2px 3px rgba(255, 255, 255, 0.8)' }}>
                        please select a document
                    </h1>
                </div>
            )}
        </div>
    );
}

export default DocumentViewer;
