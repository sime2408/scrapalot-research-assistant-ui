import React, {useEffect, useState} from "react";
import {SpecialZoomLevel, Viewer, Worker} from "@react-pdf-viewer/core";

import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';

import styles from "./DocumentViewer.module.css";

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

    // PDF

    const ViewerWrapper = ({fileUrl}) => {

        const defaultLayoutPluginInstance = defaultLayoutPlugin({
            thumbnailPlugin: {
                thumbnailWidth: 150,
            },
        });

        return (
            <Viewer fileUrl={fileUrl}
                    defaultScale={SpecialZoomLevel.PageWidth}
                    plugins={[defaultLayoutPluginInstance]}
                    initialPage={selectedDocumentInitialPage}
                    theme={darkMode ? "dark" : "light"}/>

        );
    };

    return (
        <div className={styles.fileViewer}>
            {selectedDocument ? (
                <>
                    {fileType === "pdf" && (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                            <ViewerWrapper className={styles.filePdfViewer}
                                           fileUrl={`${process.env.REACT_APP_API_BASE_URL}/database/${selectedDatabase}/file/${selectedDocument.name}`}
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
        </div>
    );
}

export default DocumentViewer;
