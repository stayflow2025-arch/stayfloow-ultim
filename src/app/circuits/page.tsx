
'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Info, Compass, SlidersHorizontal
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CircuitSearchSidebar, type CircuitFilterStats } from '@/components/circuit-search-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircuitResultCard } from '@/components/circuit-result-card';
import { useLanguage } from '@/context/language-context';
import { circuits as mockCircuits } from '@/lib/data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function CircuitsContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { t } = useLanguage();
  
  const [allCircuits, setAllCircuits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const locationParam = searchParams.get('dest') || '';

  useEffect(() => {
    const fetchCircuits = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'listings'), 
          where('category', '==', 'circuit'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const dbData = snapshot.docs.map(doc => {
          const data = doc.data();
          const details = data.details || {};
          return {
            id: doc.id,
            title: details.name || details.title || 'Circuit StayFloow',
            location: data.location?.address || 'Algérie',
            pricePerPerson: data.price || 5000,
            rating: data.rating || 8.5,
            reviewsCount: Math.floor(Math.random() * 50) + 5,
            duration: details.duration || '1 jour',
            description: details.description || 'Une aventure inoubliable vous attend.',
            photos: data.photos || ["https://placehold.co/400x300?text=Tour+StayFloow"],
            amenities: details.amenities || []
          };
        });
        
        // On combine les données réelles et les données de test (mock)
        setAllCircuits([...dbData, ...mockCircuits]);
      } catch (e) {
        console.error("Error fetching circuits:", e);
        setAllCircuits(mockCircuits);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchCircuits();
  }, [db]);

  const stats = useMemo<CircuitFilterStats>(() => {
    const s: CircuitFilterStats = {
      ratings: { "9+": 0, "8+": 0, "7+": 0, "6+": 0 },
      options: {}
    };

    const optionsList = [
      "Guide inclus (local arabe/français)", "Repas inclus (halal)", "Transport 4x4 (désert)",
      "Durée 1 jour", "Durée multi-jours (2-7 jours)", "Annulation gratuite",
      "Langue arabe", "Langue français", "Thème désert/Sahara",
      "Thème culturel/historique (pyramides, ruines)", "Thème Nil/croisière",
      "Groupe petit (max 10 pers)", "Assurance incluse"
    ];
    optionsList.forEach(o => s.options[o] = 0);

    allCircuits.forEach(c => {
      const rating = c.rating || 8.5;
      if (rating >= 9) s.ratings["9+"]++;
      if (rating >= 8) s.ratings["8+"]++;
      if (rating >= 7) s.ratings["7+"]++;
      if (rating >= 6) s.ratings["6+"]++;

      const ams = c.details?.amenities || c.amenities || [];
      ams.forEach((opt: string) => {
        if (s.options[opt] !== undefined) s.options[opt]++;
      });
    });

    return s;
  }, [allCircuits]);

  const filteredResults = useMemo(() => {
    return allCircuits.filter(c => {
      const loc = (c.location?.address || c.location || '').toLowerCase();
      if (locationParam && !loc.includes(locationParam.toLowerCase())) return false;

      const ams = c.details?.amenities || c.amenities || [];
      if (selectedOptions.length > 0) {
        const hasAll = selectedOptions.every(opt => ams.includes(opt));
        if (!hasAll) return false;
      }

      if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
        if ((c.rating || 8.5) < minRating) return false;
      }

      return true;
    });
  }, [allCircuits, locationParam, selectedOptions, selectedRatings]);

  const handleToggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleToggleRating = (rating: string) => {
    setSelectedRatings(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary pt-6 pb-10 px-4">
        <div className="max-w-[1100px] mx-auto">
          <AdvancedSearchBar />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-[280px] shrink-0 space-y-4">
          <div className="relative h-24 rounded-lg overflow-hidden border shadow-sm cursor-pointer group">
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <Button size="sm" className="bg-primary hover:bg-[#059669] text-white font-bold h-8">
                <MapIcon className="mr-2 h-4 w-4" /> Voir sur la carte
              </Button>
            </div>
          </div>

          <CircuitSearchSidebar 
            resultCount={filteredResults.length} 
            stats={stats}
            selectedOptions={selectedOptions}
            selectedRatings={selectedRatings}
            onToggleOption={handleToggleOption}
            onToggleRating={handleToggleRating}
          />
        </aside>

        {/* MOBILE FILTER BAR */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full border-slate-200 font-bold text-slate-700 h-10 px-6 shrink-0">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" /> Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-primary font-black text-xl">Filtres Circuits</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <CircuitSearchSidebar 
                  resultCount={filteredResults.length} 
                  stats={stats}
                  selectedOptions={selectedOptions}
                  selectedRatings={selectedRatings}
                  onToggleOption={handleToggleOption}
                  onToggleRating={handleToggleRating}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" className="rounded-full border-slate-200 font-bold text-slate-700 h-10 px-6 shrink-0">
            <Compass className="mr-2 h-4 w-4 text-primary" /> Thèmes
          </Button>
        </div>

        <main className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
              Circuits et Activités en Afrique
            </h1>
            <p className="text-sm text-slate-500 font-medium">Découvrez les meilleures expériences guidées sur StayFloow.com</p>
          </div>

          <Alert className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <AlertDescription className="text-[11px] md:text-xs text-slate-600">
              {filteredResults.length} circuits correspondent à votre recherche à {locationParam || 'votre destination'}.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Préparation de votre aventure...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredResults.map((circuit) => (
                <CircuitResultCard key={circuit.id} circuit={circuit} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed px-6">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Compass className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Aucun circuit disponible</h3>
              <p className="text-sm text-slate-500 mt-2">Élargissez vos critères ou changez de destination.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CircuitsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <CircuitsContent />
    </Suspense>
  );
}
