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
    "car_rental": { fr: "Locations de Voitures", en: "Car Rental", ar: "تأجير السيارات", es: "Alquiler de Coches" },
    "tours": { fr: "Circuits & Tours", en: "Tours & Activities", ar: "الجولات والأنشطة", es: "Tours y Actividades" },
    "become_partner": { fr: "Devenir Partenaire", en: "Become a Partner", ar: "كن شريكا", es: "Ser Socio" },
    "login": { fr: "Se Connecter", en: "Log In", ar: "تسجيل الدخول", es: "Iniciar Sesión" },
    "signup": { fr: "S'inscrire", en: "Sign Up", ar: "التسجيل", es: "Registrarse" },
    "open_menu": { fr: "Ouvrir le menu", en: "Open menu", ar: "افتح القائمة", es: "Abrir menú" },

    // Footer
    "footer_tagline": { fr: "Votre compagnon de voyage privilégié en Afrique. Réservez hébergements, voitures et circuits en toute simplicité.", en: "Your preferred travel companion in Africa. Book accommodations, cars, and tours with ease.", ar: "رفيقك المفضل للسفر في إفريقيا. احجز السكن والسيارات والجولات بكل سهولة.", es: "Su compañero de viaje preferido en África. Reserve alojamientos, coches y tours con facilidad." },
    "navigation": { fr: "Navigation", en: "Navigation", ar: "التنقل", es: "Navegación" },
    "company": { fr: "Entreprise", en: "Company", ar: "الشركة", es: "Empresa" },
    "about": { fr: "À propos", en: "About", ar: "معلومات عنا", es: "Sobre nosotros" },
    "contact": { fr: "Contact", en: "Contact", ar: "اتصل", es: "Contacto" },
    "legal": { fr: "Légal", en: "Legal", ar: "قانوني", es: "Legal" },
    "terms": { fr: "Conditions d'utilisation", en: "Terms of use", ar: "شروط الاستخدام", es: "Condiciones de uso" },
    "privacy": { fr: "Politique de confidentialité", en: "Privacy policy", ar: "سياسة الخصوصية", es: "Política de privacidad" },
    "rights_reserved": { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "كل الحقوق محفوظة.", es: "Todos los derechos reservados." },

    // Partner CTA
    "partner_cta_title": { fr: "Référencez votre établissement sur StayFloow.com", en: "Become a StayFloow Partner", ar: "كن شريكًا في StayFloow", es: "Conviértase en socio de StayFloow" },
    "partner_cta_desc": { fr: "Rejoignez des milliers de partenaires en Afrique et commencez à recevoir des réservations dès aujourd'hui.", en: "Join thousands of partners in Africa and start receiving bookings today.", ar: "انضم إلى آلاف الشركاء في إفريقيا وابدأ في تلقي الحجوزات اليوم.", es: "Únase a miles de socios en África y comience a recibir reservas hoy." },
    "start": { fr: "Commencer", en: "Get Started", ar: "ابدأ", es: "Empezar" },
    "add_property": { fr: "Ajouter un hébergement", en: "Add Accommodation", ar: "إضافة سكن", es: "Añadir alojamiento" },
    "add_vehicle": { fr: "Ajouter un véhicule", en: "Add a Vehicle", ar: "إضافة مركبة", es: "Añadir un vehículo" },
    "add_tour": { fr: "Ajouter un circuit", en: "Add a Tour", ar: "إضافة جولة", es: "Añadir un tour" },

    // Home page
    "home_hero_title": { fr: "Votre Porte d'Entrée en Afrique", en: "Your Gateway to Africa", ar: "بوابتك إلى إفريقيا", es: "Su puerta de entrada a África" },
    "home_hero_subtitle": { fr: "Découvrez des séjours uniques et authentiques à travers le continent.", en: "Discover unique and authentic stays across the continent.", ar: "اكتشف إقامات فريدة وأصيلة في جميع أنحاء القارة.", es: "Descubra estancias únicas y auténticas en todo el continente." },
    "featured_stays": { fr: "Séjours Recommandés", en: "Featured Stays", ar: "إقامات مميزة", es: "Estancias destacadas" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by Your Last Visit", ar: "مستوحى من زيارتك الأخيرة", es: "Inspirado por su última visita" },

    // Email Retargeting
    "email_retargeting_title": { fr: "Ne manquez aucune offre", en: "Pick up where you left off", ar: "تابع من حيث توقفت", es: "Continúa donde lo dejaste" },
    "email_retargeting_description": { fr: "Inscrivez-vous pour recevoir des alertes de prix et des recommandations exclusives basées sur vos recherches.", en: "Here are recommendations based on your last visit.", ar: "إليك بعض التوصيات بناءً على زيارتك الأخيرة.", es: "Aquí tienes recomendaciones basadas en tu última visita." },
    "email_retargeting_cta": { fr: "M'inscrire aux alertes", en: "See suggestions", ar: "عرض الاقتراحات", es: "Ver sugerencias" },

    // Search Form
    "where_to": { fr: "Où allez-vous ?", en: "Where are you going?", ar: "أين تذهب؟", es: "¿A dónde vas?" },
    "all_destinations": { fr: "Toutes les destinations", en: "All destinations", ar: "كل الوجهات", es: "Todos los destinos" },
    "choose_dates": { fr: "Choisissez vos dates", en: "Choose your dates", ar: "اختر تواريخك", es: "Elige tus fechas" },
    "travelers": { fr: "voyageurs", en: "travelers", ar: "مسافرون", es: "viajeros" },
    "search": { fr: "Rechercher...", en: "Search...", ar: "بحث...", es: "Buscar..." },

    // Contact page
    "contact.title": { fr: "Contactez-nous", en: "Contact Us", ar: "اتصل بنا", es: "Contáctenos" },
    "contact.name": { fr: "Nom complet", en: "Full Name", ar: "الاسم الكامل", es: "Nombre completo" },
    "contact.namePlaceholder": { fr: "Votre nom...", en: "Your name...", ar: "اسمك...", es: "Tu nombre..." },
    "contact.email": { fr: "Email professionnel", en: "Professional Email", ar: "البريد الإلكتروني المهني", es: "Correo profesional" },
    "contact.emailPlaceholder": { fr: "votre@email.com", en: "your@email.com", ar: "بريدك الإلكتروني...", es: "tu@email.com" },
    "contact.message": { fr: "Votre message", en: "Your message", ar: "رسالتك", es: "Tu mensaje" },
    "contact.messagePlaceholder": { fr: "Comment pouvons-nous vous aider ?", en: "How can we help you?", ar: "كيف يمكننا مساعدتك؟", es: "¿Cómo podemos ayudarte?" },
    "contact.send": { fr: "Envoyer le message", en: "Send Message", ar: "إرسال الرسالة", es: "Enviar mensaje" },
    "contact.successTitle": { fr: "Message envoyé !", en: "Message Sent!", ar: "تم إرسال الرسالة!", es: "¡Mensaje enviado!" },
    "contact.successMessage": { fr: "Notre équipe vous répondra sous 24h.", en: "Our team will respond within 24h.", ar: "سيرد فريقنا عليك في غضون 24 ساعة.", es: "Nuestro equipo responderá en 24 horas." },
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
