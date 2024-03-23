import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode, isLightMode, setIsLightMode] = useState(false);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, isLightMode, setIsLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};