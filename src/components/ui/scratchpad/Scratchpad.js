import React, {useEffect, useState} from "react";
import {Button, Col, Form, InputGroup, Modal, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {StarterKit} from '@tiptap/starter-kit';
import {EditorContent, useEditor} from '@tiptap/react';
import TurndownService from 'turndown';

import styles from './Scratchpad.module.css';
import themes from '../../themes/CustomThemeProvider.module.css';
import {useTheme} from '../../themes/ScrapalotThemeContext';

const Scratchpad = (props) => {

    const {darkMode} = useTheme();

    const {selectedText, selectedDocument} = props;

    const [modalShow, setModalShow] = useState(false);
    const [exportFormat, setExportFormat] = useState('markdown');
    const [disableButtonsIfNoContent, setDisableButtonsIfNoContent] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: '<p></p>',
        onUpdate: () => {
            const content = editor.getHTML();
            setDisableButtonsIfNoContent(content === '<p></p>' || content === '');
        }
    });

    useEffect(() => {
        if (editor && selectedText !== '') {
            const newText = `<blockquote>${selectedText}</blockquote><strong style="text-align: right !important;"><em>${selectedDocument.name}</em></strong><br/>`;
            editor.commands.insertContent(newText);
        }
    }, [selectedText, editor]);

    const MenuBar = ({editor}) => {
        if (!editor) {
            return null;
        }

        const buttons = [
            {icon: 'arrow-counterclockwise', operation: () => () => editor.chain().focus().undo().run(), label: 'Undo'},
            {icon: 'arrow-clockwise', operation: () => () => editor.chain().focus().redo().run(), label: 'Redo'},
            {icon: 'type-bold', operation: () => () => editor.chain().focus().toggleBold().run(), label: 'Bold'},
            {icon: 'type-italic', operation: () => () => editor.chain().focus().toggleItalic().run(), label: 'Italic'},
            {icon: 'type-strikethrough', operation: () => () => editor.chain().focus().toggleStrike().run(), label: 'Strikethrough'},
            {icon: 'paragraph', operation: () => () => editor.chain().focus().setParagraph().run(), label: 'Paragraph'},
            {icon: 'type-h1', operation: () => () => editor.chain().focus().toggleHeading({level: 1}).run(), label: 'Heading 1'},
            {icon: 'type-h2', operation: () => () => editor.chain().focus().toggleHeading({level: 2}).run(), label: 'Heading 2'},
            {icon: 'type-h3', operation: () => () => editor.chain().focus().toggleHeading({level: 3}).run(), label: 'Heading 3'},
            {icon: 'list-ul', operation: () => () => editor.chain().focus().toggleBulletList().run(), label: 'Bullet List'},
            {icon: 'list-ol', operation: () => () => editor.chain().focus().toggleOrderedList().run(), label: 'Ordered List'},
            {icon: 'code', operation: () => () => editor.chain().focus().toggleCode().run(), label: 'Code'},
            {icon: 'braces', operation: () => () => editor.chain().focus().toggleCodeBlock().run(), label: 'Code Block'},
            {icon: 'blockquote-left', operation: () => () => editor.chain().focus().toggleBlockquote().run(), label: 'Blockquote'},
            {icon: 'hr', operation: () => () => editor.chain().focus().setHorizontalRule().run(), label: 'Horizontal Rule'},
            {icon: 'file-break', operation: () => () => editor.chain().focus().setHardBreak().run(), label: 'Hard Break'},
        ];

        return (
            <div className={styles.scratchpadToolbar}>
                {buttons.map((button, index) => (
                    <OverlayTrigger
                        key={index}
                        placement='top'
                        overlay={
                            <Tooltip id={`tooltip-${index}`}>
                                {button.label}
                            </Tooltip>
                        }
                    >
                        <button
                            style={{border: 'none', background: 'none'}}
                            onMouseDown={(event) => {
                                event.preventDefault(); // Prevent the default mousedown behavior
                                button.operation()();
                            }}
                        >
                            <i className={`bi bi-${button.icon}`}></i>
                        </button>

                    </OverlayTrigger>
                ))}
            </div>
        );
    };

    const handleExport = () => {
        let content = editor.getHTML();
        let filename = `${selectedDocument.name.toLowerCase().split(' ').join('_')}`;

        if (exportFormat === 'markdown') {
            content = convertHtmlToMarkdown(content);
            filename = `${filename}.md`;
        } else if (exportFormat === 'bbcode') {
            content = convertHtmlToBBCode(content);
            filename = `${filename}.txt`;
        }

        saveAs(filename, content);

        setModalShow(false);
    };

    const convertHtmlToMarkdown = (html) => {
        const turnDownService = new TurndownService();
        return turnDownService.turndown(html);
    }

    const convertHtmlToBBCode = (html) => {
        let bbcode = html;

        // Replace start and end tags for some common elements
        const replacements = {
            '<b>': '[b]', '</b>': '[/b]',
            '<i>': '[i]', '</i>': '[/i]',
            '<u>': '[u]', '</u>': '[/u]',
            '<s>': '[s]', '</s>': '[/s]',
            '<br/>': '', '<br>': '',
            '<p>': '', '</p>': '',
            '<blockquote>': '[quote]', '</blockquote>': '[/quote]',
        };

        for (let [key, value] of Object.entries(replacements)) {
            bbcode = bbcode.split(key).join(value);
        }

        // Convert links
        bbcode = bbcode.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[url=$1]$2[/url]');

        // Convert images
        bbcode = bbcode.replace(/<img src="(.*?)" alt="(.*?)" \/>/g, '[img]$1[/img]');

        return bbcode;
    }

    const saveAs = (filename, content) => {
        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    // add a new state variable for the text editor height
    const [textEditorHeight, setTextEditorHeight] = useState("calc(50vh - 164px)");

    useEffect(() => {
        // remove the '%' from the end of documentViewerHeight and convert to a number
        let documentViewerHeightValue = Number(props.documentViewerHeight.slice(0, -1));

        // calculate the equivalent vh value (subtract from 100 to reverse the direction)
        let documentViewerHeightInVh = 100 - documentViewerHeightValue;

        // calculate the new height of the text editor
        let newHeight = `calc(${documentViewerHeightInVh}vh - 164px)`;

        setTextEditorHeight(newHeight);
    }, [props.documentViewerHeight]);

    return (
        <div style={{padding: '8px 12px 8px 12px', borderTop: darkMode ? '1px black solid' : '1px #c4c4c4 solid'}}>
            <MenuBar editor={editor}/>
            <div className={styles.scratchpad}>
                <div className={styles.scratchpadTextEditor}
                     style={
                         darkMode ? {
                             backgroundColor: '#5c676c',
                             padding: '8px',
                             borderRadius: '4px',
                             height: textEditorHeight,
                             border: '1px solid rgb(56 124 132)'
                         } : {
                             backgroundColor: 'white',
                             padding: '8px',
                             borderRadius: '4px',
                             height: textEditorHeight,
                             border: '1px solid rgb(229, 229, 229)'
                         }
                     }>
                    <EditorContent editor={editor}/>
                </div>
                <div className={styles.scratchpadButtonsContainer}>
                    <InputGroup className={`d-flex justify-content-between ${styles.scratchpadButtons}`}>
                        <div className="flex-grow-1 me-2">
                            <Button
                                variant="primary"
                                className="me-2"
                                style={{width: '100%'}}
                                disabled={disableButtonsIfNoContent}
                                onClick={() => setModalShow(true)}
                            >
                                <i className="bi bi-download"></i>
                                &nbsp;&nbsp;export
                            </Button>
                        </div>
                        <div className="flex-grow-1">
                            <Button
                                variant="secondary"
                                style={{width: '100%'}}
                                disabled={disableButtonsIfNoContent}>
                                <i className="bi bi-text-paragraph"></i>
                                &nbsp;&nbsp;summarize
                            </Button>
                        </div>
                    </InputGroup>
                </div>
            </div>
            <div>
                <Modal show={modalShow} onHide={() => setModalShow(false)}>
                    <Modal.Header style={{borderRadius: '0'}} closeButton className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
                        <Modal.Title>Export to file</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemePrimary}`}>
                        <Form.Group as={Row}>
                            <Col sm={10}>
                                <div style={{display: "flex", justifyContent: "space-between"}}>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label={
                                            <span>
                                <i className="bi bi-markdown" style={{marginRight: "10px"}}></i>
                                Markdown
                            </span>
                                        }
                                        name="exportFormat"
                                        id="markdown"
                                        value="markdown"
                                        checked={exportFormat === 'markdown'}
                                        onChange={e => setExportFormat(e.target.value)}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label={
                                            <span>
                                <i className="bi bi-file-earmark-code" style={{marginRight: "10px"}}></i>
                                BBCode
                            </span>
                                        }
                                        name="exportFormat"
                                        id="bbcode"
                                        value="bbcode"
                                        checked={exportFormat === 'bbcode'}
                                        onChange={e => setExportFormat(e.target.value)}
                                    />
                                </div>
                            </Col>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{borderRadius: '0'}} className={`${darkMode ? themes.darkThemeWithBottomBorderDefault : themes.lightThemeDefault}`}>
                        <Button variant="secondary" onClick={() => setModalShow(false)}>
                            <i className="bi bi-x-circle"></i> close
                        </Button>
                        <Button variant="primary" onClick={handleExport}>
                            <i className="bi bi-download"></i> save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Scratchpad;
