'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building, Car, Compass, ShieldCheck, TrendingUp, Users, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import PartnerOnboardingForm from '@/components/partners/PartnerOnboardingForm';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

function PartnerJoinContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Auto-sélection de la catégorie si présente dans l'URL (via le menu Header/Footer)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['accommodation', 'car_rental', 'circuit'].includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-body">
      {/* Header Interne Partenaire - Épuré */}
      <header className="bg-primary text-white py-4 px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            StayFloow<span className="text-secondary">.com</span> <span className="font-light ml-2 opacity-80 text-lg uppercase tracking-widest">Partner</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex font-bold">{t('help')}</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold px-6" asChild>
              <Link href="/auth/login">{t('login')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {!selectedCategory ? (
        <>
          {/* Hero Section - Matching Image */}
          <section className="bg-primary pt-20 pb-32 px-6 text-center text-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10 space-y-6">
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                {t('partner_hero_title') || 'Inscrivez votre établissement sur StayFloow.com'}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-medium">
                {t('partner_hero_subtitle') || 'Rejoignez la plus grande communauté de voyageurs en Afrique et boostez vos réservations gratuitement.'}
              </p>
              <div className="pt-8">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-primary text-lg px-10 py-7 rounded-xl font-black shadow-2xl active:scale-95 transition-all"
                  onClick={() => {
                    const el = document.getElementById('categories');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  {t('partner_hero_cta') || 'Commencer gratuitement'}
                </Button>
              </div>
            </div>
            {/* Décoration subtile */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          </section>

          {/* Categories Section - Matching Image Cards */}
          <section id="categories" className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CategoryCard 
                icon={<Building className="h-10 w-10" />}
                title={t('accommodations')}
                desc={t('partner_cat_acc_desc') || "Hôtels, riads, appartements, villas, maisons d'hôtes..."}
                onClick={() => setSelectedCategory('accommodation')}
              />
              <CategoryCard 
                icon={<Car className="h-10 w-10" />}
                title={t('car_rental')}
                desc={t('partner_cat_car_desc') || "Berlines, SUV, 4x4, minibus, voitures de luxe..."}
                onClick={() => setSelectedCategory('car_rental')}
              />
              <CategoryCard 
                icon={<Compass className="h-10 w-10" />}
                title={t('tours')}
                desc={t('partner_cat_tour_desc') || "Safaris, visites guidées, treks, croisières sur le Nil..."}
                onClick={() => setSelectedCategory('circuit')}
              />
            </div>

            {/* Trust Items - Matching Image */}
            <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
              <TrustItem 
                icon={<Users className="h-6 w-6" />} 
                title={t('trust_visibility_title') || "Visibilité mondiale"} 
                desc={t('trust_visibility_desc') || "Touchez des clients du monde entier."} 
              />
              <TrustItem 
                icon={<ShieldCheck className="h-6 w-6" />} 
                title={t('trust_payment_title') || "Paiements sécurisés"} 
                desc={t('trust_payment_desc') || "Gérez vos revenus en toute sérénité."} 
              />
              <TrustItem 
                icon={<TrendingUp className="h-6 w-6" />} 
                title={t('trust_mgmt_title') || "Gestion simplifiée"} 
                desc={t('trust_mgmt_desc') || "Des outils pro pour votre activité."} 
              />
              <TrustItem 
                icon={<Globe className="h-6 w-6" />} 
                title={t('trust_gps_title') || "GPS Précis"} 
                desc={t('trust_gps_desc') || "Vos clients vous trouvent à coup sûr."} 
              />
            </div>
          </section>
        </>
      ) : (
        <main className="flex-grow py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="text-primary font-bold hover:bg-primary/5 px-4 h-12 rounded-xl">
                ← {t('back_to_choice') || 'Retour au choix'}
              </Button>
              <h2 className="text-2xl font-black text-slate-800">
                {t('registration') || 'Inscription'} : {
                  selectedCategory === 'accommodation' ? t('accommodations') :
                  selectedCategory === 'car_rental' ? t('car_rental') : t('tours')
                }
              </h2>
            </div>
            <PartnerOnboardingForm initialCategory={selectedCategory as any} />
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-slate-200 py-12 text-center text-sm text-slate-500">
        <p>© 2025 StayFloow.com Partner Hub. {t('rights_reserved')}</p>
      </footer>
    </div>
  );
}

export default function PartnerJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PartnerJoinContent />
    </Suspense>
  );
}

function CategoryCard({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <div 
      onClick={onClick}
      className="bg-white p-10 rounded-[2rem] shadow-2xl border-2 border-transparent hover:border-primary transition-all cursor-pointer group hover:-translate-y-2 flex flex-col items-center text-center gap-6"
    >
      <div className="text-primary bg-primary/5 p-6 rounded-3xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium text-sm">{desc}</p>
      </div>
      <div className="mt-4 text-primary font-black flex items-center gap-2 uppercase text-[10px] tracking-widest border-b-2 border-transparent group-hover:border-primary transition-all">
        {t('register_my_property') || 'ENREGISTRER MON BIEN'} <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 group">
      <div className="bg-white p-4 rounded-2xl shadow-lg text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h4 className="font-black text-lg text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[180px]">{desc}</p>
    </div>
  );
}
