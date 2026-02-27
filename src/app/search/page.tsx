
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Grid, List as ListIcon, 
  Info, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property-card';
import { FilterSidebar, type FilterStats } from '@/components/filter-sidebar';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
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
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const [allApproved, setAllApproved] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);

  const locationParam = searchParams.get('dest') || '';

  useEffect(() => {
    const fetchApprovedListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        
        const dbListings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.details?.name || 'Hébergement',
            location: data.location?.address || 'Non spécifié',
            price: data.price || 0,
            rating: data.rating || 8.0,
            description: data.details?.description || '',
            images: data.photos || [],
            amenities: data.details?.amenities || [],
            type: data.details?.type || 'Hôtel',
            isBoosted: data.isBoosted || false,
            stars: data.details?.stars ? parseInt(data.details.stars) : undefined
          } as Property;
        });

        setAllApproved([...mockProperties, ...dbListings]);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setAllApproved(mockProperties);
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
    return allApproved.filter(p => {
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
  }, [allApproved, locationParam, selectedAmenities, selectedRatings]);

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
        
        {/* SIDEBAR DESKTOP */}
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

        {/* MAIN CONTENT */}
        <main className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                {locationParam || 'Toutes les destinations'} : {filteredResults.length} établissements trouvés
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
          ) : filteredResults.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
              {filteredResults.map((property) => (
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

          {filteredResults.length > 0 && (
            <div className="flex justify-center pt-10 pb-20">
              <div className="flex gap-1">
                {[1, 2, 3].map(n => (
                  <Button key={n} variant={n === 1 ? "outline" : "ghost"} className={`w-10 h-10 rounded-md ${n === 1 ? 'border-primary text-primary' : ''}`}>{n}</Button>
                ))}
                <Button variant="ghost" className="w-10 h-10 rounded-md"><ChevronRight className="h-4 w-4" /></Button>
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
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
