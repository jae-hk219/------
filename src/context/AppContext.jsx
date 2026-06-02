import React, { createContext, useContext, useState, useEffect } from 'react';
import getTranslation from '../services/translation';
import { updateRemoteUser } from '../services/authSync';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('isDarkMode') === 'true';
    } catch {
      return false;
    }
  });

  // Language State: '한국어', 'English', 'Español', 'العربية', '中文', 'Tiếng Việt', 'Bahasa Indonesia'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      return localStorage.getItem('selectedLanguage') || '한국어';
    } catch {
      return '한국어';
    }
  });

  // Notification State: true or false
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('notificationsEnabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch {
      return null;
    }
  });

  // Apply dark class to html document
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('isDarkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('isDarkMode', 'false');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  const setLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  const setNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
  };

  const loginUser = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    setCurrentUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
  };

  const updateCurrentUser = async (updatedData) => {
    if (!currentUser) return;
    const newUserData = { ...currentUser, ...updatedData };
    localStorage.setItem('currentUser', JSON.stringify(newUserData));
    setCurrentUser(newUserData);

    // Also update registered_users database
    try {
      await updateRemoteUser(currentUser.id, updatedData);
    } catch (e) {
      console.error("Failed to update registered_users:", e);
    }
  };

  // Quick Translation Helper
  const t = (key) => getTranslation(key, currentLanguage);

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      currentLanguage,
      setLanguage,
      notificationsEnabled,
      setNotifications,
      currentUser,
      loginUser,
      logoutUser,
      updateCurrentUser,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

