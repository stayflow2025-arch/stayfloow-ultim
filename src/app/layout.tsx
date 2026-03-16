import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ChatLoader } from '@/components/chat-loader';
import ClientProviders from '@/components/client-providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.stayfloow.com'),
  title: {
    default: 'StayFloow.com | Réservez Hébergements, Voitures & Circuits en Afrique',
    template: '%s | StayFloow.com'
  },
  description: 'La plateforme de référence pour réserver hôtels, riads, villas, locations de voitures et excursions en Algérie, Égypte et partout en Afrique. Meilleurs prix garantis.',
  keywords: ['voyage Afrique', 'réservation hôtel Algérie', 'location voiture Alger', 'circuit Sahara', 'StayFloow', 'tourisme Afrique', 'vacances Égypte', 'riad Marrakech'],
  authors: [{ name: 'StayFloow Team' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.stayfloow.com',
    siteName: 'StayFloow.com',
    title: 'StayFloow.com | Le partenaire de vos voyages en Afrique',
    description: 'Hébergements uniques, locations de voitures et circuits guidés. Planifiez votre séjour parfait en quelques clics.',
    images: [
      {
        url: 'https://picsum.photos/seed/stayfloow-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'StayFloow.com Travel Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayFloow.com | Réservez votre séjour en Afrique',
    description: 'Hôtels, Voitures et Circuits aux meilleurs prix.',
    images: ['https://picsum.photos/seed/stayfloow-twitter/1200/630'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <head>
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
      <body className="font-body antialiased bg-background min-h-screen flex flex-col overflow-x-hidden">
        <FirebaseClientProvider>
          <ClientProviders>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <ChatLoader />
            <Toaster />
          </ClientProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
