
"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { useLanguage } from '@/context/language-context';
import { useCurrency } from '@/context/currency-context';
import { useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { properties } from '@/lib/data';

// Optimisation : Chargement différé des composants non critiques
const AiRecommender = dynamic(() => import('@/components/ai-recommender').then(mod => mod.AiRecommender), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px] rounded-[2.5rem]" />
});

const PersonalizedRecommendations = dynamic(() => import('@/components/personalized-recommendations').then(mod => mod.PersonalizedRecommendations), {
  ssr: false,
  loading: () => <div className="space-y-12 py-12"><Skeleton className="w-full h-[300px]" /><Skeleton className="w-full h-[300px]" /></div>
});

export function HomeClient() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const propertyTypes = [
    { name: t('Hôtels'), image: 'https://picsum.photos/seed/hotel/400/300', count: '820,412', slug: 'hotel' },
    { name: t('Appartements'), image: 'https://picsum.photos/seed/apt/400/300', count: '915,234', slug: 'apartment' },
    { name: t('Complexes hôteliers'), image: 'https://picsum.photos/seed/resort/400/300', count: '145,098', slug: 'resort' },
    { name: t('Villas'), image: 'https://picsum.photos/seed/villa/400/300', count: '450,123', slug: 'villa' },
  ];

  const uniqueStays = properties.slice(0, 4);

  if (!isClient) return <div className="min-h-screen bg-slate-50 animate-pulse" />;

  return (
    <div className="flex flex-col min-h-screen bg-background page-fade-in">
      {/* Hero Section Premium */}
      <section className="bg-primary text-white pt-16 pb-48 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm mx-auto md:mx-0">
            <Sparkles className="h-4 w-4 text-secondary" /> {t("exclusive_offers")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl leading-[0.95] mx-auto md:mx-0">
            {t("hero_title")}
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl leading-relaxed mx-auto md:mx-0">
            {t("hero_subtitle")}
          </p>
        </div>
        {/* Décoration de fond optimisée */}
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-20 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </section>

      {/* Barre de Recherche Avancée */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-40 z-30 mb-20">
        <div className="bg-primary p-10 rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.25)] border-4 border-white/5">
          <AdvancedSearchBar />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24 w-full">
        {/* Types d'hébergement */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("property_types_title")}</h2>
              <p className="text-slate-500 font-medium mt-2">{t("footer_tagline")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {propertyTypes.map((type) => (
              <Link key={type.slug} href={`/search?type=${type.slug}`} className="group block">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white mb-4 transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
                  <Image 
                    src={type.image} 
                    alt={type.name} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
                <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">{type.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{type.count} {t('accommodations')}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Hébergements uniques */}
        <section className="mb-24">
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mb-12 shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl font-black tracking-tight">{t("unique_stays_title")}</h2>
              <p className="text-white/60 font-medium mt-2 max-w-xl text-lg">{t("unique_stays_desc")}</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {uniqueStays.map((stay) => (
              <Link key={stay.id} href={`/properties/${stay.id}`} className="group block bg-white p-4 rounded-[2.5rem] shadow-lg border border-slate-100 hover:shadow-2xl transition-all">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-inner">
                  <Image 
                    src={stay.images[0]} 
                    alt={stay.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">STAYFLOOW SELECTION</div>
                </div>
                <div className="px-2">
                  <h3 className="font-black text-xl text-slate-900 truncate group-hover:text-primary transition-colors">{stay.name}</h3>
                  <p className="text-sm text-slate-400 font-bold flex items-center gap-1.5 mt-1 mb-4 uppercase tracking-tighter">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {stay.location}
                  </p>
                  
                  <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-white text-xs font-black h-8 w-8 flex items-center justify-center rounded-xl shadow-md">
                        {stay.rating}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Top</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase">{t("from_price")}</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(stay.price)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommandations Personnalisées IA */}
        <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-[3rem]" />}>
          <PersonalizedRecommendations />
        </Suspense>

        {/* L'Expert IA Recommender */}
        <section className="mt-32">
          <Suspense fallback={<Skeleton className="w-full h-[450px] rounded-[3rem]" />}>
            <AiRecommender />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
