
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Star, MapPin, Heart, LayoutGrid, List, 
  Wifi, Car, Coffee, ParkingCircle, ChevronRight, Check, Map as MapIcon,
  Filter, Search as SearchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/currency-context';

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const { formatPrice } = useCurrency();

  const mockResults = [
    {
      id: 'prop-1',
      name: 'Riad Dar Al-Andalus',
      location: 'Fès, Maroc',
      distance: '0,5 km du centre',
      rating: 9.8,
      ratingText: 'Exceptionnel',
      reviews: 458,
      price: 12500,
      type: 'Riad authentique',
      image: 'https://picsum.photos/seed/riad1/600/400',
      badge: 'Coup de cœur',
      amenities: ['Wifi gratuit', 'Petit-déjeuner inclus', 'Climatisation'],
      features: ['Annulation gratuite', 'Aucun prépaiement requis']
    },
    {
      id: 'prop-4',
      name: 'Nile Floating Palace',
      location: 'Louxor, Égypte',
      distance: '2,1 km du centre',
      rating: 9.6,
      ratingText: 'Superbe',
      reviews: 1840,
      price: 18900,
      type: 'Hôtel Flottant',
      image: 'https://picsum.photos/seed/hotel1/600/400',
      badge: 'Luxe',
      amenities: ['Piscine', 'Spa', 'Vue sur le Nil'],
      features: ['Petit-déjeuner compris']
    },
    {
      id: 'prop-3',
      name: 'Villa Sahara Dream',
      location: 'Ghardaïa, Algérie',
      distance: '4,0 km du centre',
      rating: 8.8,
      ratingText: 'Fabuleux',
      reviews: 124,
      price: 15000,
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
            <Link href="/" className="text-3xl font-black text-white tracking-tighter italic hover:opacity-90 transition-opacity">StayFloow.com</Link>
            <div className="flex gap-4">
               <Button variant="ghost" className="text-white font-black">DZD</Button>
               <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary font-black transition-all rounded-xl" asChild>
                  <Link href="/auth/login">Se connecter</Link>
               </Button>
            </div>
          </div>
          <div className="max-w-5xl mx-auto w-full">
            <AdvancedSearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Filtrer par :
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-black text-primary p-0 h-auto">EFFACER</Button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Budget */}
              <FilterSection title="Budget par nuit">
                <div className="space-y-3">
                  <FilterItem label="0 - 5 000 DZD" count={12} />
                  <FilterItem label="5 000 - 10 000 DZD" count={25} />
                  <FilterItem label="10 000 - 20 000 DZD" count={42} />
                  <FilterItem label="20 000 DZD +" count={18} />
                </div>
              </FilterSection>

              <Separator />

              {/* Stars */}
              <FilterSection title="Étoiles">
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
                  <FilterItem label="Piscine" icon={<MapIcon className="h-3 w-3" />} />
                </div>
              </FilterSection>
            </div>
          </div>

          {/* Map Preview */}
          <div 
            className="relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-2xl group border-4 border-white"
            onClick={() => setShowMap(!showMap)}
          >
            <Image src="https://picsum.photos/seed/map-search/400/300" alt="Map" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 text-center">
              <MapIcon className="h-8 w-8 text-white mb-2" />
              <div className="bg-primary text-white px-6 py-2 rounded-full font-black text-xs shadow-lg">
                VOIR SUR LA CARTE
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-grow space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Alger : {mockResults.length} établissements</h2>
              <p className="text-xs text-slate-500 font-medium">Prix moyens constatés : {formatPrice(14000)} / nuit</p>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-400">VUE :</span>
               <div className="flex items-center gap-1 bg-slate-50 border p-1 rounded-xl">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={cn("h-9 px-3 rounded-lg", viewMode === 'list' ? "bg-primary shadow-md" : "hover:bg-slate-200")}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-2" /> Liste
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={cn("h-9 px-3 rounded-lg", viewMode === 'grid' ? "bg-primary shadow-md" : "hover:bg-slate-200")}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" /> Grille
                  </Button>
               </div>
            </div>
          </div>

          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {mockResults.map((item) => (
              <ResultCard key={item.id} item={item} mode={viewMode} formatPrice={formatPrice} />
            ))}
          </div>

          {mockResults.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <SearchIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
               <h3 className="text-xl font-black text-slate-400">Aucun résultat trouvé</h3>
               <p className="text-slate-500 max-w-xs mx-auto mt-2">Essayez de modifier vos dates ou d'élargir votre zone de recherche.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
      {children}
    </div>
  );
}

function FilterItem({ label, count, icon }: { label: string, count?: number, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center space-x-3">
        <Checkbox id={label} className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-primary" />
        <label htmlFor={label} className="text-sm font-medium text-slate-600 leading-none flex items-center group-hover:text-primary transition-colors">
          {label} {icon}
        </label>
      </div>
      {count !== undefined && <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{count}</span>}
    </div>
  );
}

function ResultCard({ item, mode, formatPrice }: { item: any, mode: 'list' | 'grid', formatPrice: any }) {
  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 bg-white group rounded-3xl",
      mode === 'list' ? "flex flex-col md:flex-row md:h-72" : "flex flex-col h-full"
    )}>
      <div className={cn(
        "relative shrink-0 overflow-hidden",
        mode === 'list' ? "w-full md:w-80 h-64 md:h-full" : "w-full h-56"
      )}>
        <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/90 text-white font-black border-none shadow-lg backdrop-blur-md">{item.badge}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/90 rounded-full h-10 w-10 shadow-xl text-slate-700 hover:text-red-500 hover:bg-white">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-grow p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors truncate tracking-tight">{item.name}</h3>
                <div className="hidden sm:flex shrink-0">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-[#febb02] text-[#febb02]" />)}
                </div>
              </div>
              <div className="flex items-center text-sm text-primary font-black underline mb-1 cursor-pointer">
                <MapPin className="h-4 w-4 mr-1" /> {item.location}
              </div>
              <div className="text-xs text-slate-500 font-medium">{item.distance}</div>
            </div>
            <div className="flex flex-col items-end shrink-0">
               <div className="bg-primary text-white font-black h-10 w-10 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-primary/20">
                  {item.rating}
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase mt-1">Génial</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="text-[11px] font-black text-slate-900 border-l-4 border-secondary pl-3 uppercase tracking-widest">
              {item.type}
            </div>
            <div className="flex gap-2">
              {item.features?.map((f: string) => (
                <div key={f} className="text-[11px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md">
                  <Check className="h-3 w-3" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-50 pt-6 mt-6 md:mt-0">
          <div className="space-y-1">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prix total</p>
             <div className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(item.price)}</div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 h-14 px-8 font-black text-lg rounded-2xl text-white shadow-xl shadow-primary/10 active:scale-95 transition-all" asChild>
            <Link href={`/properties/${item.id}`}>
              Voir l'offre <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

