import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(
    localStorage.getItem("adminDarkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("adminDarkMode", darkMode);
  }, [darkMode]);

  const setDarkMode = useCallback(async (value, persist = true) => {
    setDarkModeState(value);

    if (persist) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/admin-settings`,
            { darkMode: value },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.log("Failed to persist admin dark mode:", error);
      }
    }
  }, []);

  return (
    <AdminThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used inside <AdminThemeProvider>");
  }
  return ctx;
}