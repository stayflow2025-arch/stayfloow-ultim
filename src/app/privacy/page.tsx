
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Simple */}
      <header className="bg-primary text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Confidentialité
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Dernière mise à jour : 24 mai 2024
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" /> Notre engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-slate max-w-none space-y-8">
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h3>
                <p className="text-slate-600 leading-relaxed">
                  Chez StayFloow.com, nous accordons une importance capitale à la protection de vos données personnelles. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme de réservation.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">2. Données collectées</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nous collectons les informations nécessaires à la gestion de vos réservations, notamment :
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Informations d'identité (nom, prénom)</li>
                  <li>Coordonnées (email, numéro de téléphone)</li>
                  <li>Informations de paiement (via nos partenaires sécurisés comme PayPal)</li>
                  <li>Préférences de voyage et historique de réservations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">3. Utilisation de vos données</h3>
                <p className="text-slate-600 leading-relaxed">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Traiter et confirmer vos réservations d'hébergements, voitures et circuits</li>
                  <li>Vous envoyer des confirmations et mises à jour importantes</li>
                  <li>Améliorer nos services grâce à l'analyse de données anonymisées</li>
                  <li>Assurer la sécurité de notre plateforme et prévenir la fraude</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">4. Partage des données</h3>
                <p className="text-slate-600 leading-relaxed">
                  StayFloow.com ne vend jamais vos données personnelles. Nous partageons uniquement les informations strictement nécessaires avec nos partenaires (hôtels, loueurs de voitures, guides) pour assurer le bon déroulement de votre prestation.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4">5. Vos droits</h3>
                <p className="text-slate-600 leading-relaxed">
                  Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données. Vous pouvez exercer ces droits en nous contactant à <span className="font-bold text-primary">privacy@stayfloow.com</span>.
                </p>
              </section>
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white p-3 rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Des questions ?</h4>
                <p className="text-sm text-slate-500">Notre équipe dédiée à la protection des données est là pour vous.</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-primary text-white py-12 px-8 text-center mt-12">
        <p className="opacity-50 text-sm">© 2025 StayFloow.com. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
