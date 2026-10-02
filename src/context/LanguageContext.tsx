import React, { createContext, useContext, useState, useEffect } from 'react';
import enLocale from '../../locales/en.json';
import bnLocale from '../../locales/bn.json';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('globtracex_lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('globtracex_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Helper to retrieve nested dot-separated keys, e.g. "brand.tagline"
  const t = (keyPath: string): string => {
    const currentDict = language === 'bn' ? bnLocale : enLocale;
    const fallbackDict = enLocale;

    const resolve = (dict: any, path: string) => {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : undefined;
      }, dict);
    };

    const val = resolve(currentDict, keyPath);
    if (val !== undefined && typeof val === 'string') {
      return val;
    }

    const fallbackVal = resolve(fallbackDict, keyPath);
    if (fallbackVal !== undefined && typeof fallbackVal === 'string') {
      return fallbackVal;
    }

    return keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      toggleLanguage: () => {},
      setLanguage: () => {},
      t: (k: string) => k,
    };
  }
  return context;
};
