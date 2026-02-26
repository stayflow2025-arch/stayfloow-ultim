import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ChatLoader } from '@/components/chat-loader';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'StayFloow.com | Réservez Hébergements, Voitures & Circuits en Afrique',
  description: 'La plateforme de référence pour réserver hôtels, riads, locations de voitures et excursions en Afrique.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <Providers>
            <Header />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <ChatLoader />
            <Toaster />
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
