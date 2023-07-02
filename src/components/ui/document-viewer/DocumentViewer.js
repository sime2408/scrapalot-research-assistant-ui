import React, {useEffect, useState} from "react";
import axios from 'axios';
import {SpecialZoomLevel, Viewer, Worker} from "@react-pdf-viewer/core";
import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';
import {ReactReader as EpubReader, ReactReaderStyle} from 'react-reader';

import styles from "./DocumentViewer.module.css";

function DocumentViewer({selectedDatabase, selectedDocument, setSelectedDocument, darkMode}) {
    // file type state
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        if (selectedDocument && selectedDocument.name) {
            const fileType = getFileType(selectedDocument);
            setFileType(fileType);

            switch (fileType) {
                case "pdf":
                    // NOOP
                    break;
                case "epub":
                    // Reset location to the beginning of the book
                    //setEpubContentLocation(null);
                    const controller = new AbortController();
                    // fetch EPUB Blob from server
                    fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/database/${selectedDatabase}/file/${selectedDocument.name}`,
                        {signal: controller.signal} // associate the fetch with your controller
                    )
                        .then(response => response.blob())
                        .then(blob => {
                            setEpubContent(blob);
                        })
                        .catch((error) => {
                            // Don't log an error if fetch was cancelled
                            if (error.name === 'AbortError') return;
                            console.error("Error fetching EPUB Blob:", error);
                        });
                    // Clean up: cancel the fetch request if a new file is selected before the Blob is fully fetched
                    return () => {
                        controller.abort();
                        setEpubContent(null); // clean up so new file can arrive
                    };
                case "docx":
                    // fetch HTML content from server
                    axios
                        .get(
                            `${process.env.REACT_APP_API_BASE_URL}/database/${selectedDatabase}/file/${selectedDocument.name}`
                        )
                        .then((response) => {
                            setHtmlContent(response.data);
                        })
                        .catch((error) => {
                            console.error("Error fetching HTML content:", error);
                        });
                    break;
                default:
                    // Unsupported file type
                    break;
            }
        }
    }, [selectedDatabase, selectedDocument, setSelectedDocument]);

    function getFileType(selectedDocument) {
        return selectedDocument && selectedDocument.name.split(".").pop();
    }

    // PDF

    interface ViewerWrapperProps {
        fileUrl: string;
    }

    const ViewerWrapper: React.FC<ViewerWrapperProps> = ({fileUrl}) => {

        const defaultLayoutPluginInstance = defaultLayoutPlugin({
            thumbnailPlugin: {
                thumbnailWidth: 150,
            },
        });

        return (
            <Viewer fileUrl={fileUrl}
                    defaultScale={SpecialZoomLevel.PageFit}
                    plugins={[defaultLayoutPluginInstance]} theme={darkMode ? "dark" : "light"}/>

        );
    };

    // EPUB

    const [epubContent, setEpubContent] = useState(null);
    const [epubContentLocation, setEpubContentLocation] = useState(null)
    const epubLocationChanged = epubcifi => {
        // Epubcifi is an internal string used by epubjs to point to a location in an epub.
        // It looks like this: epubcifi(/6/6[titlepage]!/4/2/12[pgepubid00003]/3:0)
        setEpubContentLocation(epubcifi)
    }

    const epubContentStyles = {
        ...ReactReaderStyle,
        titleArea: {
            ...ReactReaderStyle.titleArea,
            color: darkMode ? "#f5f5f5" : "#212529"
        },
        readerArea: {
            ...ReactReaderStyle.readerArea,
            backgroundColor: darkMode ? "#212529" : "white",
        },
        tocArea: {
            ...ReactReaderStyle.tocArea,
            backgroundColor: darkMode ? "#212529" : "#f5f5f5",
        },
        arrow: {
            ...ReactReaderStyle.arrow,
            color: darkMode ? "rgb(92, 102, 108)" : "#212529"
        }
    }

    console.log(epubContentStyles)

    // HTML
    const [htmlContent, setHtmlContent] = useState(null);

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
                    {(fileType === "epub") && (
                        <div>
                            <div className={styles.fileEpubViewer}>
                                <div style={{height: 'calc(100vh - 118px)', backgroundColor: "#212529"}}>
                                    <EpubReader
                                        title={selectedDocument.name}
                                        key={`${selectedDocument.name}-${darkMode ? 'dark' : 'light'}`}  // make sure every document is unique and also depends on the theme
                                        location={epubContentLocation}
                                        locationChanged={epubLocationChanged}
                                        url={epubContent}
                                        showToc={true}
                                        readerStyles={epubContentStyles}
                                        epubOptions={{
                                            allowPopups: true,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {(fileType === "docx") && (
                        <div>
                            <div className={styles.fileHtmlViewer}>
                                <div dangerouslySetInnerHTML={{__html: htmlContent}}/>
                            </div>
                        </div>
                    )}
                    {fileType !== "pdf" && fileType !== "docx" && fileType !== "epub" && (
                        <div>Unsupported file type</div>
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
