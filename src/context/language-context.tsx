
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  fr: {
    'contact.title': 'Contactez-nous',
    'contact.name': 'Nom complet',
    'contact.namePlaceholder': 'Votre nom...',
    'contact.email': 'Email professionnel',
    'contact.emailPlaceholder': 'votre@email.com',
    'contact.message': 'Votre message',
    'contact.messagePlaceholder': 'Comment pouvons-nous vous aider ?',
    'contact.send': 'Envoyer le message',
    'contact.successTitle': 'Message envoyé !',
    'contact.successMessage': 'Notre équipe vous répondra sous 24h.',
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('fr');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
