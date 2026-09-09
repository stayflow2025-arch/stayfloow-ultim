'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Locale, localeDetails, translations } from '@/lib/translations';
export type { Locale };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  getLocaleDetails: (loc?: Locale) => { name: string; flag: string; dir: 'ltr' | 'rtl' };
  availableLocales: Locale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale = 'fr' }: { children: React.ReactNode, initialLocale?: Locale }) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('stayfloow_locale') as Locale;
    if (savedLocale && localeDetails[savedLocale] && savedLocale !== locale) {
      setLocale(savedLocale);
    }
    setMounted(true);
  }, [locale]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = localeDetails[locale].dir;
      localStorage.setItem('stayfloow_locale', locale);
    }
  }, [locale, mounted]);

  const handleSetLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    localStorage.setItem('stayfloow_locale', newLocale);
    
    // Configurer le cookie Google Translate et locale
    if (typeof window !== 'undefined') {
      if (newLocale !== 'fr') {
        document.cookie = `googtrans=/fr/${newLocale}; path=/`;
        document.cookie = `googtrans=/fr/${newLocale}; domain=.${window.location.hostname}; path=/`;
        document.cookie = `stayfloow_locale=${newLocale}; path=/; max-age=31536000`;
      } else {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
        document.cookie = `stayfloow_locale=fr; path=/; max-age=31536000`;
      }
      // Forcer le rechargement de la page pour appliquer la traduction
      window.location.reload();
    }
  };

  /**
   * Fonction de traduction résolue dès le serveur si locale est passé.
   */
  const t = useCallback((key: string): string => {
    return translations[key]?.[locale] || key;
  }, [locale]);

  const getLocaleDetails = (loc?: Locale) => {
    return localeDetails[loc || locale];
  };

  return (
    <LanguageContext.Provider value={{ 
      locale, 
      setLocale: handleSetLocale, 
      t, 
      getLocaleDetails, 
      availableLocales: Object.keys(localeDetails) as Locale[] 
    }}>
      <div style={{ direction: localeDetails[locale].dir }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
