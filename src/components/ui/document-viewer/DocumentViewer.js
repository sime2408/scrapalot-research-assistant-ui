import React, {useEffect, useState} from "react";
import {Document as PdfViewer, Page, pdfjs} from "react-pdf";
import CustomSpinner from '../../utils/CustomSpinner';

import styles from "./DocumentViewer.module.css";
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function DocumentViewer({selectedDatabase, selectedDocument, setSelectedDocument, zoomLevel, setNumPages}) {
    // loading state
    const [isLoading, setIsLoading] = useState(true);
    // pages state
    const [numPages, setLocalNumPages] = useState(null);
    // file type state
    const [fileType, setFileType] = useState(null);
    // html content state
    const [htmlContent, setHtmlContent] = useState(null);

    useEffect(() => {
        if (selectedDocument && selectedDocument.name) {
            const fileType = getFileType(selectedDocument);
            setFileType(fileType);

            switch (fileType) {
                case "pdf":
                    // NOOP
                    break;
                case "epub":
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

    function onDocumentLoadSuccess({numPages}) {
        setLocalNumPages(numPages);
        setNumPages(numPages);
        setIsLoading(false);
    }

    return (
        <div className={styles.fileViewer}>
            {selectedDocument ? (
                <>
                    {fileType === "pdf" && (
                        <PdfViewer
                            file={`${process.env.REACT_APP_API_BASE_URL}/database/${selectedDatabase}/file/${selectedDocument.name}`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<CustomSpinner/>}
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    id={`page_${index + 1}`}
                                    className={`${styles.pageDivider}`}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={zoomLevel}
                                        onRenderSuccess={() => console.log(`Page ${index + 1} rendered`)}
                                    />
                                </div>
                            ))}
                            {isLoading && <CustomSpinner/>}
                        </PdfViewer>
                    )}
                    {(fileType === "epub" || fileType === "docx") && (
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
                    <h1>please select a document</h1>
                </div>
            )}
        </div>
    );
}

export default DocumentViewer;
