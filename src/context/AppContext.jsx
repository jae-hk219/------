import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('한국어'); // '한국어' or 'English'

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === '한국어' ? 'English' : '한국어');
  };

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      currentLanguage,
      toggleLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
