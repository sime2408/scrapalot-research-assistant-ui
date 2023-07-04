import React from 'react';

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
                <a href="#" style={index === lastClickedIndex ? {color: '#fdc446'} : {}} onClick={(e) => e.preventDefault()}>[{index}]</a>
            </sup>
        </div>
    );
};

export default Footnote;
