import React, {useEffect} from "react";
import {Button, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import styles from './Scratchpad.module.css';
import {StarterKit} from '@tiptap/starter-kit';
import {EditorContent, useEditor} from '@tiptap/react';

const Scratchpad = (props) => {

    const {selectedText} = props;

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: '<p></p>',
    });

    useEffect(() => {
        if (editor && selectedText !== '') {
            const newText = `<blockquote>${selectedText}</blockquote>`;  // Wrap the selected text in cite tags
            editor.commands.insertContent(newText);
        }
    }, [selectedText]);

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

    return (
        <div style={{padding: '8px 12px 8px 0', height: 'calc(100vh - 114px)'}}>
            <MenuBar editor={editor}/>
            <div className={styles.scratchpad}>
                <div className={styles.scratchpadTextEditor}
                     style={
                         props.darkMode ? {
                             backgroundColor: '#5c676c',
                             padding: '8px',
                             borderRadius: '4px'
                         } : {
                             backgroundColor: 'whitesmoke',
                             padding: '8px',
                             borderRadius: '4px'
                         }
                     }>
                    <EditorContent editor={editor}/>
                </div>
                <div className={styles.scratchpadButtonsContainer}>
                    <InputGroup className={`d-flex justify-content-between ${styles.scratchpadButtons}`}>
                        <div className="flex-grow-1 me-2">
                            <Button variant="primary" className="me-2" style={{width: '100%'}}>export</Button>
                        </div>
                        <div className="flex-grow-1">
                            <Button variant="secondary" style={{width: '100%'}}>summarize</Button>
                        </div>
                    </InputGroup>
                </div>
            </div>
        </div>
    );
};

export default Scratchpad;
