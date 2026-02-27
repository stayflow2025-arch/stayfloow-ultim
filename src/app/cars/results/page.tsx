
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Info, SlidersHorizontal
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CarResultCard, type CarListing } from '@/components/car-result-card';
import { CarSearchSidebar, type CarFilterStats } from '@/components/car-search-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function CarResultsContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const [allApproved, setAllApproved] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const locationParam = searchParams.get('dest') || '';

  useEffect(() => {
    const fetchApprovedCars = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          listingsRef, 
          where('category', '==', 'car_rental'),
          where('status', '==', 'approved')
        );
        const querySnapshot = await getDocs(q);
        
        const dbCars = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.details?.name || 'Véhicule',
            brand: data.details?.brand || 'Marque',
            supplier: data.partnerInfo?.firstName || 'Partenaire StayFloow',
            rating: data.rating || 8.5,
            reviewsCount: Math.floor(Math.random() * 200) + 10,
            location: data.location?.address || 'Alger',
            distance: "À proximité",
            description: data.details?.description || 'Découvrez ce véhicule récent disponible dès maintenant.',
            images: data.photos || ["https://picsum.photos/seed/car/400/300"],
            specs: data.details?.amenities || ["Manuelle", "Climatisé"],
            pricePerDay: data.price || 5000,
            isAutomatic: data.details?.amenities?.includes("Boîte Automatique") || false,
            category: data.details?.type || "Économique"
          } as CarListing;
        });

        setAllApproved(dbCars);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchApprovedCars();
  }, [db]);

  const stats = useMemo<CarFilterStats>(() => {
    const s: CarFilterStats = {
      ratings: { "9+": 0, "8+": 0, "7+": 0, "6+": 0 },
      options: {}
    };

    const optionsList = [
      "Transmission automatique", "Climatisation", "Kilométrage illimité",
      "Assurance tous risques incluse", "Voiture avec GPS intégré",
      "Siège bébé / rehausseur", "4x4 / SUV", "Essence / Diesel / Électrique",
      "Âge minimum du conducteur", "Boîte manuelle", "Nombre de places (5+ ou 7+)",
      "Annulation gratuite", "Payez sur place", "Voiture récente (moins de 5 ans)",
      "Fournisseur bien noté (rating 8+)"
    ];
    optionsList.forEach(o => s.options[o] = 0);

    allApproved.forEach(car => {
      if (car.rating >= 9) s.ratings["9+"]++;
      if (car.rating >= 8) s.ratings["8+"]++;
      if (car.rating >= 7) s.ratings["7+"]++;
      if (car.rating >= 6) s.ratings["6+"]++;

      car.specs.forEach(spec => {
        if (s.options[spec] !== undefined) s.options[spec]++;
      });
    });

    return s;
  }, [allApproved]);

  const filteredResults = useMemo(() => {
    return allApproved.filter(car => {
      if (locationParam && !car.location.toLowerCase().includes(locationParam.toLowerCase())) return false;

      if (selectedOptions.length > 0) {
        const hasAll = selectedOptions.every(opt => car.specs.includes(opt));
        if (!hasAll) return false;
      }

      if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
        if (car.rating < minRating) return false;
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
      <div className="bg-primary pt-6 pb-10 px-4">
        <div className="max-w-[1100px] mx-auto">
          <AdvancedSearchBar />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        
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

          <CarSearchSidebar 
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
                <SheetTitle className="text-primary font-black text-xl">Filtres Véhicules</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <CarSearchSidebar 
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
            <MapIcon className="mr-2 h-4 w-4 text-primary" /> Carte
          </Button>
        </div>

        <main className="flex-1 space-y-4">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            {locationParam || 'Toutes les localisations'} : {filteredResults.length} véhicules disponibles
          </h1>

          <Alert className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <AlertDescription className="text-[11px] md:text-xs text-slate-600">
              Réservez votre véhicule en toute confiance. Les prix affichés incluent les taxes locales obligatoires.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Recherche des meilleurs véhicules...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredResults.map((car) => (
                <CarResultCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed px-6">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <SearchIcon className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Aucun véhicule trouvé</h3>
              <p className="text-sm text-slate-500 mt-2">Élargissez vos critères ou changez de dates.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CarResultsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <CarResultsContent />
    </Suspense>
  );
}
