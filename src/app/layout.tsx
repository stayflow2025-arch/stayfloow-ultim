import type { Metadata, Viewport } from 'next';
export const dynamic = 'force-dynamic';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ChatLoader } from '@/components/chat-loader';
import ClientProviders from '@/components/client-providers';
import StructuredData from '@/components/structured-data';
import { GoogleTranslate } from '@/components/google-translate';
import { getLocaleServer } from '@/lib/i18n-server';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.stayfloow.com'),
  title: {
    default: 'StayFloow | N°1 Location Voiture, Hébergement & Circuits (Algérie, Égypte)',
    template: '%s | StayFloow'
  },
  description: 'Trouvez et réservez instantanément les meilleures locations de voitures, hôtels, villas et circuits touristiques en Algérie et en Égypte au meilleur prix. Voyagez sereinement.',
  keywords: [
    'location de voiture algérie', 'réservation hôtel égypte', 'circuit sahara', 
    'voyage organisé', 'devenir partenaire hôte', 'louer appartement alger', 
    'ouest algérien', 'agence de location voiture', 'tourisme afrique du nord',
    'location voiture sans caution algérie', 'excursions pyramides', 'stayfloow'
  ],
  authors: [{ name: 'StayFloow Team' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.stayfloow.com',
    siteName: 'StayFloow',
    title: 'StayFloow | La Plateforme N°1 de Voyages en Algérie et Égypte',
    description: 'La garantie de trouver le meilleur hébergement, véhicule ou circuit pour vos prochaines vacances. Réservez ou devenez partenaire officiel.',
    images: [
      {
        url: 'https://www.stayfloow.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'Plateforme StayFloow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayFloow.com | Réservez votre séjour en Afrique',
    description: 'Hôtels, Voitures et Circuits aux meilleurs prix.',
    images: ['https://www.stayfloow.com/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleServer();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>
        <StructuredData />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var handleChunkError = function(error) {
                  var message = error.message || (error.reason && error.reason.message) || '';
                  var isChunkError = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(message);
                  if (isChunkError) {
                    console.warn('StayFloow Recovery: Reloading due to chunk failure...');
                    window.location.reload();
                  }
                };
                window.addEventListener('error', handleChunkError, true);
                window.addEventListener('unhandledrejection', handleChunkError);
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <GoogleTranslate />
        <FirebaseClientProvider>
          <ClientProviders initialLocale={locale}>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Toaster />
            <ChatLoader />
            <Footer />
          </ClientProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
