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
    // Global & Navigation
    "accommodations": { fr: "Hébergements", en: "Accommodations", ar: "أماكن الإقامة", es: "Alojamientos" },
    "car_rental": { fr: "Voitures", en: "Car Rental", ar: "تأجير السيارات", es: "Alquiler de Coches" },
    "tours": { fr: "Circuits", en: "Tours & Activities", ar: "الجولات والأنشطة", es: "Tours y Actividades" },
    "login": { fr: "Se connecter", en: "Log In", ar: "تسجيل الدخول", es: "Iniciar sesión" },
    "register": { fr: "S'inscrire", en: "Sign Up", ar: "إنشاء حساب", es: "Registrarse" },
    "logout": { fr: "Déconnexion", en: "Log Out", ar: "تسجيل الخروج", es: "Cerrar sesión" },
    "profile": { fr: "Mon Profil", en: "My Profile", ar: "ملفي الشخصي", es: "Mi Perfil" },
    "dashboard": { fr: "Tableau de bord", en: "Dashboard", ar: "لوحة التحكم", es: "Panel de control" },
    "list_property": { fr: "Inscrire mon bien", en: "List your property", ar: "أضف عقارك", es: "Inscribe tu bien" },
    "help": { fr: "Aide", en: "Help", ar: "مساعدة", es: "Ayuda" },
    "about": { fr: "À propos", en: "About Us", ar: "حولنا", es: "Sobre nosotros" },
    "contact": { fr: "Contact", en: "Contact", ar: "اتصل بنا", es: "Contacto" },
    "terms": { fr: "Conditions d'utilisation", en: "Terms of Service", ar: "شروط الخدمة", es: "Términos de servicio" },
    "privacy": { fr: "Confidentialité", en: "Privacy Policy", ar: "سياسة الخصوصية", es: "Privacidad" },
    "rights_reserved": { fr: "Tous droits réservés", en: "All rights reserved", ar: "جميع الحقوق محفوظة", es: "Todos los derechos reservados" },
    "footer_tagline": { fr: "Le partenaire de vos voyages en Afrique.", en: "Your travel partner in Africa.", ar: "شريك سفرك في إفريقيا.", es: "Tu socio de viajes en África." },
    "navigation": { fr: "Navigation", en: "Navigation", ar: "الملاحة", es: "Navegación" },
    "company": { fr: "Société", en: "Company", ar: "الشركة", es: "Empresa" },
    "legal": { fr: "Légal", en: "Legal", ar: "قانوني", es: "Legal" },

    // Home Page
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "hero_cta": { fr: "Se connecter ou créer un compte", en: "Sign in or create account", ar: "تسجيل الدخول أو إنشاء حساب", es: "Iniciar sesión o crear cuenta" },
    "exclusive_offers": { fr: "Offres Exclusives 2026", en: "2026 Exclusive Deals", ar: "عروض حصرية 2026", es: "Ofertas Exclusivas 2026" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Browse by property type", ar: "بحث حسب نوع الإقامة", es: "Buscar por tipo de alojamiento" },
    "unique_stays_title": { fr: "Séjournez dans nos hébergements uniques", en: "Stay in our unique accommodations", ar: "أقم في أماكن إقامتنا الفريدة", es: "Quédate en nuestros alojamientos únicos" },
    "unique_stays_desc": { fr: "Une sélection rigoureuse des établissements les mieux notés sur StayFloow.com", en: "A careful selection of top-rated properties on StayFloow.com", ar: "مجموعة مختارة بعناية من أفضل العقارات تقييمًا", es: "Una cuidada selección de las propiedades mejor valoradas" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by your visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },

    // Search Bar & Common Labels
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },
    "where_to": { fr: "Où allez-vous ?", en: "Where to?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "dates_placeholder": { fr: "Arrivée — Départ", en: "Check-in — Check-out", ar: "وصول — مغادرة", es: "Entrada — Salida" },
    "adults": { fr: "Adultes", en: "Adults", ar: "بالغين", es: "Adultos" },
    "children": { fr: "Enfants", en: "Children", ar: "أطفال", es: "Niños" },
    "rooms": { fr: "Chambres", en: "Rooms", ar: "غرف", es: "Habitaciones" },
    "adult_short": { fr: "Ad.", en: "Ad.", ar: "بالغ", es: "Ad." },
    "child_short": { fr: "Enf.", en: "Ch.", ar: "طفل", es: "Niñ." },
    "room_short": { fr: "Ch.", en: "Rm.", ar: "غرفة", es: "Hab." },
    "start": { fr: "Commencer", en: "Start", ar: "ابدأ", es: "Empezar" },
    "from_price": { fr: "À partir de", en: "Starting from", ar: "ابتداءً من", es: "Desde" },
    "per_night": { fr: "nuit", en: "night", ar: "ليلة", es: "noche" },
    "pickup_location": { fr: "Lieu de prise en charge", en: "Pick-up location", ar: "مكان الاستلام", es: "Lugar de recogida" },
    "pickup_date": { fr: "Date de départ", en: "Pick-up date", ar: "تاريخ الاستلام", es: "Fecha de recogida" },
    "return_date": { fr: "Date de retour", en: "Return date", ar: "تاريخ العودة", es: "Fecha de devolución" },
    "hour": { fr: "Heure", en: "Time", ar: "الساعة", es: "Hora" },

    // Composition & Technical Details
    "chambers": { fr: "Chambres", en: "Bedrooms", ar: "غرف نوم", es: "Dormitorios" },
    "bathrooms": { fr: "Salles de bain", en: "Bathrooms", ar: "حمامات", es: "Baños" },
    "kitchens": { fr: "Cuisines", en: "Kitchens", ar: "مابخ", es: "Cocinas" },
    "living_rooms": { fr: "Salons", en: "Salons", ar: "صالات", es: "Salones" },
    "gardens": { fr: "Jardins", en: "Gardens", ar: "حدائق", es: "Jardines" },
    "toilets": { fr: "Toilettes", en: "Toilets", ar: "مرحاض", es: "Aseos" },
    "single_rooms": { fr: "Chambres seules", en: "Single Rooms", ar: "غرف فردية", es: "Habitaciones individuales" },
    "parental_suites": { fr: "Suites parentales King Size", en: "King Size Suites", ar: "أجنحة ملكية", es: "Suites parentales King Size" },
    "double_rooms": { fr: "Chambres doubles", en: "Double Rooms", ar: "غرف مزدوجة", es: "Habitaciones dobles" },
    "amenities_label": { fr: "Équipements & Services", en: "Amenities & Services", ar: "المرافق والخدمات", es: "Servicios e instalaciones" },
    "presentation": { fr: "Présentation", en: "Description", ar: "تقديم", es: "Presentación" },
    "back": { fr: "Retour", en: "Back", ar: "عودة", es: "Volver" },

    // Car Specifics
    "transmission": { fr: "Transmission", en: "Transmission", ar: "ناقل الحركة", es: "Transmisión" },
    "fuel": { fr: "Carburant", en: "Fuel", ar: "الوقود", es: "Combustible" },
    "seats": { fr: "Places", en: "Seats", ar: "مقاعد", es: "Plazas" },
    "automatic": { fr: "Automatique", en: "Automatic", ar: "أوتوماتيكي", es: "Automático" },
    "manual": { fr: "Manuelle", en: "Manual", ar: "يدوي", es: "Manual" },
    "unlimited_mileage": { fr: "Kilométrage illimité", en: "Unlimited mileage", ar: "كيلومترات غير محدودة", es: "Kilometraje ilimitado" },

    // Tour Specifics
    "duration": { fr: "Durée", en: "Duration", ar: "المدة", es: "Duración" },
    "guide": { fr: "Guide", en: "Guide", ar: "مرشد", es: "Guía" },
    "languages": { fr: "Langues", en: "Languages", ar: "اللغات", es: "Idiomas" },
    "group_size": { fr: "Taille du groupe", en: "Group size", ar: "حجم المجموعة", es: "Tamaño del grupo" },
    "tours_title": { fr: "Trouvez l'aventure parfaite", en: "Find your perfect adventure", ar: "جد مغامرتك المثالية", es: "Encuentra la aventura perfecta" },
    "tours_subtitle": { fr: "Explorez les richesses de l'Afrique avec des guides locaux.", en: "Explore Africa's riches with local guides.", ar: "استكشف كنوز إفريقيا مع مرشدين محليين.", es: "Explora las riquezas de África con guías locales." },

    // Partner Onboarding
    "partner_hero_title": { fr: "Inscrivez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "سجل منشأتك على StayFloow.com", es: "Inscribe tu establecimiento en StayFloow.com" },
    "partner_hero_subtitle": { fr: "Rejoignez la plus grande communauté de voyageurs en Afrique.", en: "Join the largest travel community in Africa.", ar: "انضم إلى أكبر مجتمع للمسافرين في إفريقيا.", es: "Únete a la comunidad de viajeros más grande de África." },
    "partner_hero_cta": { fr: "Commencer gratuitement", en: "Start for free", ar: "ابدأ مجاناً", es: "Empezar gratis" },
    "step_info": { fr: "Infos Partenaire", en: "Partner Info", ar: "معلومات الشريك", es: "Información" },
    "step_loc": { fr: "Localisation", en: "Location", ar: "الموقع", es: "Ubicación" },
    "step_details": { fr: "Détails Pro", en: "Pro Details", ar: "التفاصيل", es: "Detalles" },
    "step_photos_price": { fr: "Photos & Prix", en: "Photos & Price", ar: "الصور والسعر", es: "Fotos y Precio" },
    "ai_improve_btn": { fr: "Améliorer par l'IA", en: "Improve with AI", ar: "تحسين بالذكاء الاصطناعي", es: "Mejorar con IA" },
    "submit_review_btn": { fr: "Soumettre pour vérification", en: "Submit for review", ar: "إرسال للمراجعة", es: "Enviar para revisión" },
    "success_msg_title": { fr: "Annonce soumise !", en: "Listing submitted!", ar: "تم تقديم الإعلان!", es: "¡Anuncio enviado!" },
    "success_msg_desc": { fr: "Nos experts vérifient votre annonce. Vous recevrez un email sous 24h.", en: "Our experts are reviewing your listing. You will get an email within 24h.", ar: "خبراؤنا يراجعون إعلانك. ستصلك رسالة في غضon 24 ساعة.", es: "Nuestros expertos están revisando tu anuncio. Recibirás un email en 24h." },
    "back_home_btn": { fr: "Retour à l'accueil", en: "Back Home", ar: "العودة للرئيسية", es: "Volver al inicio" },

    // Contact Page
    "contact.title": { fr: "Nous sommes là pour vous aider", en: "We're here to help", ar: "نحن هنا لمساعدتك", es: "Estamos aquí para ayudarte" },
    "contact.name": { fr: "Nom complet", en: "Full Name", ar: "الاسم الكامل", es: "Nombre completo" },
    "contact.email": { fr: "Email professionnel", en: "Business Email", ar: "البريد الإلكتروني", es: "Correo profesional" },
    "contact.message": { fr: "Votre message", en: "Your message", ar: "رسالتك", es: "Tu message" },
    "contact.send": { fr: "Envoyer le message", en: "Send message", ar: "إرسال الرسالة", es: "Enviar mensaje" },
    "contact.successTitle": { fr: "Message envoyé !", en: "Message sent!", ar: "تم إرسال الرسالة!", es: "¡Mensaje enviado!" },
    "contact.successMessage": { fr: "Nous vous répondrons dans les plus brefs délais.", en: "We will get back to you as soon as possible.", ar: "سنقوم بالرد عليك في أقرب وقت ممكن.", es: "Te responderemos lo antes posible." },

    // Retargeting & CTA
    "partner_cta_title": { fr: "Prêt à accueillir des voyageurs ?", en: "Ready to welcome travelers?", ar: "جاهز لاستقبال المسافرين؟", es: "¿Listo para recibir viajeros?" },
    "partner_cta_desc": { fr: "Inscrivez votre hébergement, véhicule ou circuit aujourd'hui et augmentez vos revenus.", en: "List your property, car, or tour today and increase your revenue.", ar: "أضف عقارك، سيارتك أو جولاتك اليوم وزد أرباحك.", es: "Inscribe tu alojamiento, vehículo o circuito hoy y aumenta tus ingresos." },
    "email_retargeting_title": { fr: "Ne manquez aucune offre", en: "Don't miss any deal", ar: "لا تفوت أي عرض", es: "No te pierdas ninguna oferta" },
    "email_retargeting_description": { fr: "Inscrivez-vous pour recevoir les meilleures promotions StayFloow directement.", en: "Sign up to receive the best StayFloow promotions directly.", ar: "اشترك لتلقي أفضل عروض StayFloow مباشرة.", es: "Regístrate para recibir las mejores promociones de StayFloow directamente." },
    "email_retargeting_cta": { fr: "S'inscrire aux offres", en: "Sign up for deals", ar: "اشترك في العروض", es: "Suscribirse a ofertas" },

    // Amenities List
    "Wi-Fi gratuit": { fr: "Wi-Fi gratuit", en: "Free Wi-Fi", ar: "واي فاي مجاني", es: "Wi-Fi gratuito" },
    "Petit-déjeuner inclus": { fr: "Petit-déjeuner inclus", en: "Breakfast included", ar: "إفطار مشمول", es: "Desayuno incluido" },
    "Climatisation": { fr: "Climatisation", en: "Air conditioning", ar: "تكييف", es: "Aire acondicionado" },
    "Parking gratuit": { fr: "Parking gratuit", en: "Free parking", ar: "موقف مجاني", es: "Parking gratuito" },
    "Piscine": { fr: "Piscine", en: "Swimming Pool", ar: "مسبح", es: "Piscina" },
    "Restaurant sur place": { fr: "Restaurant sur place", en: "On-site restaurant", ar: "مطعم في الموقع", es: "Restaurante en el sitio" },
    "Réception 24h/24": { fr: "Réception 24h/24", en: "24-hour front desk", ar: "استقبال 24 ساعة", es: "Recepción 24 horas" },
    "Animaux domestiques acceptés": { fr: "Animaux domestiques acceptés", en: "Pets allowed", ar: "يسمح بالحيوانات الأليفة", es: "Se admiten mascotas" },
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
    const savedLocale = localStorage.getItem('stayfloow_locale') as Locale;
    if (savedLocale && ['fr', 'en', 'ar', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDetails[locale].dir;
    localStorage.setItem('stayfloow_locale', locale);
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
