import React, { createContext, useState } from 'react';

const ScrapalotLoadingContext = createContext();

const ScrapalotLoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <ScrapalotLoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </ScrapalotLoadingContext.Provider>
    );
};

export { ScrapalotLoadingProvider, ScrapalotLoadingContext };
