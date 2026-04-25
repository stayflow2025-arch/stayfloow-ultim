
import { cookies } from 'next/headers';
import { translations, Locale } from './translations';

/**
 * Récupère la locale actuelle côté serveur.
 */
export async function getLocaleServer(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get('stayfloow_locale')?.value as Locale;
    if (locale && (locale === 'fr' || locale === 'en' || locale === 'ar' || locale === 'es')) {
      return locale;
    }
  } catch (e) {
    console.error("Error reading locale cookies:", e);
  }
  return 'fr'; // Default
}

/**
 * Fonction de traduction côté serveur.
 */
export async function getTranslationServer() {
  const locale = await getLocaleServer();
  
  return (key: string): string => {
    return translations[key]?.[locale] || key;
  };
}
