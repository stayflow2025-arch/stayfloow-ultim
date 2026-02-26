
import React from 'react';
import Link from 'next/link';
import { FileText, ShieldAlert, Scale, Clock, MessageSquare, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Simple */}
      <header className="bg-primary text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <Button variant="ghost" className="text-white hover:bg-white/10 font-bold" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <FileText className="h-4 w-4" /> Mentions Légales
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Conditions d'Utilisation
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Dernière mise à jour : 31 Janvier 2026
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary" /> Contrat d'Utilisation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-10">
              <section className="space-y-4">
                <p className="text-slate-600 leading-relaxed font-medium">
                  Ces conditions régissent votre accès et votre utilisation de la plateforme StayFloow. En utilisant nos services, vous acceptez ces conditions dans leur intégralité.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Utilisation de la plateforme
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Vous devez avoir au moins 18 ans pour utiliser StayFloow. Vous vous engagez à fournir des informations exactes lors de votre inscription et à maintenir la sécurité et la confidentialité de votre compte personnel ou professionnel.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Réservations et Paiements
                </h3>
                <div className="space-y-3">
                  <p className="text-slate-600 leading-relaxed">
                    <strong>Pour les Voyageurs :</strong> Vous acceptez de payer l'intégralité des frais associés à votre réservation (prix de base, taxes et frais éventuels). Les paiements sont sécurisés et traités via nos partenaires financiers.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>Pour les Hôtes :</strong> Vous vous engagez à honorer les réservations confirmées et à fournir une description honnête et précise de vos services (logement, véhicule ou circuit).
                  </p>
                </div>
              </section>

              <section className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" /> 
                  3. Politique d'Annulation
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Notre politique est conçue pour protéger à la fois les voyageurs et nos partenaires locaux :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Plus de 48 heures avant :</strong> Annulation gratuite possible sans frais de pénalité (hors frais bancaires éventuels).</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span><strong>Moins de 48 heures avant :</strong> Aucun remboursement ne sera possible. Le montant total de la réservation est dû en cas d'annulation tardive ou de non-présentation.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center text-sm">4</span>
                  Conduite et Responsabilités
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Le respect mutuel est le socle de la communauté StayFloow. Toute activité illégale, frauduleuse ou discriminatoire entraînera une exclusion immédiate. Les voyageurs sont responsables de toute dégradation causée durant leur prestation.
                </p>
              </section>

              <section className="space-y-4 border-l-4 border-amber-400 pl-6 py-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-amber-500" /> 
                  5. Rôle de StayFloow
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  StayFloow est une <strong>plateforme technologique intermédiaire</strong>. Nous ne sommes pas propriétaires des biens listés. Par conséquent, StayFloow ne peut être tenu responsable des litiges, problèmes de qualité ou dommages survenant lors d'un séjour. Ces questions doivent être résolues directement entre le client et l'hôte.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center text-sm">6</span>
                  Droit applicable
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Ces conditions sont régies par le <strong>droit algérien</strong>. Tout litige non résolu à l'amiable sera soumis à la compétence exclusive des tribunaux d'Alger.
                </p>
              </section>
            </CardContent>
          </Card>

          <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <h4 className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-secondary" /> Une question sur nos termes ?
              </h4>
              <p className="text-white/70 max-w-md">
                Notre équipe est à votre disposition pour clarifier tout point concernant nos conditions d'utilisation.
              </p>
              <div className="flex items-center gap-2 text-secondary font-bold">
                <Mail className="h-4 w-4" /> stayflow2025@gmail.com
              </div>
            </div>
            <Button className="bg-secondary hover:bg-white text-primary font-black px-10 h-14 rounded-xl shadow-lg relative z-10" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
            {/* Décoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </main>

      <footer className="bg-primary text-white py-12 px-8 text-center mt-12">
        <p className="opacity-50 text-sm">© 2025 StayFloow.com. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
