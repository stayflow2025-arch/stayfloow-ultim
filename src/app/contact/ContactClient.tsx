"use client";

import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import ContactPageContent from "./ContactPageContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactClient() {
  const { t } = useLanguage();
  const { toast } = useToast();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header spécifique pour la page contact si besoin de navigation directe */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/">Accueil</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <ContactPageContent t={t} toast={toast} />
      </main>

      <footer className="bg-primary text-white py-12 px-6 text-center">
        <p className="opacity-50 text-sm">© 2025 StayFloow.com. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
