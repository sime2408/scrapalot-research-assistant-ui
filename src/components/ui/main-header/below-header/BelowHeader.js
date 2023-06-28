import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Dropdown, DropdownButton, FormControl, InputGroup, Overlay, OverlayTrigger, Row, Tooltip} from "react-bootstrap";

import styles from "./BelowHeader.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Cookies from 'js-cookie';

import CustomAlert from '../../../utils/CustomAlert';
import CustomCookieSwitch from '../../../utils/CustomCookieSwitch';

function BelowHeader({
                         fileType, onSearch, onZoomIn, onZoomOut, onNextPage,
                         onPreviousPage, numPages, setCurrentPage, handleClearMessages
                     }) {

    const languages = [
        {id: 'en', name: 'English', flag: '🇬🇧'},
        {id: 'de', name: 'German', flag: '🇩🇪'},
        {id: 'es', name: 'Spanish', flag: '🇪🇸'},
        {id: 'fr', name: 'French', flag: '🇫🇷'},
        {id: 'it', name: 'Italian', flag: '🇮🇹'},
        {id: 'hr', name: 'Croatian', flag: '🇭🇷'},
    ];

    // alert state
    const [showAlert, setShowAlert] = useState(false);
    // search through files from the sidebar
    const searchThroughFiles = useRef(null);
    // input page num state
    const [pageInput, setPageInput] = useState("1");
    // chosen languages states
    const [language, setLanguage] = useState(() => {
        const savedLocale = Cookies.get('scrapalot-locale');
        return languages.find(lang => lang.id === savedLocale) || languages[0];
    });
    const [search, setSearch] = useState("");
    // question/answers state
    const [qaInputValid, setQaInputValid] = useState(true);

    useEffect(() => {
        if (search.length >= 3 || search.length === 0) {
            setQaInputValid(true);
            onSearch(search);
        } else {
            setQaInputValid(false);
        }
    }, [search, onSearch]);

    useEffect(() => {
        // Save the selected locale to cookie whenever it changes
        Cookies.set('scrapalot-locale', language.id, {expires: 30});
    }, [language]);

    // function to handle form submit

    const onGoToPage = (e) => {
        if (e.key === "Enter") {
            const pageNum = parseInt(pageInput);

            if (pageNum <= 0 || pageNum > numPages || isNaN(pageNum)) {
                setShowAlert(true);
            } else {
                setCurrentPage(pageNum);
                setShowAlert(false);
            }
        }
    };

    // Determine if buttons and inputs should be hidden / disabled
    const isToolbarHidden = fileType !== 'pdf';
    const isNextPreviousDisabled = !numPages;

    const closeAlert = () => setShowAlert(false);

    const renderSearchTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            search files in the selected database
        </Tooltip>
    );

    const renderClearTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            clear the chat messages
        </Tooltip>
    );

    return (
        <Row className={styles.row}>
            <Col md={2} className={`${styles.belowHeaderSearchBar} ${styles.col}`}>
                <div style={{width: "calc(100% - 20px)", margin: "0 10px"}}>
                    <InputGroup className={styles.inputGroup}>
                        <OverlayTrigger
                            placement="bottom"
                            delay={{show: 250, hide: 400}}
                            overlay={renderSearchTooltip}
                            trigger={["hover", "focus"]}
                        >
                            <FormControl
                                placeholder="search files"
                                aria-label="Search"
                                style={{paddingRight: '35px'}}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                ref={searchThroughFiles}
                            />
                        </OverlayTrigger>
                        <InputGroup.Text className={styles.belowHeaderSearchBarInput}>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Overlay target={searchThroughFiles.current} show={!qaInputValid} placement="top">
                            {(props) => (
                                <Tooltip id="overlay-example" {...props}>
                                    Please type at least 3 characters.
                                </Tooltip>
                            )}
                        </Overlay>
                    </InputGroup>
                </div>
            </Col>
            <Col md={7} className={styles.col}>
                <div className={`${styles.belowHeaderToolbar} d-flex justify-content-center`}>
                    {!isToolbarHidden && (
                        <>
                            <Button variant="light" onClick={() => onPreviousPage(setPageInput)} className="mx-1" disabled={isNextPreviousDisabled}>
                                <i className="bi bi-chevron-left"></i>
                            </Button>
                            <Button variant="light" onClick={() => onNextPage(setPageInput)} className="mx-1" disabled={isNextPreviousDisabled}>
                                <i className="bi bi-chevron-right"></i>
                            </Button>
                            <InputGroup className="mx-1" style={{width: "145px"}}>
                                <FormControl
                                    type="number"
                                    min={1}
                                    max={numPages}
                                    placeholder={`go to page`}
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onKeyDown={onGoToPage}
                                    disabled={isNextPreviousDisabled}
                                />
                            </InputGroup>
                            {showAlert && (
                                <CustomAlert message="Invalid page number!" onClose={closeAlert}/>
                            )}
                            <Button variant="light" onClick={onZoomOut} className="mx-1" disabled={isToolbarHidden}>
                                <i className="bi bi-zoom-out"></i>
                            </Button>
                            <Button variant="light" onClick={onZoomIn} className="mx-1" disabled={isToolbarHidden}>
                                <i className="bi bi-zoom-in"></i>
                            </Button>
                        </>
                    )}
                    {numPages && <p style={{
                        fontSize: "0.8em",
                        padding: "8px",
                        margin: "0",
                        display: "flex",
                        alignItems: "flex-end"
                    }} className="mx-1">{`Page ${pageInput} / ${numPages}`}</p>}
                </div>
            </Col>
            <Col md={3} className={styles.col}>
                <div className={styles.belowHeaderAiChatbot}>
                    <OverlayTrigger
                        style={{cursor: 'pointer'}}
                        placement="bottom"
                        overlay={renderClearTooltip}
                    >
                        <button onClick={handleClearMessages} style={{border: 'none', background: 'none'}}>
                            <i className="bi bi-trash"></i>
                        </button>
                    </OverlayTrigger>
                    <span className={styles.belowHeaderAiChatbotTranslateChunks}>
                        <CustomCookieSwitch toggleLabel={"translate footnotes"} cookieKey={"scrapalot-translate-chunks"}/>
                    </span>
                    <div className={styles.belowHeaderLangContainer}>
                        <DropdownButton
                            align="end"
                            size='sm'
                            className={`${styles.belowHeaderLangDropdown} border-0 p-0`}
                            variant="default"
                            id="dropdown-basic-button"
                            title={<span style={{fontSize: '2.0em'}}>{language.flag}</span>}
                        >
                            <Dropdown.Header>Languages</Dropdown.Header>
                            {languages.map(lang => (
                                <Dropdown.Item key={lang.id} onClick={() => {
                                    setLanguage(lang);
                                    Cookies.set('scrapalot-locale', lang.id)
                                }}>
                                    {lang.flag} {lang.name}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                    </div>
                </div>
            </Col>
        </Row>
    );
}

export default BelowHeader;
