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
    // === NAVIGATION & GENERAL ===
    "accommodations": { fr: "Hébergements", en: "Accommodations", ar: "أماكن الإقامة", es: "Alojamientos" },
    "car_rental": { fr: "Voitures", en: "Car Rental", ar: "تأجير السيارات", es: "Alquiler de Coches" },
    "tours": { fr: "Circuits", en: "Tours & Activities", ar: "الجولات والأنشطة", es: "Tours y Actividades" },
    "login": { fr: "Se connecter", en: "Log In", ar: "تسجيل الدخول", es: "Iniciar sesión" },
    "register": { fr: "S'inscrire", en: "Sign Up", ar: "إنشاء حساب", es: "Registrarse" },
    "logout": { fr: "Déconnexion", en: "Log Out", ar: "تسجيل الخروج", es: "Cerrar sesión" },
    "list_property": { fr: "Inscrire mon bien", en: "List your property", ar: "أضف عقارك", es: "Inscribe tu bien" },
    "help": { fr: "Aide", en: "Help", ar: "مساعدة", es: "Ayuda" },
    "navigation": { fr: "Navigation", en: "Navigation", ar: "الملاحة", es: "Navegación" },
    "company": { fr: "Société", en: "Company", ar: "الشركة", es: "Empresa" },
    "legal": { fr: "Légal", en: "Legal", ar: "قانوني", es: "Legal" },
    "about": { fr: "À propos", en: "About", ar: "حول", es: "Acerca de" },
    "contact": { fr: "Contact", en: "Contact", ar: "اتصال", es: "Contacto" },
    "terms": { fr: "Conditions d'utilisation", en: "Terms of Service", ar: "شروط الاستخدام", es: "Términos de uso" },
    "privacy": { fr: "Confidentialité", en: "Privacy Policy", ar: "الخصوصية", es: "Privacidad" },
    "rights_reserved": { fr: "Tous droits réservés", en: "All rights reserved", ar: "جميع الحقوق محفوظة", es: "Todos los derechos reservados" },
    "footer_tagline": { fr: "Le partenaire de vos voyages en Afrique.", en: "Your travel partner in Africa.", ar: "شريك سفرك في أفريقيا.", es: "Su socio de viajes en África." },

    // === BARRE DE RECHERCHE & OCCUPANCY ===
    "where_to": { fr: "Où allez-vous ?", en: "Where to?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "pickup_location": { fr: "Lieu de prise en charge", en: "Pickup Location", ar: "موقع الاستلام", es: "Lugar de recogida" },
    "guests_rooms": { fr: "Voyageurs & Chambres", en: "Guests & Rooms", ar: "المسافرون والغرف", es: "Viajeros y Habitaciones" },
    "adults": { fr: "Adultes", en: "Adults", ar: "بالغون", es: "Adultos" },
    "adult_singular": { fr: "adulte", en: "adult", ar: "بالغ", es: "adulto" },
    "adults_plural": { fr: "adultes", en: "adults", ar: "بالغون", es: "adultos" },
    "children": { fr: "Enfants", en: "Children", ar: "أطفال", es: "Niños" },
    "child_singular": { fr: "enfant", en: "child", ar: "طفل", es: "niño" },
    "children_plural": { fr: "enfants", en: "children", ar: "أطفال", es: "niños" },
    "rooms": { fr: "Chambres", en: "Rooms", ar: "غرف", es: "Habitaciones" },
    "room_singular": { fr: "chambre", en: "room", ar: "غرفة", es: "habitación" },
    "rooms_plural": { fr: "chambres", en: "rooms", ar: "غرف", es: "habitaciones" },
    "age_label": { fr: "ÂGE DE L'ENFANT", en: "CHILD AGE", ar: "عمر الطفل", es: "EDAD DEL NIÑO" },
    "infant_free_info": { fr: "Bon à savoir : Les enfants de moins de 2 ans séjournent gratuitement sur StayFloow !", en: "Good to know: Children under 2 stay for free on StayFloow!", ar: "معلومة مفيدة: الأطفال دون سن 2 سنة يقيمون مجانًا في StayFloow!", es: "¡Es bueno saberlo: los niños menores de 2 años se alojan gratis en StayFloow!" },
    "travel_with_pet": { fr: "Vous voyagez avec votre animal ?", en: "Are you traveling with your pet?", ar: "هل تسافر مع حيوانك الأليف؟", es: "¿Viajas con tu mascota?" },
    "done": { fr: "Terminer", en: "Done", ar: "تم", es: "Terminar" },
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },

    // === HERO & ACCUEIL ===
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "exclusive_offers": { fr: "Offres Exclusives 2026", en: "Exclusive 2026 Offers", ar: "عروض حصرية 2026", es: "Ofertas Exclusivas 2026" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Search by property type", ar: "البحث حسب نوع الإقامة", es: "Buscar por tipo de propiedad" },
    "unique_stays_title": { fr: "Séjournez dans nos hébergements uniques", en: "Stay in our unique stays", ar: "أقم في أماكن إقامتنا الفريدة", es: "Quédese en nuestras estancias únicas" },
    "unique_stays_desc": { fr: "Une sélection rigoureuse des établissements les mieux notés sur StayFloow.com", en: "A rigorous selection of top-rated properties on StayFloow.com", ar: "اختيار صارم لأفضل العقارات تقييمًا على StayFloow.com", es: "Una selección rigurosa de las propiedades mejor valoradas en StayFloow.com" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by your visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },
    "from_price": { fr: "À partir de", en: "From", ar: "تبدأ من", es: "Desde" },
    "per_night": { fr: "nuit", en: "night", ar: "ليلة", es: "noche" },

    // === ONBOARDING PARTENAIRE ===
    "partner_hero_title": { fr: "Inscrivez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "سجل عقارك على StayFloow.com", es: "Inscriba su establecimiento en StayFloow.com" },
    "partner_hero_subtitle": { fr: "Rejoignez la plus grande communauté de voyageurs en Afrique.", en: "Join the largest travel community in Africa.", ar: "انضم إلى أكبر مجتمع للمسافرين في أفريقيا.", es: "Únase a la mayor communauté de viajeros de África." },
    "partner_hero_cta": { fr: "Commencer gratuitement", en: "Get started for free", ar: "ابدأ مجاناً", es: "Empezar gratis" },
    "partner_cat_acc_desc": { fr: "Hôtels, riads, appartements, villas, maisons d'hôtes...", en: "Hotels, riads, apartments, villas, guest houses...", ar: "فنادق، رياض، شقق، فيلات، دور ضيافة...", es: "Hoteles, riads, apartamentos, villas, casas de huéspedes..." },
    "partner_cat_car_desc": { fr: "Berlines, SUV, 4x4, minibus, voitures de luxe...", en: "Sedans, SUVs, 4x4s, minibuses, luxury cars...", ar: "سيدان، دفع رباعي، ميني باص، سيارات فاخرة...", es: "Sedanes, SUV, 4x4, minibuses, coches de lujo..." },
    "partner_cat_tour_desc": { fr: "Safaris, visites guidées, treks, croisières sur le Nil...", en: "Safaris, guided tours, treks, Nile cruises...", ar: "سفاري، جولات سياحية، رحلات، كروز النيل...", es: "Safaris, visitas guiadas, caminatas, cruceros por el Nilo..." },
    "register_my_property": { fr: "ENREGISTRER MON BIEN", en: "REGISTER MY PROPERTY", ar: "سجل عقاري", es: "REGISTRAR MI BIEN" },
    "back_to_choice": { fr: "Retour au choix", en: "Back to choice", ar: "العودة إلى الخيار", es: "Volver a la elección" },
    "registration": { fr: "Inscription", en: "Registration", ar: "تسجيل", es: "Registro" },
    "step_info": { fr: "Infos Contact", en: "Contact Info", ar: "معلومات الاتصال", es: "Información de contacto" },
    "step_loc": { fr: "Localisation", en: "Location", ar: "الموقع", es: "Ubicación" },
    "step_details": { fr: "Détails & IA", en: "Details & AI", ar: "التفاصيل والذكاء الاصطناعي", es: "Detalles e IA" },
    "step_photos_price": { fr: "Photos & Prix", en: "Photos & Price", ar: "الصور والسعر", es: "Fotos y Precio" },
    "first_name": { fr: "Prénom", en: "First Name", ar: "الاسم الأول", es: "Nombre" },
    "last_name": { fr: "Nom", en: "Last Name", ar: "اللقب", es: "Apellido" },
    "pro_email": { fr: "Email professionnel", en: "Professional Email", ar: "البريد الإلكتروني المهني", es: "Correo electrónico profesional" },
    "phone_whatsapp": { fr: "Téléphone (WhatsApp)", en: "Phone (WhatsApp)", ar: "الهاتف (واتساب)", es: "Teléfono (WhatsApp)" },
    "full_address": { fr: "Adresse complète", en: "Full Address", ar: "العنوان الكامل", es: "Dirección complète" },

    // === DETAILS ET EQUIPEMENTS ===
    "amenities_label": { fr: "Équipements & Services", en: "Amenities & Services", ar: "المرافق والخدمات", es: "Instalaciones y Servicios" },
    "description_label": { fr: "Description commerciale", en: "Commercial Description", ar: "الوصف التجاري", es: "Descripción comercial" },
    "single_rooms": { fr: "Chambres seules", en: "Single Rooms", ar: "غرف فردية", es: "Habitaciones individuales" },
    "double_rooms": { fr: "Chambres doubles", en: "Double Rooms", ar: "غرف مزدوجة", es: "Habitaciones dobles" },
    "parental_suites": { fr: "Suites parentales", en: "Parental Suites", ar: "أجنحة عائلية", es: "Suites parentales" },
    "back": { fr: "Précédent", en: "Back", ar: "رجوع", es: "Atrás" },
    "continue": { fr: "Continuer", en: "Continue", ar: "استمرار", es: "Continuar" },
    "partner_cta_title": { fr: "Devenez partenaire StayFloow", en: "Become a StayFloow partner", ar: "كن شريكاً في StayFloow", es: "Conviértase en socio de StayFloow" },
    "partner_cta_desc": { fr: "Rejoignez des milliers d'hôtes et loueurs en Afrique et commencez à générer des revenus.", en: "Join thousands of hosts and renters in Africa and start earning revenue.", ar: "انضم إلى آلاف المضيفين والمؤجرين في أفريقيا وابدأ في تحقيق الدخل.", es: "Únase a miles de anfitriones y arrendadores en África y comience a generar ingresos." },
    "start": { fr: "Commencer", en: "Get Started", ar: "ابدأ الآن", ar: "Comenzar" },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  getLocaleDetails: (loc?: Locale) => { name: string; flag: string; dir: 'ltr' | 'rtl' };
  availableLocales: Locale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('stayfloow_locale') as Locale;
    if (savedLocale && localeDetails[savedLocale]) {
      setLocale(savedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = localeDetails[locale].dir;
      localStorage.setItem('stayfloow_locale', locale);
    }
  }, [locale, mounted]);

  const t = useCallback((key: string): string => {
    if (!mounted) return key;
    return translations[key]?.[locale] || key;
  }, [locale, mounted]);

  const getLocaleDetails = (loc?: Locale) => {
    return localeDetails[loc || locale];
  };

  return (
    <LanguageContext.Provider value={{ 
      locale, 
      setLocale, 
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