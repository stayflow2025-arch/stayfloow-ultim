
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, ShieldCheck, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { circuits } from '@/lib/data';
import { CircuitCard } from '@/components/circuit-card';
import { useLanguage } from '@/context/language-context';

export default function CircuitsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Redundant header removed - using global layout header */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 font-bold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back') || 'Retour'}
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
                <Compass className="h-12 w-12 text-primary" /> {t('tours_title') || 'Nos Circuits & Excursions'}
              </h1>
              <p className="text-xl text-slate-500 mt-3 font-medium">{t('tours_subtitle') || "Explorez les merveilles de l'Afrique avec nos guides certifiés StayFloow."}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {circuits.map((circuit) => (
            <CircuitCard key={circuit.id} circuit={circuit} />
          ))}
        </div>

        {/* Pourquoi réserver avec nous */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h4 className="text-xl font-black mb-3">{t('certified_guides') || 'Guides Certifiés'}</h4>
            <p className="text-slate-500 font-medium leading-relaxed">{t('certified_guides_desc') || 'Tous nos guides sont rigoureusement sélectionnés et formés selon notre charte de qualité.'}</p>
          </div>
          <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h4 className="text-xl font-black mb-3">{t('total_flexibility') || 'Flexibilité Totale'}</h4>
            <p className="text-slate-500 font-medium leading-relaxed">{t('total_flexibility_desc') || "Annulation gratuite jusqu'à 48h avant le départ sur la plupart des circuits et activités."}</p>
          </div>
          <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-6">
              <Compass className="h-10 w-10 text-primary" />
            </div>
            <h4 className="text-xl font-black mb-3">{t('unique_experiences') || 'Expériences Uniques'}</h4>
            <p className="text-slate-500 font-medium leading-relaxed">{t('unique_experiences_desc') || 'Des itinéraires hors des sentiers battus pour découvrir la culture africaine authentique.'}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
