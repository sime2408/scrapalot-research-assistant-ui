import React from 'react';

const CustomToggle = ({children, eventKey, handleOnClick, setOpen}) => {
    return (
        <div onClick={(event) => {
            event.stopPropagation();
            if (eventKey === setOpen) {
                setOpen(null); // close if it's currently open
            } else {
                setOpen(eventKey); // open if it's currently closed
            }
            handleOnClick(eventKey);
        }}>
            {children}
        </div>
    );
};

export default CustomToggle;
