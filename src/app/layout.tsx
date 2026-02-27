
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ChatLoader } from '@/components/chat-loader';
import ClientProviders from '@/components/client-providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.stayfloow.com'),
  title: {
    default: 'StayFloow.com | Réservez Hébergements, Voitures & Circuits en Afrique',
    template: '%s | StayFloow.com'
  },
  description: 'La plateforme de référence pour réserver hôtels, riads, locations de voitures et excursions en Algérie et partout en Afrique. Meilleurs prix garantis.',
  keywords: ['voyage Afrique', 'réservation hôtel Algérie', 'location voiture Alger', 'circuit Sahara', 'StayFloow', 'tourisme Afrique'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayFloow',
  },
  formatDetection: {
    telephone: true,
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
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
