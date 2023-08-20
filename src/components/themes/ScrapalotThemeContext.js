import {createContext, useContext, useReducer} from 'react';
import Cookies from 'js-cookie';

// ThemeContext for managing darkMode
const ScrapalotThemeContext = createContext({
    darkMode: false,
    toggleTheme: () => {
    }
});

const initialThemeState = {
    darkMode: Cookies.get('scrapalot-dark-mode') === 'true', // Convert the cookie value to a boolean
};

function themeReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_THEME':
            Cookies.set('scrapalot-dark-mode', !state.toString()); // Convert to string before setting the cookie
            return !state;
        default:
            return state;
    }
}

export const ScrapalotThemeProvider = ({children}) => {
    const [darkMode, dispatch] = useReducer(themeReducer, initialThemeState.darkMode);

    return (
        <ScrapalotThemeContext.Provider value={{darkMode, toggleTheme: () => dispatch({type: 'TOGGLE_THEME'})}}>
            {children}
        </ScrapalotThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ScrapalotThemeContext);

    if (!context || (context.darkMode === undefined && !context.toggleTheme)) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};

