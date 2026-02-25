
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Building, Car, Compass, ShieldCheck, TrendingUp, Users, Globe, ArrowRight } from 'lucide-react';
import PartnerOnboardingForm from '@/components/partners/PartnerOnboardingForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function PartnerJoinPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const heroImage = "https://picsum.photos/seed/stayfloow-join/1920/1080";

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-body">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            StayFloow<span className="text-secondary">.com</span> <span className="font-light ml-2 opacity-80">Partner</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex">Aide</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold">
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section Style Booking */}
      {!selectedCategory ? (
        <>
          <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
            <Image 
              src={heroImage} 
              alt="StayFloow Partner" 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#003580]/70" /> {/* Bleu foncé type Booking */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Inscrivez votre établissement sur StayFloow.com
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">
                Rejoignez la plus grande communauté de voyageurs en Afrique et boostez vos réservations gratuitement.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white text-xl px-10 py-8 rounded-md font-black shadow-xl"
                onClick={() => {
                  const el = document.getElementById('categories');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Commencer gratuitement
              </Button>
            </div>
          </section>

          {/* Category Selection Grid */}
          <section id="categories" className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryCard 
                icon={<Building className="h-12 w-12" />}
                title="Hébergement"
                desc="Hôtels, riads, appartements, villas, maisons d'hôtes..."
                onClick={() => setSelectedCategory('accommodation')}
              />
              <CategoryCard 
                icon={<Car className="h-12 w-12" />}
                title="Location de voiture"
                desc="Berlines, SUV, 4x4, minibus, voitures de luxe..."
                onClick={() => setSelectedCategory('car_rental')}
              />
              <CategoryCard 
                icon={<Compass className="h-12 w-12" />}
                title="Circuits & Excursions"
                desc="Safaris, visites guidées, treks, croisières sur le Nil..."
                onClick={() => setSelectedCategory('circuit')}
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-12">
              <TrustItem icon={<Users />} title="Visibilité mondiale" desc="Touchez des clients du monde entier." />
              <TrustItem icon={<ShieldCheck />} title="Paiements sécurisés" desc="Gérez vos revenus en toute sérénité." />
              <TrustItem icon={<TrendingUp />} title="Gestion simplifiée" desc="Des outils pro pour votre activité." />
              <TrustItem icon={<Globe />} title="GPS Précis" desc="Vos clients vous trouvent à coup sûr." />
            </div>
          </section>
        </>
      ) : (
        /* Form Section */
        <main className="flex-grow py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="text-primary font-bold">
                ← Retour au choix
              </Button>
              <h2 className="text-2xl font-black text-slate-800">
                Inscription : {
                  selectedCategory === 'accommodation' ? 'Hébergement' :
                  selectedCategory === 'car_rental' ? 'Location de voiture' : 'Circuit & Excursion'
                }
              </h2>
            </div>
            <PartnerOnboardingForm initialCategory={selectedCategory as any} />
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-slate-200 py-12 text-center text-sm text-slate-500">
        <p>© 2025 StayFloow.com Partner Hub. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

function CategoryCard({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-8 rounded-xl shadow-xl border-b-4 border-transparent hover:border-primary transition-all cursor-pointer group hover:-translate-y-2 flex flex-col items-center text-center gap-4"
    >
      <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-black text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
      <div className="mt-4 text-primary font-bold flex items-center gap-2">
        Enregistrer mon bien <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="bg-primary/10 p-4 rounded-full text-primary">{icon}</div>
      <h4 className="font-black text-lg text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}
