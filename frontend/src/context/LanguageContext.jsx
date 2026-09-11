import { useState } from "react";

import en from "../locales/en";
import hi from "../locales/hi";
import LanguageContext from "./languageContextValue";

const translations = { en, hi };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");

    return savedLanguage === "en" || savedLanguage === "hi"
      ? savedLanguage
      : "hi";
  });

  const changeLanguage = (lang) => {
    if (lang !== "en" && lang !== "hi") {
      return;
    }

    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
