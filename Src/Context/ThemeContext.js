// 📁 src/Context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAppTheme } from "../Utills/Theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(getAppTheme(false));

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("themeMode");
      if (saved) {
        const dark = saved === "dark";
        setIsDarkMode(dark);
        setTheme(getAppTheme(dark));
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setTheme(getAppTheme(newMode));
    await AsyncStorage.setItem("themeMode", newMode ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);
