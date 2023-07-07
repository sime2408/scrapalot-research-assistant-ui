import React from "react";

import styles from './Scratchpad.module.css';
import {StarterKit} from '@tiptap/starter-kit';
import {EditorContent, useEditor} from '@tiptap/react';

const Scratchpad = (props) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: '<p>Hello World!</p>',
    })

    const MenuBar = ({ editor }) => {
        if (!editor) {
            return null
        }

        return (
            <>
                <div className={styles.scratchpadToolbar}>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .undo()
                                    .run()
                            }>
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .redo()
                                    .run()
                            }>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .toggleBold()
                                    .run()
                            }>
                        <i className="bi bi-type-bold"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .toggleItalic()
                                    .run()
                            }>
                        <i className="bi bi-type-italic"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .toggleStrike()
                                    .run()
                            }>
                        <i className="bi bi-type-strikethrough"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().setParagraph().run()}>
                        <i className="bi bi-paragraph"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <i className="bi bi-type-h1"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <i className="bi bi-type-h2"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <i className="bi bi-type-h3"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <i className="bi bi-list-ul"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <i className="bi bi-list-ol"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            disabled={
                                !editor.can()
                                    .chain()
                                    .focus()
                                    .toggleCode()
                                    .run()
                            }>
                        <i className="bi bi-code"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                        <i className="bi bi-braces"></i>
                    </button>

                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                        <i className="bi bi-blockquote-left"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                        <i className="bi bi-hr"></i>
                    </button>
                    <button style={{border: 'none', background: 'none'}}
                            onClick={() => editor.chain().focus().setHardBreak().run()}>
                        <i className="bi bi-file-break"></i>
                    </button>
                </div>
            </>
        )
    }

    return (
        <div style={{padding: '8px 8px 8px 0', height: 'calc(100vh - 134px)'}}>
            <MenuBar editor={editor}/>
            <div className={styles.scratchpad}>
                <div className={styles.scratchpadTextEditor}>

                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );

}

export default Scratchpad;