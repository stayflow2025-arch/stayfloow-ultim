'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Info, Compass, Star, Clock, Check, MapPin
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CircuitSearchSidebar, type CircuitFilterStats } from '@/components/circuit-search-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircuitResultCard } from '@/components/circuit-result-card';
import { useLanguage } from '@/context/language-context';

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
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllCircuits(data);
      } catch (e) {
        console.error("Error fetching circuits:", e);
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
      "Groupe petit (max 10 pers)", "Assurance incluse",
      "Départ depuis aéroport (Alger/Caire)", "Rating guide 8+"
    ];
    optionsList.forEach(o => s.options[o] = 0);

    allCircuits.forEach(c => {
      const rating = c.rating || 8.5;
      if (rating >= 9) s.ratings["9+"]++;
      if (rating >= 8) s.ratings["8+"]++;
      if (rating >= 7) s.ratings["7+"]++;
      if (rating >= 6) s.ratings["6+"]++;

      c.details?.amenities?.forEach((opt: string) => {
        if (s.options[opt] !== undefined) s.options[opt]++;
      });
    });

    return s;
  }, [allCircuits]);

  const filteredResults = useMemo(() => {
    return allCircuits.filter(c => {
      if (locationParam && !c.location?.address?.toLowerCase().includes(locationParam.toLowerCase())) return false;

      if (selectedOptions.length > 0) {
        const hasAll = selectedOptions.every(opt => c.details?.amenities?.includes(opt));
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
        <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
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

        <main className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t('tours_title')}
            </h1>
            <p className="text-slate-500 font-medium">{t('tours_subtitle')}</p>
          </div>

          <Alert className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-xs text-slate-600">
              {filteredResults.length} {t('tours')} correspondent à votre recherche à {locationParam || 'votre destination'}.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Préparation de votre aventure...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredResults.map((circuit) => (
                <CircuitResultCard key={circuit.id} circuit={circuit} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-slate-50 rounded-xl border-2 border-dashed">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Compass className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Aucun circuit disponible</h3>
              <p className="text-slate-500 mt-2">Élargissez vos critères ou changez de destination.</p>
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