"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Info, ChevronRight
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CircuitResultCard, type CircuitListing } from '@/components/circuit-result-card';
import { CircuitSearchSidebar, type CircuitFilterStats } from '@/components/circuit-search-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';

function CircuitResultsContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const [allApproved, setAllApproved] = useState<CircuitListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const locationParam = searchParams.get('dest') || '';

  useEffect(() => {
    const fetchApprovedCircuits = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          listingsRef, 
          where('category', '==', 'circuit'),
          where('status', '==', 'approved')
        );
        const querySnapshot = await getDocs(q);
        
        const dbCircuits = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.details?.name || 'Circuit Authentique',
            location: data.location?.address || 'Sahara, Algérie',
            guide: data.partnerInfo?.firstName || 'Guide Local StayFloow',
            guideRating: data.guideRating || 8.8,
            reviewsCount: Math.floor(Math.random() * 150) + 5,
            duration: data.details?.duration || "3 jours",
            description: data.details?.description || 'Une aventure inoubliable au cœur du désert.',
            images: data.photos || ["https://picsum.photos/seed/desert/400/300"],
            options: data.details?.amenities || ["Guide Pro", "Transport 4x4"],
            pricePerPerson: data.price || 45000,
            isPopular: data.isBoosted || false
          } as CircuitListing;
        });

        setAllApproved(dbCircuits);
      } catch (error) {
        console.error("Error fetching circuits:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchApprovedCircuits();
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

    allApproved.forEach(circ => {
      if (circ.guideRating >= 9) s.ratings["9+"]++;
      if (circ.guideRating >= 8) s.ratings["8+"]++;
      if (circ.guideRating >= 7) s.ratings["7+"]++;
      if (circ.guideRating >= 6) s.ratings["6+"]++;

      circ.options.forEach(opt => {
        if (s.options[opt] !== undefined) s.options[opt]++;
      });
    });

    return s;
  }, [allApproved]);

  const filteredResults = useMemo(() => {
    return allApproved.filter(circ => {
      if (locationParam && !circ.location.toLowerCase().includes(locationParam.toLowerCase())) return false;

      if (selectedOptions.length > 0) {
        const hasAll = selectedOptions.every(opt => circ.options.includes(opt));
        if (!hasAll) return false;
      }

      if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
        if (circ.guideRating < minRating) return false;
      }

      return true;
    });
  }, [allApproved, locationParam, selectedOptions, selectedRatings]);

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
      <div className="bg-[#10B981] pt-6 pb-10 px-4">
        <div className="max-w-[1100px] mx-auto">
          <AdvancedSearchBar />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
          <div className="relative h-24 rounded-lg overflow-hidden border shadow-sm cursor-pointer group">
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#059669] text-white font-bold h-8">
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

        <main className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {locationParam || 'Tous les circuits'} : {filteredResults.length} expériences trouvées
          </h1>

          <Alert className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-xs text-slate-600">
              Découvrez l'Afrique authentique. Nos circuits sont validés par des experts locaux pour garantir votre sécurité et votre confort.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#10B981]" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Préparation de votre itinéraire...</p>
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
                <SearchIcon className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Aucun circuit trouvé</h3>
              <p className="text-slate-500 mt-2">Élargissez vos thèmes ou changez de zone géographique.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CircuitResultsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#10B981]" /></div>}>
      <CircuitResultsContent />
    </Suspense>
  );
}
