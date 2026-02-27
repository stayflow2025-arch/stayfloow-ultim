"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { AiRecommender } from '@/components/ai-recommender';
import { PersonalizedRecommendations } from '@/components/personalized-recommendations';
import { useLanguage } from '@/context/language-context';
import { useCurrency } from '@/context/currency-context';
import { useEffect, useState } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const propertyTypes = [
    { name: 'Hôtels', image: 'https://picsum.photos/seed/hotel/400/300', count: '820,412' },
    { name: 'Appartements', image: 'https://picsum.photos/seed/apt/400/300', count: '915,234' },
    { name: 'Complexes hôteliers', image: 'https://picsum.photos/seed/resort/400/300', count: '145,098' },
    { name: 'Villas', image: 'https://picsum.photos/seed/villa/400/300', count: '450,123' },
  ];

  const uniqueStays = [
    { id: 'prop-1', name: 'Riad Dar Al-Andalus', location: 'Fès, Maroc', rating: 9.8, price: 12500, image: 'https://picsum.photos/seed/unique1/400/500' },
    { id: 'prop-2', name: 'Desert Cave Hotel', location: 'Ghardaïa, Algérie', rating: 9.5, price: 8500, image: 'https://picsum.photos/seed/unique2/400/500' },
    { id: 'prop-3', name: 'Nile Floating Palace', location: 'Louxor, Égypte', rating: 9.6, price: 15000, image: 'https://picsum.photos/seed/unique3/400/500' },
    { id: 'prop-4', name: 'Royal Algerian Tent', location: 'Timimoun, Algérie', rating: 9.7, price: 11000, image: 'https://picsum.photos/seed/unique4/400/500' },
  ];

  if (!isClient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-white pt-16 pb-36 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter max-w-3xl leading-tight">
            {t("hero_title")}
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl">
            {t("hero_subtitle")}
          </p>
          <div className="pt-4">
            <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold px-8 h-14 rounded-md shadow-xl border-none" asChild>
              <Link href="/auth/login">{t("hero_cta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Container de la barre de recherche remonté sur la ligne verte */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-28 z-30 mb-12">
        <AdvancedSearchBar />
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-20 w-full">
        {/* Section 1 : Types d'hébergement */}
        <section className="mb-20">
          <h2 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">{t("property_types_title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <Link key={type.name} href={`/search?type=${type.name.toLowerCase()}`} className="group space-y-3">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm">
                  <Image src={type.image} alt={type.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:underline">{type.name}</h3>
                  <p className="text-xs text-slate-500">{type.count} établissements</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2 : Hébergements uniques */}
        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("unique_stays_title")}</h2>
            <p className="text-slate-500 font-medium mt-1">{t("unique_stays_desc")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {uniqueStays.map((stay) => (
              <Link key={stay.id} href={`/properties/${stay.id}`} className="group block">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md">
                  <Image src={stay.image} alt={stay.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{stay.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" /> {stay.location}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded">
                    {stay.rating}
                  </div>
                  <span className="text-xs font-bold text-slate-700">Exceptionnel</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t("from_price")}</p>
                  <p className="text-xl font-black text-slate-900">{formatPrice(stay.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3 : Recommandations Personnalisées */}
        <PersonalizedRecommendations />

        {/* Section 4 : Assistant Voyage IA (DÉPLACÉ EN BAS) */}
        <section className="mb-20 mt-32">
          <AiRecommender />
        </section>
      </main>
    </div>
  );
}
