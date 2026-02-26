
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, MapPin, Heart, LayoutGrid, List, 
  Wifi, Car, Coffee, ParkingCircle, ChevronRight, Check, Map as MapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);

  const mockResults = [
    {
      id: 1,
      name: 'Riad Dar El Kenz',
      location: 'Casbah, Alger',
      distance: '0,5 km du centre',
      rating: 9.4,
      ratingText: 'Exceptionnel',
      reviews: 458,
      price: '12 500',
      type: 'Riad authentique',
      image: 'https://picsum.photos/seed/riad1/600/400',
      badge: 'Coup de cœur',
      amenities: ['Wifi gratuit', 'Petit-déjeuner inclus', 'Climatisation'],
      features: ['Annulation gratuite', 'Aucun prépaiement requis']
    },
    {
      id: 2,
      name: 'Nile Palace Cairo',
      location: 'Zamalek, Le Caire',
      distance: '2,1 km du centre',
      rating: 9.1,
      ratingText: 'Superbe',
      reviews: 1840,
      price: '18 900',
      type: 'Hôtel 5 étoiles',
      image: 'https://picsum.photos/seed/hotel1/600/400',
      badge: 'Luxe',
      amenities: ['Piscine', 'Spa', 'Vue sur le Nil'],
      features: ['Petit-déjeuner compris']
    },
    {
      id: 3,
      name: 'Villa Sahara Dream',
      location: 'Ghardaïa, Algérie',
      distance: '4,0 km du centre',
      rating: 8.8,
      ratingText: 'Fabuleux',
      reviews: 124,
      price: '15 000',
      type: 'Villa Privée',
      image: 'https://picsum.photos/seed/villa1/600/400',
      badge: 'Populaire',
      amenities: ['Piscine privée', 'Jardin', 'Parking'],
      features: ['Annulation gratuite']
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Search Header */}
      <div className="bg-primary pt-6 pb-12 px-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-black text-white tracking-tighter italic">StayFloow.com</Link>
            <div className="flex gap-4">
               <Button variant="ghost" className="text-white font-bold">DZD</Button>
               <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary font-bold transition-all" asChild>
                  <Link href="/auth/login">Se connecter</Link>
               </Button>
            </div>
          </div>
          <div className="max-w-5xl mx-auto w-full">
            <AdvancedSearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-primary/5 border-b border-primary/10">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">Filtrer par :</h3>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Budget */}
              <FilterSection title="Votre budget (par nuit)">
                <div className="space-y-3">
                  <FilterItem label="0 DZD - 5 000 DZD" count={12} />
                  <FilterItem label="5 000 DZD - 10 000 DZD" count={25} />
                  <FilterItem label="10 000 DZD - 20 000 DZD" count={42} />
                  <FilterItem label="20 000 DZD +" count={18} />
                </div>
              </FilterSection>

              <Separator />

              {/* Popular */}
              <FilterSection title="Filtres populaires">
                <div className="space-y-3">
                  <FilterItem label="Hôtels" />
                  <FilterItem label="Petit-déjeuner inclus" />
                  <FilterItem label="Annulation gratuite" />
                  <FilterItem label="Piscine" />
                  <FilterItem label="Très bon : 8+" />
                </div>
              </FilterSection>

              <Separator />

              {/* Stars */}
              <FilterSection title="Note de l'établissement">
                <div className="space-y-3">
                  {[5, 4, 3, 2].map(s => (
                    <FilterItem 
                      key={s} 
                      label={`${s} étoiles`} 
                      icon={<div className="flex ml-1">{Array(s).fill(0).map((_, i) => <Star key={i} className="h-2 w-2 fill-[#febb02] text-[#febb02]" />)}</div>} 
                    />
                  ))}
                </div>
              </FilterSection>

              <Separator />

              {/* Amenities */}
              <FilterSection title="Équipements">
                <div className="space-y-3">
                  <FilterItem label="Parking" icon={<ParkingCircle className="h-3 w-3" />} />
                  <FilterItem label="Wifi gratuit" icon={<Wifi className="h-3 w-3" />} />
                  <FilterItem label="Restaurant" icon={<Coffee className="h-3 w-3" />} />
                  <FilterItem label="Navette aéroport" icon={<Car className="h-3 w-3" />} />
                </div>
              </FilterSection>
            </div>
          </div>

          {/* Map Preview */}
          <div 
            className="relative h-40 rounded-lg overflow-hidden cursor-pointer shadow-md group border border-slate-200"
            onClick={() => setShowMap(!showMap)}
          >
            <Image src="https://picsum.photos/seed/map/400/300" alt="Map" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="bg-primary text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2">
                <MapIcon className="h-4 w-4" /> Afficher sur la carte
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-grow space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900">Alger : {mockResults.length} établissements trouvés</h2>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded">
               <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
               >
                 <List className="h-4 w-4" />
               </Button>
               <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
               >
                 <LayoutGrid className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {mockResults.map((item) => (
              <ResultCard key={item.id} item={item} mode={viewMode} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[13px] font-black text-slate-900">{title}</h4>
      {children}
    </div>
  );
}

function FilterItem({ label, count, icon }: { label: string, count?: number, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center space-x-3">
        <Checkbox id={label} className="h-5 w-5 rounded-sm border-slate-400" />
        <label htmlFor={label} className="text-[13px] text-slate-700 leading-none flex items-center group-hover:underline">
          {label} {icon}
        </label>
      </div>
      {count !== undefined && <span className="text-xs text-slate-500">{count}</span>}
    </div>
  );
}

function ResultCard({ item, mode }: { item: any, mode: 'list' | 'grid' }) {
  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 hover:border-primary transition-all bg-white",
      mode === 'list' ? "flex flex-col md:flex-row h-auto md:h-64" : "flex flex-col h-full"
    )}>
      <div className={cn(
        "relative shrink-0",
        mode === 'list' ? "w-full md:w-64 h-56 md:h-full" : "w-full h-48"
      )}>
        <Image src={item.image} alt={item.name} fill className="object-cover" />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/90 rounded-full h-8 w-8 shadow">
          <Heart className="h-4 w-4 text-slate-700" />
        </Button>
      </div>
      
      <div className="flex-grow p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-primary hover:text-slate-900 truncate tracking-tight">{item.name}</h3>
                <div className="flex shrink-0">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-[#febb02] text-[#febb02]" />)}
                </div>
              </div>
              <div className="flex items-center text-xs text-primary font-bold underline mb-1">
                <MapPin className="h-3 w-3 mr-1" /> {item.location}
              </div>
              <div className="text-[11px] text-slate-600 mb-2">{item.distance}</div>
            </div>
            <div className="flex items-center gap-2 text-right">
               <div className="hidden sm:block">
                  <div className="font-black text-slate-900 text-sm">{item.ratingText}</div>
                  <div className="text-[10px] text-slate-500">{item.reviews} expériences vécues sur StayFloow.com</div>
               </div>
               <div className="bg-primary text-white font-black h-8 w-8 rounded-tr-lg rounded-bl-lg rounded-tl-lg flex items-center justify-center text-sm">
                  {item.rating}
               </div>
            </div>
          </div>
          
          <div className="text-[11px] font-bold text-slate-900 border-l-2 border-[#febb02] pl-2 mb-3">
            {item.type}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {item.features?.map((f: string) => (
              <div key={f} className="text-[11px] font-bold text-green-700 flex items-center gap-1">
                <Check className="h-3 w-3" /> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end border-t pt-3">
          <div className="text-[10px] text-slate-500">
             Les prix incluent les taxes et frais StayFloow.com.
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-slate-900 tracking-tight">{item.price} DZD</div>
            <Button className="bg-primary hover:bg-primary/90 h-10 px-6 font-bold mt-2 text-white">
              Voir l'offre <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
