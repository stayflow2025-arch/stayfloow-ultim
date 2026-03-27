'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, MapPin, Gauge } from 'lucide-react';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { cars } from '@/lib/data';
import { CarCard } from '@/components/car-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

export default function CarsPage() {
  const { t } = useLanguage();

  // Calcul dynamique des compteurs par catégorie
  const getCount = (category: string) => {
    return cars.filter(c => c.category === category).length;
  };

  const getImage = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
  };

  const carCategories = [
    { 
      name: 'Économique', 
      image: getImage('car-eco'), 
      count: getCount('Économique'),
      slug: 'économique',
      color: 'text-[#10B981]' // Vert comme sur la photo
    },
    { 
      name: 'SUV & 4x4', 
      image: getImage('car-suv'), 
      count: getCount('SUV & 4x4'),
      slug: 'suv & 4x4',
      color: 'text-slate-900'
    },
    { 
      name: 'Berline', 
      image: getImage('car-sedan'), 
      count: getCount('Berline'),
      slug: 'berline',
      color: 'text-slate-900'
    },
    { 
      name: 'Luxe', 
      image: getImage('car-luxury'), 
      count: getCount('Luxe'),
      slug: 'luxe',
      color: 'text-slate-900'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Hero Section */}
      <section className="bg-primary pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Location de voitures pour tous les types de voyages
          </h1>
          <p className="text-lg md:text-2xl text-white opacity-90 max-w-3xl leading-relaxed">
            De super voitures à des tarifs avantageux, proposées par les plus grandes sociétés de location de voitures sur StayFloow.com.
          </p>
          <div className="pt-8">
            <AdvancedSearchBar />
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 -mt-12 pb-20 w-full z-20">
        
        {/* Why us */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 flex items-center gap-5 bg-white shadow-xl border-none rounded-[2rem] hover:scale-[1.02] transition-transform">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary"><ShieldCheck className="h-8 w-8" /></div>
            <div>
              <h3 className="font-black text-lg">Assurance incluse</h3>
              <p className="text-sm text-slate-500 font-medium">Roulez sereinement partout en Afrique.</p>
            </div>
          </Card>
          <Card className="p-8 flex items-center gap-5 bg-white shadow-xl border-none rounded-[2rem] hover:scale-[1.02] transition-transform">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary"><MapPin className="h-8 w-8" /></div>
            <div>
              <h3 className="font-black text-lg">Livraison flexible</h3>
              <p className="text-sm text-slate-500 font-medium">À l'aéroport ou à votre hôtel.</p>
            </div>
          </Card>
          <Card className="p-8 flex items-center gap-5 bg-white shadow-xl border-none rounded-[2rem] hover:scale-[1.02] transition-transform">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary"><Gauge className="h-8 w-8" /></div>
            <div>
              <h3 className="font-black text-lg">Kilométrage illimité</h3>
              <p className="text-sm text-slate-500 font-medium">Disponible sur une large sélection.</p>
            </div>
          </Card>
        </section>

        {/* Categories Section - Fidèle à la photo demandée */}
        <section className="mb-20">
          <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {carCategories.map((cat) => (
              <Link key={cat.slug} href={`/cars/results?cat=${cat.slug}`} className="group block space-y-4">
                <div className="relative aspect-[1.4/1] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all group-hover:shadow-md bg-[#E5EAF3] flex items-center justify-center">
                  {cat.image ? (
                    <Image 
                      src={cat.image} 
                      alt={cat.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <Gauge className="h-16 w-16 text-slate-300/50" />
                  )}
                </div>
                <div className="px-1">
                  <h3 className={cn("font-black text-xl tracking-tight transition-colors", cat.color)}>
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {cat.count} {cat.count > 1 ? 'VÉHICULES' : 'VÉHICULE'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Cars */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nos véhicules populaires</h2>
              <p className="text-slate-500 font-medium">Réservez les meilleures offres du moment</p>
            </div>
            <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5" asChild>
              <Link href="/cars/results">Tout voir →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
