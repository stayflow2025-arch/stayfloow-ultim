"use client";

import { PropertyCard } from "./property-card";
import { Eye, LayoutGrid, Lightbulb, List, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import type { Property } from "@/lib/data";

export function PersonalizedRecommendations() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const db = useFirestore();
  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'listings'),
      where('category', '==', 'accommodation'),
      where('status', '==', 'approved'),
      limit(20)
    );
  }, [db]);

  const { data: snapshot, isLoading } = useCollection(listingsQuery);

  const { recentlyViewed, similarToLastViewed } = useMemo(() => {
    if (!snapshot) return { recentlyViewed: [], similarToLastViewed: [] };

    const allListings = snapshot.map(doc => {
      const data = doc.details || {};
      return {
        id: doc.id,
        name: data.name || 'Hébergement',
        location: doc.location?.address || 'Non spécifié',
        price: doc.price || 0,
        rating: doc.rating || 8.0,
        description: data.description || '',
        images: doc.photos || [],
        amenities: data.amenities || [],
        type: data.type || 'Hôtel',
        stars: data.stars ? parseInt(data.stars) : undefined,
      } as Property;
    });

    const recent = allListings.slice(0, 4);
    const remaining = allListings.slice(4);
    const shuffled = [...remaining].sort(() => 0.5 - Math.random());
    const inspired = shuffled.slice(0, Math.max(0, 4 - recent.length) || 4);

    // Si on a moins de 5 éléments en tout, on réutilise certains pour "inspirés" pour la démo
    if (inspired.length === 0 && recent.length > 0) {
      return { recentlyViewed: recent, similarToLastViewed: [...recent].reverse() };
    }

    return { recentlyViewed: recent, similarToLastViewed: inspired };
  }, [snapshot]);

  const getButtonClass = (mode: 'grid' | 'list') =>
    `h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${viewMode === mode
      ? "bg-secondary text-primary border-secondary shadow-lg"
      : "bg-white text-slate-400 hover:text-primary border-slate-100 shadow-sm"
    }`;

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="space-y-16 py-12">
      {/* SECTION 1 : Récemment consultés */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Eye className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {t('recently_viewed')}
              </h2>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Vos dernières recherches sur StayFloow</p>
            </div>
          </div>

          {/* Boutons de mode de vue */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setViewMode('grid')}
              className={getButtonClass('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setViewMode('list')}
              className={getButtonClass('list')}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-8",
            viewMode === 'grid'
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
          )}
        >
          {recentlyViewed.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              viewMode={viewMode}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2 : Inspirés par votre visite */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {t('inspired_by_visit')}
              </h2>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Sélectionnés par notre algorithme IA</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setViewMode('grid')}
              className={getButtonClass('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setViewMode('list')}
              className={getButtonClass('list')}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-8",
            viewMode === 'grid'
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
          )}
        >
          {similarToLastViewed.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              viewMode={viewMode}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
