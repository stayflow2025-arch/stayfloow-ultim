'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Locale = "fr" | "ar" | "en";

type Translations = {
  [key in Locale]: {
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
    'partner_cta_title': 'Référencez votre établissement sur StayFloow.com',
    'partner_cta_desc': 'Rejoignez des milliers de partenaires en Afrique et commencez à recevoir des réservations dès aujourd\'hui.',
    'start': 'Commencer',
    'add_property': 'Ajouter un hébergement',
    'add_vehicle': 'Ajouter un véhicule',
    'add_tour': 'Ajouter un circuit',
    'footer_tagline': 'Votre compagnon de voyage privilégié en Afrique. Réservez hébergements, voitures et circuits en toute simplicité.',
    'navigation': 'Navigation',
    'accommodations': 'Hébergements',
    'car_rental': 'Locations de voitures',
    'tours': 'Circuits & Tours',
    'company': 'Société',
    'about': 'À propos',
    'contact': 'Contact',
    'legal': 'Légal',
    'terms': 'Conditions d\'utilisation',
    'privacy': 'Confidentialité',
    'rights_reserved': 'Tous droits réservés.',
    'become_partner': 'Devenir partenaire',
    'login': 'Se connecter',
    'signup': 'S\'inscrire',
    'open_menu': 'Ouvrir le menu',
    'recently_viewed': 'Consultés récemment',
    'inspired_by_visit': 'Inspirés par votre visite',
    'email_retargeting_title': 'Ne manquez aucune offre',
    'email_retargeting_description': 'Inscrivez-vous pour recevoir des alertes de prix et des recommandations exclusives basées sur vos recherches.',
    'email_retargeting_cta': 'M\'inscrire aux alertes',
    'search': 'Rechercher...',
  },
  ar: {
    'contact.title': 'اتصل بنا',
    'contact.name': 'الاسم الكامل',
    'contact.namePlaceholder': 'اسمك...',
    'contact.email': 'البريد الإلكتروني المهني',
    'contact.emailPlaceholder': 'votre@email.com',
    'contact.message': 'رسالتك',
    'contact.messagePlaceholder': 'كيف يمكننا مساعدتك؟',
    'contact.send': 'إرسال الرسالة',
    'contact.successTitle': 'تم إرسال الرسالة!',
    'contact.successMessage': 'سيرد فريقنا عليك في غضون 24 ساعة.',
    'partner_cta_title': 'قم بإدراج مؤسستك على StayFloow.com',
    'partner_cta_desc': 'انضم إلى آلاف الشركاء في إفريقيا وابدأ في تلقي الحجوزات اليوم.',
    'start': 'ابدأ الآن',
    'add_property': 'إضافة سكن',
    'add_vehicle': 'إضافة مركبة',
    'add_tour': 'إضافة جولة',
    'footer_tagline': 'رفيقك المفضل للسفر في إفريقيا. احجز السكن والسيارات والجولات بكل سهولة.',
    'navigation': 'التنقل',
    'accommodations': 'أماكن الإقامة',
    'car_rental': 'تأجير السيارات',
    'tours': 'الجولات والرحلات',
    'company': 'الشركة',
    'about': 'حول',
    'contact': 'اتصل',
    'legal': 'قانوني',
    'terms': 'شروط الاستخدام',
    'privacy': 'الخصوصية',
    'rights_reserved': 'جميع الحقوق محفوظة.',
    'become_partner': 'كن شريكاً',
    'login': 'تسجيل الدخول',
    'signup': 'إنشاء حساب',
    'open_menu': 'افتح القائمة',
    'recently_viewed': 'تمت مشاهدتها مؤخراً',
    'inspired_by_visit': 'مستوحاة من زيارتك',
    'email_retargeting_title': 'لا تفوت أي عرض',
    'email_retargeting_description': 'اشترك لتلقي تنبيهات الأسعار والتوصيات الحصرية بناءً على عمليات البحث الخاصة بك.',
    'email_retargeting_cta': 'سجل في التنبيهات',
    'search': 'بحث...',
  },
  en: {
    'contact.title': 'Contact Us',
    'contact.name': 'Full Name',
    'contact.namePlaceholder': 'Your name...',
    'contact.email': 'Professional Email',
    'contact.emailPlaceholder': 'votre@email.com',
    'contact.message': 'Your message',
    'contact.messagePlaceholder': 'How can we help you?',
    'contact.send': 'Send Message',
    'contact.successTitle': 'Message Sent!',
    'contact.successMessage': 'Our team will respond within 24h.',
    'partner_cta_title': 'List your property on StayFloow.com',
    'partner_cta_desc': 'Join thousands of partners in Africa and start receiving bookings today.',
    'start': 'Get Started',
    'add_property': 'Add Accommodation',
    'add_vehicle': 'Add a Vehicle',
    'add_tour': 'Add a Tour',
    'footer_tagline': 'Your preferred travel companion in Africa. Book accommodations, cars, and tours with ease.',
    'navigation': 'Navigation',
    'accommodations': 'Accommodations',
    'car_rental': 'Car Rentals',
    'tours': 'Circuits & Tours',
    'company': 'Company',
    'about': 'About',
    'contact': 'Contact',
    'legal': 'Legal',
    'terms': 'Terms of Use',
    'privacy': 'Privacy Policy',
    'rights_reserved': 'All rights reserved.',
    'become_partner': 'Become a partner',
    'login': 'Log in',
    'signup': 'Sign up',
    'open_menu': 'Open menu',
    'recently_viewed': 'Recently viewed',
    'inspired_by_visit': 'Inspired by your visit',
    'email_retargeting_title': 'Don\'t miss any deal',
    'email_retargeting_description': 'Sign up to receive price alerts and exclusive recommendations based on your searches.',
    'email_retargeting_cta': 'Sign up for alerts',
    'search': 'Search...',
  }
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: (key: string) => string;
  availableLocales: Locale[];
  getLocaleDetails: (loc?: Locale) => { name: string; flag: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');

  const availableLocales: Locale[] = ['fr', 'ar', 'en'];

  const t = (key: string) => {
    return translations[locale][key] || key;
  };

  const getLocaleDetails = (loc?: Locale) => {
    const l = loc || locale;
    const details = {
      fr: { name: "Français", flag: "🇫🇷" },
      ar: { name: "العربية", flag: "🇩🇿" },
      en: { name: "English", flag: "🇬🇧" }
    };
    return details[l];
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, availableLocales, getLocaleDetails }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
