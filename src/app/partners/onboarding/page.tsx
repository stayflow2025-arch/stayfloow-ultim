
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PartnerOnboardingForm from "@/components/partners/PartnerOnboardingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Car, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'accommodation' | 'car_rental' | 'circuit' | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Minimaliste Onboarding */}
      <header className="bg-white border-b py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
            StayFloow<span className="text-secondary">.com</span> <span className="text-slate-300 font-light ml-2">| Partenaire</span>
          </Link>
          <Link href="/contact" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            Besoin d'aide ?
          </Link>
        </div>
      </header>

      <main className="flex-grow py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {!selectedCategory ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                  <Sparkles className="h-4 w-4" /> Devenir Partenaire StayFloow
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Commençons votre aventure.
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                  Quel type de service souhaitez-vous proposer à la communauté de voyageurs StayFloow ?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <OnboardingChoice 
                  icon={<Building className="h-10 w-10" />}
                  title="Hébergement"
                  desc="Hôtels, Riads, Villas, Appartements..."
                  onClick={() => setSelectedCategory('accommodation')}
                />
                <OnboardingChoice 
                  icon={<Car className="h-10 w-10" />}
                  title="Location de voiture"
                  desc="SUV, Berlines, 4x4, Citadines..."
                  onClick={() => setSelectedCategory('car_rental')}
                />
                <OnboardingChoice 
                  icon={<Compass className="h-10 w-10" />}
                  title="Circuits & Tours"
                  desc="Excursions, Safaris, Visites guidées..."
                  onClick={() => setSelectedCategory('circuit')}
                />
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-xl">
                    <Building className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Déjà inscrit ?</h3>
                    <p className="text-sm text-slate-500">Accédez directement à votre tableau de bord.</p>
                  </div>
                </div>
                <Button variant="outline" className="border-primary text-primary font-black px-8" asChild>
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCategory(null)} 
                  className="font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Changer de catégorie
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Catégorie :</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                    {selectedCategory === 'accommodation' ? 'Hébergement' : 
                     selectedCategory === 'car_rental' ? 'Véhicule' : 'Circuit'}
                  </span>
                </div>
              </div>
              <PartnerOnboardingForm initialCategory={selectedCategory} />
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 font-medium">
        © 2025 StayFloow.com Partner Hub. Inscription sécurisée.
      </footer>
    </div>
  );
}

function OnboardingChoice({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-10 rounded-3xl border-2 border-transparent hover:border-primary shadow-xl hover:shadow-2xl transition-all group flex flex-col items-center text-center gap-6"
    >
      <div className="bg-slate-50 p-6 rounded-2xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="pt-4">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </div>
      </div>
    </button>
  );
}
