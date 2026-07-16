import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const setDarkMode = useCallback(async (value, persist = true) => {
    setDarkModeState(value);

    if (persist) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await axios.put(
            "http://localhost:5000/api/buspass/settings",
            { darkMode: value },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.log("Failed to persist dark mode:", error);
      }
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}