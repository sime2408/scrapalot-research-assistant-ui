import React, {useEffect, useRef, useState} from "react";
import {Col, Dropdown, DropdownButton, FormControl, InputGroup, Overlay, OverlayTrigger, Row, Tooltip} from "react-bootstrap";

import styles from "./BelowHeader.module.css";
import themes from "../../../themes/CustomThemeProvider.module.css"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Cookies from 'js-cookie';
import ScrapalotCookieSwitch from '../../../utils/ScrapalotCookieSwitch';

import englishFlag from '../../../../static/img/flags/en.svg';
import germanFlag from '../../../../static/img/flags/de.svg';
import spanishFlag from '../../../../static/img/flags/es.svg';
import frenchFlag from '../../../../static/img/flags/fr.svg';
import italianFlag from '../../../../static/img/flags/it.svg';
import croatianFlag from '../../../../static/img/flags/hr.svg';

function BelowHeader({setLocale, onSearch, handleClearMessages, darkMode}) {

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
        setLocale(newLocale.id);
        Cookies.set('scrapalot-locale', newLocale.id, {expires: 30});
    };

    // search through files from the sidebar
    const searchThroughFiles = useRef(null);
    // search
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

    const renderSearchTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            search documents from your database
        </Tooltip>
    );

    const renderClearTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            clear the chat messages
        </Tooltip>
    );

    return (
        <Row className={`${styles.row} ${darkMode ? themes.darkThemeSecondary : ''}`}>
            <Col md={2} className={`${styles.belowHeaderSearchBar} ${styles.col}`} style={darkMode ? {borderRight: '1px solid #41494d'} : {borderRight: "1px solid rgb(229, 229, 229)"}}>
                <div style={{width: "calc(100% - 20px)", margin: "0 10px"}}>
                    <InputGroup className={styles.inputGroup}>
                        <OverlayTrigger
                            placement="bottom"
                            delay={{show: 250, hide: 400}}
                            overlay={renderSearchTooltip}
                            trigger={["hover", "focus"]}
                        >
                            <FormControl
                                placeholder="search documents"
                                aria-label="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                ref={searchThroughFiles}
                                style={darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', paddingRight: '35px', borderRadius: '0', borderColor: '#212529'} : {
                                    paddingRight: '35px',
                                    borderRadius: '0'
                                }}
                            />
                        </OverlayTrigger>
                        <InputGroup.Text
                            style={darkMode ? {backgroundColor: 'rgb(92 102 108)', color: 'white', borderColor: '#212529'} : {backgroundColor: ''}}
                            className={`${styles.belowHeaderSearchBarInput} ${darkMode ? `${themes.darkThemeInputGroup} ${themes.darkThemeButtons}` : ''}`}>
                            <i style={darkMode ? {color: 'white', borderColor: '#212529'} : {color: 'black'}} className="bi bi-search"></i>
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
            <Col md={7}>
                {/* Empty spacer column */}
            </Col>
            <Col md={3} className={styles.col} style={darkMode ? {borderLeft: '1px solid #41494d'} : {borderLeft: "1px solid rgb(229, 229, 229)"}}>
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
                        <ScrapalotCookieSwitch toggleLabel={"translate footnotes"} cookieKey={"scrapalot-translate-chunks"}/>
                    </span>
                    <div className={styles.belowHeaderLangContainer}>
                        <DropdownButton
                            align="end"
                            size='sm'
                            className={`${styles.belowHeaderLangDropdown} border-0 p-0`}
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
            </Col>
        </Row>
    );
}

export default BelowHeader;
