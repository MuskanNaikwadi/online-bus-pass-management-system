import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import translations, { LANGUAGES } from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = useCallback(async (langCode, persist = true) => {
    setLanguageState(langCode);

    if (persist) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await axios.put(
            "${process.env.REACT_APP_API_URL}/api/buspass/settings",
            { language: langCode },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.log("Failed to persist language:", error);
      }
    }
  }, []);

  // t("key") — returns translated string, falls back to English, then to the key itself
  const t = useCallback(
    (key) => {
      return (
        translations[language]?.[key] ||
        translations.en[key] ||
        key
      );
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}