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
    "logout": { fr: "Déconnexion", en: "Log Out", ar: "تسجيل الخروج", es: "Cerrar séance" },
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

    // === BARRE DE RECHERCHE & SEARCH BAR ===
    "where_to": { fr: "Où allez-vous ?", en: "Where to?", ar: "إلى أين أنت ذاهب؟", es: "¿A dónde vas?" },
    "pickup_location": { fr: "Lieu de prise en charge", en: "Pickup Location", ar: "موقع الاستلام", es: "Lugar de recogida" },
    "arrival_departure": { fr: "Arrivée — Départ", en: "Arrival — Departure", ar: "الوصول — المغادرة", es: "Llegada — Salida" },
    "pickup_return": { fr: "Départ — Retour", en: "Pickup — Return", ar: "الاستلام — العودة", es: "Recogida — Devolución" },
    "choose_dates": { fr: "Choisir les dates", en: "Choose dates", ar: "اختر التواريخ", es: "Elegir fechas" },
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
    "age_of_child": { fr: "ÂGE DE L'ENFANT", en: "CHILD AGE", ar: "عمر الطفل", es: "EDAD DEL NIÑO" },
    "infant_free_info": { fr: "Bon à savoir : Les enfants de moins de 2 ans séjournent gratuitement sur StayFloow !", en: "Good to know: Children under 2 stay for free on StayFloow!", ar: "معلومة مفيدة: الأطفال دون سن 2 سنة يقيمون مجانًا في StayFloow!", es: "¡Es bueno saberlo: los niños menores de 2 años se alojan gratis en StayFloow!" },
    "travel_with_pet": { fr: "Vous voyagez avec votre animal ?", en: "Are you traveling with your pet?", ar: "هل تسافر مع حيوانك الأليف؟", es: "¿Viajas con tu mascota?" },
    "done": { fr: "Terminer", en: "Done", ar: "تم", es: "Terminar" },
    "search_btn": { fr: "Rechercher", en: "Search", ar: "بحث", es: "Buscar" },

    // === HERO & HOME ===
    "hero_title": { fr: "Des séjours inoubliables pour tous les budgets.", en: "Incredible stays for every budget.", ar: "إقامات لا تنسى لجميع الميزانيات.", es: "Estancias inolvidables para todos los presupuestos." },
    "hero_subtitle": { fr: "Économisez 15 % ou plus sur vos réservations de 2026 grâce aux offres StayFloow.", en: "Save 15% or more on 2026 bookings with StayFloow deals.", ar: "وفر 15% أو أكثر على حجوزات 2026 مع عروض StayFloow.", es: "Ahorra un 15% o más en reservas de 2026 con ofertas de StayFloow." },
    "exclusive_offers": { fr: "Offres Exclusives 2026", en: "Exclusive 2026 Offers", ar: "عروض حصرية 2026", es: "Ofertas Exclusivas 2026" },
    "property_types_title": { fr: "Rechercher par type d'hébergement", en: "Search by property type", ar: "البحث حسب نوع الإقامة", es: "Buscar por tipo de propiedad" },
    "unique_stays_title": { fr: "Séjournez dans nos hébergements uniques", en: "Stay in our unique stays", ar: "أقم في أماكن إقامتنا الفريدة", es: "Quédese en nuestras estancias únicas" },
    "from_price": { fr: "À partir de", en: "From", ar: "تبدأ من", es: "Desde" },
    "recently_viewed": { fr: "Consultés récemment", en: "Recently viewed", ar: "تمت مشاهدتها مؤخراً", es: "Vistos recientemente" },
    "inspired_by_visit": { fr: "Inspirés par votre visite", en: "Inspired by your visit", ar: "مستوحى من زيارتك", es: "Inspirado por tu visita" },

    // === FILTERS & SIDEBAR ===
    "smart_filters": { fr: "Filtres intelligents", en: "Smart filters", ar: "فلاتر ذكية", es: "Filtros inteligentes" },
    "guest_ratings": { fr: "Note des commentaires", en: "Guest ratings", ar: "تقييمات الضيوف", es: "Calificación de los huéspedes" },
    "popular_amenities": { fr: "Équipements populaires", en: "Popular amenities", ar: "المرافق الشائعة", es: "Instalaciones populares" },
    "excellent_9": { fr: "Fabuleux : 9+", en: "Excellent: 9+", ar: "رائع: 9+", es: "Excelente: 9+" },
    "very_good_8": { fr: "Très bien : 8+", en: "Very good: 8+", ar: "جيد جداً: 8+", es: "Muy bien: 8+" },
    "good_7": { fr: "Bien : 7+", en: "Good: 7+", ar: "جيد: 7+", es: "Bien: 7+" },
    "pleasant_6": { fr: "Agréable : 6+", en: "Pleasant: 6+", ar: "مرضٍ: 6+", es: "Agradable: 6+" },

    // === ONBOARDING PARTNER ===
    "partner_hero_title": { fr: "Inscrivez votre établissement sur StayFloow.com", en: "List your property on StayFloow.com", ar: "سجل عقارك على StayFloow.com", es: "Inscriba su establecimiento en StayFloow.com" },
    "partner_hero_subtitle": { fr: "Rejoignez la plus grande communauté de voyageurs en Afrique.", en: "Join the largest travel community in Africa.", ar: "انضم إلى أكبر مجتمع للمسافرين في أفريقيا.", es: "Únase a la mayor comunidad de viajeros de África." },
    "partner_hero_cta": { fr: "Commencer gratuitement", en: "Get started for free", ar: "ابدأ مجاناً", es: "Empezar gratis" },
    "register_my_property": { fr: "ENREGISTRER MON BIEN", en: "REGISTER MY PROPERTY", ar: "سجل عقاري", es: "REGISTRAR MI BIEN" },
    "back_to_choice": { fr: "Retour au choix", en: "Back to choice", ar: "العودة إلى الخيار", es: "Volver a la elección" },
    "step_info": { fr: "Infos Contact", en: "Contact Info", ar: "معلومات الاتصال", es: "Información de contacto" },
    "step_loc": { fr: "Localisation", en: "Location", ar: "الموقع", es: "Ubicación" },
    "step_details": { fr: "Détails & IA", en: "Details & AI", ar: "التفاصيل والذكاء الاصطناعي", es: "Detalles e IA" },
    "step_photos_price": { fr: "Photos & Prix", en: "Photos & Price", ar: "الصور والسعر", es: "Fotos y Precio" },
    "first_name": { fr: "Prénom", en: "First Name", ar: "الاسم الأول", es: "Nombre" },
    "last_name": { fr: "Nom", en: "Last Name", ar: "اللقب", es: "Apellido" },
    "pro_email": { fr: "Email professionnel", en: "Professional Email", ar: "البريد الإلكتروني المهني", es: "Correo electrónico profesional" },
    "phone_whatsapp": { fr: "Téléphone (WhatsApp)", en: "Phone (WhatsApp)", ar: "الهاتف (واتساب)", es: "Teléfono (WhatsApp)" },
    "full_address": { fr: "Adresse complète", en: "Full Address", ar: "العنوان الكامل", es: "Dirección completa" },
    "back": { fr: "Précédent", en: "Back", ar: "رجوع", es: "Atrás" },
    "continue": { fr: "Continuer", en: "Continue", ar: "استمرار", es: "Continuar" },
    "partner_cta_title": { fr: "Devenez partenaire StayFloow", en: "Become a StayFloow partner", ar: "كن شريكاً في StayFloow", es: "Conviértase en socio de StayFloow" },
    "partner_cta_desc": { fr: "Rejoignez des milliers d'hôtes et loueurs en Afrique et commencez à générer des revenus.", en: "Join thousands of hosts and renters in Africa and start earning revenue.", ar: "انضم إلى آلاف المضيفين والمؤجرين في أفريقيا وابدأ في تحقيق الدخل.", es: "Únase a miles de anfitriones y arrendadores en África y comience a generar ingresos." },
    "start": { fr: "Commencer", en: "Get Started", ar: "ابدأ الآن", es: "Comenzar" },
    "year_label": { fr: "an", en: "year", ar: "سنة", es: "año" },
    "years_label": { fr: "ans", en: "years", ar: "سنوات", es: "años" },
    "free_label": { fr: "Gratuit", en: "Free", ar: "مجاني", es: "Gratis" },

    // === CONTACT PAGE ===
    "contact.title": { fr: "Contactez-nous", en: "Contact Us", ar: "اتصل بنا", es: "Contáctenos" },
    "contact.name": { fr: "Nom complet", en: "Full Name", ar: "الاسم الكامل", es: "Nombre completo" },
    "contact.email": { fr: "Email", en: "Email", ar: "البريد الإلكتروني", es: "Correo electrónico" },
    "contact.message": { fr: "Votre message", en: "Your message", ar: "رسالتك", es: "Tu message" },
    "contact.send": { fr: "Envoyer le message", en: "Send Message", ar: "إرسال الرسالة", es: "Enviar mensaje" },
    "contact.successTitle": { fr: "Message envoyé !", en: "Message Sent!", ar: "تم إرسال الرسالة!", es: "¡Mensaje enviado!" },
    "contact.successMessage": { fr: "Notre équipe reviendra vers vous très rapidement.", en: "Our team will get back to you very shortly.", ar: "سيعاود فريقنا الاتصال بك في أقرب وقت ممكن.", es: "Nuestro equipo se pondrá en contacto con usted muy pronto." },
    "contact.namePlaceholder": { fr: "Votre nom", en: "Your name", ar: "اسمك", es: "Su nombre" },
    "contact.emailPlaceholder": { fr: "votre@email.com", en: "your@email.com", ar: "بريدك@الإلكتروني.com", es: "tu@email.com" },
    "contact.messagePlaceholder": { fr: "Comment pouvons-nous vous aider ?", en: "How can we help you?", ar: "كيف يمكننا مساعدتك؟", es: "¿Cómo podemos ayudarle?" },
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
