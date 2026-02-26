'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type Locale = 'fr' | 'en' | 'ar' | 'es';

const localeDetails: Record<Locale, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
    fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
    ar: { name: 'العربية', flag: '🇩🇿', dir: 'rtl' },
    es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
};

const translations: Record<string, Record<Locale, string>> = {
    // Header
    "accommodations": { fr: "Hébergements", en: "Accommodations", ar: "أماكن الإقامة", es: "Alojamientos" },
    "car_rental": { fr: "Voitures", en: "Car Rental", ar: "تأجير السيارات", es: "Alquiler de Coches" },
    "tours": { fr: "Circuits", en: "Tours & Activities", ar: "الجولات والأنشطة", es: "Tours y Actividades" },
    "list_property": { fr: "Listez votre bien", en: "List your property", ar: "أضف عقارك", es: "Publica tu propiedad" },
    "help": { fr: "Aide", en: "Help", ar: "مساعدة", es: "Ayuda" },
    "login": { fr: "Se Connecter", en: "Log In", ar: "تسجيل الدخول", es: "Iniciar Sesión" },
    "register": { fr: "S'inscrire", en: "Sign Up", ar: "التسجيل", es: "Registrarse" },
    "profile": { fr: "Mon Profil", en: "My Profile", ar: "ملفي الشخصي", es: "Mi Perfil" },
    "dashboard": { fr: "Dashboard", en: "Dashboard", ar: "لوحة التحكم", es: "Panel de control" },
    "logout": { fr: "Se déconnecter", en: "Log Out", ar: "تسجيل الخروج", es: "Cerrar sesión" },

    // Search Bar
    "where_to": { fr: "Où allez-vous ?", en: "Where are you going?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "dates_placeholder": { fr: "Arrivée — Départ", en: "Check-in — Check-out", ar: "الوصول — المغادرة", es: "Entrada — Salida" },
    "occupants": { fr: "adultes · enfants · chambre", en: "adults · children · room", ar: "بالغين · أطفال · غرفة", es: "adultos · niños · habitación" },
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },

    // Home Page
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "hero_cta": { fr: "Se connecter ou créer un compte", en: "Sign in or create account", ar: "تسجيل الدخول أو إنشاء حساب", es: "Iniciar sesión o crear cuenta" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Browse by property type", ar: "بحث حسب نوع الإقامة", es: "Buscar por tipo de alojamiento" },
    "unique_stays_title": { fr: "Nos pépites StayFloow", en: "Our StayFloow Gems", ar: "جواهر ستاي فلو", es: "Nuestras joyas StayFloow" },
    "unique_stays_desc": { fr: "Les établissements préférés de notre communauté en Afrique.", en: "Community-favorite properties across Africa.", ar: "العقارات المفضلة لدى مجتمعنا في إفريقيا.", es: "Las propiedades favoritas de nuestra comunidad en África." },
    "from_price": { fr: "À partir de", en: "Starting from", ar: "ابتداءً من", es: "Desde" },
    "per_night": { fr: "nuit", en: "night", ar: "ليلة", es: "noche" },

    // Footer
    "footer_tagline": { fr: "Votre compagnon de voyage privilégié en Afrique. Réservez hébergements, voitures et circuits en toute simplicité.", en: "Your preferred travel companion in Africa. Book accommodations, cars, and tours with ease.", ar: "رفيقك المفضل للسفر في إفريقيا. احجز السكن والسيارات والجولات بكل سهولة.", es: "Su compañero de viaje preferido en África. Reserve alojamientos, coches y tours con facilidad." },
    "navigation": { fr: "Navigation", en: "Navigation", ar: "التنقل", es: "Navegación" },
    "company": { fr: "Société", en: "Company", ar: "الشركة", es: "Empresa" },
    "about": { fr: "À propos", en: "About", ar: "معلومات عنا", es: "Sobre nosotros" },
    "contact": { fr: "Contact", en: "Contact", ar: "اتصل", es: "Contacto" },
    "admin_portal": { fr: "Portail Admin", en: "Admin Portal", ar: "بوابة المسؤول", es: "Portal de Administración" },
    "partner_space": { fr: "Espace Partenaire", en: "Partner Space", ar: "مساحة الشريك", es: "Espacio para socios" },
    "legal": { fr: "Légal", en: "Legal", ar: "قانوني", es: "Legal" },
    "terms": { fr: "Conditions d'utilisation", en: "Terms of use", ar: "شروط الاستخدام", es: "Condiciones de uso" },
    "privacy": { fr: "Confidentialité", en: "Privacy", ar: "الخصوصية", es: "Privacidad" },
    "rights_reserved": { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "كل الحقوق محفوظة.", es: "Todos los derechos reservados." },
    "partner_cta_title": { fr: "Référencez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "أدرج عقارك على StayFloow.com", es: "Registra tu establecimiento en StayFloow.com" },
    "partner_cta_desc": { fr: "Rejoignez des milliers de partenaires en Afrique et commencez à recevoir des réservations dès aujourd'hui.", en: "Join thousands of partners in Africa and start receiving bookings today.", ar: "انضم إلى آلاف الشركاء في إفريقيا وابدأ في تلقي الحجوزات اليوم.", es: "Únase a miles de socios en África y comience a recibir reservas hoy." },
    "start": { fr: "Commencer", en: "Get Started", ar: "ابدأ", es: "Empezar" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by Your Visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  getLocaleDetails: (loc?: Locale) => { name: string; flag: string; dir: 'ltr' | 'rtl' };
  availableLocales: Locale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('fr');

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDetails[locale].dir;
  }, [locale]);

  const t = useCallback((key: string): string => {
    return translations[key]?.[locale] || key;
  }, [locale]);

  const getLocaleDetails = (loc?: Locale) => {
    return localeDetails[loc || locale];
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, getLocaleDetails, availableLocales: Object.keys(localeDetails) as Locale[] }}>
      <div dir={localeDetails[locale].dir} className="contents">
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
