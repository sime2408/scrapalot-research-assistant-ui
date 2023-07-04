import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function Footnote({index, link, content, page, setSelectedDatabase, setSelectedDocument, handleFootnoteClick, lastClickedIndex, setLastClickedIndex}) {

    const handleClick = (databaseName, fileName, page, messageIndex) => {
        setSelectedDatabase(databaseName);
        setSelectedDocument({name: fileName});
        handleFootnoteClick(content, page, messageIndex);
        setLastClickedIndex(index);
    };

    // Extract the database and file name from the link
    const pathArray = link.split(new RegExp('\\\\|/'));
    const fileName = pathArray.pop();
    const databaseName = pathArray.pop();

    return (
        <div>
            <sup style={{cursor: 'pointer'}} className={'mt-1 me-1'} onClick={() => handleClick(databaseName, fileName, page, index)}>
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-${index}`}>
                            {fileName}
                        </Tooltip>
                    }
                >
                    <a href="#" style={index === lastClickedIndex ? {color: '#fdc446'} : {}} onClick={(e) => e.preventDefault()}>[{index}]</a>
                </OverlayTrigger>
            </sup>
        </div>
    );
};

export default Footnote;
