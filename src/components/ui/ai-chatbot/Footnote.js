import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

function Footnote({index, link, content, page, handleFootnoteClick, footnoteLastClickedIndex, setFootnoteLastClickedIndex, messageIndex}) {

    const handleClick = (databaseName, fileName, page) => {
        const selectedDocument = {name: fileName};
        handleFootnoteClick(content, page, messageIndex, databaseName, selectedDocument);
        setFootnoteLastClickedIndex({messageIndex: messageIndex, footnoteIndex: index});
    };

    // Extract the database and file name from the link
    const pathArray = link.split(new RegExp('\\\\|/'));
    const fileName = pathArray.pop();
    const databaseName = pathArray.pop();

    return (
        <>
            <sup style={{cursor: 'pointer'}} className={'mt-1 me-1'} onClick={() => handleClick(databaseName, fileName, page)}>
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-${index}`}>
                            {fileName}
                        </Tooltip>
                    }
                >
                    <a href="#" style={footnoteLastClickedIndex && index === footnoteLastClickedIndex.footnoteIndex && messageIndex === footnoteLastClickedIndex.messageIndex ? {color: '#fdc446'} : {}}
                       onClick={(e) => {
                           e.preventDefault()
                       }}>[{index}]</a>
                </OverlayTrigger>
            </sup>
        </>
    );
};

export default Footnote;
