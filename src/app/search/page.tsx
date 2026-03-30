"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Grid, List as ListIcon, 
  Info, ChevronRight, SlidersHorizontal, Baby
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property-card';
import { FilterSidebar, type FilterStats } from '@/components/filter-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { useLanguage } from '@/context/language-context';
import { properties as mockProperties, type Property } from '@/lib/data';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function SearchResultsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const [allApproved, setAllApproved] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const locationParam = searchParams.get('dest') || '';
  const hasInfants = searchParams.get('hasInfants') === 'true';

  useEffect(() => {
    const fetchApprovedListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          listingsRef, 
          where('category', '==', 'accommodation'),
          where('status', '==', 'approved')
        );
        const querySnapshot = await getDocs(q);
        
        const adults = parseInt(searchParams.get('adults') || '2');
        const children = parseInt(searchParams.get('children') || '0');
        const totalGuests = adults + children;

        const dbListings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calcul du prix dynamique pour la recherche
          let displayPrice = data.price || 0;
          if (data.useOccupancyPricing && data.occupancyPrices) {
            const guestCount = Math.min(totalGuests, data.details?.maxCapacity || 10);
            const occupancyPrice = data.occupancyPrices[guestCount.toString()] || 
                                   data.occupancyPrices[Object.keys(data.occupancyPrices).sort().pop() || ""];
            if (occupancyPrice) {
              displayPrice = occupancyPrice;
            }
          }

          return {
            id: doc.id,
            name: data.details?.name || 'Hébergement',
            location: data.location?.address || 'Non spécifié',
            price: displayPrice,
            rating: data.rating || 8.0,
            description: data.details?.description || '',
            images: data.photos || [],
            amenities: data.details?.amenities || [],
            type: data.details?.type || 'Hôtel',
            isBoosted: data.isBoosted || false,
            stars: data.details?.stars ? parseInt(data.details.stars) : undefined,
            isInfantFriendly: data.details?.amenities?.includes("Lit bébé / lit supplémentaire") || data.details?.propertyType === 'hotel'
          } as Property & { isInfantFriendly?: boolean };
        });

        const hiddenMocks = JSON.parse(localStorage.getItem('stayfloow_hidden_mocks') || '[]');
        const visibleMocks = mockProperties.filter(p => !hiddenMocks.includes(p.id));

        setAllApproved([...visibleMocks, ...dbListings]);
      } catch (error) {
        console.error("Error fetching listings:", error);
        const hiddenMocks = JSON.parse(localStorage.getItem('stayfloow_hidden_mocks') || '[]');
        const visibleMocks = mockProperties.filter(p => !hiddenMocks.includes(p.id));
        setAllApproved(visibleMocks);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchApprovedListings();
  }, [db]);

  const stats = useMemo<FilterStats>(() => {
    const s: FilterStats = {
      ratings: { "9+": 0, "8+": 0, "7+": 0, "6+": 0 },
      amenities: {}
    };

    const amenitiesList = [
      "Wi-Fi gratuit", "Climatisation", "Parking gratuit", "Petit-déjeuner inclus",
      "Piscine", "Restaurant sur place", "Réception 24h/24", "Animaux domestiques acceptés",
      "Terrasse / balcon / vue", "Cuisine / coin cuisine", "Prises électriques près du lit",
      "Salle de bain privée", "Lit bébé / lit supplémentaire", "Ascenseur", "Accessibilité PMR"
    ];
    amenitiesList.forEach(a => s.amenities[a] = 0);

    const itemsForStats = allApproved.filter(p => 
      locationParam ? p.location.toLowerCase().includes(locationParam.toLowerCase()) : true
    );

    itemsForStats.forEach(p => {
      if (p.rating >= 9) s.ratings["9+"]++;
      if (p.rating >= 8) s.ratings["8+"]++;
      if (p.rating >= 7) s.ratings["7+"]++;
      if (p.rating >= 6) s.ratings["6+"]++;

      p.amenities?.forEach(a => {
        if (s.amenities[a] !== undefined) s.amenities[a]++;
      });
    });

    return s;
  }, [allApproved, locationParam]);

  const filteredResults = useMemo(() => {
    let results = allApproved.filter(p => {
      const matchDest = locationParam ? p.location.toLowerCase().includes(locationParam.toLowerCase()) : true;
      if (!matchDest) return false;

      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(a => p.amenities?.includes(a));
        if (!hasAll) return false;
      }

      if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
        if (p.rating < minRating) return false;
      }

      return true;
    });

    // ALGORITHME DE MISE EN AVANT IA
    if (hasInfants) {
      results.sort((a: any, b: any) => {
        // Priorité aux annonces certifiées "Infant Friendly"
        const scoreA = (a.isInfantFriendly ? 10 : 0) + (a.isBoosted ? 5 : 0);
        const scoreB = (b.isInfantFriendly ? 10 : 0) + (b.isBoosted ? 5 : 0);
        return scoreB - scoreA;
      });
    }

    return results;
  }, [allApproved, locationParam, selectedAmenities, selectedRatings, hasInfants]);

  useEffect(() => {
    setCurrentPage(1);
  }, [locationParam, selectedAmenities, selectedRatings, hasInfants]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, currentPage]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
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
        
        <aside className="hidden lg:block w-[280px] shrink-0 space-y-4">
          <div className="relative h-24 rounded-lg overflow-hidden border shadow-sm cursor-pointer group">
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <Button size="sm" className="bg-primary hover:bg-[#059669] text-white font-bold h-8">
                <MapIcon className="mr-2 h-4 w-4" /> Voir sur la carte
              </Button>
            </div>
          </div>

          <FilterSidebar 
            resultCount={filteredResults.length} 
            stats={stats}
            selectedAmenities={selectedAmenities}
            selectedRatings={selectedRatings}
            onToggleAmenity={handleToggleAmenity}
            onToggleRating={handleToggleRating}
          />
        </aside>

        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full border-slate-200 font-bold text-slate-700 h-10 px-6 shrink-0">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" /> Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-primary font-black">Filtres StayFloow</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <FilterSidebar 
                  resultCount={filteredResults.length} 
                  stats={stats}
                  selectedAmenities={selectedAmenities}
                  selectedRatings={selectedRatings}
                  onToggleAmenity={handleToggleAmenity}
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
          {hasInfants && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
              <div className="bg-primary p-2 rounded-full text-white shadow-lg"><Baby className="h-5 w-5" /></div>
              <div>
                <p className="font-black text-emerald-900 leading-tight">Politique StayFloow Nourrissons</p>
                <p className="text-xs text-emerald-700 font-medium">Les enfants de moins de 2 ans séjournent gratuitement. Nous avons mis en avant les établissements les mieux équipés pour votre bébé.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                {locationParam || 'Toutes les destinations'} : {filteredResults.length} {filteredResults.length === 1 ? t('search_result_singular') : t('search_results_plural')}
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="flex border rounded-full p-1 bg-slate-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-full h-8 px-4 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="h-4 w-4 mr-2" /> Liste
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-full h-8 px-4 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4 mr-2" /> Mosaïque
                </Button>
              </div>
            </div>
          </div>

          <Alert className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <AlertDescription className="text-[11px] md:text-xs text-slate-600">
              Le montant de la commission payée et d'autres facteurs peuvent affecter le classement d'un hébergement. <span className="text-primary cursor-pointer font-medium underline">En savoir plus.</span>
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Recherche des meilleures offres...</p>
            </div>
          ) : paginatedResults.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
              {paginatedResults.map((property) => (
                <PropertyCard key={property.id} property={property} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed px-6">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <SearchIcon className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Aucun hébergement trouvé</h3>
              <p className="text-sm text-slate-500 mt-2">Essayez de modifier vos critères ou d'élargir votre zone de recherche.</p>
              <Button 
                variant="outline" 
                className="mt-6 border-primary text-primary font-black rounded-xl"
                onClick={() => { setSelectedAmenities([]); setSelectedRatings([]); }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center pt-10 pb-20">
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  return (
                    <Button 
                      key={n} 
                      variant={n === currentPage ? "outline" : "ghost"} 
                      className={`w-10 h-10 rounded-md transition-colors ${n === currentPage ? 'border-primary text-primary font-black bg-primary/5' : 'text-slate-500 font-bold hover:bg-slate-100'}`}
                      onClick={() => {
                        setCurrentPage(n);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {n}
                    </Button>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="w-10 h-10 rounded-md text-slate-500 hover:bg-slate-100"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
