"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  LayoutGrid, List, Map as MapIcon, 
  Search as SearchIcon, Loader2, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/currency-context';
import { properties as initialProperties, type Property } from '@/lib/data';
import { PropertyCard } from '@/components/property-card';
import { FilterSidebar } from '@/components/filter-sidebar';
import { PropertiesMap } from '@/components/properties-map';
import { EmailRetargetingCard } from '@/components/email-retargeting-card';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Paramètres de recherche
  const locationParam = searchParams.get('dest') || searchParams.get('location') || '';

  useEffect(() => {
    const fetchResults = () => {
      setLoading(true);
      try {
        // Simulation de la récupération des propriétés approuvées
        const localApproved = JSON.parse(localStorage.getItem('approvedProperties') || '[]');
        
        const combined = [...initialProperties, ...localApproved];
        
        // Déduplication par ID
        const propertyMap = new Map();
        combined.forEach(p => propertyMap.set(p.id, p));
        const allProperties = Array.from(propertyMap.values()) as Property[];

        // Filtrage par localisation
        const results = allProperties
          .filter(p => {
            const matchesLocation = locationParam ? 
              (p.location?.toLowerCase().includes(locationParam.toLowerCase()) || 
               p.name?.toLowerCase().includes(locationParam.toLowerCase())) : true;
            return matchesLocation;
          })
          .sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));

        setFilteredResults(results);
      } catch (error) {
        console.error("Erreur lors du filtrage des résultats:", error);
      } finally {
        // Simulation délai de recherche
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchResults();
  }, [locationParam]);

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
          <FilterSidebar resultCount={filteredResults.length} />

          {/* Map Preview */}
          <div 
            className="relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-2xl group border-4 border-white"
            onClick={() => setShowMap(!showMap)}
          >
            <PropertiesMap properties={filteredResults} />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 text-center">
              <MapIcon className="h-8 w-8 text-white mb-2" />
              <div className="bg-primary text-white px-6 py-2 rounded-full font-black text-xs shadow-lg">
                AGRANDIR LA CARTE
              </div>
            </div>
          </div>

          <EmailRetargetingCard />
        </aside>

        {/* Results */}
        <main className="flex-grow space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {locationParam ? `Hébergements à "${locationParam}"` : 'Toutes les offres'}
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">{filteredResults.length} résultats</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Meilleurs prix garantis sur StayFloow.com</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={cn("h-10 px-4 rounded-xl font-black", viewMode === 'list' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary")}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-2" /> Liste
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={cn("h-10 px-4 rounded-xl font-black", viewMode === 'grid' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary")}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" /> Grille
                  </Button>
               </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-primary bg-white rounded-3xl border border-slate-200">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p className="font-black animate-pulse tracking-widest text-xs">RECHERCHE DES MEILLEURES OFFRES...</p>
            </div>
          ) : (
            <>
              {showMap && (
                <div className="h-[500px] w-full animate-in zoom-in-95 duration-500">
                  <PropertiesMap properties={filteredResults} />
                </div>
              )}
              
              <div className={cn(
                "grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              )}>
                {filteredResults.map((property) => (
                  <PropertyCard key={property.id} property={property} viewMode={viewMode} isGenius={Math.random() > 0.7} />
                ))}
              </div>
            </>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
               <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-400">Aucun résultat trouvé</h3>
               <p className="text-slate-500 max-w-xs mx-auto mt-4 font-medium">Essayez de modifier votre recherche ou d'explorer nos <Link href="/" className="text-primary font-black underline">destinations populaires</Link>.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-slate-400">Initialisation de la recherche...</p>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
