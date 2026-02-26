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

    // Partner Page
    "partner_hero_title": { fr: "Inscrivez votre établissement sur StayFloow.com", en: "List your establishment on StayFloow.com", ar: "سجل منشأتك على StayFloow.com", es: "Registre su establecimiento en StayFloow.com" },
    "partner_hero_subtitle": { fr: "Rejoignez la plus grande communauté de voyageurs en Afrique et boostez vos réservations gratuitement.", en: "Join the largest travel community in Africa and boost your bookings for free.", ar: "انضم إلى أكبر مجتمع للمسافرين في إفريقيا وعزز حجوزاتك مجانًا.", es: "Únase a la comunidad de viajeros más grande de África y aumente sus reservas gratis." },
    "partner_hero_cta": { fr: "Commencer gratuitement", en: "Start for free", ar: "ابدأ مجاناً", es: "Empezar gratis" },
    "register_my_property": { fr: "ENREGISTRER MON BIEN", en: "REGISTER MY PROPERTY", ar: "تسجيل عقاري", es: "REGISTRAR MI PROPIEDAD" },
    "registration": { fr: "Inscription", en: "Registration", ar: "تسجيل", es: "Registro" },
    "back_to_choice": { fr: "Retour au choix", en: "Back to choice", ar: "العودة للخيارات", es: "Volver a elegir" },
    "partner_cat_acc_desc": { fr: "Hôtels, riads, appartements, villas, maisons d'hôtes...", en: "Hotels, riads, apartments, villas, guest houses...", ar: "فنادق، رياض، شقق، فيلات، بيوت ضيافة...", es: "Hoteles, riads, apartamentos, villas, casas de huéspedes..." },
    "partner_cat_car_desc": { fr: "Berlines, SUV, 4x4, minibus, voitures de luxe...", en: "Sedans, SUVs, 4x4s, minibuses, luxury cars...", ar: "سيدان، دفع رباعي، ميني باص، سيارات فاخرة...", es: "Sedanes, SUV, 4x4, minibuses, coches de lujo..." },
    "partner_cat_tour_desc": { fr: "Safaris, visites guidées, treks, croisières sur le Nil...", en: "Safaris, guided tours, treks, Nile cruises...", ar: "رحلات سفاري، جولات سياحية، رحلات نيلية...", es: "Safaris, visitas guiadas, treks, cruceros por el Nilo..." },
    "trust_visibility_title": { fr: "Visibilité mondiale", en: "Global Visibility", ar: "ظهور عالمي", es: "Visibilité mundial" },
    "trust_visibility_desc": { fr: "Touchez des clients du monde entier.", en: "Reach customers from all over the world.", ar: "صل إلى العملاء من جميع أنحاء العالم.", es: "Llegue a clientes de todo el mundo." },
    "trust_payment_title": { fr: "Paiements sécurisés", en: "Secure Payments", ar: "مدفوعats آمنة", es: "Pagos seguros" },
    "trust_payment_desc": { fr: "Gérez vos revenus en toute sérénité.", en: "Manage your income with peace of mind.", ar: "إدارة دخلك براحة بال.", es: "Gestione sus ingresos con tranquilidad." },
    "trust_mgmt_title": { fr: "Gestion simplifiée", en: "Simplified Management", ar: "إدارة مبسطة", es: "Gestión simplificada" },
    "trust_mgmt_desc": { fr: "Des outils pro pour votre activité.", en: "Professional tools for your business.", ar: "أدوات احترافية لنشاطك.", es: "Herramientas pro para su negocio." },
    "trust_gps_title": { fr: "GPS Précis", en: "Precise GPS", ar: "نظام تحديد المواقع دقيق", es: "GPS preciso" },
    "trust_gps_desc": { fr: "Vos clients vous trouvent à coup sûr.", en: "Your customers find you for sure.", ar: "عملاؤك يجدونك بالتأكيد.", es: "Sus clientes lo encuentran con seguridad." },

    // Search Bar & Summary
    "where_to": { fr: "Où allez-vous ?", en: "Where are you going?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "dates_placeholder": { fr: "Arrivée — Départ", en: "Check-in — Check-out", ar: "الوصول — المغادرة", es: "Entrada — Salida" },
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },
    "adults": { fr: "adultes", en: "adults", ar: "بالغين", es: "adultos" },
    "children": { fr: "enfants", en: "children", ar: "أطفال", es: "niños" },
    "rooms": { fr: "chambres", en: "rooms", ar: "غرف", es: "habitaciones" },
    "adult_short": { fr: "ad.", en: "ad.", ar: "بالغ", es: "ad." },
    "child_short": { fr: "enf.", en: "ch.", ar: "طفل", es: "ni." },
    "room_short": { fr: "ch.", en: "rm.", ar: "غرفة", es: "hab." },

    // Filters
    "filters": { fr: "Filtres de recherche", en: "Search Filters", ar: "مرشحات البحث", es: "Filtros de búsqueda" },
    "popular": { fr: "Populaires", en: "Popular", ar: "الأكثر شعبية", es: "Populares" },
    "property_types": { fr: "Types de propriétés", en: "Property Types", ar: "أنواع العقارات", es: "Tipos de propiedad" },
    "budget_per_night": { fr: "Budget (par nuit)", en: "Budget (per night)", ar: "الميزانية (لكل ليلة)", es: "Presupuesto (por noche)" },
    "show_results": { fr: "Afficher les résultats", en: "Show results", ar: "عرض النتائج", es: "Mostrar résultats" },
    "WiFi gratuit": { fr: "WiFi gratuit", en: "Free WiFi", ar: "واي فاي مجاني", es: "WiFi gratis" },
    "Piscine": { fr: "Piscine", en: "Pool", ar: "مسبح", es: "Piscina" },
    "Petit-déjeuner inclus": { fr: "Petit-déjeuner inclus", en: "Breakfast included", ar: "الإفطار مشمول", es: "Desayuno incluido" },
    "Parking gratuit": { fr: "Parking gratuit", en: "Free parking", ar: "موقف سيارات مجاني", es: "Parking gratis" },
    "Climatisation": { fr: "Climatisation", en: "Air conditioning", ar: "تكييف هواء", es: "Aire acondicionado" },

    // Footer
    "footer_tagline": { fr: "Votre compagnon de voyage privilégié en Afrique. Réservez hébergements, voitures et circuits en toute simplicité.", en: "Your preferred travel companion in Africa. Book accommodations, cars, and tours with ease.", ar: "رفيقك المفضل للسفر في إفريقيا. احجز السكن والسيارات والجولات بكل سهولة.", es: "Su compañero de viaje preferido en África. Reserve alojamientos, coches y tours con facilidad." },
    "rights_reserved": { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "كل الحقوق محفوظة.", es: "Todos los derechos reservados." },
    "navigation": { fr: "Navigation", en: "Navigation", ar: "التنقل", es: "Navegación" },
    "company": { fr: "Société", en: "Company", ar: "الشركة", es: "Empresa" },
    "about": { fr: "À propos", en: "About", ar: "معلومات عنا", es: "Sobre nosotros" },
    "contact": { fr: "Contact", en: "Contact", ar: "اتصل", es: "Contacto" },
    "legal": { fr: "Légal", en: "Legal", ar: "قانوني", es: "Legal" },
    "terms": { fr: "Conditions d'utilisation", en: "Terms of use", ar: "شروط الاستخدام", es: "Condiciones de uso" },
    "privacy": { fr: "Confidentialité", en: "Privacy", ar: "الخصوصية", es: "Privacidad" },
    "partner_cta_title": { fr: "Référencez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "أدرج عقارك على StayFloow.com", es: "Registra tu establecimiento en StayFloow.com" },
    "partner_cta_desc": { fr: "Rejoignez des milliers de partenaires en Afrique et commencez à recevoir des réservations dès aujourd'hui.", en: "Join thousands of partners in Africa and start receiving bookings today.", ar: "انضم إلى آلاف الشركاء في إفريقيا وابدأ في تلقي الحجوزات اليوم.", es: "Únase a miles de socios en África y comience a recibir reservas hoy." },
    "start": { fr: "Commencer", en: "Get Started", ar: "ابدأ", es: "Empezar" },

    // Retargeting
    "email_retargeting_title": { fr: "Reprenez là où vous vous êtes arrêté", en: "Pick up where you left off", ar: "تابع من حيث توقفت", es: "Continúa donde lo dejaste" },
    "email_retargeting_description": { fr: "Voici des recommandations basées sur votre dernière visite.", en: "Here are recommendations based on your last visit.", ar: "إليك بعض التوصيات بناءً على زيارتك الأخيرة.", es: "Aquí tienes recomendaciones basadas en tu última visita." },
    "email_retargeting_cta": { fr: "Voir les suggestions", en: "See suggestions", ar: "عرض الاقتراحات", es: "Ver sugerencias" },
    
    // Home components
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by Your Visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "hero_cta": { fr: "Se connecter ou créer un compte", en: "Sign in or create account", ar: "تسجيل الدخول أو إنشاء حساب", es: "Iniciar sesión o crear cuenta" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Browse by property type", ar: "بحث حسب نوع الإقامة", es: "Buscar por tipo de alojamiento" },
    "unique_stays_title": { fr: "Séjournez dans nos hébergements uniques", en: "Stay in our unique accommodations", ar: "أقم في أماكن إقامتنا الفريدة", es: "Quédate en nuestros alojamientos únicos" },
    "unique_stays_desc": { fr: "Une sélection rigoureuse des établissements les mieux notés sur StayFloow.com", en: "A careful selection of top-rated properties on StayFloow.com", ar: "مجموعة مختارة بعناية من أفضل العقارات تقييمًا على StayFloow.com", es: "Una cuidada selección de las propiedades mejor valoradas en StayFloow.com" },
    "from_price": { fr: "À partir de", en: "Starting from", ar: "ابتداءً من", es: "Desde" },
    "search": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" }
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
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};