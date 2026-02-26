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
    // Navigation & Global
    "accommodations": { fr: "Hébergements", en: "Accommodations", ar: "أماكن الإقامة", es: "Alojamientos" },
    "car_rental": { fr: "Voitures", en: "Car Rental", ar: "تأجير السيارات", es: "Alquiler de Coches" },
    "tours": { fr: "Circuits", en: "Tours & Activities", ar: "الجولات والأنشطة", es: "Tours y Actividades" },
    "list_property": { fr: "Listez votre bien", en: "List your property", ar: "أضف عقارك", es: "Publica tu propiedad" },
    "login": { fr: "Se connecter", en: "Log In", ar: "تسجيل الدخول", es: "Iniciar sesión" },
    "register": { fr: "S'inscrire", en: "Sign Up", ar: "إنشاء حساب", es: "Registrarse" },
    "profile": { fr: "Profil", en: "Profile", ar: "الملف الشخصي", es: "Perfil" },
    "dashboard": { fr: "Tableau de bord", en: "Dashboard", ar: "لوحة التحكم", es: "Panel" },
    "logout": { fr: "Déconnexion", en: "Log Out", ar: "تسجيل الخروج", es: "Cerrar sesión" },
    "back": { fr: "Retour", en: "Back", ar: "رجوع", es: "Volver" },
    "continue": { fr: "Continuer", en: "Continue", ar: "استمرار", es: "Continuar" },
    "start": { fr: "Commencer", en: "Start", ar: "ابدأ", es: "Empezar" },
    "help": { fr: "Aide", en: "Help", ar: "مساعدة", es: "Ayuda" },

    // Home Page
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "hero_cta": { fr: "Se connecter ou créer un compte", en: "Sign in or create account", ar: "تسجيل الدخول أو إنشاء حساب", es: "Iniciar sesión o crear cuenta" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Browse by property type", ar: "بحث حسب نوع الإقامة", es: "Buscar por tipo de alojamiento" },
    "unique_stays_title": { fr: "Séjournez dans nos hébergements uniques", en: "Stay in our unique accommodations", ar: "أقم في أماكن إقامتنا الفريدة", es: "Quédate en nuestros alojamientos únicos" },
    "unique_stays_desc": { fr: "Une sélection rigoureuse des établissements les mieux notés sur StayFloow.com", en: "A careful selection of top-rated properties on StayFloow.com", ar: "مجموعة مختارة بعناية من أفضل العقارات تقييمًا على StayFloow.com", es: "Una cuidada selección de las propiedades mejor valoradas en StayFloow.com" },
    "from_price": { fr: "À partir de", en: "Starting from", ar: "ابتداءً من", es: "Desde" },
    "per_night": { fr: "nuit", en: "night", ar: "ليلة", es: "noche" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos récemment" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by your visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },

    // Search Bar
    "where_to": { fr: "Où allez-vous ?", en: "Where to?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "dates_placeholder": { fr: "Arrivée — Départ", en: "Check-in — Check-out", ar: "الوصول — المغادرة", es: "Entrada — Salida" },
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },
    "adults": { fr: "adultes", en: "adults", ar: "بالغين", es: "adultos" },
    "children": { fr: "enfants", en: "children", ar: "أطفال", es: "niños" },
    "rooms": { fr: "chambres", en: "rooms", ar: "غرف", es: "غرف" },
    "adult_short": { fr: "ad.", en: "ad.", ar: "بالغ", es: "ad." },
    "child_short": { fr: "enf.", en: "ch.", ar: "طفل", es: "ni." },
    "room_short": { fr: "ch.", en: "rm.", ar: "غرفة", es: "hab." },

    // Partner Portal & Registration
    "partner_hero_title": { fr: "Inscrivez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "سجل عقارك على StayFloow.com", es: "Publique su propiedad en StayFloow.com" },
    "partner_hero_subtitle": { fr: "Rejoignez la plus grande communauté de voyageurs en Afrique et boostez vos réservations gratuitement.", en: "Join the largest travel community in Africa and boost your bookings for free.", ar: "انضم إلى أكبر مجتمع للمسافرين في إفريقيا وعزز حجوزاتك مجانًا.", es: "Únase a la comunidad de viajeros más grande de África y aumente sus reservas gratis." },
    "partner_hero_cta": { fr: "Commencer gratuitement", en: "Start for free", ar: "ابدأ مجاناً", es: "Empezar gratis" },
    "register_my_property": { fr: "ENREGISTRER MON BIEN", en: "REGISTER MY PROPERTY", ar: "تسجيل عقاري", es: "REGISTRAR MI PROPIEDAD" },
    "registration": { fr: "Inscription", en: "Registration", ar: "تسجيل", es: "Registro" },
    "back_to_choice": { fr: "Retour au choix", en: "Back to choice", ar: "العودة للخيارات", es: "Volver a elegir" },
    "first_name": { fr: "Prénom", en: "First Name", ar: "الاسم الأول", es: "Nombre" },
    "last_name": { fr: "Nom", en: "Last Name", ar: "اللقب", es: "Apellido" },
    "pro_email": { fr: "Email professionnel", en: "Professional Email", ar: "البريد الإلكتروني المهني", es: "Email profesional" },
    "phone_whatsapp": { fr: "Numéro de téléphone (WhatsApp)", en: "Phone Number (WhatsApp)", ar: "رقم الهاتف (واتساب)", es: "Número de téléphone (WhatsApp)" },
    "commercial_name": { fr: "Nom commercial de l'annonce", en: "Listing Commercial Name", ar: "الاسم التجاري للإعلان", es: "Nombre comercial del anuncio" },
    "step_info": { fr: "Informations", en: "Information", ar: "معلومات", es: "Información" },
    "step_loc": { fr: "Localisation", en: "Location", ar: "الموقع", es: "Ubicación" },
    "step_details": { fr: "Détails Pro", en: "Pro Details", ar: "تفاصيل مهنية", es: "Detalles Pro" },
    "step_photos_price": { fr: "Photos & Prix", en: "Photos & Price", ar: "الصور والسعر", es: "Fotos y Precio" },
    "full_address": { fr: "Adresse complète", en: "Full Address", ar: "العنوان الكامل", es: "Dirección complète" },
    "map_preview": { fr: "Aperçu de la localisation", en: "Location Preview", ar: "معاينة الموقع", es: "Vista previa del mapa" },
    "map_hint": { fr: "* La carte s'ajuste automatiquement en fonction de la ville saisie.", en: "* Map adjusts automatically based on the city entered.", ar: "* الخريطة تتعدل تلقائياً حسب المدينة المدخلة.", es: "* El mapa se ajusta automáticamente según la ciudad introducida." },
    "listing_type_label": { fr: "Type d'offre", en: "Offer Type", ar: "نوع العرض", es: "Tipo de oferta" },
    "amenities_label": { fr: "Équipements & Inclusions", en: "Amenities & Inclusions", ar: "المرافق والمزايا", es: "Servicios e Inclusiones" },
    "description_label": { fr: "Description attractive", en: "Attractive Description", ar: "وصف جذاب", es: "Descripción atractiva" },
    "ai_improve_btn": { fr: "Améliorer avec l'IA", en: "Improve with AI", ar: "تحسين باستخدام الذكاء الاصطناعي", es: "Mejorar con IA" },
    "photos_label": { fr: "Photos de l'annonce (5 minimum)", en: "Listing Photos (Min 5)", ar: "صور الإعلان (5 كحد أدنى)", es: "Fotos del anuncio (Min 5)" },
    "base_price_label": { fr: "Prix de base", en: "Base Price", ar: "السعر الأساسي", es: "Precio base" },
    "ai_analyze_price_btn": { fr: "Analyser mon prix avec l'IA StayFloow", en: "Analyze my price with StayFloow AI", ar: "تحليل سعري بواسطة ذكاء StayFloow", es: "Analizar mi precio con la IA de StayFloow" },
    "submit_review_btn": { fr: "Valider et envoyer pour examen", en: "Validate and send for review", ar: "تأكيد وإرسال للمراجعة", es: "Validar y enviar para revisión" },
    "success_msg_title": { fr: "Merci !", en: "Thank you!", ar: "شكراً لك!", es: "¡Gracias!" },
    "success_msg_desc": { fr: "Votre annonce est en cours de validation par nos experts.", en: "Your listing is being validated by our experts.", ar: "إعلانك قيد المراجعة من قبل خبرائنا.", es: "Su anuncio está siendo validado por nuestros expertos." },
    "back_home_btn": { fr: "Retour à l'accueil", en: "Back to Home", ar: "العودة للرئيسية", es: "Volver al inicio" },

    // Amenities & Types (Used in filters and cards)
    "Hôtel ★★★": { fr: "Hôtel ★★★", en: "Hotel ★★★", ar: "فندق ★★★", es: "Hotel ★★★" },
    "Hôtel ★★★★": { fr: "Hôtel ★★★★", en: "Hotel ★★★★", ar: "فندق ★★★★", es: "Hotel ★★★★" },
    "Hôtel ★★★★★": { fr: "Hôtel ★★★★★", en: "Hotel ★★★★★", ar: "فندق ★★★★★", es: "Hotel ★★★★★" },
    "Riad": { fr: "Riad", en: "Riad", ar: "رياض", es: "Riad" },
    "Villa": { fr: "Villa", en: "Villa", ar: "فيلا", es: "Villa" },
    "Appartement": { fr: "Appartement", en: "Apartment", ar: "شقة", es: "Apartamento" },
    "Studio": { fr: "Studio", en: "Studio", ar: "ستوديو", es: "Studio" },
    "Glamping": { fr: "Glamping", en: "Glamping", ar: "تخييم فاخر", es: "Glamping" },
    "WiFi gratuit": { fr: "WiFi gratuit", en: "Free WiFi", ar: "واي فاي مجاني", es: "WiFi gratis" },
    "Piscine": { fr: "Piscine", en: "Swimming Pool", ar: "مسبح", es: "Piscina" },
    "Climatisation": { fr: "Climatisation", en: "Air Conditioning", ar: "تكييف هواء", es: "Aire acondicionado" },
    "Parking gratuit": { fr: "Parking gratuit", en: "Free Parking", ar: "موقف سيارات مجاني", es: "Parking gratis" },
    "Petit-déjeuner inclus": { fr: "Petit-déjeuner inclus", en: "Breakfast included", ar: "فطور شامل", es: "Desayuno incluido" },
    "Vue mer": { fr: "Vue mer", en: "Sea View", ar: "إطلالة على البحر", es: "Vistas al mar" },
    "Cuisine équipée": { fr: "Cuisine équipée", en: "Equipped Kitchen", ar: "مطبخ مجهز", es: "Cocina equipada" },

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
