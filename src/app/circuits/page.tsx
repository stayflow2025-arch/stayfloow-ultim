
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, MapPin, Star, Calendar, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { circuits } from '@/lib/data';

export default function CircuitsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/search?type=accommodations" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Séjours</Link>
            <Link href="/cars" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Voitures</Link>
            <Link href="/circuits" className="bg-white/20 px-3 py-2 rounded-md transition-colors font-bold">Circuits</Link>
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary font-black transition-all" asChild>
              <Link href="/partners/join">Devenir partenaire</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 font-bold text-slate-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Compass className="h-10 w-10 text-primary" /> Nos Circuits & Excursions
          </h1>
          <p className="text-xl text-slate-500 mt-2">Explorez les merveilles de l'Afrique avec nos guides certifiés StayFloow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {circuits.map((circuit) => (
            <Card key={circuit.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all group">
              <div className="relative h-64 w-full">
                <Image 
                  src={circuit.images[0]} 
                  alt={circuit.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">CIRCUIT CERTIFIÉ</span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{circuit.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {circuit.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                    <Star className="h-3 w-3 fill-primary" /> 4.9
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="h-4 w-4 text-primary" /> Multi-jours
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="h-4 w-4 text-primary" /> Groupe partagé
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">À partir de</span>
                    <p className="text-xl font-black text-primary">{circuit.pricePerPerson.toLocaleString()} DZD</p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                    <Link href={`/circuits/book?id=${circuit.id}`}>Réserver</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pourquoi réserver avec nous */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-black mb-2">Guides Certifiés</h4>
            <p className="text-sm text-slate-500">Tous nos guides sont rigoureusement sélectionnés et formés.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-black mb-2">Flexibilité Totale</h4>
            <p className="text-sm text-slate-500">Annulation gratuite jusqu'à 48h avant le départ sur la plupart des circuits.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-black mb-2">Expériences Uniques</h4>
            <p className="text-sm text-slate-500">Des itinéraires hors des sentiers battus pour découvrir la vraie Afrique.</p>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-16 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center opacity-70 text-sm">
          <p>© 2025 StayFloow.com. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
